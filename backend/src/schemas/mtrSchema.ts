import Joi from 'joi';

export const createMtrSchema = {
    body: Joi.object({
        PCODE: Joi.number().integer().optional(),
        VISIDATE: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).optional(),
        VISITIME: Joi.string().optional(),
        PNAME: Joi.string().max(40).optional(),
        PBIRTH: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).optional(),
        AGE: Joi.number().integer().optional(),
        PHONENUM: Joi.string().max(20).optional(),
        SEX: Joi.string().valid('1', '2').optional(),
        // other fields...
    })
};

export const updateMtrSchema = {
    params: Joi.object({
        pcode: Joi.number().integer().required()
    }),
    body: Joi.object({
        VISIDATE: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).optional(),
        // ...
    }).unknown(true)
};

export const getMtrByPcodeSchema = {
    params: Joi.object({
        pcode: Joi.number().integer().required()
    })
};

export const getMtrByVisidateSchema = {
    query: Joi.object({
        visidate: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required()
    })
};
