import { pooledQueryDb } from '../config/database';
import { processMtswaitFields, encodeKorean, generateResIds } from '../utils/koreanUtils';
import {
  getWaitByVisidateSQL,
  getWaitInsertSQL,
  getWaitUpdateSQL,
  getWaitDeleteSQL
} from './sqlQueries';

const mtswaitService = {

  // Get by VISIDATE
  getByVisitDate: async (visidate: string) => {
    const sql = getWaitByVisidateSQL();
    const result = await pooledQueryDb('mtswait', sql, [visidate]);
    return processMtswaitFields(result);
  },

  // Create
  create: async (data: any) => {
    // Generate RESID1 and RESID2 from VISIDATE
    const { resid1, resid2 } = generateResIds(data.VISIDATE);

    // Encode strings
    const displayNameEncoded = encodeKorean(data.DISPLAYNAME || '');
    const displayNameHex = displayNameEncoded ? Buffer.from(displayNameEncoded).toString('hex') : '';

    // Hardcoded logic from original file
    const room = encodeKorean('제1진료실');
    const dept = encodeKorean('가정의학과');
    const doctor = encodeKorean('한유석');

    const roomHex = room ? Buffer.from(room).toString('hex') : '';
    const deptHex = dept ? Buffer.from(dept).toString('hex') : '';
    const doctorHex = doctor ? Buffer.from(doctor).toString('hex') : '';

    const sql = getWaitInsertSQL();
    const params = [
      data.PCODE,
      data.VISIDATE,
      resid1,
      resid2,
      displayNameHex,
      roomHex, // '1' is handled in SQL? No, roomname passed as encoded
      // wait, the SQL has hardcoded '1', '14', '63221'. The values are for names?
      // Original: getWaitInsertSQL() => ... VALUES (?, ?, ?, ?, ?, '1', ?, '14', ?, '63221', ?)
      // Params count: 5 + 1 + 1 + 1 = 8?
      // Original params: [PCODE, VISIDATE, RESID1, RESID2, hex(DISPLAYNAME), hex('...'), hex('...'), hex('...')]
      // 1. PCODE
      // 2. VISIDATE
      // 3. RESID1
      // 4. RESID2
      // 5. DISPLAYNAME
      // 6. ROOMNM (after '1')
      // 7. DEPTNM (after '14')
      // 8. DOCTRNM (after '63221')

      deptHex,
      doctorHex
      // Wait, let's double check the SQL in sqlQueries.ts vs params here
    ];

    // Re-checking SQL:
    // ... VALUES (?, ?, ?, ?, ?, '1', ?, '14', ?, '63221', ?)
    // ?1: PCODE
    // ?2: VISIDATE
    // ?3: RESID1
    // ?4: RESID2
    // ?5: DISPLAYNAME
    // '1'
    // ?6: ROOMNM
    // '14'
    // ?7: DEPTNM
    // '63221'
    // ?8: DOCTRNM

    // My previous 'roomHex' corresponds to ?6?
    // original: Buffer.from(encodeKorean('제1진료실')).toString('hex') -> ROOMNM
    // original: Buffer.from(encodeKorean('가정의학과')).toString('hex') -> DEPTNM
    // original: Buffer.from(encodeKorean('한유석')).toString('hex') -> DOCTRNM

    // So params should be:
    const paramsFixed = [
      data.PCODE,
      data.VISIDATE,
      resid1,
      resid2,
      displayNameHex,
      roomHex,
      deptHex,
      doctorHex
    ];

    return await pooledQueryDb('mtswait', sql, paramsFixed);
  },

  // Update
  update: async (pcode: number | string, visidate: string, data: any) => {
    const sql = getWaitUpdateSQL();

    const displayNameEncoded = encodeKorean(data.DISPLAYNAME || '');
    const displayNameHex = displayNameEncoded ? Buffer.from(displayNameEncoded).toString('hex') : '';

    const params = [
      data.RESID1,
      data.RESID2,
      displayNameHex,
      pcode,
      visidate
    ];
    return await pooledQueryDb('mtswait', sql, params);
  },

  // Delete
  delete: async (pcode: number | string, visidate: string) => {
    const sql = getWaitDeleteSQL();
    return await pooledQueryDb('mtswait', sql, [pcode, visidate]);
  },
};

export default mtswaitService;