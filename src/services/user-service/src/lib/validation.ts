import Joi from "joi";

export const SCHEMA_USERNAME = Joi.string().min(5).max(15);
export const SCHEMA_USERBIO = Joi.string().max(300);
export const SCHEMA_PROFILEPICTURE = Joi.link();
export const SCHEMA_USERTITLE = Joi.string().min(1).max(15);
