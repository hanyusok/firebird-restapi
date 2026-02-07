import Joi, { Schema } from 'joi';
import { Request, Response, NextFunction } from 'express';
import { logWarn } from '../utils/logger';

// Helper function to pick keys from object
const pick = (object: any, keys: string[]) => {
    return keys.reduce((obj: any, key: string) => {
        if (object && Object.prototype.hasOwnProperty.call(object, key)) {
            obj[key] = object[key];
        }
        return obj;
    }, {});
};

const validate = (schema: object) => (req: Request, res: Response, next: NextFunction) => {
    // Pick keys to validate from request (body, query, params) based on schema definition
    const validSchema = pick(schema, ['params', 'query', 'body']);
    const object = pick(req, Object.keys(validSchema));

    const { value, error } = Joi.compile(validSchema)
        .prefs({ errors: { label: 'key' }, abortEarly: false })
        .validate(object);

    if (error) {
        const errorMessage = error.details.map((details) => details.message).join(', ');
        logWarn('Validation Error', { path: req.path, error: errorMessage });

        return res.status(400).json({
            status: 'error',
            statusCode: 400,
            message: errorMessage
        });
    }

    Object.assign(req, value);
    return next();
};

export default validate;
