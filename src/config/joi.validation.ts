import * as Joi from 'joi';

export const JoiValdiationSchema = Joi.object({
    MONGODB: Joi.required(),
    PORT: Joi.number().default(8080),
    DEFAUL_LIMIT: Joi.number().default(6)
});