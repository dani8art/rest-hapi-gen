const Joi = require('joi');

const models = require('../models');

/**
 * Build error status definition that is common to every response.
 */
function commonErrorsResponse(auth) {
  const common = {
    500: internalError(),
  };

  if (auth) {
    common['401'] = unauthorized();
    common['403'] = forbidden();
  }

  return common;
}

/**
 * Build response specification for the get collection action.
 *
 * @param {string} collectionName
 * @param {any} schema
 */
function getCollectionResponseBuilder(collectionName, schema, auth) {
  const resourceSchema = models.buildResourceSchema(collectionName, schema);

  return {
    status: {
      200: models.buildCollectionSchema(collectionName, resourceSchema),
      ...commonErrorsResponse(auth),
    },
  };
}

/**
 * Build response specification for the get resource action.
 *
 * @param {string} collectionName
 * @param {any} schema
 */
function getResourceResponseBuilder(collectionName, schema, auth) {
  return {
    status: {
      200: models.buildResourceSchema(collectionName, schema),
      ...commonErrorsResponse(auth),
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
function createResourceResponseBuilder(collectionName, schema, auth) {
  return {
    status: {
      200: models.buildResourceSchema(collectionName, schema),
      ...commonErrorsResponse(auth),
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
function updateResourceResponseBuilder(collectionName, schema, auth) {
  return {
    status: {
      200: models.buildResourceSchema(collectionName, schema),
      ...commonErrorsResponse(auth),
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
function deleteResourceResponseBuilder(collectionName, schema, auth) {
  return {
    status: {
      200: Joi.object({
        acknowledged: Joi.boolean().required(),
        deletedCount: Joi.number().min(0).required(),
      })
        .label('_deleted')
        .description('Deleted resource stats'),
      ...commonErrorsResponse(auth),
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

/**
 * Build a response specification for an unauthorized request error.
 */
function unauthorized() {
  return Joi.object({
    statusCode: Joi.number().valid(401).required(),
    error: Joi.string().required(),
    message: Joi.string().required(),
    attributes: Joi.object({
      realm: Joi.string().required(),
      error: Joi.string().required(),
    }).label('_unauthorized_error_attributes'),
  })
    .label('_unauthorized_error')
    .description('Unauthorized request');
}

/**
 * Build a response specification for a forbidden request error.
 */
function forbidden() {
  return Joi.object({
    statusCode: Joi.number().valid(403).required(),
    error: Joi.string().required(),
    message: Joi.string().required(),
  })
    .label('_forbidden_error')
    .description('Forbidden request');
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
    unauthorized,
    forbidden,
  },
};
