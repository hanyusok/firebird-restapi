import dotenv from 'dotenv';
import Firebird, { Options, Database } from 'node-firebird';

dotenv.config();

// Connection options for PERSON database
export const personOptions: Options = {
    host: process.env.FIREBIRD_HOST,
    port: process.env.FIREBIRD_PORT ? parseInt(process.env.FIREBIRD_PORT, 10) : undefined,
    database: process.env.FIREBIRD_PERSON_DATABASE,
    user: process.env.FIREBIRD_USER,
    password: process.env.FIREBIRD_PASSWORD,
    lowercase_keys: false,
    role: undefined,
    pageSize: 4096
};

// Connection options for MTSWAIT database
export const mtswaitOptions: any = {
    host: process.env.FIREBIRD_HOST,
    port: process.env.FIREBIRD_PORT ? parseInt(process.env.FIREBIRD_PORT, 10) : undefined,
    database: process.env.FIREBIRD_MTSWAIT_DATABASE,
    user: process.env.FIREBIRD_USER,
    password: process.env.FIREBIRD_PASSWORD,
    lowercase_keys: false,
    role: undefined,
    pageSize: 4096,
    charset: 'KSC5601'
};

// Connection options for MTSMTR database
export const mtsmtrOptions: any = {
    host: process.env.FIREBIRD_HOST,
    port: process.env.FIREBIRD_PORT ? parseInt(process.env.FIREBIRD_PORT, 10) : undefined,
    database: process.env.FIREBIRD_MTSMTR_DATABASE,
    user: process.env.FIREBIRD_USER,
    password: process.env.FIREBIRD_PASSWORD,
    lowercase_keys: false,
    role: undefined,
    pageSize: 4096,
    charset: 'KSC5601'
};

// Helper function to execute queries (defaults to PERSON database)
export const query = (sql: string, params: any[] = []): Promise<any[]> => {
    return new Promise((resolve, reject) => {
        Firebird.attach(personOptions, (err: any, db: Database) => {
            if (err) {
                console.error('Database connection error:', err);
                return reject(err);
            }

            db.query(sql, params, (err: any, result: any[]) => {
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
export function getPersonDb(callback: (err: any, db: Database) => void): void {
    Firebird.attach(personOptions, callback);
}

// Function to get MTSWAIT DB connection
export function getMtswaitDb(callback: (err: any, db: Database) => void): void {
    Firebird.attach(mtswaitOptions, callback);
}

// Function to get MTSMTR DB connection
export function getMtsmtrDb(callback: (err: any, db: Database) => void): void {
    Firebird.attach(mtsmtrOptions, callback);
}

type DbType = 'person' | 'mtswait' | 'mtsmtr';

// Generic async query helper for any DB type
export const queryDb = (dbType: DbType, sql: string, params: any[] = []): Promise<any[]> => {
    let options: Options;
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
            return Promise.reject(new Error('Unknown dbType: ' + dbType));
    }
    return new Promise((resolve, reject) => {
        Firebird.attach(options, (err: any, db: Database) => {
            if (err) {
                console.error('Database connection error:', err);
                return reject(err);
            }
            db.query(sql, params, (err: any, result: any[]) => {
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
try {
    const fs = require('fs');
    fs.appendFileSync('debug.log', `[${new Date().toISOString()}] Creating MTSWAIT pool with: ${JSON.stringify(mtswaitOptions)}\n`);
} catch (e) { console.error(e); }

const personPool = Firebird.pool(5, personOptions);
const mtswaitPool = Firebird.pool(5, mtswaitOptions);
const mtsmtrPool = Firebird.pool(5, mtsmtrOptions);

// Generic pooled query helper
export const pooledQueryDb = (dbType: DbType, sql: string, params: any[] = []): Promise<any[]> => {
    let pool: any; // node-firebird pool type is tricky, using any for now or defined interface
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
            return Promise.reject(new Error('Unknown dbType: ' + dbType));
    }
    return new Promise((resolve, reject) => {
        pool.get((err: any, db: Database) => {
            if (err) {
                console.error('Database pool error:', err);
                return reject(err);
            }
            db.query(sql, params, (err: any, result: any[]) => {
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