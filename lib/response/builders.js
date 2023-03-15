const Joi = require('joi');
const models = require('../models');

/**
 * Build response specification for the get collection action.
 *
 * @param {string} collectionName
 * @param {any} schema
 */
function getCollectionResponseBuilder(collectionName, schema) {
  const resourceSchema = models.buildResourceSchema(collectionName, schema);

  return {
    status: {
      200: models.buildCollectionSchema(collectionName, resourceSchema),
    },
  };
}

/**
 * Build response specification for the get resource action.
 *
 * @param {string} collectionName
 * @param {any} schema
 */
function getResourceResponseBuilder(collectionName, schema) {
  return {
    status: {
      200: models.buildResourceSchema(collectionName, schema),
    },
  };
}

/**
 * Build response specification for the get resource action.
 *
 * @param {string} collectionName
 * @param {any} schema
 */
function createResourceResponseBuilder(collectionName, schema) {
  return {
    status: {
      200: models.buildResourceSchema(collectionName, schema),
    },
  };
}

/**
 * Build response specification for the get resource action.
 *
 * @param {string} collectionName
 * @param {any} schema
 */
function updateResourceResponseBuilder(collectionName, schema) {
  return {
    status: {
      200: models.buildResourceSchema(collectionName, schema),
    },
  };
}

/**
 * Build response specification for the get resource action.
 *
 * @param {string} collectionName
 * @param {any} schema
 */
function deleteResourceResponseBuilder(collectionName, schema) {
  return {};
}

/**
 * Build a response specification for an internal error.
 */
function internalError() {
  return Joi.object({
    statusCode: Joi.number().valid(500).required(),
    error: Joi.string().required(),
    message: Joi.string().required(),
  })
    .label('internal_error')
    .description('An unexpected internal error response');
}

module.exports = {
  getCollectionResponseBuilder,
  getResourceResponseBuilder,
  createResourceResponseBuilder,
  updateResourceResponseBuilder,
  deleteResourceResponseBuilder,
  errors: {
    internal: internalError,
  },
};
