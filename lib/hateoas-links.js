const path = require('path');

/**
 * Build a link.
 * @param {string} href String that contains the hiperlink to the object.
 *
 * @returns {} The link object {href: [string]}
 */
function buildLink(href) {
  return { href };
}

/**
 * Build a resource link.
 * @param {string} url Base url with <protocol>://<host>:<port>/<basePath> for building the link.
 * @param {string} identifier Identifier the resource like _id or id.
 *
 * @returns {} The link object {href: [string]}
 */
function buildResourceLink(url, identifier) {
  const resourceUrl = new URL(url.href);
  if (identifier && !resourceUrl.pathname.includes(`/${identifier}`)) {
    resourceUrl.pathname = path.join(resourceUrl.pathname, identifier);
    resourceUrl.search = '';
  }
  return buildLink(resourceUrl.href);
}

/**
 * Build collection link.
 * @param {string} url Base url with <protocol>://<host>:<port>/<basePath> for building the link.
 *
 * @returns {} The link object {href: [string]}
 */
function buildCollectionLink(url, identifier) {
  const collectionUrl = new URL(url.href);
  if (identifier && collectionUrl.pathname.includes(identifier)) {
    collectionUrl.pathname = collectionUrl.pathname.replace(`/${identifier}`, '');
    collectionUrl.search = '';
  }
  return buildLink(collectionUrl.href);
}

module.exports = {
  buildCollectionLink,
  buildResourceLink,
};
