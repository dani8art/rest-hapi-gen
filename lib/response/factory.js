const { ActionType } = require('../statics');

const {
  getCollectionResponseBuilder,
  getResourceResponseBuilder,
  createResourceResponseBuilder,
  updateResourceResponseBuilder,
  deleteResourceResponseBuilder,
} = require('./builders');

const responseBuilderFactory = (actionType) => {
  switch (actionType) {
    case ActionType.GET_COLLECTION:
      return getCollectionResponseBuilder;

    case ActionType.GET_RESOURCE:
      return getResourceResponseBuilder;

    case ActionType.CREATE_RESOURCE:
      return createResourceResponseBuilder;

    case ActionType.UPDATE_RESOURCE:
      return updateResourceResponseBuilder;

    case ActionType.DELETE_RESOURCE:
      return deleteResourceResponseBuilder;

    default:
      throw new Error('Response Builder not found.');
  }
};

module.exports = responseBuilderFactory;
