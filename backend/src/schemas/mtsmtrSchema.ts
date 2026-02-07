import Joi from 'joi';

export const createMtrSchema = Joi.object({
    PCODE: Joi.number().required(),
    VISIDATE: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required(),
    VISITIME: Joi.date().optional(),
    PNAME: Joi.string().required(),
    PBIRTH: Joi.date().optional().allow(null),
    AGE: Joi.string().allow('').optional(),
    PHONENUM: Joi.string().allow('').optional(),
    SEX: Joi.string().max(1).allow('').optional(),
    SERIAL: Joi.number().optional(),
    N: Joi.number().optional(),
    GUBUN: Joi.string().optional(),
    RESERVED: Joi.string().allow('').optional(),
    FIN: Joi.string().allow('').optional()
});

export const updateMtrSchema = Joi.object({
    VISITIME: Joi.date().optional(),
    PNAME: Joi.string().optional(),
    PBIRTH: Joi.date().optional().allow(null),
    AGE: Joi.string().allow('').optional(),
    PHONENUM: Joi.string().allow('').optional(),
    SEX: Joi.string().max(1).allow('').optional(),
    GUBUN: Joi.string().optional()
});
