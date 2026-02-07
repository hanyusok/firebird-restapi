import Firebird from 'node-firebird';
import { personOptions } from './src/config/database';
import { decodeKorean } from './src/utils/koreanUtils';

const listPeople = () => {
    Firebird.attach(personOptions, (err, db) => {
        if (err) { console.error(err); return; }
        db.query("SELECT FIRST 5 PCODE, PNAME FROM PERSON", [], (err, res) => {
            db.detach();
            if (err) { console.error(err); return; }
            res.forEach((r: any) => {
                const val = r.PNAME;
                const isBuffer = Buffer.isBuffer(val);
                console.log(`PCODE: ${r.PCODE}, IsBuffer: ${isBuffer}, Type: ${typeof val}`);

                let buf;
                if (isBuffer) {
                    buf = val;
                } else if (typeof val === 'string') {
                    // Assume binary string (latin1) if no charset
                    buf = Buffer.from(val, 'binary');
                } else {
                    console.log('Unknown type');
                    return;
                }

                console.log(`HEX: ${buf.toString('hex')}`);
            });
        });
    });
};

listPeople();
