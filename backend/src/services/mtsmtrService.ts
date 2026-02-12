import { pooledQueryDb } from '../config/database';
import { processKoreanFields } from '../utils/koreanUtils';
import {
    getMtrByVisidateSQL,
    getMtrByVisidateAndFinSQL,
    getMtrInsertSQL,
    getMtrUpdateSQL,
    getMtrDeleteSQL,
    getMtrByIdSQL,
    getWaitDeleteSQL
} from './sqlQueries';

const mtsmtrService = {
    // Helper to get table name from date
    getTableName: (dateStr: string) => {
        // Expected formats: YYYYMMDD, YYYY-MM-DD
        const cleanDate = dateStr.replace(/[^0-9]/g, '');
        const year = cleanDate.substring(0, 4);
        return `MTR${year}`;
    },

    getByVisitDate: async (visidate: string, fin?: string) => {
        const tableName = mtsmtrService.getTableName(visidate);

        let sql: string;
        const params: any[] = [visidate];

        if (fin !== undefined) {
            sql = getMtrByVisidateAndFinSQL(tableName);
            params.push(fin);
        } else {
            sql = getMtrByVisidateSQL(tableName);
        }

        console.log(`Querying ${tableName} for date ${visidate} with fin='${fin}'`);

        // MTR tables have PNAME, so we don't need the join logic we used for WAIT
        const results = await pooledQueryDb('mtsmtr', sql, params);

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
        const waitTableName = tableName.replace('MTR', 'WAIT');
        const deleteWaitSql = getWaitDeleteSQL(waitTableName);

        try {
            await pooledQueryDb('mtswait', deleteWaitSql, [pcode, visidate]);
            console.log(`Cascaded delete to ${waitTableName} for PCODE ${pcode}`);
        } catch (err) {
            console.error('Failed to cascade delete to WAIT table:', err);
        }

        return { message: 'MTR and WAIT records deleted' };
    }
};

export default mtsmtrService;
