import Firebird from 'node-firebird';
import { mtsmtrOptions } from './src/config/database';

const verifyMtrSchema = () => {
    console.log('Connecting to MTSMTR...');
    console.log('DB Path:', mtsmtrOptions.database);

    Firebird.attach(mtsmtrOptions, (err, db) => {
        if (err) {
            console.error('Error attaching:', err);
            return;
        }
        console.log('Connected!');

        // Check if MTR2026 exists and get its fields
        const sql = `
            SELECT RDB$FIELD_NAME 
            FROM RDB$RELATION_FIELDS 
            WHERE RDB$RELATION_NAME = 'MTR2026'
            ORDER BY RDB$FIELD_POSITION
        `;

        db.query(sql, [], (err, result) => {
            if (err) {
                console.error('Error querying schema:', err);
                db.detach();
                return;
            }

            console.log('--- Columns in MTR2026 ---');
            result.forEach((row: any) => {
                console.log(row.RDB$FIELD_NAME.trim());
            });
            console.log('--------------------------');

            // Also fetch 1 row to see data
            db.query('SELECT FIRST 1 * FROM MTR2026', [], (err, rows) => {
                db.detach();
                if (err) {
                    console.error('Error fetching data:', err);
                    return;
                }
                console.log('--- Sample Data ---');
                console.log(rows);
            });
        });
    });
};

verifyMtrSchema();
