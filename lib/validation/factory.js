const { ActionType } = require('../statics');
const {
  getCollectionValidationBuilder,
  getResourceValidationBuilder,
  createResourceValidationBuilder,
  updateResourceValidationBuilder,
  deleteResourceValidationBuilder,
} = require('./builders');

/**
 * Get the proper validation builder given an action type.
 *
 * @param {string} actionType
 */
const validationBuilderFactory = (actionType) => {
  switch (actionType) {
    case ActionType.GET_COLLECTION:
      return getCollectionValidationBuilder;

    case ActionType.GET_RESOURCE:
      return getResourceValidationBuilder;

    case ActionType.CREATE_RESOURCE:
      return createResourceValidationBuilder;

    case ActionType.UPDATE_RESOURCE:
      return updateResourceValidationBuilder;

    case ActionType.DELETE_RESOURCE:
      return deleteResourceValidationBuilder;

    default:
      throw new Error('Validation Builder not found.');
  }
};

module.exports = validationBuilderFactory;
