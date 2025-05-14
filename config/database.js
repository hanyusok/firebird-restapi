require('dotenv').config();

const Firebird = require('node-firebird');

// Connection options for PERSON database
const personOptions = {
    host: process.env.FIREBIRD_HOST,
    port: process.env.FIREBIRD_PORT,
    database: process.env.FIREBIRD_PERSON_DATABASE, // e.g., C:\\path\\to\\PERSON.FDB
    user: process.env.FIREBIRD_USER,
    password: process.env.FIREBIRD_PASSWORD,
    lowercase_keys: false,
    role: null,
    pageSize: 4096
};

// Connection options for MTSWAIT database
const mtswaitOptions = {
    host: process.env.FIREBIRD_HOST,
    port: process.env.FIREBIRD_PORT,
    database: process.env.FIREBIRD_MTSWAIT_DATABASE, // e.g., C:\\path\\to\\MTSWAIT.FDB
    user: process.env.FIREBIRD_USER,
    password: process.env.FIREBIRD_PASSWORD,
    lowercase_keys: false,
    role: null,
    pageSize: 4096
};

// Connection options for MTSMTR database
const mtsmtrOptions = {
    host: process.env.FIREBIRD_HOST,
    port: process.env.FIREBIRD_PORT,
    database: process.env.FIREBIRD_MTSMTR_DATABASE,
    user: process.env.FIREBIRD_USER,
    password: process.env.FIREBIRD_PASSWORD,
    lowercase_keys: false,
    role: null,
    pageSize: 4096,
    charset: 'KSC5601'
};

// Helper function to execute queries (defaults to PERSON database)
const query = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        Firebird.attach(personOptions, (err, db) => {
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

// Function to get PERSON DB connection
function getPersonDb(callback) {
    Firebird.attach(personOptions, callback);
}

// Function to get MTSWAIT DB connection
function getMtswaitDb(callback) {
    Firebird.attach(mtswaitOptions, callback);
}

// Function to get MTSMTR DB connection
function getMtsmtrDb(callback) {
    Firebird.attach(mtsmtrOptions, callback);
}

module.exports = {
    query,
    getPersonDb,
    getMtswaitDb,
    getMtsmtrDb
}; 