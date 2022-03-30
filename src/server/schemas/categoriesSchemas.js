const { Joi } = require("express-validation");
Joi.objectId = require("joi-objectid")(Joi);

const categorySchema = {
  body: Joi.object({
    id: Joi.objectId(),
    name: Joi.string().required(),
    icon: Joi.string().allow(""),
  }),
};

module.exports = {
  categorySchema,
};
