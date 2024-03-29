import Joi from "joi";

const createContactSchema = Joi.object({
   name: Joi.string().required(),
   email: Joi.string().email().required(),
   phone: Joi.string().required(),
});

export const userSchema = Joi.object({
   email: Joi.string().email().required(),
   password: Joi.string().min(4).required(),
});

export const updateContactSchema = Joi.object({
   name: Joi.string().allow(" "),
   email: Joi.string().email(),
   phone: Joi.string(),
}).min(1);

export default createContactSchema;
