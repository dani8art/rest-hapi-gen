jest.mock('../../lib/description/builders');

const { ActionType } = require('../../lib/statics');
const descriptionBuilderFactory = require('../../lib/description/factory');
const builders = require('../../lib/description/builders');

describe('Description Builder Factory Tests', () => {
  const collection = 'tests';

  beforeEach(() => jest.clearAllMocks());
  it('when we need to build description for the action get collection', () => {
    const action = ActionType.GET_COLLECTION;

    const descriptionBuilder = descriptionBuilderFactory(action);
    descriptionBuilder(collection);

    expect(builders.getCollectionDescriptionBuilder).toHaveBeenCalledWith(collection);
  });

  it('when we need to build description for the action get resource', () => {
    const action = ActionType.GET_RESOURCE;

    const descriptionBuilder = descriptionBuilderFactory(action);
    descriptionBuilder(collection);

    expect(builders.getResourceDescriptionBuilder).toHaveBeenCalledWith(collection);
  });

  it('when we need to build description for the action create resource', () => {
    const action = ActionType.CREATE_RESOURCE;

    const descriptionBuilder = descriptionBuilderFactory(action);
    descriptionBuilder(collection);

    expect(builders.createResourceDescriptionBuilder).toHaveBeenCalledWith(collection);
  });

  it('when we need to build description for the action update resource', () => {
    const action = ActionType.UPDATE_RESOURCE;

    const descriptionBuilder = descriptionBuilderFactory(action);
    descriptionBuilder(collection);

    expect(builders.updateResourceDescriptionBuilder).toHaveBeenCalledWith(collection);
  });

  it('when we need to build description for the action delete resource', () => {
    const action = ActionType.DELETE_RESOURCE;

    const descriptionBuilder = descriptionBuilderFactory(action);
    descriptionBuilder(collection);

    expect(builders.deleteResourceDescriptionBuilder).toHaveBeenCalledWith(collection);
  });

  it('when we need to build description for the action delete resource', () => {
    expect.assertions(1);
    const action = 'myAction';

    try {
      const descriptionBuilder = descriptionBuilderFactory(action);
      descriptionBuilder(collection);
    } catch (e) {
      expect(e.message).toBe('Description Builder not found.');
    }
  });
});
