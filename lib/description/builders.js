/**
 * Build the method description when action is get collection
 *
 * @param {string} collectionName Name of the collection.
 */
function getCollectionDescriptionBuilder(collectionName) {
  return `Gets all ${collectionName}`;
}

/**
 * Build the method description when action is get resource
 *
 * @param {string} collectionName Name of the collection.
 */
function getResourceDescriptionBuilder(collectionName) {
  return `Gets an existing ${collectionName}`;
}

/**
 * Build the method description when action is create resource
 *
 * @param {string} collectionName Name of the collection.
 */
function createResourceDescriptionBuilder(collectionName) {
  return `Creates a new ${collectionName}`;
}

/**
 * Build the method description when action is update resource
 *
 * @param {string} collectionName Name of the collection.
 */
function updateResourceDescriptionBuilder(collectionName) {
  return `Updates an existing ${collectionName}`;
}

/**
 * Build the method description when action is delete resource
 *
 * @param {string} collectionName Name of the collection.
 */
function deleteResourceDescriptionBuilder(collectionName) {
  return `Deletes an existing ${collectionName}`;
}

module.exports = {
  getCollectionDescriptionBuilder,
  getResourceDescriptionBuilder,
  createResourceDescriptionBuilder,
  updateResourceDescriptionBuilder,
  deleteResourceDescriptionBuilder,
};
