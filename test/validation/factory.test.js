jest.mock('../../lib/validation/builders');

const { ActionType } = require('../../lib/statics');
const validationBuilderFactory = require('../../lib/validation/factory');
const builders = require('../../lib/validation/builders');

describe('Validation Builder Factory Tests', () => {
  const schema = 'tests';

  beforeEach(() => jest.clearAllMocks());
  it('when we need to build validation for the action get collection', () => {
    const action = ActionType.GET_COLLECTION;

    const validationBuilder = validationBuilderFactory(action);
    validationBuilder(schema);

    expect(builders.getCollectionValidationBuilder).toHaveBeenCalledWith(schema);
  });

  it('when we need to build validation for the action get resource', () => {
    const action = ActionType.GET_RESOURCE;

    const validationBuilder = validationBuilderFactory(action);
    validationBuilder(schema);

    expect(builders.getResourceValidationBuilder).toHaveBeenCalledWith(schema);
  });

  it('when we need to build validation for the action create resource', () => {
    const action = ActionType.CREATE_RESOURCE;

    const validationBuilder = validationBuilderFactory(action);
    validationBuilder(schema);

    expect(builders.createResourceValidationBuilder).toHaveBeenCalledWith(schema);
  });

  it('when we need to build validation for the action update resource', () => {
    const action = ActionType.UPDATE_RESOURCE;

    const validationBuilder = validationBuilderFactory(action);
    validationBuilder(schema);

    expect(builders.updateResourceValidationBuilder).toHaveBeenCalledWith(schema);
  });

  it('when we need to build validation for the action delete resource', () => {
    const action = ActionType.DELETE_RESOURCE;

    const validationBuilder = validationBuilderFactory(action);
    validationBuilder(schema);

    expect(builders.deleteResourceValidationBuilder).toHaveBeenCalledWith(schema);
  });

  it('when we need to build validation for the action delete resource', () => {
    expect.assertions(1);
    const action = 'myAction';

    try {
      const validationBuilder = validationBuilderFactory(action);
      validationBuilder(schema);
    } catch (e) {
      expect(e.message).toBe('Validation Builder not found.');
    }
  });
});
