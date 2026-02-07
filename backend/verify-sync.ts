import Firebird from 'node-firebird';
import { mtswaitOptions, mtsmtrOptions } from './src/config/database';

const verifySync = () => {
    const PCODE = 9999;
    const VISIDATE = '2026-02-13';

    console.log(`Verifying sync for PCODE ${PCODE} on ${VISIDATE}...`);

    // Check WAIT
    console.log('--- Checking WAIT2026 ---');
    Firebird.attach(mtswaitOptions, (err, db) => {
        if (err) { console.error(err); return; }
        db.query("SELECT * FROM WAIT2026 WHERE PCODE = ? AND VISIDATE = ?", [PCODE, VISIDATE], (err, res) => {
            db.detach();
            if (err) console.error(err);
            console.log('WAIT Record:', res.length > 0 ? 'Found' : 'Not Found');
            if (res.length > 0) console.log(res[0]);

            // Check MTR
            console.log('\n--- Checking MTR2026 ---');
            Firebird.attach(mtsmtrOptions, (err, db2) => {
                if (err) { console.error(err); return; }
                db2.query("SELECT * FROM MTR2026 WHERE PCODE = ? AND VISIDATE = ?", [PCODE, VISIDATE], (err, res2) => {
                    db2.detach();
                    if (err) console.error(err);
                    console.log('MTR Record:', res2.length > 0 ? 'Found' : 'Not Found');
                    if (res2.length > 0) console.log(res2[0]);
                });
            });
        });
    });
};

verifySync();
