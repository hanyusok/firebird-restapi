import Firebird from 'node-firebird';
import { personOptions, mtsmtrOptions } from './src/config/database';
import { decodeKorean } from './src/utils/koreanUtils';

const testRealData = () => {
    console.log('Fetching PCODE 1 from PERSON...');

    Firebird.attach(personOptions, (err, db) => {
        if (err) { console.error(err); return; }

        db.query("SELECT PCODE, PNAME, PBIRTH, SEX FROM PERSON WHERE PCODE = 1", [], (err, res) => {
            db.detach();
            if (err) { console.error(err); return; }

            if (res.length === 0) { console.log('Person 1 not found'); return; }

            const person = res[0];
            const pname = decodeKorean(person.PNAME) || '';
            const sex = decodeKorean(person.SEX) || '';
            const pbirth = person.PBIRTH; // Date

            const phone = '';
            const gubun = '요양';
            const age = '0'; // Dummy

            console.log('Decoded Data:', { pname, sex, pbirth });

            // Now try Insert into MTR for PCODE 1 (Just to test encoding compatibility)
            // But PCODE 1 key might conflict if I don't change VISIDATE?
            // VISIDATE is part of PK? Or just PCODE + VISIDATE + VISITIME?
            // MTR PK is likely PCODE + VISIDATE + VISITIME.

            Firebird.attach(mtsmtrOptions, (err, db2) => {
                if (err) { console.error(err); return; }

                const tableName = 'MTR2026';
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

                const runInsert = (label: string, p_pname: any, p_pbirth: any) => {
                    const params = [
                        1, new Date(), new Date(),
                        p_pname, p_pbirth, age, phone, sex, gubun
                    ];
                    console.log(`Testing ${label}...`);
                    db2.query(sql, params, (err, result) => {
                        if (err) {
                            console.error(`FAILED ${label}:`, err.message);
                        } else {
                            console.log(`SUCCESS ${label}!`);
                        }
                    });
                };

                runInsert('PCODE=1', pname, pbirth);

                setTimeout(() => {
                    db2.detach();
                }, 2000);
            });
        });
    });
};

testRealData();
