jest.mock('@hapi/joi');
jest.mock('joi-objectid');

const Joi = require('@hapi/joi');
const builders = require('../../lib/validation/builders');

const JoiCommonMock = mockType => {
  return {
    mockType,
    required: jest.fn().mockReturnValue('required')
  };
};
Joi.object.mockImplementation(object => {
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
    const expectedValidation = { params: { identifier: Joi.objectId() } };
    const actualValidation = builders.getResourceValidationBuilder(schema);

    expect(actualValidation).toStrictEqual(expectedValidation);
  });

  it('#createResourceValidationBuilder should return payload validation', () => {
    const expectedValidation = { payload: schema };
    const actualValidation = builders.createResourceValidationBuilder(schema);

    expect(actualValidation).toStrictEqual(expectedValidation);
  });

  it('#updateResourceValidationBuilder should return payload and identifier validation', () => {
    const expectedValidation = { payload: schema, params: { identifier: Joi.objectId() } };
    const actualValidation = builders.updateResourceValidationBuilder(schema);

    expect(actualValidation).toStrictEqual(expectedValidation);
  });

  it('#deleteResourceValidationBuilder should return identifier validation', () => {
    const expectedValidation = { params: { identifier: Joi.objectId() } };
    const actualValidation = builders.deleteResourceValidationBuilder(schema);

    expect(actualValidation).toStrictEqual(expectedValidation);
  });
});
