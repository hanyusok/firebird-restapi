// services/sqlQueries.js
const baseSelectFields = 'PCODE, FCODE, CAST(PNAME AS VARCHAR(40) CHARACTER SET OCTETS) as PNAME, PBIRTH, PIDNUM, PIDNUM2, OLDIDNUM, SEX, RELATION, CAST(RELATION2 AS VARCHAR(6) CHARACTER SET OCTETS) as RELATION2, CRIPPLED, VINFORM, AGREE, LASTCHECK, PERINFO, CARDCHECK, JAEHAN, SEARCHID, PCCHECK, PSNIDT, PSNID';

const getBaseSelectSQL = () => `SELECT ${baseSelectFields} FROM PERSON`;

const getPaginatedSelectSQL = () => `SELECT FIRST ? SKIP ? ${baseSelectFields} FROM PERSON`;

const getCountSQL = () => 'SELECT COUNT(*) as total FROM PERSON';

module.exports = {
    baseSelectFields,
    getBaseSelectSQL,
    getPaginatedSelectSQL,
    getCountSQL
};