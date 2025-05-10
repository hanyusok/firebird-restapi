require('dotenv').config();

const Firebird = require('node-firebird');

const options = {
    host: process.env.FIREBIRD_HOST,
    port: process.env.FIREBIRD_PORT,
    database: process.env.FIREBIRD_DATABASE,
    user: process.env.FIREBIRD_USER,
    password: process.env.FIREBIRD_PASSWORD,
    lowercase_keys: false,
    role: null,
    pageSize: 4096
};

// Helper function to execute queries
const query = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        Firebird.attach(options, (err, db) => {
            if (err) {
                console.error('Database connection error:', err);
                return reject(err);
            }

            db.query(sql, params, (err, result) => {
                db.detach();
                if (err) {
                    console.error('Query execution error:', err);
                    return reject(err);
                }
                resolve(result);
            });
        });
    });
};

module.exports = { query }; 