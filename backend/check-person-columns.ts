import Firebird from 'node-firebird';
import { personOptions } from './src/config/database';

const checkPersonColumns = () => {
    console.log('Checking PERSON columns...');
    Firebird.attach(personOptions, (err, db) => {
        if (err) { console.error(err); return; }
        const sql = `
            SELECT RDB$FIELD_NAME 
            FROM RDB$RELATION_FIELDS 
            WHERE RDB$RELATION_NAME = 'PERSON'
            ORDER BY RDB$FIELD_POSITION
        `;
        db.query(sql, [], (err, res) => {
            db.detach();
            if (err) { console.error(err); return; }
            res.forEach((r: any) => console.log(r.RDB$FIELD_NAME.trim()));
        });
    });
};

checkPersonColumns();
