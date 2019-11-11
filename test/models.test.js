jest.mock('mongoose');
jest.mock('joigoose');

const Joi = require('@hapi/joi');
const mongoose = require('mongoose');
const joigoose = require('joigoose').mockReturnValue({ convert: jest.fn().mockReturnValue('mongoSchema') })(mongoose);

const ObjectId = jest.requireActual('mongoose').Types.ObjectId;

const models = require('../lib/models');

describe('Models Utils Tests', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('#documentToJson', () => {
    const fields = { _id: new ObjectId('5db998d3afa2e2a47c1090be') };
    const document = { ...fields, toJSON: jest.fn().mockReturnValue(fields) };

    it('should map the _id which is an ObjectId', () => {
      const expected = { _id: '5db998d3afa2e2a47c1090be' };
      const actual = models.documentToJson(document);

      expect(actual).toStrictEqual(expected);
    });
  });

  describe('#buildModel', () => {
    it('should build the model', () => {
      const schema = Joi.object({ test: Joi.string() });
      const collectionName = 'test';

      models.buildModel(collectionName, schema);

      expect(joigoose.convert).toHaveBeenCalledWith(schema);
      expect(mongoose.model).toHaveBeenCalledWith(collectionName, 'mongoSchema');
    });
  });

  describe('#buildResourceSchema', () => {
    it('should return the correct schema', () => {
      const schema = Joi.object({ test: Joi.string() });
      const collectionName = 'test';
      const validObject = { test: 'test', _id: '5db998d3afa2e2a47c1090be', __v: 0, _links: {} };
      const idNotValidObject = { test: 'test', _id: 'hello', __v: 0, _links: {} };
      const missingIdNotValidObject = { test: 'test', __v: 0, _links: {} };
      const vNotValidObject = { test: 'test', _id: '5db998d3afa2e2a47c1090be', __v: '0s', _links: {} };
      const missingVNotValidObject = { test: 'test', _id: '5db998d3afa2e2a47c1090be', _links: {} };
      const linksNotValidObject = { test: 'test', _id: '5db998d3afa2e2a47c1090be', __v: 0 };

      const extendedSchema = models.buildResourceSchema(collectionName, schema);

      expect(extendedSchema.validate(validObject).error).toBe(null);
      expect(extendedSchema.validate(idNotValidObject).error.message).toBe(
        'child "_id" fails because ["_id" with value "hello" fails to match the valid mongo id pattern]'
      );
      expect(extendedSchema.validate(missingIdNotValidObject).error.message).toBe(
        'child "_id" fails because ["_id" is required]'
      );
      expect(extendedSchema.validate(vNotValidObject).error.message).toBe(
        'child "__v" fails because ["__v" must be a number]'
      );
      expect(extendedSchema.validate(missingVNotValidObject).error.message).toBe(
        'child "__v" fails because ["__v" is required]'
      );
      expect(extendedSchema.validate(linksNotValidObject).error.message).toBe(
        'child "_links" fails because ["_links" is required]'
      );
    });
  });

  describe('#buildCollectionSchema', () => {
    it('should return the correct schema', () => {
      const schema = Joi.object({ test: Joi.string() });
      const collectionName = 'tests';
      const validObject = {
        _embedded: { tests: [{ test: 'test' }] },
        _links: { self: { href: 'test' } }
      };
      const linksNotValidObject = {
        _embedded: { tests: [{ test: 'test' }] },
        _links: { self: 'self' }
      };
      const embeddedNotValidObject = {
        _embedded: { hello: [{ test: 'test' }] },
        _links: { self: { href: 'test' } }
      };

      const extendedSchema = models.buildCollectionSchema(collectionName, schema);

      expect(extendedSchema.validate(validObject).error).toBe(null);
      expect(extendedSchema.validate(linksNotValidObject).error.message).toBe(
        'child "_links" fails because [child "self" fails because ["self" must be an object]]'
      );
      expect(extendedSchema.validate(embeddedNotValidObject).error.message).toBe(
        'child "_embedded" fails because ["hello" is not allowed]'
      );
    });
  });
});
