const { join } = require('path');
const HapiRequestUtil = require('./hapi-request-util');

/**
 * Map a resource path.
 *
 * @param {Request} url Hapi request where to find info to map the path.
 * @param {string} identifier Identifier for the resource.
 */
function mapResourcePath(request, identifier) {
  return request.path.includes(identifier) ? request.path : join(request.path, identifier);
}

/**
 * Map a collection path.
 *
 * @param {Request} url Hapi request where to find info to map the path.
 * @param {string} identifier Identifier for the resource.
 */
function mapCollectionPath(request, identifier) {
  return request.path.includes(identifier) ? request.path.replace(`/${identifier}`, '') : request.path;
}

/**
 * Build a href from a given hapi request object.
 *
 * @param {Request} request Hapi.js request object.
 * @param {string} path Path to append to the generated href.
 * @param {number} pagination.limit Page size info to build pagination links.
 * @param {number} pagination.page Page position info to build pagination links.
 * @param {number} pagination.count Total number of items in the collection.
 * @param {boolean} addQuery Whether to add the request query to the href.
 */
function href(request, path, pagination, addQuery) {
  const protocol = HapiRequestUtil.protocol(request);
  const host = HapiRequestUtil.host(request);

  const uri = new URL(`${protocol}://${host}`);
  uri.pathname = path || request.path || '/';

  if (pagination) {
    if (pagination.limit && pagination.limit !== HapiRequestUtil.DEFAULT_PAGE_LIMIT) {
      uri.searchParams.append('limit', pagination.limit);
    }

    uri.searchParams.append('page', pagination.page);
  }

  if (addQuery) {
    Object.keys(request.query).forEach((p) => {
      if (p !== HapiRequestUtil.LIMIT_REQUEST_QUERY_KEY && p !== HapiRequestUtil.PAGES_REQUEST_QUERY_KEY) {
        uri.searchParams.append(p, request.query[p]);
      }
    });
  }

  return { href: uri.toString() };
}

module.exports = {
  mapCollectionPath,
  mapResourcePath,
  href,
};
