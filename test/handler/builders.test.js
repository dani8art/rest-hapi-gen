jest.mock('../../lib/hateoas');
jest.mock('../../lib/models');
jest.mock('@hapi/boom');

const Boom = require('@hapi/boom');
const hateoas = require('../../lib/hateoas');
const models = require('../../lib/models');

Boom.badImplementation.mockImplementation((m) => m);
Boom.notFound.mockImplementation((m) => m);
Boom.badRequest.mockImplementation((m) => m);
models.documentToJson.mockImplementation((document) => document);
hateoas.addCollectionLinks.mockImplementation((jsonDocuments) => jsonDocuments);
hateoas.addResourceLinks.mockImplementation((jsonDocument) => jsonDocument);

const builders = require('../../lib/handler/builders');

describe('Handler Builder Tests', () => {
  const mockResource = { testresource: 'testresource' };
  const mockCollection = [mockResource];

  const findMock = jest.fn().mockReturnValue(mockCollection);
  const findMockError = (message) =>
    jest.fn().mockImplementation(() => {
      throw new Error(message || 'find error');
    });

  const findOneMock = jest.fn().mockImplementation((query) => {
    if (query._id === 'notFound') {
      return undefined;
    }
    return mockResource;
  });
  const findOneMockError = (message) =>
    jest.fn().mockImplementation(() => {
      throw new Error(message || 'findOne error');
    });

  const saveMock = jest.fn().mockReturnValue(mockResource);
  const saveMockError = (message) =>
    jest.fn().mockImplementation(() => {
      throw new Error(message || 'saveMock error');
    });

  const updateOneMock = jest.fn();
  const updateOneMockError = (message) =>
    jest.fn().mockImplementation(() => {
      throw new Error(message || 'updateOne error');
    });

  const deleteOneMock = jest.fn().mockReturnValue('deleted');
  const deleteOneMockError = (message) =>
    jest.fn().mockImplementation(() => {
      throw new Error(message || 'deleteOne error');
    });

  const mockCustomResource = { customHandler: 'customHandler' };
  const mockCustomCollection = [mockCustomResource];
  const customHandlerMock = jest.fn().mockReturnValue(mockCustomResource);

  const mockModel = jest.fn().mockImplementation((errors, message) => {
    return {
      find: !errors ? findMock : findMockError(message),
      findOne: !errors ? findOneMock : findOneMockError(message),
      save: !errors ? saveMock : saveMockError(message),
      updateOne: !errors ? updateOneMock : updateOneMockError(message),
      deleteOne: !errors ? deleteOneMock : deleteOneMockError(message),
    };
  });

  const mockRequest = { query: { name: 'fuffy' } };
  const mockH = {};
  const options = { test: 'options', collection: { name: 'name' } };

  beforeEach(() => jest.clearAllMocks());

  describe('#getCollectionHandlerBuilder', () => {
    it('should return the default handler', async () => {
      const model = mockModel();
      const actualHandler = builders.getCollectionHandlerBuilder(model, options);

      const actualResponse = await actualHandler(mockRequest, mockH);

      expect(model.find).toHaveBeenCalledWith({ name: 'fuffy' });
      expect(models.documentToJson).toHaveBeenCalledWith(mockResource, 0, mockCollection);
      expect(hateoas.addCollectionLinks).toHaveBeenCalledWith(mockCollection, mockRequest, options.collection.name);
      expect(actualResponse).toStrictEqual(mockCollection);
    });

    [
      { query: {}, parsedQuery: {} },
      { query: { name: 'fuffy' }, parsedQuery: { name: 'fuffy' } },
      { query: { name: 4 }, parsedQuery: { name: 4 } },
      { query: { name: '{"$lte": "fuffy"}' }, parsedQuery: { name: { $lte: 'fuffy' } } },
      {
        query: { name: '{"$lte": "fuffy"}', tags: '{ "$in": ["vaporizing", "talking"] }' },
        parsedQuery: { name: { $lte: 'fuffy' }, tags: { $in: ['vaporizing', 'talking'] } },
      },
      {
        query: { name: '{"$lte": "fuffy"}', tags: ['vaporizing', 'talking'] },
        parsedQuery: { name: { $lte: 'fuffy' }, tags: ['vaporizing', 'talking'] },
      },
    ].forEach((params, i) => {
      it(`should parse hapi query to mongoose query parms[${i}]`, async () => {
        const model = mockModel();
        const actualHandler = builders.getCollectionHandlerBuilder(model, options);

        mockRequest.query = params.query;
        const actualResponse = await actualHandler(mockRequest, mockH);

        expect(model.find).toHaveBeenCalledWith(params.parsedQuery);
      });
    });

    it('should return the the custom handler', async () => {
      const model = mockModel();
      const customOptions = { ...options, handler: customHandlerMock };
      const actualHandler = builders.getCollectionHandlerBuilder(model, customOptions);

      const actualResponse = await actualHandler(mockRequest, mockH);

      expect(model.find).not.toHaveBeenCalled();
      expect(customHandlerMock).toHaveBeenCalled();
      expect(models.documentToJson).toHaveBeenCalledWith(mockCustomResource, 0, mockCustomCollection);
      expect(hateoas.addCollectionLinks).toHaveBeenCalledWith(
        mockCustomCollection,
        mockRequest,
        options.collection.name
      );
      expect(actualResponse).toStrictEqual(mockCustomCollection);
    });

    it('should return error', async () => {
      const model = mockModel(true);

      const actualHandler = builders.getCollectionHandlerBuilder(model, options);

      const actualResponse = await actualHandler(mockRequest, mockH);

      expect(model.find).toHaveBeenCalled();
      expect(models.documentToJson).not.toHaveBeenCalledWith(mockResource, 0, mockCollection);
      expect(hateoas.addCollectionLinks).not.toHaveBeenCalledWith(mockCollection, options);
      expect(actualResponse).toBe('find error');
    });
  });

  describe('#getResourceHandlerBuilder', () => {
    it('should return the default handler', async () => {
      const model = mockModel();
      const actualHandler = builders.getResourceHandlerBuilder(model, options);

      const mockRequest = { params: { identifier: 'id' } };
      const actualResponse = await actualHandler(mockRequest, mockH);

      expect(model.findOne).toHaveBeenCalled();
      expect(models.documentToJson).toHaveBeenCalledWith(mockResource);
      expect(hateoas.addResourceLinks).toHaveBeenCalledWith(mockResource, mockRequest, '_id');
      expect(actualResponse).toStrictEqual(mockResource);
    });

    it('should return the the custom handler', async () => {
      const model = mockModel();
      const customOptions = { ...options, handler: customHandlerMock };
      const actualHandler = builders.getResourceHandlerBuilder(model, customOptions);

      const actualResponse = await actualHandler(mockRequest, mockH);

      expect(customHandlerMock).toHaveBeenCalled();
      expect(model.findOne).not.toHaveBeenCalled();
      expect(models.documentToJson).toHaveBeenCalledWith(mockCustomResource);
      expect(hateoas.addResourceLinks).toHaveBeenCalledWith(mockCustomResource, mockRequest, '_id');
      expect(actualResponse).toStrictEqual(mockCustomResource);
    });

    it('should return not found error', async () => {
      const model = mockModel();
      const actualHandler = builders.getResourceHandlerBuilder(model, options);

      const mockRequest = { params: { identifier: 'notFound' } };
      const actualResponse = await actualHandler(mockRequest, mockH);

      expect(model.findOne).toHaveBeenCalled();
      expect(models.documentToJson).not.toHaveBeenCalledWith(mockResource);
      expect(hateoas.addResourceLinks).not.toHaveBeenCalledWith(mockResource, options);
      expect(actualResponse).toStrictEqual('Not found resource with notFound');
    });

    it('should return implementation error', async () => {
      const model = mockModel(true);
      const actualHandler = builders.getResourceHandlerBuilder(model, options);

      const mockRequest = { params: { identifier: 'id' } };
      const actualResponse = await actualHandler(mockRequest, mockH);

      expect(model.findOne).toHaveBeenCalled();
      expect(models.documentToJson).not.toHaveBeenCalledWith(mockResource);
      expect(hateoas.addResourceLinks).not.toHaveBeenCalledWith(mockResource, options);
      expect(actualResponse).toStrictEqual('findOne error');
    });
  });

  describe('#createResourceHandlerBuilder', () => {
    it('should return the default handler', async () => {
      const modelInstance = mockModel();
      const model = jest.fn().mockImplementation(() => modelInstance);
      const actualHandler = builders.createResourceHandlerBuilder(model, options);

      const mockRequest = { payload: 'payload' };
      const actualResponse = await actualHandler(mockRequest, mockH);

      expect(model).toHaveBeenCalledTimes(1);
      expect(modelInstance.save).toHaveBeenCalledTimes(1);
      expect(models.documentToJson).toHaveBeenCalledWith(mockResource);
      expect(hateoas.addResourceLinks).toHaveBeenCalledWith(mockResource, mockRequest, '_id');
      expect(actualResponse).toStrictEqual(mockResource);
    });

    it('should return the the custom handler', async () => {
      const modelInstance = mockModel();
      const model = jest.fn().mockImplementation(() => modelInstance);
      const customOptions = { ...options, handler: customHandlerMock };
      const actualHandler = builders.createResourceHandlerBuilder(model, customOptions);

      const actualResponse = await actualHandler(mockRequest, mockH);

      expect(model).toHaveBeenCalledTimes(0);
      expect(modelInstance.save).toHaveBeenCalledTimes(0);
      expect(customHandlerMock).toHaveBeenCalledTimes(1);
      expect(models.documentToJson).toHaveBeenCalledWith(mockCustomResource);
      expect(hateoas.addResourceLinks).toHaveBeenCalledWith(mockCustomResource, mockRequest, '_id');
      expect(actualResponse).toStrictEqual(mockCustomResource);
    });

    it('should return generic error', async () => {
      const modelInstance = mockModel(true);
      const model = jest.fn().mockImplementation(() => modelInstance);
      const actualHandler = builders.createResourceHandlerBuilder(model, options);

      const actualResponse = await actualHandler(mockRequest, mockH);

      expect(model).toHaveBeenCalledTimes(1);
      expect(modelInstance.save).toHaveBeenCalledTimes(1);
      expect(models.documentToJson).not.toHaveBeenCalledWith(mockResource);
      expect(hateoas.addResourceLinks).not.toHaveBeenCalledWith(mockResource, options);
      expect(actualResponse).toStrictEqual('saveMock error');
    });

    it('should return duplicate key error', async () => {
      const modelInstance = mockModel(true, 'E11000');
      const model = jest.fn().mockImplementation(() => modelInstance);
      const actualHandler = builders.createResourceHandlerBuilder(model, options);

      const actualResponse = await actualHandler(mockRequest, mockH);

      expect(model).toHaveBeenCalledTimes(1);
      expect(modelInstance.save).toHaveBeenCalledTimes(1);
      expect(models.documentToJson).not.toHaveBeenCalledWith(mockResource);
      expect(hateoas.addResourceLinks).not.toHaveBeenCalledWith(mockResource, options);
      expect(actualResponse).toStrictEqual(
        'Duplicate key error. [collection = name, key = unknown]. The given value already exists: unknown'
      );
    });
  });

  describe('#updateResourceHandlerBuilder', () => {
    it('should return the default handler', async () => {
      const model = mockModel();
      const actualHandler = builders.updateResourceHandlerBuilder(model, options);

      const mockRequest = { params: { identifier: 'id' }, payload: 'payload' };
      const actualResponse = await actualHandler(mockRequest, mockH);

      expect(updateOneMock).toHaveBeenCalledWith({ _id: mockRequest.params.identifier }, mockRequest.payload);
      expect(findOneMock).toHaveBeenCalledWith({ _id: mockRequest.params.identifier });
      expect(models.documentToJson).toHaveBeenCalledWith(mockResource);
      expect(hateoas.addResourceLinks).toHaveBeenCalledWith(mockResource, mockRequest, '_id');
      expect(actualResponse).toStrictEqual(mockResource);
    });

    it('should return the the custom handler', async () => {
      const model = mockModel();
      const customOptions = { ...options, handler: customHandlerMock };
      const actualHandler = builders.getResourceHandlerBuilder(model, customOptions);

      const mockRequest = { params: { identifier: 'id' }, payload: 'payload' };
      const actualResponse = await actualHandler(mockRequest, mockH);

      expect(updateOneMock).toHaveBeenCalledTimes(0);
      expect(findOneMock).toHaveBeenCalledTimes(0);
      expect(customHandlerMock).toHaveBeenCalled();
      expect(models.documentToJson).toHaveBeenCalledWith(mockCustomResource);
      expect(hateoas.addResourceLinks).toHaveBeenCalledWith(mockCustomResource, mockRequest, '_id');
      expect(actualResponse).toStrictEqual(mockCustomResource);
    });

    it('should return error', async () => {
      const model = mockModel(true);
      const actualHandler = builders.updateResourceHandlerBuilder(model, options);

      const mockRequest = { params: { identifier: 'id' }, payload: 'payload' };
      const actualResponse = await actualHandler(mockRequest, mockH);

      expect(model.updateOne).toHaveBeenCalledWith({ _id: mockRequest.params.identifier }, mockRequest.payload);
      expect(model.findOne).not.toHaveBeenCalledWith({ _id: mockRequest.params.identifier });
      expect(models.documentToJson).not.toHaveBeenCalledWith(mockResource);
      expect(hateoas.addResourceLinks).not.toHaveBeenCalledWith(mockResource, options);
      expect(actualResponse).toStrictEqual('updateOne error');
    });
  });

  describe('#deleteResourceHandlerBuilder', () => {
    it('should return default handler', async () => {
      const expectedResponse = 'deleted';
      const model = mockModel();
      const actualHandler = builders.deleteResourceHandlerBuilder(model, options);

      const mockRequest = { params: { identifier: 'id' } };
      const actualResponse = await actualHandler(mockRequest, mockH);

      expect(deleteOneMock).toHaveBeenCalledWith({ _id: mockRequest.params.identifier });
      expect(models.documentToJson).not.toHaveBeenCalled();
      expect(hateoas.addResourceLinks).not.toHaveBeenCalled();
      expect(actualResponse).toStrictEqual(expectedResponse);
    });

    it('should return the the custom handler', async () => {
      const model = mockModel();
      const customOptions = { ...options, handler: customHandlerMock };
      const actualHandler = builders.getResourceHandlerBuilder(model, customOptions);

      const mockRequest = { params: { identifier: 'id' }, payload: 'payload' };
      const actualResponse = await actualHandler(mockRequest, mockH);

      expect(deleteOneMock).not.toHaveBeenCalled();
      expect(customHandlerMock).toHaveBeenCalled();
      expect(models.documentToJson).not.toHaveBeenCalledWith();
      expect(hateoas.addResourceLinks).not.toHaveBeenCalledWith();
      expect(actualResponse).toStrictEqual(mockCustomResource);
    });

    it('should return error', async () => {
      const expectedResponse = 'deleted';
      const model = mockModel(true);
      const actualHandler = builders.deleteResourceHandlerBuilder(model, options);

      const mockRequest = { params: { identifier: 'id' } };
      const actualResponse = await actualHandler(mockRequest, mockH);

      expect(model.deleteOne).toHaveBeenCalledWith({ _id: mockRequest.params.identifier });
      expect(models.documentToJson).not.toHaveBeenCalled();
      expect(hateoas.addResourceLinks).not.toHaveBeenCalled();
      expect(actualResponse).toStrictEqual('deleteOne error');
    });
  });
});
