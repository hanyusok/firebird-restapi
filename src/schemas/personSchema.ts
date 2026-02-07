import Joi from 'joi';

export const createPersonSchema = {
    body: Joi.object({
        PNAME: Joi.string().max(40).optional(),
        PBIRTH: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).allow(null).optional(),
        PIDNUM: Joi.string().max(13).allow(null).optional(), // Assuming length based on typical ID
        PIDNUM2: Joi.string().max(13).allow(null).optional(),
        OLDIDNUM: Joi.string().max(20).allow(null).optional(),
        SEX: Joi.string().valid('1', '2').allow(null).optional(), // Assuming 1=Male, 2=Female
        RELATION: Joi.string().max(10).allow(null).optional(),
        RELATION2: Joi.string().max(6).allow(null).optional(),
        CRIPPLED: Joi.string().max(1).allow(null).optional(),
        VINFORM: Joi.string().allow(null).optional(),
        AGREE: Joi.string().max(1).allow(null).optional(),
        LASTCHECK: Joi.string().allow(null).optional(),
        PERINFO: Joi.string().max(1).allow(null).optional(),
        CARDCHECK: Joi.string().allow(null).optional(),
        JAEHAN: Joi.string().max(1).allow(null).optional(),
        SEARCHID: Joi.string().max(20).allow(null).optional(),
        PCCHECK: Joi.string().max(1).allow(null).optional(),
        PSNIDT: Joi.string().allow(null).optional(),
        PSNID: Joi.string().max(20).allow(null).optional(),
        // Any other fields...
    })
};

export const updatePersonSchema = {
    params: Joi.object({
        pcode: Joi.number().integer().required()
    }),
    body: Joi.object({
        PNAME: Joi.string().max(40).optional(),
        // Allow updating other fields as well, similar to create
        // reusing the definition from create roughly but usually updates are partial
    }).unknown(true) // Allow other fields for now as there are many
};

export const getPersonSchema = {
    params: Joi.object({
        pcode: Joi.number().integer().required()
    })
};

export const searchPersonSchema = {
    query: Joi.object({
        pname: Joi.string().optional(),
        pcode: Joi.number().integer().optional(),
        searchId: Joi.string().optional()
    }).min(1) // Require at least one
};
