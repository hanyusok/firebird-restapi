import Firebird from 'node-firebird';
import { mtswaitOptions } from './src/config/database';

const verifyAll = () => {
    console.log('Verifying registrations for 2026-02-11...');

    Firebird.attach(mtswaitOptions, (err, db) => {
        if (err) {
            console.error('Error attaching:', err);
            return;
        }

        const sql = "SELECT * FROM WAIT2026 WHERE VISIDATE = '2026-02-11'";

        db.query(sql, [], (err, result) => {
            db.detach();
            if (err) {
                console.error('Error executing query:', err);
                return;
            }

            console.log('--- Database Content (Direct Query) ---');
            console.log(`Total Records: ${result.length}`);
            result.forEach((row: any) => {
                console.log(`PCODE: ${row.PCODE}, RESID2: ${row.RESID2}, ROOMNM: ${row.ROOMNM}`);
                // Verify ROOMNM is not null/empty/wrong type
            });
            console.log('---------------------------------------');
        });
    });
};

verifyAll();
