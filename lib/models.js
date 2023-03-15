const Mongoose = require('mongoose');
const Joigoose = require('joigoose')(Mongoose);
const Joi = require('joi');
const Pluralize = require('pluralize');

Joi.objectId = () => Joi.string().pattern(/^[0-9a-fA-F]{24}$/);

/**
 * Normalizes Joi.ValidationError with the actual path.
 *
 * @param {Joi.ValidationError[]} errors Array of errors to normalize.
 * @param {string} path Where the error needs to be normalized.
 * @param {string} label Label that will be replaced in the error message by the actual path.
 */
function normalizeJoiError(errors, path, label) {
  const message = errors
    .map((e) => e.messages[e.code].render(e.value, e.state, e.prefs, e.local, {}).replace(`"${label}" `, ''))
    .join(' and ');

  return new Joi.ValidationError(`"${path}" ${message}`);
}

/**
 * Build link schema.
 */
function buildLinkSchema(path) {
  return Joi.object({ href: Joi.string().required() })
    .label('_link')
    .error((errors) => normalizeJoiError(errors, path, '_link'));
}

/**
 * Build the hateoas collection schema.
 *
 * @param {string} collectionName Name of the collection.
 * @param {any} schema Joi schema definition.
 */
function buildCollectionSchema(collectionName, schema) {
  return Joi.object({
    _links: Joi.object({
      self: buildLinkSchema('_links.self').required(),
      prev: buildLinkSchema('_links.prev'),
      next: buildLinkSchema('_links.next'),
    }).label('_links_collection'),
    _pages: Joi.object({ limit: Joi.number().min(1), page: Joi.number().min(1), count: Joi.number().min(0) }),
    _embedded: Joi.object({
      [collectionName]: Joi.array().items(schema).label(`${collectionName}_array`),
    }).label(`${collectionName}_embedded`),
  }).label(`${collectionName}_collection`);
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
      _links: Joi.object({
        self: buildLinkSchema('_links.self').required(),
        collection: buildLinkSchema('_links.collection').required(),
      })
        .required()
        .error((errors) => normalizeJoiError(errors, '_links', '_links_resource'))
        .label('_links_resource'),
    })
    .label(Pluralize.singular(collectionName));
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
