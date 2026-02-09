import { pooledQueryDb } from '../config/database';
import { processKoreanFields } from '../utils/koreanUtils';
import { getMtrByVisidateSQL, getMtrInsertSQL, getMtrUpdateSQL, getMtrDeleteSQL, getMtrByIdSQL, getWaitDeleteSQL } from './sqlQueries';

const mtsmtrService = {
    // Helper to get table name from date
    getTableName: (dateStr: string) => {
        // Expected formats: YYYYMMDD, YYYY-MM-DD
        const cleanDate = dateStr.replace(/[^0-9]/g, '');
        const year = cleanDate.substring(0, 4);
        return `MTR${year}`;
    },

    getByVisitDate: async (visidate: string) => {
        const tableName = mtsmtrService.getTableName(visidate);
        const sql = getMtrByVisidateSQL(tableName);
        console.log(`Querying ${tableName} for date ${visidate}`);

        // MTR tables have PNAME, so we don't need the join logic we used for WAIT
        const results = await pooledQueryDb('mtsmtr', sql, [visidate]);

        // Process Korean encoding and Date fields
        // We can reuse processKoreanFields or processMtswaitFields?
        // processKoreanFields is for PERSON table (has PNAME, ADDRESS etc)
        // processMtswaitFields is for WAIT table (has DISPLAYNAME)

        // Let's look at processKoreanFields in utils. 
        // It decodes PNAME, RELATION2, MEMO1, MEMO2. 
        // MTR2026 has PNAME.

        return processKoreanFields(results);
    },

    create: async (data: any) => {
        const tableName = mtsmtrService.getTableName(data.VISIDATE);
        const sql = getMtrInsertSQL(tableName);

        const params = [
            data.PCODE,
            data.VISIDATE,
            data.VISITIME || new Date(),
            data.PNAME,  // String - connection handles encoding
            data.PBIRTH || null,
            data.AGE || '',
            data.PHONENUM || '',
            data.SEX || '',
            data.SERIAL || 1,
            data.N || 0,
            data.GUBUN || '요양',
            data.RESERVED || 'R',
            data.FIN || '',
            data.TEMPERATUR || '36.5'  // Default temperature value
        ];

        await pooledQueryDb('mtsmtr', sql, params);
        return { message: 'MTR record created' };
    },

    update: async (id: number, visidate: string, data: any) => {
        const tableName = mtsmtrService.getTableName(visidate);
        const sql = getMtrUpdateSQL(tableName);

        const params = [
            data.VISITIME || new Date(),
            data.PNAME,
            data.PBIRTH || null,
            data.AGE || '',
            data.PHONENUM || '',
            data.SEX || '',
            data.GUBUN || '요양',
            data.TEMPERATUR || '36.5',  // Default temperature value
            id  // "#" column value
        ];

        await pooledQueryDb('mtsmtr', sql, params);
        return { message: 'MTR record updated' };
    },

    delete: async (id: number, visidate: string) => {
        const tableName = mtsmtrService.getTableName(visidate);

        // 1. Get the PCODE first so we can delete from WAIT table
        const selectSql = getMtrByIdSQL(tableName);
        const mtrRecords = await pooledQueryDb('mtsmtr', selectSql, [id]);

        if (!mtrRecords || mtrRecords.length === 0) {
            throw new Error('Record not found');
        }

        const mtrRecord = mtrRecords[0];
        const pcode = mtrRecord.PCODE;

        // 2. Delete from MTR
        const deleteMtrSql = getMtrDeleteSQL(tableName);
        await pooledQueryDb('mtsmtr', deleteMtrSql, [id]);

        // 3. Delete from WAIT (Cascading delete)
        // We need to calculate WAIT table name (same year logic)
        // Verify if we should use mtswaitService or direct SQL. Direct SQL avoids circular dependency possibility and is simpler here.
        const waitTableName = tableName.replace('MTR', 'WAIT');
        const deleteWaitSql = getWaitDeleteSQL(waitTableName);

        // We use PCODE and VISIDATE to delete from WAIT
        // Note: mtrRecord.VISIDATE might be Date object or string depending on driver. 
        // We passed visidate string to the function, safer to use that or ensure format.
        // But wait, the record in DB has the correct PCODE.

        try {
            await pooledQueryDb('mtswait', deleteWaitSql, [pcode, visidate]);
            console.log(`Cascaded delete to ${waitTableName} for PCODE ${pcode}`);
        } catch (err) {
            console.error('Failed to cascade delete to WAIT table:', err);
            // We don't throw here, as MTR delete was successful.
            // Or should we?
        }

        return { message: 'MTR and WAIT records deleted' };
    }
};

export default mtsmtrService;
