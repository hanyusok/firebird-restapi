import Firebird from 'node-firebird';
import { pooledQueryDb, mtswaitOptions } from '../config/database';
import { processMtswaitFields, encodeKorean, decodeKorean, generateResIds } from '../utils/koreanUtils';
import {
  getWaitByVisidateSQL,
  getWaitInsertSQL,
  getWaitUpdateSQL,
  getWaitDeleteSQL,
  getMtrDeleteByPcodeVisidateSQL
} from './sqlQueries';

const mtswaitService = {

  // Helper to get table name from date
  getTableName: (dateStr: string) => {
    // Expected formats: YYYYMMDD, YYYY-MM-DD, etc.
    const cleanDate = dateStr.replace(/[^0-9]/g, '');
    const year = cleanDate.substring(0, 4);
    return `WAIT${year}`;
  },

  // Get by VISIDATE (with name lookup from PERSON table)
  getByVisitDate: async (visidate: string) => {
    const tableName = mtswaitService.getTableName(visidate);
    const sql = getWaitByVisidateSQL(tableName);
    console.log(`Querying ${tableName} for date ${visidate} (direct attach)`);

    // 1. Get Wait List
    const waitList: any[] = await new Promise((resolve, reject) => {
      Firebird.attach(mtswaitOptions, (err: any, db: any) => {
        if (err) {
          console.error('Direct attach failed:', err);
          return reject(err);
        }
        db.query(sql, [visidate], (err: any, result: any) => {
          db.detach();
          if (err) {
            console.error('Query failed:', err);
            return reject(err);
          }
          resolve(result);
        });
      });
    });

    if (waitList.length === 0) return [];

    // 2. Extract PCODEs
    const pcodes = [...new Set(waitList.map(item => item.PCODE))];

    // 3. Query PERSON table for names
    // Note: 'pooledQueryDb' handles the connection. We need to query 'person'.
    // We can't use simple WHERE PCODE IN (?) because Firebird doesn't support array params directly like that easily in node-firebird without expanding ?
    // But pooledQueryDb expects array of params.
    // We will construct the SQL dynamically for the IN clause.
    const placeholders = pcodes.map(() => '?').join(',');
    const personSql = `SELECT PCODE, CAST(PNAME AS VARCHAR(40) CHARACTER SET OCTETS) as PNAME FROM PERSON WHERE PCODE IN (${placeholders})`;

    const personResults = await pooledQueryDb('person', personSql, pcodes); // params are the pcodes array

    // 4. Map PCODE -> PNAME
    const nameMap = new Map();
    if (Array.isArray(personResults)) {
      personResults.forEach((p: any) => {
        nameMap.set(p.PCODE, p.PNAME); // PNAME is likely Buffer here
      });
    } else if (personResults) {
      const p = personResults as any;
      nameMap.set(p.PCODE, p.PNAME);
    }

    // 5. Merge and Process
    const merged = waitList.map(item => {
      const nameBuffer = nameMap.get(item.PCODE);
      return {
        ...item,
        DISPLAYNAME: nameBuffer // processMtswaitFields will decode this
      };
    });

    return processMtswaitFields(merged);
  },

  // Create
  create: async (data: any) => {
    const tableName = mtswaitService.getTableName(data.VISIDATE);
    const mtrTableName = tableName.replace('WAIT', 'MTR'); // e.g. WAIT2026 -> MTR2026

    // 0. Fetch Person Details for MTR
    const personSql = `
      SELECT 
        PCODE, 
        CAST(PNAME AS VARCHAR(40) CHARACTER SET OCTETS) as PNAME,
        PBIRTH, 
        CAST(SEX AS VARCHAR(2) CHARACTER SET OCTETS) as SEX
      FROM PERSON 
      WHERE PCODE = ?
    `;
    const personResult = await pooledQueryDb('person', personSql, [data.PCODE]);

    if (!personResult || personResult.length === 0) {
      throw new Error('Person not found');
    }
    const person = personResult[0]; // Raw buffer data
    console.log('Person data fetched:', { PCODE: person.PCODE, hasPNAME: !!person.PNAME, hasSEX: !!person.SEX });

    // Generate RESID1 and RESID2 from VISIDATE
    const { resid1, resid2 } = generateResIds(data.VISIDATE);

    // Hardcoded logic for default values
    const room = '제1진료실';
    const dept = '가정의학과';
    const doctor = '한유석';

    // WAIT table requires hex encoding for Korean text (unlike MTR table)
    const roomHex = Buffer.from(encodeKorean(room) || '').toString('hex');
    const deptHex = Buffer.from(encodeKorean(dept) || '').toString('hex');
    const doctorHex = Buffer.from(encodeKorean(doctor) || '').toString('hex');

    // 1. Insert into WAIT table using hex encoding for Korean text
    const waitSql = `
        INSERT INTO ${tableName} (
            PCODE, VISIDATE, RESID1, RESID2, 
            ROOMCODE, ROOMNM, 
            DEPTCODE, DEPTNM, 
            DOCTRCODE, DOCTRNM,
            GOODOC
        ) VALUES (
            ?, ?, ?, ?, 
            '1', CAST(X'${roomHex}' AS VARCHAR(40) CHARACTER SET OCTETS), 
            '14', CAST(X'${deptHex}' AS VARCHAR(40) CHARACTER SET OCTETS), 
            '63221', CAST(X'${doctorHex}' AS VARCHAR(40) CHARACTER SET OCTETS),
            ''
        )
    `;

    const waitParams = [
      data.PCODE,
      data.VISIDATE,
      resid1,
      resid2
    ];

    await pooledQueryDb('mtswait', waitSql, waitParams);

    // 2. Insert into MTR table
    // Need to import getMtrInsertSQL but circular dependency or just duplicate/import?
    // Let's manually construct it or assume it's available via import if I add it.
    // importing from sqlQueries.ts is safe.

    // Calculate AGE (Simple approximation)
    let age = '';
    // PBIRTH is likely a date object or null if raw? Firebird returns Date object for timestamps usually.
    // But pooledQueryDb returns what node-firebird returns.
    // If it's Buffer (from previous issues), we need to handle it.
    // Validated: PBIRTH in PERSON is TIMESTAMP. node-firebird returns Date.
    if (person.PBIRTH) {
      const birthParams = new Date(person.PBIRTH);
      const today = new Date();

      let months = (today.getFullYear() - birthParams.getFullYear()) * 12 + (today.getMonth() - birthParams.getMonth());
      if (today.getDate() < birthParams.getDate()) {
        months--;
      }

      const y = Math.floor(months / 12);
      const m = months % 12;

      age = `${y}y ${m}m`;
    }

    // Prepare MTR params
    // " #", PCODE, VISIDATE, VISITIME, PNAME, PBIRTH, AGE, PHONENUM, SEX, SERIAL, N, GUBUN, RESERVED, FIN
    // SERIAL=1, N=0, GUBUN='요양', RESERVED='', FIN=''

    /* 
       Issues:
       1. PNAME is Buffer (encoded). MTR expects Encoded string? Yes.
       2. SEX is char?
       3. PHONENUM? -> PERSON table doesn't have PHONENUM, so we'll use empty string
    */

    // We already have the raw buffers from PERSON for PNAME. We can use them directly or cast them?
    // In MTR insert, we use parameters `?`. node-firebird handles Buffers as binary data. 
    // If MTR columns are defined as VARCHAR CHARACTER SET KSC5601 (or similar), passing Buffer usually works if encoded correctly.
    // Since we fetched from PERSON (EUC-KR/KSC5601) and inserting into MTR (EUC-KR/KSC5601), passing Buffer directly *should* work.

    // "GEN_ID..." is part of SQL string.

    const mtrSql = `
        INSERT INTO ${mtrTableName} (
            "#", PCODE, VISIDATE, VISITIME, 
            PNAME, PBIRTH, AGE, PHONENUM, SEX, 
            SERIAL, N, GUBUN, RESERVED, FIN
        ) VALUES (
            GEN_ID(GEN_${mtrTableName}_SEQ, 1), ?, ?, ?, 
            ?, ?, ?, ?, ?, 
            1, 0, ?, '', ''
        )
    `;

    const visitTime = new Date(); // Current time for VISITIME

    // GUBUN = '요양' -> Pass as string, connection handles encoding
    const gubun = '요양';

    // Decode Person fields from buffers to strings
    // The connection will handle encoding automatically when we pass strings
    const pname = decodeKorean(person.PNAME) || '';
    const sex = decodeKorean(person.SEX) || '';
    const phone = '';  // PERSON table doesn't have PHONENUM

    const mtrParams = [
      data.PCODE,
      data.VISIDATE,
      visitTime,
      pname,           // Pass string, connection handles encoding
      person.PBIRTH,
      age,
      phone,           // Empty string
      sex,             // Pass string, connection handles encoding
      gubun            // Pass string, connection handles encoding
    ];

    try {
      console.log('Attempting MTR insert with params:', {
        PCODE: mtrParams[0],
        VISIDATE: mtrParams[1],
        VISITIME: mtrParams[2],
        PNAME_isBuffer: Buffer.isBuffer(mtrParams[3]),
        PBIRTH: mtrParams[4],
        AGE: mtrParams[5],
        PHONENUM_isBuffer: Buffer.isBuffer(mtrParams[6]),
        SEX_isBuffer: Buffer.isBuffer(mtrParams[7]),
        GUBUN_isBuffer: Buffer.isBuffer(mtrParams[8])
      });
      await pooledQueryDb('mtsmtr', mtrSql, mtrParams);
    } catch (e: any) {
      console.error('Failed to insert into MTR:', e);
      console.error('Error details:', { message: e.message, gdscode: e.gdscode });
      // Do we revert WAIT insert? ideal but complex. 
      // For now, log and allow partial failure (or throw to indicate partial success/failure)
      // User wants it to update, so maybe throw to alert frontend.
      throw e;
    }

    return { message: 'Registered to Wait and MTR' };
  },

  // Update
  update: async (pcode: number | string, visidate: string, data: any) => {
    const tableName = mtswaitService.getTableName(visidate);
    const sql = getWaitUpdateSQL(tableName);

    // const displayNameEncoded = encodeKorean(data.DISPLAYNAME || '');
    // const displayNameHex = displayNameEncoded ? Buffer.from(displayNameEncoded).toString('hex') : '';

    const params = [
      data.RESID1,
      data.RESID2,
      // displayNameHex, // Removed
      pcode,
      visidate
    ];
    return await pooledQueryDb('mtswait', sql, params);
  },

  // Delete
  // Delete
  delete: async (pcode: number | string, visidate: string) => {
    const tableName = mtswaitService.getTableName(visidate);
    const sql = getWaitDeleteSQL(tableName);

    await pooledQueryDb('mtswait', sql, [pcode, visidate]);

    // Cascading delete to MTR table
    const mtrTableName = tableName.replace('WAIT', 'MTR');
    const mtrDeleteSql = getMtrDeleteByPcodeVisidateSQL(mtrTableName);

    try {
      await pooledQueryDb('mtsmtr', mtrDeleteSql, [pcode, visidate]);
      console.log(`Cascaded delete to ${mtrTableName} for PCODE ${pcode}`);
    } catch (err) {
      console.error('Failed to cascade delete to MTR table:', err);
      // Log but don't fail as WAIT delete succeeded
    }

    return { message: 'Wait record deleted (and cascaded to MTR)' };
  },
};

export default mtswaitService;