jest.mock('../../lib/response/builders');

const { ActionType } = require('../../lib/statics');
const responseBuilderFactory = require('../../lib/response/factory');
const builders = require('../../lib/response/builders');

describe('Response Builder Factory Tests', () => {
  const collectionName = 'tests';
  const schema = 'testSchema';

  beforeEach(() => jest.clearAllMocks());
  it('when we need to build response for the action get collection', () => {
    const action = ActionType.GET_COLLECTION;

    const responseBuilder = responseBuilderFactory(action);
    responseBuilder(collectionName, schema);

    expect(builders.getCollectionResponseBuilder).toHaveBeenCalledWith(collectionName, schema);
  });

  it('when we need to build response for the action get resource', () => {
    const action = ActionType.GET_RESOURCE;

    const responseBuilder = responseBuilderFactory(action);
    responseBuilder(collectionName, schema);

    expect(builders.getResourceResponseBuilder).toHaveBeenCalledWith(collectionName, schema);
  });

  it('when we need to build response for the action create resource', () => {
    const action = ActionType.CREATE_RESOURCE;

    const responseBuilder = responseBuilderFactory(action);
    responseBuilder(collectionName, schema);

    expect(builders.createResourceResponseBuilder).toHaveBeenCalledWith(collectionName, schema);
  });

  it('when we need to build response for the action update resource', () => {
    const action = ActionType.UPDATE_RESOURCE;

    const responseBuilder = responseBuilderFactory(action);
    responseBuilder(collectionName, schema);

    expect(builders.updateResourceResponseBuilder).toHaveBeenCalledWith(collectionName, schema);
  });

  it('when we need to build response for the action delete resource', () => {
    const action = ActionType.DELETE_RESOURCE;

    const responseBuilder = responseBuilderFactory(action);
    responseBuilder(collectionName, schema);

    expect(builders.deleteResourceResponseBuilder).toHaveBeenCalledWith(collectionName, schema);
  });

  it('when we need to build response for the action delete resource', () => {
    expect.assertions(1);
    const action = 'myAction';

    try {
      const responseBuilder = responseBuilderFactory(action);
      responseBuilder(collectionName, schema);
    } catch (e) {
      expect(e.message).toBe('Response Builder not found.');
    }
  });
});
