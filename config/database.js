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

// Generic async query helper for any DB type
const queryDb = (dbType, sql, params = []) => {
    let options;
    switch (dbType) {
        case 'person':
            options = personOptions;
            break;
        case 'mtswait':
            options = mtswaitOptions;
            break;
        case 'mtsmtr':
            options = mtsmtrOptions;
            break;
        default:
            throw new Error('Unknown dbType: ' + dbType);
    }
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

// Create pools for each DB (pool size 5)
const personPool = Firebird.pool(5, personOptions);
const mtswaitPool = Firebird.pool(5, mtswaitOptions);
const mtsmtrPool = Firebird.pool(5, mtsmtrOptions);

// Generic pooled query helper
const pooledQueryDb = (dbType, sql, params = []) => {
    let pool;
    switch (dbType) {
        case 'person':
            pool = personPool;
            break;
        case 'mtswait':
            pool = mtswaitPool;
            break;
        case 'mtsmtr':
            pool = mtsmtrPool;
            break;
        default:
            throw new Error('Unknown dbType: ' + dbType);
    }
    return new Promise((resolve, reject) => {
        pool.get((err, db) => {
            if (err) {
                console.error('Database pool error:', err);
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

module.exports = {
    query,
    getPersonDb,
    getMtswaitDb,
    getMtsmtrDb,
    queryDb,
    pooledQueryDb
}; 