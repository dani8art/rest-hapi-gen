const HateoasLinks = require('./hateoas-links');

/**
 * Generate a new object with the field of the input object plus the hateoas links.
 *
 * @param {any} object Fields which will be added to the resource plus the hateoas links.
 * @param {Request} request A Hapi request where to find the links info.
 * @param {string} idName Optional. Identifier the resource like _id or id.
 *
 * @returns {any} The object with the hateoas links.
 */
function addResourceLinks(object, request, idName) {
  if (!object) {
    return object;
  }

  const identifier = object[idName || '_id'];

  const resourceLink = HateoasLinks.href(request, HateoasLinks.mapResourcePath(request, identifier));
  const collectionLink = HateoasLinks.href(request, HateoasLinks.mapCollectionPath(request, identifier));

  return { ...object, _links: { self: resourceLink, collection: collectionLink } };
}

/**
 * Generate a new object with the field of the input object plus the hateoas links.
 *
 * @param {any[]} array Array with objects which will be added to the resource plus the hateoas links.
 * @param {string} name Name of the collection.
 * @param {Request} request A Hapi request where to find the links info.
 *
 * @returns {any[]} The object with the array and the hateoas links.
 */
function addCollectionLinks(array, request, name) {
  const collectionLink = HateoasLinks.href(request);

  const hateoasResources = array.map((resource) => addResourceLinks(resource, request));
  return { _links: { self: collectionLink }, _embedded: { [name]: hateoasResources } };
}

module.exports = {
  addResourceLinks,
  addCollectionLinks,
};
