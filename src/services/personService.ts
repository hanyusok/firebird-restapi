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

    // Get persons by name
    getByName: async (name: string) => {
        // Ensure the name is properly formatted for PNAME field
        const formattedName = name.trim().substring(0, 40).toUpperCase();
        const encodedName = encodeKorean(formattedName);
        const hexName = encodedName ? Buffer.from(encodedName).toString('hex') : '';
        const sql = `${getBaseSelectSQL()} WHERE CAST(PNAME AS VARCHAR(40) CHARACTER SET OCTETS) CONTAINING CAST(X'${hexName}' AS VARCHAR(40) CHARACTER SET OCTETS) ORDER BY PCODE`;

        try {
            const result = await pooledQueryDb('person', sql);
            const processedResult = processKoreanFields(result);
            return processedResult;
        } catch (error) {
            console.error('Error in searchByName:', error);
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

        const hexPname = personData.PNAME ? Buffer.from(encodeKorean(personData.PNAME) || '').toString('hex') : '';
        const hexRelation2 = personData.RELATION2 ? Buffer.from(encodeKorean(personData.RELATION2) || '').toString('hex') : '';

        const sql = `
            INSERT INTO PERSON (
                PCODE, FCODE, PNAME, PBIRTH, PIDNUM, PIDNUM2, OLDIDNUM,
                SEX, RELATION, RELATION2, CRIPPLED, VINFORM, AGREE, LASTCHECK,
                PERINFO, CARDCHECK, JAEHAN, SEARCHID, PCCHECK, PSNIDT, PSNID
            ) VALUES (
                ?, ?, CAST(X'${hexPname}' AS VARCHAR(40) CHARACTER SET OCTETS), ?, ?, ?, ?,
                ?, ?, CAST(X'${hexRelation2}' AS VARCHAR(6) CHARACTER SET OCTETS), ?, ?, ?, ?,
                ?, ?, ?, ?, ?, ?, ?
            )
        `;

        const params = [
            personData.PCODE,
            personData.FCODE,
            personData.PBIRTH || null,
            personData.PIDNUM || null,
            personData.PIDNUM2 || null,
            personData.OLDIDNUM || null,
            personData.SEX || null,
            personData.RELATION || null,
            personData.CRIPPLED || null,
            personData.VINFORM || null,
            personData.AGREE || null,
            personData.LASTCHECK || null,
            personData.PERINFO || null,
            personData.CARDCHECK || null,
            personData.JAEHAN || null,
            personData.SEARCHID || null,
            personData.PCCHECK || null,
            personData.PSNIDT || null,
            personData.PSNID || null
        ];

        try {
            console.log('Attempting to insert person with PCODE:', personData.PCODE);
            await pooledQueryDb('person', sql, params);
            console.log('Successfully inserted person');

            // Verify the LAST table after insertion
            const verifyLastCodes = await personService.getLastCodes();
            console.log('LAST table after insertion:', verifyLastCodes);

            return await personService.getByPcode(personData.PCODE);
        } catch (error) {
            console.error('Error in createPerson:', error);
            throw error;
        }
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