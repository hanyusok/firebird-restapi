// services/sqlQueries.js
const baseSelectFields = 'PCODE, FCODE, CAST(PNAME AS VARCHAR(40) CHARACTER SET OCTETS) as PNAME, PBIRTH, PIDNUM, PIDNUM2, OLDIDNUM, SEX, RELATION, CAST(RELATION2 AS VARCHAR(6) CHARACTER SET OCTETS) as RELATION2, CRIPPLED, VINFORM, AGREE, LASTCHECK, PERINFO, CARDCHECK, JAEHAN, SEARCHID, PCCHECK, PSNIDT, PSNID';

const getBaseSelectSQL = () => `SELECT ${baseSelectFields} FROM PERSON`;

const getPaginatedSelectSQL = () => `SELECT FIRST ? SKIP ? ${baseSelectFields} FROM PERSON`;

const getCountSQL = () => 'SELECT COUNT(*) as total FROM PERSON';

// MTR2025 table fields and queries
const mtrSelectFields = 'PCODE, VISIDATE, VISITIME, PNAME, PBIRTH, AGE, PHONENUM, SEX, SERIAL, N, GUBUN, RESERVED, FIN';
const getMtrSelectSQL = () => `SELECT ${mtrSelectFields} FROM MTR2025`;
const getMtrByPcodeSQL = () => `${getMtrSelectSQL()} WHERE PCODE = ? ORDER BY VISIDATE DESC, VISITIME DESC`;
const getMtrByVisidateSQL = () => `${getMtrSelectSQL()} WHERE VISIDATE = ? ORDER BY VISITIME`;
const getMtrAllSQL = () => `${getMtrSelectSQL()} ORDER BY VISIDATE DESC, VISITIME DESC`;
const getMtrInsertSQL = () => `INSERT INTO MTR2025 ("#", PCODE, VISIDATE, VISITIME, PNAME, PBIRTH, AGE, PHONENUM, SEX, SERIAL, N, GUBUN, RESERVED, FIN) VALUES (GEN_ID(GEN_MTR2025_SEQ, 1), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
const getMtrUpdateSQL = () => `UPDATE MTR2025 SET VISIDATE = ?, VISITIME = ?, PNAME = ?, PBIRTH = ?, AGE = ?, PHONENUM = ?, SEX = ?, SERIAL = ?, N = ?, GUBUN = ?, RESERVED = ?, FIN = ? WHERE PCODE = ?`;
const getMtrDeleteSQL = () => `DELETE FROM MTR2025 WHERE PCODE = ?`;

// WAIT2025 table fields and queries
const waitSelectFields = 'PCODE, VISIDATE, RESID1, RESID2, CAST(DISPLAYNAME AS VARCHAR(40) CHARACTER SET OCTETS) as DISPLAYNAME';
const getWaitSelectSQL = () => `SELECT ${waitSelectFields} FROM WAIT2025`;
const getWaitByVisidateSQL = () => `${getWaitSelectSQL()} WHERE VISIDATE = ?`;
const getWaitInsertSQL = () => `INSERT INTO WAIT2025 (PCODE, VISIDATE, RESID1, RESID2, DISPLAYNAME, ROOMCODE, ROOMNM, DEPTCODE, DEPTNM, DOCTRCODE, DOCTRNM) VALUES (?, ?, ?, ?, ?, '1', ?, '14', ?, '63221', ?)`;
const getWaitUpdateSQL = () => `UPDATE WAIT2025 SET RESID1=?, RESID2=?, DISPLAYNAME=? WHERE PCODE=? AND VISIDATE=?`;
const getWaitDeleteSQL = () => `DELETE FROM WAIT2025 WHERE PCODE = ? AND VISIDATE = ?`;

module.exports = {
    baseSelectFields,
    getBaseSelectSQL,
    getPaginatedSelectSQL,
    getCountSQL,
    // MTR2025
    mtrSelectFields,
    getMtrSelectSQL,
    getMtrByPcodeSQL,
    getMtrByVisidateSQL,
    getMtrAllSQL,
    getMtrInsertSQL,
    getMtrUpdateSQL,
    getMtrDeleteSQL,
    // WAIT2025
    waitSelectFields,
    getWaitSelectSQL,
    getWaitByVisidateSQL,
    getWaitInsertSQL,
    getWaitUpdateSQL,
    getWaitDeleteSQL
};