import Firebird from 'node-firebird';
import { mtsmtrOptions } from './src/config/database';
import { encodeKorean } from './src/utils/koreanUtils';

const testInsert = () => {
    console.log('Testing MTR2026 Insert...');

    Firebird.attach(mtsmtrOptions, (err, db) => {
        if (err) { console.error('Attach error:', err); return; }

        const tableName = 'MTR2026';

        // Use a known PCODE that exists in PERSON (e.g., 2)
        const PCODE = 2;
        const VISIDATE = new Date();
        const VISITIME = new Date();
        const PNAME = encodeKorean('테스트');
        const PBIRTH = null;
        const AGE = '0';
        const PHONENUM = '';
        const SEX = '1';
        const GUBUN = encodeKorean('요양');

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

        console.log('Executing SQL:', sql);

        db.query(sql, params, (err, result) => {
            db.detach();
            if (err) {
                console.error('Insert query failed:', err);
                return;
            }
            console.log('Insert success!', result);
        });
    });
};

testInsert();
