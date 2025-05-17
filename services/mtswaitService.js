const { pooledQueryDb } = require('../config/database');
const { processMtswaitFields, encodeKorean, generateResIds } = require('../utils/koreanUtils');
const {
  getWaitByVisidateSQL,
  getWaitInsertSQL,
  getWaitUpdateSQL,
  getWaitDeleteSQL
} = require('./sqlQueries');

const mtswaitService = {

  // Get by VISIDATE
  getByVisitDate: async (visidate) => {
    const sql = getWaitByVisidateSQL();
    const result = await pooledQueryDb('mtswait', sql, [visidate]);
    return processMtswaitFields(result);
  },

  // Create
  create: async (data) => {
    // Generate RESID1 and RESID2 from VISIDATE
    const { resid1, resid2 } = generateResIds(data.VISIDATE);
    // Note: DISPLAYNAME and other encoded fields must be handled in params
    const sql = getWaitInsertSQL();
    const params = [
      data.PCODE,
      data.VISIDATE,
      resid1,
      resid2,
      Buffer.from(encodeKorean(data.DISPLAYNAME || '')).toString('hex'),
      Buffer.from(encodeKorean('제1진료실')).toString('hex'),
      Buffer.from(encodeKorean('가정의학과')).toString('hex'),
      Buffer.from(encodeKorean('한유석')).toString('hex')
    ];
    return await pooledQueryDb('mtswait', sql, params);
  },

  // Update
  update: async (pcode, visidate, data) => {
    const sql = getWaitUpdateSQL();
    const params = [
      data.RESID1,
      data.RESID2,
      Buffer.from(encodeKorean(data.DISPLAYNAME || '')).toString('hex'),
      pcode,
      visidate
    ];
    return await pooledQueryDb('mtswait', sql, params);
  },

  // Delete
  delete: async (pcode, visidate) => {
    const sql = getWaitDeleteSQL();
    return await pooledQueryDb('mtswait', sql, [pcode, visidate]);
  },
};

module.exports = mtswaitService;