jest.mock('joi');
jest.mock('../../lib/joi-object-id');

const Joi = require('joi');
const builders = require('../../lib/validation/builders');

const JoiRequiredMock = jest.fn().mockReturnValue('required');
const JoiCommonMock = (mockType) => {
  return {
    mockType,
    required: JoiRequiredMock,
  };
};
Joi.object.mockImplementation((object) => {
  return { ...object, ...JoiCommonMock('object') };
});
Joi.string.mockReturnValue(JoiCommonMock('string'));

Joi.objectId = jest.fn();
Joi.objectId.mockReturnValue(JoiCommonMock('objectId'));

describe('Validation Builders Tests', () => {
  const schema = Joi.object({ test: Joi.string().required() });

  it('#getCollectionValidationBuilder should return empty object', () => {
    const expectedValidation = {};
    const actualValidation = builders.getCollectionValidationBuilder(schema);

    expect(actualValidation).toStrictEqual(expectedValidation);
  });

  it('#getResourceValidationBuilder should return empty object', () => {
    const expectedValidation = { params: Joi.object({ identifier: Joi.objectId() }) };
    const actualValidation = builders.getResourceValidationBuilder(schema);

    expect(actualValidation).toEqual(expectedValidation);
  });

  it('#createResourceValidationBuilder should return payload validation', () => {
    const expectedValidation = { payload: schema };
    const actualValidation = builders.createResourceValidationBuilder(schema);

    expect(actualValidation).toStrictEqual(expectedValidation);
  });

  it('#updateResourceValidationBuilder should return payload and identifier validation', () => {
    const expectedValidation = { payload: schema, params: Joi.object({ identifier: Joi.objectId() }) };
    const actualValidation = builders.updateResourceValidationBuilder(schema);

    expect(actualValidation).toEqual(expectedValidation);
  });

  it('#deleteResourceValidationBuilder should return identifier validation', () => {
    const expectedValidation = { params: Joi.object({ identifier: Joi.objectId() }) };
    const actualValidation = builders.deleteResourceValidationBuilder(schema);

    expect(actualValidation).toEqual(expectedValidation);
  });
});
