import { pooledQueryDb } from '../config/database';
import { processKoreanFields } from '../utils/koreanUtils';
import { getMtrByVisidateSQL } from './sqlQueries';

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
    }
};

export default mtsmtrService;
