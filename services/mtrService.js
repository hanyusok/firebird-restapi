const { pooledQueryDb } = require('../config/database');
const { convertToLocalTime } = require('../utils/koreanUtils');
const {
    getMtrAllSQL,
    getMtrByPcodeSQL,
    getMtrByVisidateSQL,
    getMtrInsertSQL,
    getMtrUpdateSQL,
    getMtrDeleteSQL
} = require('./sqlQueries');

class MtrService {
    // Helper function to process dates in result
    static processDates(result) {
        if (Array.isArray(result)) {
            return result.map(item => ({
                ...item,
                VISIDATE: convertToLocalTime(item.VISIDATE),
                VISITIME: convertToLocalTime(item.VISITIME),
                PBIRTH: convertToLocalTime(item.PBIRTH)
            }));
        }
        return {
            ...result,
            VISIDATE: convertToLocalTime(result.VISIDATE),
            VISITIME: convertToLocalTime(result.VISITIME),
            PBIRTH: convertToLocalTime(result.PBIRTH)
        };
    }

    // Get all records
    static async getAll() {
        const sql = getMtrAllSQL();
        const result = await pooledQueryDb('mtsmtr', sql);
        return MtrService.processDates(result || []);
    }

    // Get record by PCODE
    static async getByPcode(pcode) {
        const sql = getMtrByPcodeSQL();
        const result = await pooledQueryDb('mtsmtr', sql, [pcode]);
        return result && result.length > 0 ? MtrService.processDates(result[0]) : null;
    }

    // Get records by VISIDATE
    static async getByVisidate(visidate) {
        const sql = getMtrByVisidateSQL();
        const result = await pooledQueryDb('mtsmtr', sql, [visidate]);
        return MtrService.processDates(result || []);
    }

    // Create new record
    static async create(record) {
        const sql = getMtrInsertSQL();
        const formatDate = (dateStr) => {
            if (!dateStr) return null;
            return dateStr;
        };
        const params = [
            record.PCODE || null,
            formatDate(record.VISIDATE),
            formatDate(record.VISITIME),
            record.PNAME || null,
            formatDate(record.PBIRTH),
            record.AGE || null,
            record.PHONENUM || null,
            record.SEX || '1',
            record.SERIAL || 1,
            record.N || null,
            record.GUBUN || '요양',
            record.RESERVED || null,
            record.FIN || null
        ];
        return await pooledQueryDb('mtsmtr', sql, params);
    }

    // Update record
    static async update(pcode, record) {
        const sql = getMtrUpdateSQL();
        const formatDate = (dateStr) => {
            if (!dateStr) return null;
            return dateStr;
        };
        const params = [
            formatDate(record.VISIDATE),
            formatDate(record.VISITIME),
            record.PNAME || null,
            formatDate(record.PBIRTH),
            record.AGE || null,
            record.PHONENUM || null,
            record.SEX || '1',
            record.SERIAL || 1,
            record.N || null,
            record.GUBUN || '요양',
            record.RESERVED || null,
            record.FIN || null,
            pcode
        ];
        return await pooledQueryDb('mtsmtr', sql, params);
    }

    // Delete record
    static async delete(pcode) {
        const sql = getMtrDeleteSQL();
        return await pooledQueryDb('mtsmtr', sql, [pcode]);
    }
}

module.exports = MtrService; 