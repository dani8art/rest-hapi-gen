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
      200: models.buildCollectionSchema(collectionName, resourceSchema)
    }
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
      200: models.buildResourceSchema(collectionName, schema)
    }
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
      200: models.buildResourceSchema(collectionName, schema)
    }
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
      200: models.buildResourceSchema(collectionName, schema)
    }
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

module.exports = {
  getCollectionResponseBuilder,
  getResourceResponseBuilder,
  createResourceResponseBuilder,
  updateResourceResponseBuilder,
  deleteResourceResponseBuilder
};
