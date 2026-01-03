import Joi from "joi";

export const SCHEMA_PLUGINNAME = Joi.string().min(5).max(15);
export const SCHEMA_DESCRIPTION = Joi.string().max(300);
export const SCHEMA_RELEASENUMBER = Joi.string().min(3).max(9);
export const SCHEMA_RELEASENOTES = Joi.string().max(100);
