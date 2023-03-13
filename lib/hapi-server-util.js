const { Server } = require('@hapi/hapi');
const HateoasLinks = require('./hateoas-links');

/**
 * Whether a path is naviable or not. A navigable path would be navigable if they can be resolved by a browser.
 *
 * @param {string} path Path to be checked.
 * @param {string} base Configured base path for the API to be ignored. Default '/'.
 *
 * @returns {boolean}
 */
const isNavigable = (path, base = '/') => {
  return !path.includes('swaggerui') && path !== base && !path.includes('{') && !path.includes('}') && path != '/';
};

/**
 * Whether a path element in an array is distinct.
 *
 * @param {string} path Path to be checked.
 * @param {int} i Current index.
 * @param {string[]} a Current array.
 *
 * @returns {boolean}
 */
const distinct = (path, i, a) => {
  return a.indexOf(path) === i;
};

module.exports = {
  /**
   * Whether a plugin is already registered in a given server.
   *
   * @param {Server} server Hapi Server to be queried.
   * @param {Plugin} plugin Hapi Pluging to match in the server plugin registry.
   */
  isRegistered(server, plugin) {
    const pkg = plugin.pkg || plugin.plugin.pkg;
    const name = pkg ? pkg.name : undefined;

    return !!Object.keys(server.registrations).find((key) => key === name);
  },

  /**
   * Whether a path is already a route or not.
   *
   * @param {Server} server This server will be used to get the table() method.
   * @param {string} path Path to be checked.
   *
   * @returns {boolean}
   */
  isRoute(server, path) {
    return server.table().find((route) => route.path === path);
  },

  /**
   * Map a @hapi/hapi Server object route table into an object of href.
   *
   * @param {Server} server This server will be used to get the table() method.
   * @param {Request} request This is the hapi request to be used to build links.
   * @param {string} base Base path for the API to be ignored.
   */
  hrefTable(server, request, base) {
    return server
      .table()
      .map((route) => route.path)
      .filter((path) => isNavigable(path, base))
      .filter(distinct)
      .sort()
      .reduce((acc, path) => {
        acc[path.split('/').pop()] = HateoasLinks.href(request, path);

        return acc;
      }, {});
  },
};
