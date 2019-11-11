jest.mock('../../lib/path/builders');

const { ActionType } = require('../../lib/statics');
const pathBuilderFactory = require('../../lib/path/factory');
const builders = require('../../lib/path/builders');

describe('Path Builder Factory Tests', () => {
  const collection = 'tests';
  const basePath = '/test/base/path';

  beforeEach(() => jest.clearAllMocks());
  it('when we need to build path for the action get collection', () => {
    const action = ActionType.GET_COLLECTION;

    const pathBuilder = pathBuilderFactory(action);
    pathBuilder(basePath, collection);

    expect(builders.pluralPathBuilder).toHaveBeenCalledWith(basePath, collection);
  });

  it('when we need to build path for the action get resource', () => {
    const action = ActionType.GET_RESOURCE;

    const pathBuilder = pathBuilderFactory(action);
    pathBuilder(basePath, collection);

    expect(builders.singularPathBuilder).toHaveBeenCalledWith(basePath, collection);
  });

  it('when we need to build path for the action create resource', () => {
    const action = ActionType.CREATE_RESOURCE;

    const pathBuilder = pathBuilderFactory(action);
    pathBuilder(basePath, collection);

    expect(builders.pluralPathBuilder).toHaveBeenCalledWith(basePath, collection);
  });

  it('when we need to build path for the action update resource', () => {
    const action = ActionType.UPDATE_RESOURCE;

    const pathBuilder = pathBuilderFactory(action);
    pathBuilder(basePath, collection);

    expect(builders.singularPathBuilder).toHaveBeenCalledWith(basePath, collection);
  });

  it('when we need to build path for the action delete resource', () => {
    const action = ActionType.DELETE_RESOURCE;

    const pathBuilder = pathBuilderFactory(action);
    pathBuilder(basePath, collection);

    expect(builders.singularPathBuilder).toHaveBeenCalledWith(basePath, collection);
  });

  it('when we need to build path for the action delete resource', () => {
    expect.assertions(1);
    const action = 'myAction';

    try {
      const pathBuilder = pathBuilderFactory(action);
      pathBuilder(basePath, collection);
    } catch (e) {
      expect(e.message).toBe('Path Builder not found.');
    }
  });
});
