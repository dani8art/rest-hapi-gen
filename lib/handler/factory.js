const { ActionType } = require('../statics');

const {
  getCollectionHandlerBuilder,
  getResourceHandlerBuilder,
  createResourceHandlerBuilder,
  updateResourceHandlerBuilder,
  deleteResourceHandlerBuilder
} = require('./builders');

/**
 *
 * @param {*} actionType
 */
const handlerBuilderFactory = actionType => {
  switch (actionType) {
    case ActionType.GET_COLLECTION:
      return getCollectionHandlerBuilder;

    case ActionType.GET_RESOURCE:
      return getResourceHandlerBuilder;

    case ActionType.CREATE_RESOURCE:
      return createResourceHandlerBuilder;

    case ActionType.UPDATE_RESOURCE:
      return updateResourceHandlerBuilder;

    case ActionType.DELETE_RESOURCE:
      return deleteResourceHandlerBuilder;

    default:
      throw new Error('Handler Builder not found.');
  }
};

module.exports = handlerBuilderFactory;
