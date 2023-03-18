const Joi = require('joi');

const models = require('../models');

/**
 * Build error status definition that is common to every response.
 */
function commonErrorsResponse() {
  return {
    500: internalError(),
  };
}

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
      ...commonErrorsResponse(),
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
      ...commonErrorsResponse(),
      404: notFound(),
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
      ...commonErrorsResponse(),
      400: badRequest(),
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
      ...commonErrorsResponse(),
      400: badRequest(),
      404: notFound(),
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
  return {
    status: {
      200: Joi.object({
        acknowledged: Joi.boolean().required(),
        deletedCount: Joi.number().min(0).required(),
      })
        .label('_deleted')
        .description('Deleted resource stats'),
      ...commonErrorsResponse(),
      // Delete hasn't not_fount error instead of it returns `deletedCount = 0`
    },
  };
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
    .label('_internal_error')
    .description('An unexpected internal error response');
}

/**
 * Build a response specification for a bad request error.
 */
function badRequest() {
  return Joi.object({
    statusCode: Joi.number().valid(400).required(),
    error: Joi.string().required(),
    message: Joi.string().required(),
  })
    .label('_bad_request_error')
    .description('Bad request');
}

/**
 * Build a response specification for a not found request error.
 */
function notFound() {
  return Joi.object({
    statusCode: Joi.number().valid(404).required(),
    error: Joi.string().required(),
    message: Joi.string().required(),
  })
    .label('_not_found_error')
    .description('Resource not found');
}

module.exports = {
  getCollectionResponseBuilder,
  getResourceResponseBuilder,
  createResourceResponseBuilder,
  updateResourceResponseBuilder,
  deleteResourceResponseBuilder,
  errors: {
    internal: internalError,
    badRequest,
    notFound,
  },
};
