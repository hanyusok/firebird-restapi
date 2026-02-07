import Firebird from 'node-firebird';
import { mtsmtrOptions } from './src/config/database';

const checkMtr = () => {
    console.log('Checking MTR2026 for PCODE 7690...');

    Firebird.attach(mtsmtrOptions, (err, db) => {
        if (err) {
            console.error('Error attaching:', err);
            return;
        }

        const sql = "SELECT * FROM MTR2026 WHERE PCODE = 7690 AND VISIDATE = '2026-02-10'";

        db.query(sql, [], (err, result) => {
            db.detach();
            if (err) {
                console.error('Error executing query:', err);
                return;
            }

            console.log('--- Query Result ---');
            console.log(result);
            if (result.length === 0) {
                console.log('No record found in MTR2026.');
            } else {
                console.log('Record found!');
            }
            console.log('--------------------');
        });
    });
};

checkMtr();
