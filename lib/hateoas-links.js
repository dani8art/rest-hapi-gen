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
 */
function href(request, path) {
  const protocol = HapiRequestUtil.protocol(request);
  const host = HapiRequestUtil.host(request);

  const uri = new URL(`${protocol}://${host}`);
  uri.pathname = path || request.path || '/';

  return { href: uri.toString() };
}

module.exports = {
  mapCollectionPath,
  mapResourcePath,
  href,
};
