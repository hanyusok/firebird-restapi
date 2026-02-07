import { pooledQueryDb } from '../config/database';
import { processKoreanFields, encodeKorean } from '../utils/koreanUtils';
import { getBaseSelectSQL, getPaginatedSelectSQL, getCountSQL } from './sqlQueries';

const personService = {
    // Get all persons with pagination
    getAllPersons: async (page: number = 1, limit: number = 10) => {
        const offset = (page - 1) * limit;
        const sql = `${getPaginatedSelectSQL()} ORDER BY PCODE`;
        const countSql = getCountSQL();

        const [results, countResult] = await Promise.all([
            pooledQueryDb('person', sql, [limit, offset]),
            pooledQueryDb('person', countSql)
        ]);

        const total = countResult[0].TOTAL;
        const processedResults = processKoreanFields(results);

        return {
            data: processedResults,
            pagination: {
                total,
                currentPage: page,
                itemsPerPage: limit,
                totalPages: Math.ceil(total / limit),
                hasNextPage: page * limit < total,
                hasPreviousPage: page > 1
            }
        };
    },

    // Search persons by name and/or birthdate
    search: async (name?: string, birthdate?: string) => {
        let sql = getBaseSelectSQL();
        const conditions: string[] = [];
        // We can't use simple params array easily if we have multiple conditions with potential encoding
        // But we can construct the WHERE clause.

        if (name) {
            const formattedName = name.trim().substring(0, 40).toUpperCase();
            const encodedName = encodeKorean(formattedName);
            const hexName = encodedName ? Buffer.from(encodedName).toString('hex') : '';
            conditions.push(`CAST(PNAME AS VARCHAR(40) CHARACTER SET OCTETS) CONTAINING CAST(X'${hexName}' AS VARCHAR(40) CHARACTER SET OCTETS)`);
        }

        if (birthdate) {
            // Assumes PBIRTH is stored as string 'YYYY-MM-DD' or similar compatible format in DB
            // If DB uses DATE type, we might need cast. equivalent to 'YYYY-MM-DD'
            // Based on previous files, PBIRTH seems to be used as string in inserts.
            // Let's assume it's string matching or direct comparison.
            // Firebird DATE literals are 'YYYY-MM-DD'.
            // Safest is to use parameter if possible, but mixing with the hex string above is tricky if we use pooledQueryDb with simple string concat.
            // Let's try to use params for birthdate.
            // But wait, constructing sql with `?` and passing params array is best.
        }

        // Re-thinking: Use sql string construction for everything to be consistent with the hex approach which is hard to parameterize directly as binary
        // (node-firebird params are mostly for standard types)

        if (birthdate) {
            conditions.push(`PBIRTH = '${birthdate}'`);
        }

        if (conditions.length > 0) {
            sql += ' WHERE ' + conditions.join(' AND ');
        } else {
            // No conditions? Return empty or limit?
            // Schema requires at least one param, so this shouldn't happen essentially.
            return [];
        }

        sql += ' ORDER BY PCODE';

        try {
            const result = await pooledQueryDb('person', sql);
            return processKoreanFields(result);
        } catch (error) {
            console.error('Error in search:', error);
            throw error;
        }
    },

    // Get persons by pcode
    getByPcode: async (pcode: number | string) => {
        const sql = `${getBaseSelectSQL()} WHERE PCODE = ? ORDER BY PCODE`;
        const result = await pooledQueryDb('person', sql, [pcode]);
        return processKoreanFields(result);
    },

    // Get persons by searchId
    getBySearchId: async (searchId: string) => {
        const sql = `${getBaseSelectSQL()} WHERE SEARCHID = ? ORDER BY PCODE`;
        const result = await pooledQueryDb('person', sql, [searchId]);
        return processKoreanFields(result);
    },

    // Get last codes with lock
    getLastCodes: async () => {
        const sql = 'SELECT PCODE, FCODE FROM "LAST" WITH LOCK';
        try {
            const result = await pooledQueryDb('person', sql);
            return result[0] || { PCODE: null, FCODE: null };
        } catch (error) {
            console.error('Error getting last codes:', error);
            throw error;
        }
    },

    // Modify the createPerson function to use the last codes
    createPerson: async (personData: any) => {
        // First get the last codes with lock
        const lastCodes = await personService.getLastCodes();
        console.log('Last codes from LAST table:', lastCodes);

        // Calculate new codes
        let newPcode = (lastCodes.PCODE || 0) + 1;  // Always increment by 1
        let newFcode = (lastCodes.FCODE || 0) + 1;  // Always increment by 1

        console.log('New codes to be used:', { newPcode, newFcode });

        // Update the LAST table with new codes
        console.log('Updating LAST table with new codes');
        await pooledQueryDb('person', 'UPDATE "LAST" SET PCODE = ?, FCODE = ?', [newPcode, newFcode]);

        // Set the new codes in personData
        personData.PCODE = newPcode;
        personData.FCODE = newFcode;

        console.log('Final personData before insertion:', personData);

        // Encode strings to EUC-KR buffers
        const pnameEncoded = encodeKorean(personData.PNAME);
        const relation2Encoded = encodeKorean(personData.RELATION2);

        // Other fields might need encoding if they are strings. 
        // SEX is char(1), usually ASCII.
        // MEMO? 
        const memo1Encoded = encodeKorean(personData.MEMO1);
        const memo2Encoded = encodeKorean(personData.MEMO2);

        const sql = `
            INSERT INTO PERSON (
                PCODE, FCODE, PNAME, PBIRTH, PIDNUM, PIDNUM2, OLDIDNUM,
                SEX, RELATION, RELATION2, CRIPPLED, VINFORM, AGREE, LASTCHECK,
                PERINFO, CARDCHECK, JAEHAN, SEARCHID, PCCHECK, PSNIDT, PSNID,
                MEMO1, MEMO2
            ) VALUES (
                ?, ?, ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?, ?, ?,
                ?, ?
            )
        `;

        const params = [
            // PCODE, FCODE
            newPcode, newFcode,
            // PNAME (Buffer)
            pnameEncoded,
            // PBIRTH, PIDNUM, PIDNUM2, OLDIDNUM
            personData.PBIRTH, personData.PIDNUM, personData.PIDNUM2, personData.OLDIDNUM,
            // SEX
            personData.SEX,
            // RELATION
            personData.RELATION,
            // RELATION2 (Buffer)
            relation2Encoded,
            // CRIPPLED
            personData.CRIPPLED,
            // VINFORM
            personData.VINFORM,
            // AGREE
            personData.AGREE,
            // LASTCHECK
            personData.LASTCHECK,
            // PERINFO
            personData.PERINFO,
            // CARDCHECK
            personData.CARDCHECK,
            // JAEHAN
            personData.JAEHAN,
            // SEARCHID
            personData.SEARCHID,
            // PCCHECK
            personData.PCCHECK,
            // PSNIDT
            personData.PSNIDT,
            // PSNID
            personData.PSNID,
            // MEMO1, MEMO2
            memo1Encoded, memo2Encoded
        ];

        await pooledQueryDb('person', sql, params);

        return { PCODE: newPcode, ...personData };
    },

    // Delete a person by PCODE
    deletePerson: async (pcode: number | string) => {
        const sql = 'DELETE FROM PERSON WHERE PCODE = ?';

        try {
            await pooledQueryDb('person', sql, [pcode]);
            return { success: true, message: 'Person deleted successfully' };
        } catch (error) {
            console.error('Error in deletePerson:', error);
            throw error;
        }
    },

    // Update a person by PCODE
    updatePerson: async (pcode: number | string, personData: any) => {
        // First check if the person exists
        const existingPerson = await personService.getByPcode(pcode);
        if (!existingPerson || (Array.isArray(existingPerson) && existingPerson.length === 0)) {
            throw new Error('Person not found');
        }

        // Prepare the update SQL
        const updateFields: string[] = [];
        const updateValues: any[] = [];

        // Add each field to update
        Object.keys(personData).forEach(key => {
            if (key !== 'PCODE') { // Don't allow updating PCODE
                // Handle Korean fields
                if (['PNAME', 'RELATION2', 'MEMO1', 'MEMO2'].includes(key)) {
                    if (personData[key] && personData[key].trim() !== '') {
                        const encodedVal = encodeKorean(personData[key]);
                        const hexVal = encodedVal ? Buffer.from(encodedVal).toString('hex') : '';
                        updateFields.push(`${key} = CAST(X'${hexVal}' AS VARCHAR(${key === 'PNAME' ? '40' : key === 'RELATION2' ? '6' : '80'}) CHARACTER SET OCTETS)`);
                    } else {
                        updateFields.push(`${key} = NULL`);
                    }
                } else {
                    updateFields.push(`${key} = ?`);
                    updateValues.push(personData[key] || null);
                }
            }
        });

        // Add PCODE to the WHERE clause
        updateValues.push(pcode);

        const sql = `
            UPDATE PERSON
            SET ${updateFields.join(', ')}
            WHERE PCODE = ?
    `;

        try {
            await pooledQueryDb('person', sql, updateValues);
            // Return the updated person
            return await personService.getByPcode(pcode);
        } catch (error) {
            console.error('Error in updatePerson:', error);
            throw error;
        }
    }
};

export default personService;