jest.mock('../../lib/handler/builders');

const { ActionType } = require('../../lib/statics');
const handlerBuilderFactory = require('../../lib/handler/factory');
const builders = require('../../lib/handler/builders');

describe('Handler Builder Factory Tests', () => {
  const model = 'model';
  const opts = 'opts';

  beforeEach(() => jest.clearAllMocks());
  it('when we need to build handler for the action get collection', () => {
    const action = ActionType.GET_COLLECTION;

    const handlerBuilder = handlerBuilderFactory(action);
    handlerBuilder(model, opts);

    expect(builders.getCollectionHandlerBuilder).toHaveBeenCalledWith(model, opts);
  });

  it('when we need to build handler for the action get resource', () => {
    const action = ActionType.GET_RESOURCE;

    const handlerBuilder = handlerBuilderFactory(action);
    handlerBuilder(model, opts);

    expect(builders.getResourceHandlerBuilder).toHaveBeenCalledWith(model, opts);
  });

  it('when we need to build handler for the action create resource', () => {
    const action = ActionType.CREATE_RESOURCE;

    const handlerBuilder = handlerBuilderFactory(action);
    handlerBuilder(model, opts);

    expect(builders.createResourceHandlerBuilder).toHaveBeenCalledWith(model, opts);
  });

  it('when we need to build handler for the action update resource', () => {
    const action = ActionType.UPDATE_RESOURCE;

    const handlerBuilder = handlerBuilderFactory(action);
    handlerBuilder(model, opts);

    expect(builders.updateResourceHandlerBuilder).toHaveBeenCalledWith(model, opts);
  });

  it('when we need to build handler for the action delete resource', () => {
    const action = ActionType.DELETE_RESOURCE;

    const handlerBuilder = handlerBuilderFactory(action);
    handlerBuilder(model, opts);

    expect(builders.deleteResourceHandlerBuilder).toHaveBeenCalledWith(model, opts);
  });

  it('when we need to build handler for the action delete resource', () => {
    expect.assertions(1);
    const action = 'myAction';

    try {
      const handlerBuilder = handlerBuilderFactory(action);
      handlerBuilder(model, opts);
    } catch (e) {
      expect(e.message).toBe('Handler Builder not found.');
    }
  });
});
