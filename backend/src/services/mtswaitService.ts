import Firebird from 'node-firebird';
import { pooledQueryDb, mtswaitOptions } from '../config/database';
import { processMtswaitFields, encodeKorean, generateResIds } from '../utils/koreanUtils';
import {
  getWaitByVisidateSQL,
  getWaitInsertSQL,
  getWaitUpdateSQL,
  getWaitDeleteSQL
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

    // Generate RESID1 and RESID2 from VISIDATE
    const { resid1, resid2 } = generateResIds(data.VISIDATE);

    // Encode strings
    // const displayNameEncoded = encodeKorean(data.DISPLAYNAME || '');
    // const displayNameHex = displayNameEncoded ? Buffer.from(displayNameEncoded).toString('hex') : '';
    // Name is not stored in WAIT table anymore

    // Hardcoded logic from original file
    const room = encodeKorean('제1진료실');
    const dept = encodeKorean('가정의학과');
    const doctor = encodeKorean('한유석');

    const roomHex = room ? Buffer.from(room).toString('hex') : '';
    const deptHex = dept ? Buffer.from(dept).toString('hex') : '';
    const doctorHex = doctor ? Buffer.from(doctor).toString('hex') : '';

    const sql = getWaitInsertSQL(tableName);

    const paramsFixed = [
      data.PCODE,
      data.VISIDATE,
      resid1,
      resid2,
      // displayNameHex, // Removed
      roomHex,
      deptHex,
      doctorHex
    ];

    return await pooledQueryDb('mtswait', sql, paramsFixed);
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
  delete: async (pcode: number | string, visidate: string) => {
    const tableName = mtswaitService.getTableName(visidate);
    const sql = getWaitDeleteSQL(tableName);
    return await pooledQueryDb('mtswait', sql, [pcode, visidate]);
  },
};

export default mtswaitService;