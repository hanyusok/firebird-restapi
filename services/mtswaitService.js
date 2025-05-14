const { getMtswaitDb } = require('../config/database');
const { processMtswaitFields, encodeKorean, generateResIds } = require('../utils/koreanUtils');

const mtswaitService = {

  // Get by VISIDATE
  getByVisitDate: (visidate) => new Promise((resolve, reject) => {
    getMtswaitDb((err, db) => {
      if (err) return reject(err);
      const sql = `SELECT 
        PCODE, VISIDATE, RESID1, RESID2,
        CAST(DISPLAYNAME AS VARCHAR(40) CHARACTER SET OCTETS) as DISPLAYNAME
        FROM WAIT2025 WHERE VISIDATE = ?`;
      db.query(sql, [visidate], (err, result) => {
        db.detach();
        if (err) return reject(err);
        resolve(processMtswaitFields(result));
      });
    });
  }),

  // Create
  create: (data) => new Promise((resolve, reject) => {
    getMtswaitDb((err, db) => {
      if (err) return reject(err);
      
      // Generate RESID1 and RESID2 from VISIDATE
      const { resid1, resid2 } = generateResIds(data.VISIDATE);
      
      const sql = `INSERT INTO WAIT2025 (
        PCODE, VISIDATE, RESID1, RESID2, DISPLAYNAME,
        ROOMCODE, ROOMNM, DEPTCODE, DEPTNM, DOCTRCODE, DOCTRNM
      ) VALUES (
        ?, ?, ?, ?, CAST(X'${Buffer.from(encodeKorean(data.DISPLAYNAME || '')).toString('hex')}' AS VARCHAR(40) CHARACTER SET OCTETS),
        '1', CAST(X'${Buffer.from(encodeKorean('제1진료실')).toString('hex')}' AS VARCHAR(40) CHARACTER SET OCTETS),
        '14', CAST(X'${Buffer.from(encodeKorean('가정의학과')).toString('hex')}' AS VARCHAR(40) CHARACTER SET OCTETS),
        '63221', CAST(X'${Buffer.from(encodeKorean('한유석')).toString('hex')}' AS VARCHAR(40) CHARACTER SET OCTETS)
      )`;
      const params = [
        data.PCODE,
        data.VISIDATE,
        resid1,
        resid2
      ];
      db.query(sql, params, (err, result) => {
        db.detach();
        if (err) return reject(err);
        resolve(result);
      });
    });
  }),

  // Update
  update: (pcode, visidate, data) => new Promise((resolve, reject) => {
    getMtswaitDb((err, db) => {
      if (err) return reject(err);
      const sql = `UPDATE WAIT2025 SET 
        RESID1=?, RESID2=?, DISPLAYNAME=CAST(X'${Buffer.from(encodeKorean(data.DISPLAYNAME || '')).toString('hex')}' AS VARCHAR(40) CHARACTER SET OCTETS)
        WHERE PCODE=? AND VISIDATE=?`;
      const params = [
        data.RESID1,
        data.RESID2,
        pcode,
        visidate
      ];
      db.query(sql, params, (err, result) => {
        db.detach();
        if (err) return reject(err);
        resolve(result);
      });
    });
  }),

  // Delete
  delete: (pcode, visidate) => new Promise((resolve, reject) => {
    getMtswaitDb((err, db) => {
      if (err) return reject(err);
      db.query('DELETE FROM WAIT2025 WHERE PCODE = ? AND VISIDATE = ?', [pcode, visidate], (err, result) => {
        db.detach();
        if (err) return reject(err);
        resolve(result);
      });
    });
  }),
};

module.exports = mtswaitService;