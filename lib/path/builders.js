const path = require('path');

/**
 * Build the path for the plural REST endpoint.
 *
 * @param {string} basePath The base path for the route.
 * @param {string} collectionName The collection name.
 */
function pluralPathBuilder(basePath, collectionName) {
  return path.join(basePath, collectionName);
}

/**
 * Build the path for the singular REST endpoint.
 *
 * @param {string} basePath The base path for the route.
 * @param {string} collectionName The collection name.
 */
function singularPathBuilder(basePath, collectionName) {
  return path.join(basePath, collectionName, '{identifier}');
}

module.exports = {
  singularPathBuilder,
  pluralPathBuilder
};
