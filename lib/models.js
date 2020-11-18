const Mongoose = require('mongoose');
const Joigoose = require('joigoose')(Mongoose);

const Joi = require('joi');
Joi.objectId = () => Joi.string().pattern(/^[0-9a-fA-F]{24}$/);

/**
 * Build link schema.
 */
function buildLinkSchema() {
  return Joi.object()
    .pattern(Joi.string(), Joi.object({ href: Joi.string().required() }))
    .required();
}

/**
 * Build the hateoas collection schema.
 *
 * @param {string} collectionName Name of the collection.
 * @param {any} schema Joi schema definition.
 */
function buildCollectionSchema(collectionName, schema) {
  return Joi.object({
    _links: buildLinkSchema(),
    _embedded: Joi.object({
      [collectionName]: Joi.array().items(schema).label(`${collectionName} array`),
    }),
  }).label(`${collectionName} collection`);
}

/**
 * Add two field of mongo, _id and __v, and a field form hateoas to the response schema.
 *
 * @param {string} collectionName Name of the collection.
 * @param {any} schema Joi schema definition.
 */
function buildResourceSchema(collectionName, schema) {
  return schema
    .keys({
      _id: Joi.objectId().required(),
      __v: Joi.number().required(),
      _links: buildLinkSchema(),
    })
    .label(collectionName);
}

/**
 * Map a mongo document especific data type to a string.
 * @param {any} document The mongo document to be mapped.
 */
function documentToJson(document) {
  if (!document) {
    return document;
  }

  let json = document;
  if (document.toJSON) {
    json = document.toJSON();
  }

  json._id = String(json._id);

  return json;
}

/**
 * Build mongoose model from a Joi schema.
 * @param {string} collectionName Name of the collection.
 * @param {any} joiSchema Joi schema definition.
 */
function buildModel(collectionName, joiSchema) {
  const mongooseSchema = Joigoose.convert(joiSchema);
  return Mongoose.model(collectionName, mongooseSchema);
}

module.exports = {
  documentToJson,

  buildModel,

  buildResourceSchema,
  buildCollectionSchema,
};
