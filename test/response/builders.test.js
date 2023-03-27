jest.mock('../../lib/models');
jest.mock('joi');

const Joi = require('joi');

Joi.object.mockImplementation((object) => {
  object.__proto__.stack = ['object'];

  object.__proto__.required = jest.fn().mockImplementation(() => {
    object.__proto__.stack.push('required');

    return object;
  });

  object.__proto__.label = jest.fn().mockImplementation(() => {
    object.__proto__.stack.push('label');

    object.__proto__.description = jest.fn().mockImplementation(() => {
      object.__proto__.stack.push('description');

      return object;
    });

    return object;
  });

  return object;
});

Joi.boolean.mockImplementation(() => {
  const boolean = {};
  boolean.__proto__.stack = ['boolean'];
  boolean.__proto__.required = jest.fn().mockImplementation(() => {
    boolean.__proto__.stack.push('required');

    return boolean.__proto__.stack.join('.');
  });

  return boolean;
});

Joi.number.mockImplementation(() => {
  const number = {};
  number.__proto__.stack = ['number'];

  number.__proto__.min = jest.fn().mockImplementation((min) => {
    number.__proto__.stack.push('min');
    number.__proto__.stack.push(min);

    return number;
  });

  number.__proto__.valid = jest.fn().mockImplementation((valid) => {
    number.__proto__.stack.push('valid');
    number.__proto__.stack.push(valid);

    return number;
  });

  number.__proto__.required = jest.fn().mockImplementation(() => {
    number.__proto__.stack.push('required');

    return number.__proto__.stack.join('.');
  });

  return number;
});

Joi.string.mockImplementation(() => {
  const string = {};
  string.__proto__.stack = ['string'];
  string.__proto__.required = jest.fn().mockImplementation(() => {
    string.__proto__.stack.push('required');

    return string.__proto__.stack.join('.');
  });

  return string;
});

const builders = require('../../lib/response/builders');
const models = require('../../lib/models');

models.buildResourceSchema.mockImplementation((collection, schema) => {
  return schema;
});
models.buildCollectionSchema.mockImplementation((collection, schema) => {
  return { [collection]: schema };
});

describe('Response Builders Tests', () => {
  const collectionName = 'tests';
  const schema = 'testSchema';

  beforeEach(() => jest.clearAllMocks());

  it('#getCollectionResponseBuilder should return the proper response validation', () => {
    const expectedResponseValidation = {
      status: {
        200: { tests: 'testSchema' },
        500: { error: 'string.required', message: 'string.required', statusCode: 'number.valid.500.required' },
      },
    };

    const actualResponseValidation = builders.getCollectionResponseBuilder(collectionName, schema);

    expect(actualResponseValidation).toStrictEqual(expectedResponseValidation);
  });

  it('and auth is enabled then #getCollectionResponseBuilder should return the proper response validation', () => {
    const expectedResponseValidation = {
      status: {
        200: { tests: 'testSchema' },
        401: {
          attributes: { error: 'string.required', realm: 'string.required' },
          error: 'string.required',
          message: 'string.required',
          statusCode: 'number.valid.401.required',
        },
        403: { error: 'string.required', message: 'string.required', statusCode: 'number.valid.403.required' },
        500: { error: 'string.required', message: 'string.required', statusCode: 'number.valid.500.required' },
      },
    };

    const actualResponseValidation = builders.getCollectionResponseBuilder(collectionName, schema, true);

    expect(actualResponseValidation).toStrictEqual(expectedResponseValidation);
  });

  it('#getResourceResponseBuilder should return the proper response validation', () => {
    const expectedResponseValidation = {
      status: {
        200: 'testSchema',
        404: { error: 'string.required', message: 'string.required', statusCode: 'number.valid.404.required' },
        500: { error: 'string.required', message: 'string.required', statusCode: 'number.valid.500.required' },
      },
    };

    const actualResponseValidation = builders.getResourceResponseBuilder(collectionName, schema);

    expect(actualResponseValidation).toStrictEqual(expectedResponseValidation);
  });

  it('and auth is enabled then #getResourceResponseBuilder should return the proper response validation', () => {
    const expectedResponseValidation = {
      status: {
        200: 'testSchema',
        401: {
          attributes: { error: 'string.required', realm: 'string.required' },
          error: 'string.required',
          message: 'string.required',
          statusCode: 'number.valid.401.required',
        },
        403: { error: 'string.required', message: 'string.required', statusCode: 'number.valid.403.required' },
        404: { error: 'string.required', message: 'string.required', statusCode: 'number.valid.404.required' },
        500: { error: 'string.required', message: 'string.required', statusCode: 'number.valid.500.required' },
      },
    };

    const actualResponseValidation = builders.getResourceResponseBuilder(collectionName, schema, true);

    expect(actualResponseValidation).toStrictEqual(expectedResponseValidation);
  });

  it('#createResourceResponseBuilder should return the proper response validation', () => {
    const expectedResponseValidation = {
      status: {
        200: 'testSchema',
        400: { error: 'string.required', message: 'string.required', statusCode: 'number.valid.400.required' },
        500: { error: 'string.required', message: 'string.required', statusCode: 'number.valid.500.required' },
      },
    };

    const actualResponseValidation = builders.createResourceResponseBuilder(collectionName, schema);

    expect(actualResponseValidation).toStrictEqual(expectedResponseValidation);
  });

  it('and auth is enabled #createResourceResponseBuilder should return the proper response validation', () => {
    const expectedResponseValidation = {
      status: {
        200: 'testSchema',
        401: {
          attributes: { error: 'string.required', realm: 'string.required' },
          error: 'string.required',
          message: 'string.required',
          statusCode: 'number.valid.401.required',
        },
        403: { error: 'string.required', message: 'string.required', statusCode: 'number.valid.403.required' },
        400: { error: 'string.required', message: 'string.required', statusCode: 'number.valid.400.required' },
        500: { error: 'string.required', message: 'string.required', statusCode: 'number.valid.500.required' },
      },
    };

    const actualResponseValidation = builders.createResourceResponseBuilder(collectionName, schema, true);

    expect(actualResponseValidation).toStrictEqual(expectedResponseValidation);
  });

  it('#updateResourceResponseBuilder should return the proper response validation', () => {
    const expectedResponseValidation = {
      status: {
        200: 'testSchema',
        400: { error: 'string.required', message: 'string.required', statusCode: 'number.valid.400.required' },
        404: { error: 'string.required', message: 'string.required', statusCode: 'number.valid.404.required' },
        500: { error: 'string.required', message: 'string.required', statusCode: 'number.valid.500.required' },
      },
    };

    const actualResponseValidation = builders.updateResourceResponseBuilder(collectionName, schema);

    expect(actualResponseValidation).toStrictEqual(expectedResponseValidation);
  });

  it('and auth is enabled then #updateResourceResponseBuilder should return the proper response validation', () => {
    const expectedResponseValidation = {
      status: {
        200: 'testSchema',
        400: { error: 'string.required', message: 'string.required', statusCode: 'number.valid.400.required' },
        401: {
          attributes: { error: 'string.required', realm: 'string.required' },
          error: 'string.required',
          message: 'string.required',
          statusCode: 'number.valid.401.required',
        },
        403: { error: 'string.required', message: 'string.required', statusCode: 'number.valid.403.required' },
        404: { error: 'string.required', message: 'string.required', statusCode: 'number.valid.404.required' },
        500: { error: 'string.required', message: 'string.required', statusCode: 'number.valid.500.required' },
      },
    };

    const actualResponseValidation = builders.updateResourceResponseBuilder(collectionName, schema, true);

    expect(actualResponseValidation).toStrictEqual(expectedResponseValidation);
  });

  it('#deleteResourceResponseBuilder should return the proper response validation', () => {
    const actualResponseValidation = builders.deleteResourceResponseBuilder(collectionName, schema);

    expect(actualResponseValidation.stack.join('.')).toEqual('object.label.description');
    expect(actualResponseValidation).toStrictEqual({
      status: {
        200: { acknowledged: 'boolean.required', deletedCount: 'number.min.0.required' },
        500: { error: 'string.required', message: 'string.required', statusCode: 'number.valid.500.required' },
      },
    });
  });

  it('and auth is enabled then #deleteResourceResponseBuilder should return the proper response validation', () => {
    const actualResponseValidation = builders.deleteResourceResponseBuilder(collectionName, schema, true);

    expect(actualResponseValidation.stack.join('.')).toEqual('object.label.description');
    expect(actualResponseValidation).toStrictEqual({
      status: {
        200: { acknowledged: 'boolean.required', deletedCount: 'number.min.0.required' },
        401: {
          attributes: { error: 'string.required', realm: 'string.required' },
          error: 'string.required',
          message: 'string.required',
          statusCode: 'number.valid.401.required',
        },
        403: { error: 'string.required', message: 'string.required', statusCode: 'number.valid.403.required' },
        500: { error: 'string.required', message: 'string.required', statusCode: 'number.valid.500.required' },
      },
    });
  });
});
