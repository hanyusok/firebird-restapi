const { getMtsmtrDb } = require('../config/database');

class MtrService {
    // Get all records
    static async getAll() {
        return new Promise((resolve, reject) => {
            getMtsmtrDb((err, db) => {
                if (err) {
                    console.error('Database connection error:', err);
                    return reject(err);
                }

                const sql = `
                    SELECT PCODE, VISIDATE, VISITIME, PNAME, PBIRTH, AGE, PHONENUM, SEX, SERIAL,
                           N, GUBUN, RESERVED, FIN
                    FROM MTR2025
                    ORDER BY VISIDATE DESC, VISITIME DESC
                `;

                db.query(sql, (err, result) => {
                    db.detach();
                    if (err) {
                        console.error('Query execution error:', err);
                        return reject(err);
                    }
                    resolve(result || []);
                });
            });
        });
    }

    // Get record by PCODE
    static async getByPcode(pcode) {
        return new Promise((resolve, reject) => {
            getMtsmtrDb((err, db) => {
                if (err) {
                    console.error('Database connection error:', err);
                    return reject(err);
                }

                const sql = `
                    SELECT PCODE, VISIDATE, VISITIME, PNAME, PBIRTH, AGE, PHONENUM, SEX, SERIAL,
                           N, GUBUN, RESERVED, FIN
                    FROM MTR2025 
                    WHERE PCODE = ?
                    ORDER BY VISIDATE DESC, VISITIME DESC
                `;

                db.query(sql, [pcode], (err, result) => {
                    db.detach();
                    if (err) {
                        console.error('Query execution error:', err);
                        return reject(err);
                    }
                    resolve(result && result.length > 0 ? result[0] : null);
                });
            });
        });
    }

    // Get records by VISIDATE
    static async getByVisidate(visidate) {
        return new Promise((resolve, reject) => {
            getMtsmtrDb((err, db) => {
                if (err) {
                    console.error('Database connection error:', err);
                    return reject(err);
                }

                const sql = `
                    SELECT PCODE, VISIDATE, VISITIME, PNAME, PBIRTH, AGE, PHONENUM, SEX, SERIAL,
                           N, GUBUN, RESERVED, FIN
                    FROM MTR2025 
                    WHERE VISIDATE = ?
                    ORDER BY VISITIME
                `;

                db.query(sql, [visidate], (err, result) => {
                    db.detach();
                    if (err) {
                        console.error('Query execution error:', err);
                        return reject(err);
                    }
                    resolve(result || []);
                });
            });
        });
    }

    // Create new record
    static async create(record) {
        return new Promise((resolve, reject) => {
            getMtsmtrDb((err, db) => {
                if (err) {
                    console.error('Database connection error:', err);
                    return reject(err);
                }

                const sql = `
                    INSERT INTO MTR2025 (
                        "#", PCODE, VISIDATE, VISITIME, PNAME, PBIRTH, AGE, PHONENUM, SEX, SERIAL,
                        N, GUBUN, RESERVED, FIN
                    ) VALUES (
                        GEN_ID(GEN_MTR2025_SEQ, 1), ?, ?, ?, ?, ?, ?, ?, ?, ?,
                        ?, ?, ?, ?
                    )
                `;

                // Convert empty strings to null for date/time fields
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

                db.query(sql, params, (err, result) => {
                    if (err) {
                        console.error('Query execution error:', err);
                        db.detach();
                        return reject(err);
                    }
                    
                    // The transaction is automatically committed after the query
                    db.detach();
                    resolve(result);
                });
            });
        });
    }

    // Update record
    static async update(pcode, record) {
        return new Promise((resolve, reject) => {
            getMtsmtrDb((err, db) => {
                if (err) {
                    console.error('Database connection error:', err);
                    return reject(err);
                }

                const sql = `
                    UPDATE MTR2025 
                    SET VISIDATE = ?, 
                        VISITIME = ?, 
                        PNAME = ?, 
                        PBIRTH = ?, 
                        AGE = ?, 
                        PHONENUM = ?,
                        SEX = ?,
                        SERIAL = ?,
                        N = ?,
                        GUBUN = ?,
                        RESERVED = ?,
                        FIN = ?
                    WHERE PCODE = ?
                `;

                // Convert empty strings to null for date/time fields
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

                db.query(sql, params, (err, result) => {
                    db.detach();
                    if (err) {
                        console.error('Query execution error:', err);
                        return reject(err);
                    }
                    resolve(result);
                });
            });
        });
    }

    // Delete record
    static async delete(pcode) {
        return new Promise((resolve, reject) => {
            getMtsmtrDb((err, db) => {
                if (err) {
                    console.error('Database connection error:', err);
                    return reject(err);
                }

                const sql = `DELETE FROM MTR2025 WHERE PCODE = ?`;

                db.query(sql, [pcode], (err, result) => {
                    db.detach();
                    if (err) {
                        console.error('Query execution error:', err);
                        return reject(err);
                    }
                    resolve(result);
                });
            });
        });
    }
}

module.exports = MtrService; 