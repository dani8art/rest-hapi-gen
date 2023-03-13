const HateoasLinks = require('./hateoas-links');

/**
 * Generate a new object with the field of the input object plus the hateoas links.
 *
 * @param {any} object Fields which will be added to the resource plus the hateoas links.
 * @param {Request} request A Hapi request where to find the links info.
 * @param {string} idName Optional. Identifier the resource like _id or id.
 * @param {boolean} fromCollection Optional. Whether the resource link is requested from a collection endpoint.
 */
function addResourceLinks(object, request, idName, fromCollection) {
  if (!object) {
    return object;
  }

  const addQuery = !fromCollection;
  const identifier = object[idName || '_id'];
  const resourcePath = HateoasLinks.mapResourcePath(request, identifier);
  const collectionPath = HateoasLinks.mapCollectionPath(request, identifier);

  const resourceLink = HateoasLinks.href(request, resourcePath, null, addQuery);

  const collectionLink = HateoasLinks.href(request, collectionPath, null, addQuery);

  return { ...object, _links: { self: resourceLink, collection: collectionLink } };
}

/**
 * Generate a new object with the field of the input object plus the hateoas links.
 *
 * @param {any[]} array Array with objects which will be added to the resource plus the hateoas links.
 * @param {string} name Name of the collection.
 * @param {Request} request A Hapi request where to find the links info.
 * @param {number} pagination.limit Page size info to build pagination links.
 * @param {number} pagination.page Page position info to build pagination links.
 * @param {number} pagination.count Total number of items in the collection.
 *
 * @returns {any[]} The object with the array and the hateoas links.
 */
function addCollectionLinks(array, request, name, pagination) {
  const _links = { self: HateoasLinks.href(request, null, pagination, true) };

  if (pagination.page - 1 >= 1) {
    _links.prev = HateoasLinks.href(request, null, { limit: pagination.limit, page: pagination.page - 1 }, true);
  }

  if (pagination.page + 1 <= Math.ceil(pagination.count / pagination.limit)) {
    _links.next = HateoasLinks.href(request, null, { limit: pagination.limit, page: pagination.page + 1 }, true);
  }

  const hateoasResources = array.map((resource) => addResourceLinks(resource, request, null, true));
  return { _links, _pages: pagination, _embedded: { [name]: hateoasResources } };
}

module.exports = {
  addResourceLinks,
  addCollectionLinks,
};
