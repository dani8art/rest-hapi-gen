const URL = require('url');
const { ActionType, ActionTypeHttpMethod } = require('./statics');
const descriptionBuilderFactory = require('./description/factory');
const pathBuilderFactory = require('./path/factory');
const validationBuilderFactory = require('./validation/factory');
const responseBuilderFactory = require('./response/factory');
const handlerBuilderFactory = require('./handler/factory');

/**
 * Build hapi route for the given actionType.
 *
 * @param {ActionType} actionType
 * @param {string} options.collectionName
 * @param {any} options.schema
 * @param {any} options.model
 * @param {string} options.basePath
 * @param {string} options.server.protocol
 * @param {string} options.server.host
 * @param {string} options.server.port
 * @param {string} options.collectionName
 */
function routeBuilder(actionType, options) {
  const method = ActionTypeHttpMethod[actionType];
  const handler = options.overrides ? (options.overrides.actions ? options.overrides.actions[actionType] : null) : null;

  const pathBuilder = pathBuilderFactory(actionType);
  const handlerBuilder = handlerBuilderFactory(actionType);
  const descriptionBuilder = descriptionBuilderFactory(actionType);
  const validationBuilder = validationBuilderFactory(actionType);
  const responseBuilder = responseBuilderFactory(actionType);

  const hateoas = {
    collectionName: options.collectionName,
    url: URL.resolve(options.server.info.uri, options.basePath),
  };

  return {
    method,
    path: pathBuilder(options.basePath, options.collectionName),
    options: {
      handler: handlerBuilder(options.model, { ...hateoas, handler }),
      tags: ['api', options.collectionName],
      description: descriptionBuilder(options.collectionName),
      validate: validationBuilder(options.schema),
      response: responseBuilder(options.collectionName, options.schema),
    },
  };
}

function buildGetCollectionRoute(options) {
  return routeBuilder(ActionType.GET_COLLECTION, options);
}

function buildGetResourceRoute(options) {
  return routeBuilder(ActionType.GET_RESOURCE, options);
}

function buildCreateResourceRoute(options) {
  return routeBuilder(ActionType.CREATE_RESOURCE, options);
}

function buildUpdateResourceRoute(options) {
  return routeBuilder(ActionType.UPDATE_RESOURCE, options);
}

function buildDeleteResourceRoute(options) {
  return routeBuilder(ActionType.DELETE_RESOURCE, options);
}

module.exports = {
  buildGetCollectionRoute,
  buildGetResourceRoute,
  buildCreateResourceRoute,
  buildUpdateResourceRoute,
  buildDeleteResourceRoute,
};
