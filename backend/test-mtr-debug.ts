import Firebird from 'node-firebird';
import { mtsmtrOptions } from './src/config/database';
import { encodeKorean } from './src/utils/koreanUtils';

const testDebug = () => {
    console.log('Debugging MTR2026...');

    Firebird.attach(mtsmtrOptions, (err, db) => {
        if (err) { console.error('Attach error:', err); return; }

        // 1. Check Generator
        db.query("SELECT RDB$GENERATOR_NAME FROM RDB$GENERATORS WHERE RDB$GENERATOR_NAME = 'GEN_MTR2026_SEQ'", [], (err, res) => {
            if (err) console.error('Generator check error:', err);
            console.log('Generator Check:', res && res.length > 0 ? 'Exists' : 'MISSING');

            if (!res || res.length === 0) {
                console.log('Aborting insert because generator is missing.');
                db.detach();
                return;
            }

            // 2. Try Insert with Strings (since charset is KSC5601)
            // Note: If charset is set, driver expects strings.
            const tableName = 'MTR2026';
            const PCODE = 2;
            const VISIDATE = new Date();
            const VISITIME = new Date();
            const PNAME = '테스트'; // String
            const PBIRTH = null;
            const AGE = '0';
            const PHONENUM = '';
            const SEX = '1';
            const GUBUN = '요양'; // String

            const sql = `
                INSERT INTO ${tableName} (
                    "#", PCODE, VISIDATE, VISITIME, 
                    PNAME, PBIRTH, AGE, PHONENUM, SEX, 
                    SERIAL, N, GUBUN, RESERVED, FIN
                ) VALUES (
                    GEN_ID(GEN_${tableName}_SEQ, 1), ?, ?, ?, 
                    ?, ?, ?, ?, ?, 
                    1, 0, ?, '', ''
                )
            `;

            const params = [
                PCODE, VISIDATE, VISITIME,
                PNAME, PBIRTH, AGE, PHONENUM, SEX,
                GUBUN
            ];

            console.log('Executing SQL with Strings:', sql);

            db.query(sql, params, (err, result) => {
                db.detach();
                if (err) {
                    console.error('Insert with Strings failed:', err);
                    return;
                }
                console.log('Insert with Strings success!', result);
            });
        });
    });
};

testDebug();
