// services/sqlQueries.ts

export const baseSelectFields = 'PCODE, FCODE, CAST(PNAME AS VARCHAR(40) CHARACTER SET OCTETS) as PNAME, PBIRTH, PIDNUM, PIDNUM2, OLDIDNUM, SEX, RELATION, CAST(RELATION2 AS VARCHAR(6) CHARACTER SET OCTETS) as RELATION2, CRIPPLED, VINFORM, AGREE, LASTCHECK, PERINFO, CARDCHECK, JAEHAN, SEARCHID, PCCHECK, PSNIDT, PSNID';

export const getBaseSelectSQL = (): string => `SELECT ${baseSelectFields} FROM PERSON`;

export const getPaginatedSelectSQL = (): string => `SELECT FIRST ? SKIP ? ${baseSelectFields} FROM PERSON`;

export const getCountSQL = (): string => 'SELECT COUNT(*) as total FROM PERSON';

// MTR2025 table fields and queries
export const mtrSelectFields = '"#", PCODE, VISIDATE, VISITIME, PNAME, PBIRTH, AGE, PHONENUM, SEX, SERIAL, N, GUBUN, RESERVED, FIN';
export const getMtrSelectSQL = (tableName: string = 'MTR2025'): string => `SELECT ${mtrSelectFields} FROM ${tableName}`;
export const getMtrByPcodeSQL = (tableName: string = 'MTR2025'): string => `${getMtrSelectSQL(tableName)} WHERE PCODE = ? ORDER BY VISIDATE DESC, VISITIME DESC`;
export const getMtrByVisidateSQL = (tableName: string = 'MTR2025'): string => `${getMtrSelectSQL(tableName)} WHERE VISIDATE = ? ORDER BY VISITIME`;
export const getMtrAllSQL = (tableName: string = 'MTR2025'): string => `${getMtrSelectSQL(tableName)} ORDER BY VISIDATE DESC, VISITIME DESC`;
export const getMtrInsertSQL = (tableName: string = 'MTR2025'): string => `INSERT INTO ${tableName} ("#", PCODE, VISIDATE, VISITIME, PNAME, PBIRTH, AGE, PHONENUM, SEX, SERIAL, N, GUBUN, RESERVED, FIN) VALUES (GEN_ID(GEN_${tableName}_SEQ, 1), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
export const getMtrUpdateSQL = (tableName: string = 'MTR2025'): string => `UPDATE ${tableName} SET VISITIME = ?, PNAME = ?, PBIRTH = ?, AGE = ?, PHONENUM = ?, SEX = ?, GUBUN = ? WHERE "#" = ?`;
export const getMtrDeleteSQL = (tableName: string = 'MTR2025'): string => `DELETE FROM ${tableName} WHERE "#" = ?`;

// WAIT tables (Dynamic table name)
// Updated: WAIT2026 does not store PNAME. We must join with PERSON table or fetch separately.
// Include all columns with CAST for Korean text fields
export const waitSelectFields = 'PCODE, VISIDATE, RESID1, RESID2, GOODOC, ROOMCODE, CAST(ROOMNM AS VARCHAR(40) CHARACTER SET OCTETS) as ROOMNM, DEPTCODE, CAST(DEPTNM AS VARCHAR(40) CHARACTER SET OCTETS) as DEPTNM, DOCTRCODE, CAST(DOCTRNM AS VARCHAR(40) CHARACTER SET OCTETS) as DOCTRNM, D_ALARM, PSN';
export const getWaitSelectSQL = (tableName: string = 'WAIT2025'): string => `SELECT ${waitSelectFields} FROM ${tableName}`;
export const getWaitByVisidateSQL = (tableName: string = 'WAIT2025'): string => `${getWaitSelectSQL(tableName)} WHERE VISIDATE = ?`;
export const getWaitInsertSQL = (tableName: string = 'WAIT2025'): string => `INSERT INTO ${tableName} (PCODE, VISIDATE, RESID1, RESID2, ROOMCODE, ROOMNM, DEPTCODE, DEPTNM, DOCTRCODE, DOCTRNM, GOODOC) VALUES (?, ?, ?, ?, '1', ?, '14', ?, '63221', ?, '')`;
export const getWaitUpdateSQL = (tableName: string = 'WAIT2025'): string => `UPDATE ${tableName} SET RESID1=?, RESID2=? WHERE PCODE=? AND VISIDATE=?`;
export const getWaitDeleteSQL = (tableName: string = 'WAIT2025'): string => `DELETE FROM ${tableName} WHERE PCODE = ? AND VISIDATE = ?`;