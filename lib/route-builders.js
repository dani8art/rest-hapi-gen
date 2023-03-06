const { ActionType, ActionTypeHttpMethod } = require('./statics');
const descriptionBuilderFactory = require('./description/factory');
const pathBuilderFactory = require('./path/factory');
const validationBuilderFactory = require('./validation/factory');
const responseBuilderFactory = require('./response/factory');
const handlerBuilderFactory = require('./handler/factory');

function getScope(actionType, options) {
  if (!options.auth) {
    return false;
  } else if (options.auth.enabled) {
    if (!options.auth.scope) {
      return false;
    } else {
      const readActions = [ActionType.GET_COLLECTION, ActionType.GET_RESOURCE];
      if (readActions.includes(actionType)) {
        return options.auth.scope.read || false;
      } else {
        return options.auth.scope.write || false;
      }
    }
  } else {
    return false;
  }
}

/**
 * Build hapi route for the given actionType.
 *
 * @param {ActionType} actionType
 * @param {string} options.collection.name
 * @param {any} options.schema
 * @param {any} options.model
 * @param {string} options.basePath
 * @param {string} options.server.protocol
 * @param {string} options.server.host
 * @param {string} options.server.port
 */
function routeBuilder(actionType, options) {
  const method = ActionTypeHttpMethod[actionType];
  const handler = options.overrides ? (options.overrides.actions ? options.overrides.actions[actionType] : null) : null;

  const pathBuilder = pathBuilderFactory(actionType);
  const handlerBuilder = handlerBuilderFactory(actionType);
  const descriptionBuilder = descriptionBuilderFactory(actionType);
  const validationBuilder = validationBuilderFactory(actionType);
  const responseBuilder = responseBuilderFactory(actionType);

  return {
    method,
    path: pathBuilder(options.basePath, options.collection.name),
    options: {
      handler: handlerBuilder(options.model, { collection: options.collection, handler }),
      tags: ['api', options.collection.name],
      description: descriptionBuilder(options.collection.name),
      validate: validationBuilder(options.schema),
      response: responseBuilder(options.collection.name, options.schema),
      auth: { access: { scope: getScope(actionType, options) } },
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
