const hateoasLinks = require('./hateoas-links');

/**
 * Generate a new object with the field of the input object plus the hateoas links.
 *
 * @param {any} object Fields which will be added to the resource plus the hateoas links.
 * @param {string} opts.url Required. Base url with <protocol>://<host>:<port>/<basePath> for building the link.
 * @param {string} opts.collectionName Required. Collection name.
 * @param {string} opts.identifier Optional. Identifier the resource like _id or id.
 *
 * @returns {any} The object with the hateoas links.
 */
function addResourceLinks(object, opts) {
  if (!object) {
    return object;
  }

  const identifier = object[(opts && opts.identifier) || '_id'];
  const resourceLink = hateoasLinks.buildResourceLink(opts.url, identifier);
  const collectionLink = hateoasLinks.buildCollectionLink(opts.url, identifier);

  return { ...object, _links: { self: resourceLink, collection: collectionLink } };
}

/**
 * Generate a new object with the field of the input object plus the hateoas links.
 *
 * @param {any[]} array Array with objects which will be added to the resource plus the hateoas links.
 * @param {string} opts.url Required. Base url with <protocol>://<host>:<port>/<basePath> for building the link.
 * @param {string} opts.collectionName Required. Collection name.
 * @param {*} opts
 *
 * @returns {any[]} The object with the array and the hateoas links.
 */
function addCollectionLinks(array, opts) {
  const collectionLink = hateoasLinks.buildCollectionLink(opts.url);

  const hateoasResources = array.map((resource) => addResourceLinks(resource, opts));
  return { _links: { self: collectionLink }, _embedded: { [opts.collectionName]: hateoasResources } };
}

module.exports = {
  addResourceLinks,
  addCollectionLinks,
};
