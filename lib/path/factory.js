const { ActionType } = require('../statics');
const { singularPathBuilder, pluralPathBuilder } = require('./builders');

/**
 * Get the proper path builder given an action type.
 *
 * @param {string} actionType
 */
const pathBuilderFactory = actionType => {
  switch (actionType) {
    case ActionType.GET_COLLECTION:
      return pluralPathBuilder;

    case ActionType.GET_RESOURCE:
      return singularPathBuilder;

    case ActionType.CREATE_RESOURCE:
      return pluralPathBuilder;

    case ActionType.UPDATE_RESOURCE:
      return singularPathBuilder;

    case ActionType.DELETE_RESOURCE:
      return singularPathBuilder;

    default:
      throw new Error('Path Builder not found.');
  }
};

module.exports = pathBuilderFactory;
