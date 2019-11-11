const { ActionType } = require('../statics');

const {
  getCollectionDescriptionBuilder,
  getResourceDescriptionBuilder,
  createResourceDescriptionBuilder,
  updateResourceDescriptionBuilder,
  deleteResourceDescriptionBuilder
} = require('./builders');

/**
 * Get the proper description builder given an action type.
 *
 * @param {string} actionType
 */
function descriptionBuilderFactory(actionType) {
  switch (actionType) {
    case ActionType.GET_COLLECTION:
      return getCollectionDescriptionBuilder;

    case ActionType.GET_RESOURCE:
      return getResourceDescriptionBuilder;

    case ActionType.CREATE_RESOURCE:
      return createResourceDescriptionBuilder;

    case ActionType.UPDATE_RESOURCE:
      return updateResourceDescriptionBuilder;

    case ActionType.DELETE_RESOURCE:
      return deleteResourceDescriptionBuilder;

    default:
      throw new Error('Description Builder not found.');
  }
}

module.exports = descriptionBuilderFactory;
