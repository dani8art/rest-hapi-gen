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
 * @param {string} collectionName Collection name.
 * @param {string} identifier Identifier the resource like _id or id.
 *
 * @returns {} The link object {href: [string]}
 */
function buildResourceLink(url, collectionName, identifier) {
  return buildLink(`${url}/${collectionName}/${identifier}`);
}

/**
 * Build collection link.
 * @param {string} url Base url with <protocol>://<host>:<port>/<basePath> for building the link.
 * @param {string} collectionName Collection name.
 *
 * @returns {} The link object {href: [string]}
 */
function buildCollectionLink(url, collectionName) {
  return buildLink(`${url}/${collectionName}`);
}

module.exports = {
  buildCollectionLink,
  buildResourceLink,
};
