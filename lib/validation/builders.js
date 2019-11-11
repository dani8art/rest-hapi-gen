const Joi = require('@hapi/joi');
Joi.objectId = require('joi-objectid')(Joi);

/**
 * Return the validation for the identifier
 */
function identifierValidation() {
  return Joi.objectId();
}

/**
 * Build the validation definition for the get collection action.
 *
 * @param {Joi} schema
 */
function getCollectionValidationBuilder(schema) {
  return {};
}

/**
 * Build the validation definition for the get resource action.
 *
 * @param {Joi} schema
 */
function getResourceValidationBuilder(schema) {
  return {
    params: {
      identifier: identifierValidation()
    }
  };
}

/**
 * Build the validation definition for the create resource action.
 *
 * @param {Joi} schema
 */
function createResourceValidationBuilder(schema) {
  return {
    payload: schema
  };
}

/**
 * Build the validation definition for the update resource action.
 *
 * @param {Joi} schema
 */
function updateResourceValidationBuilder(schema) {
  return {
    params: {
      identifier: identifierValidation()
    },
    payload: schema
  };
}

/**
 * Build the validation definition for the delete resource action.
 *
 * @param {Joi} schema
 */
function deleteResourceValidationBuilder(schema) {
  return {
    params: {
      identifier: identifierValidation()
    }
  };
}

module.exports = {
  getCollectionValidationBuilder,
  getResourceValidationBuilder,
  createResourceValidationBuilder,
  updateResourceValidationBuilder,
  deleteResourceValidationBuilder
};
