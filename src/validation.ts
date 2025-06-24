import Joi from "joi";

// plugin schemas
export const SCHEMA_PLUGINNAME = Joi.string().min(5).max(15);
export const SCHEMA_DESCRIPTION = Joi.string().max(300);
export const SCHEMA_RELEASENUMBER = Joi.string().min(3).max(9);
export const SCHEMA_RELEASENOTES = Joi.string().max(100);

// user schemas
export const SCHEMA_USERNAME = Joi.string().min(5).max(15)
export const SCHEMA_USERBIO = Joi.string().max(300) 
export const SCHEMA_PROFILEPICTURE = Joi.link()
export const SCHEMA_USERTITLE = Joi.string().min(1).max(15)