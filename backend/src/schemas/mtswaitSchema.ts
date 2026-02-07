import Joi from 'joi';

export const createWaitSchema = {
    body: Joi.object({
        PCODE: Joi.number().integer().required(),
        VISIDATE: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required(),
        DISPLAYNAME: Joi.string().max(40).optional(),
        // Other fields handled in service or defaults
    })
};

export const updateWaitSchema = {
    params: Joi.object({
        visidate: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required(),
        pcode: Joi.number().integer().required()
    }),
    body: Joi.object({
        RESID1: Joi.string().optional(),
        RESID2: Joi.string().optional(),
        DISPLAYNAME: Joi.string().max(40).optional()
    })
};

export const getWaitSchema = {
    params: Joi.object({
        visidate: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required()
    })
};

export const deleteWaitSchema = {
    params: Joi.object({
        visidate: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required(),
        pcode: Joi.number().integer().required()
    })
};
