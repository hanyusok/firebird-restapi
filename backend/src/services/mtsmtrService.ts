import { pooledQueryDb } from '../config/database';
import { processKoreanFields } from '../utils/koreanUtils';
import { getMtrByVisidateSQL, getMtrInsertSQL, getMtrUpdateSQL, getMtrDeleteSQL } from './sqlQueries';

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
            data.RESERVED || '',
            data.FIN || ''
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
            id  // "#" column value
        ];

        await pooledQueryDb('mtsmtr', sql, params);
        return { message: 'MTR record updated' };
    },

    delete: async (id: number, visidate: string) => {
        const tableName = mtsmtrService.getTableName(visidate);
        const sql = getMtrDeleteSQL(tableName);

        await pooledQueryDb('mtsmtr', sql, [id]);
        return { message: 'MTR record deleted' };
    }
};

export default mtsmtrService;
