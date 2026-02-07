// services/sqlQueries.ts

export const baseSelectFields = 'PCODE, FCODE, CAST(PNAME AS VARCHAR(40) CHARACTER SET OCTETS) as PNAME, PBIRTH, PIDNUM, PIDNUM2, OLDIDNUM, SEX, RELATION, CAST(RELATION2 AS VARCHAR(6) CHARACTER SET OCTETS) as RELATION2, CRIPPLED, VINFORM, AGREE, LASTCHECK, PERINFO, CARDCHECK, JAEHAN, SEARCHID, PCCHECK, PSNIDT, PSNID';

export const getBaseSelectSQL = (): string => `SELECT ${baseSelectFields} FROM PERSON`;

export const getPaginatedSelectSQL = (): string => `SELECT FIRST ? SKIP ? ${baseSelectFields} FROM PERSON`;

export const getCountSQL = (): string => 'SELECT COUNT(*) as total FROM PERSON';

// MTR2025 table fields and queries
export const mtrSelectFields = 'PCODE, VISIDATE, VISITIME, PNAME, PBIRTH, AGE, PHONENUM, SEX, SERIAL, N, GUBUN, RESERVED, FIN';
export const getMtrSelectSQL = (): string => `SELECT ${mtrSelectFields} FROM MTR2025`;
export const getMtrByPcodeSQL = (): string => `${getMtrSelectSQL()} WHERE PCODE = ? ORDER BY VISIDATE DESC, VISITIME DESC`;
export const getMtrByVisidateSQL = (): string => `${getMtrSelectSQL()} WHERE VISIDATE = ? ORDER BY VISITIME`;
export const getMtrAllSQL = (): string => `${getMtrSelectSQL()} ORDER BY VISIDATE DESC, VISITIME DESC`;
export const getMtrInsertSQL = (): string => `INSERT INTO MTR2025 ("#", PCODE, VISIDATE, VISITIME, PNAME, PBIRTH, AGE, PHONENUM, SEX, SERIAL, N, GUBUN, RESERVED, FIN) VALUES (GEN_ID(GEN_MTR2025_SEQ, 1), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
export const getMtrUpdateSQL = (): string => `UPDATE MTR2025 SET VISIDATE = ?, VISITIME = ?, PNAME = ?, PBIRTH = ?, AGE = ?, PHONENUM = ?, SEX = ?, SERIAL = ?, N = ?, GUBUN = ?, RESERVED = ?, FIN = ? WHERE PCODE = ?`;
export const getMtrDeleteSQL = (): string => `DELETE FROM MTR2025 WHERE PCODE = ?`;

// WAIT2025 table fields and queries
export const waitSelectFields = 'PCODE, VISIDATE, RESID1, RESID2, CAST(DISPLAYNAME AS VARCHAR(40) CHARACTER SET OCTETS) as DISPLAYNAME';
export const getWaitSelectSQL = (): string => `SELECT ${waitSelectFields} FROM WAIT2025`;
export const getWaitByVisidateSQL = (): string => `${getWaitSelectSQL()} WHERE VISIDATE = ?`;
export const getWaitInsertSQL = (): string => `INSERT INTO WAIT2025 (PCODE, VISIDATE, RESID1, RESID2, DISPLAYNAME, ROOMCODE, ROOMNM, DEPTCODE, DEPTNM, DOCTRCODE, DOCTRNM) VALUES (?, ?, ?, ?, ?, '1', ?, '14', ?, '63221', ?)`;
export const getWaitUpdateSQL = (): string => `UPDATE WAIT2025 SET RESID1=?, RESID2=?, DISPLAYNAME=? WHERE PCODE=? AND VISIDATE=?`;
export const getWaitDeleteSQL = (): string => `DELETE FROM WAIT2025 WHERE PCODE = ? AND VISIDATE = ?`;