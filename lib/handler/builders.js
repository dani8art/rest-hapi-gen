const Boom = require('@hapi/boom');

const hateoas = require('../hateoas');
const models = require('../models');

/**
 * Whether execute custom handler or default one
 *
 * @param {Function} handler Default implemented handler
 * @param {Function} custom User custom handler
 */
async function override(handler, custom, request, h, model) {
  if (!custom) {
    return await handler();
  } else {
    return await custom(request, h, model);
  }
}

/**
 * Parse as much as posible a @hapi/hapi request.query object to a mongoose query.
 * 
 * @param {*} query @hapi/hapi request.query object.
 * 
 * @returns A mongoose query.
 */
function toMongooseQuery(query) {
  const mongooseQuery = {};

  Object.keys(query).forEach((p) => {
    try {
      mongooseQuery[p] = JSON.parse(query[p]);
    } catch (e) {
      mongooseQuery[p] = query[p];
    }
  });

  return mongooseQuery;
}

/**
 * Build a default handler for the get collection action.
 *
 * @param {any} model Mongoose model generated from the collection schema definition.
 * @param {string} opts.collectionName Collection name will be used to build hateoas links.
 * @param {string} opts.url Api endpoint URL will be used to build hateoas links.
 * @param {string} opts.handler A custom handler from user configuration.
 */
function getCollectionHandlerBuilder(model, opts) {
  return async (request, h) => {
    let collection;
    try {
      const defaultHandler = async () => await model.find(toMongooseQuery(request.query));

      let documents = await override(defaultHandler, opts.handler, request, h, model);

      if (!Array.isArray(documents)) {
        documents = [documents];
      }

      documents = documents.map(models.documentToJson);

      opts.url = request.url;
      collection = hateoas.addCollectionLinks(documents, opts);
    } catch (e) {
      return Boom.badImplementation(e.message);
    }
    return collection;
  };
}

/**
 * Build a default handler for the get resource action.
 *
 * @param {any} model Mongoose model generated from the collection schema definition.
 * @param {string} opts.collectionName Collection name will be used to build hateoas links.
 * @param {string} opts.url Api endpoint URL will be used to build hateoas links.
 */
function getResourceHandlerBuilder(model, opts) {
  return async (request, h) => {
    let resource;
    try {
      const defaultHandler = async () => await model.findOne({ _id: request.params.identifier });

      const document = await override(defaultHandler, opts.handler, request, h, model);

      if (!document) {
        return Boom.notFound(`Not found resource with ${request.params.identifier}`);
      }

      const jsonDocument = models.documentToJson(document);

      opts.url = request.url;
      resource = hateoas.addResourceLinks(jsonDocument, opts);
    } catch (e) {
      return Boom.badImplementation(e.message);
    }
    return resource;
  };
}

/**
 * Build a default handler for the create resource action.
 *
 * @param {any} model Mongoose model generated from the collection schema definition.
 * @param {string} opts.collectionName Collection name will be used to build hateoas links.
 * @param {string} opts.url Api endpoint URL will be used to build hateoas links.
 */
function createResourceHandlerBuilder(model, opts) {
  return async (request, h) => {
    let resource;
    try {
      const defaultHandler = async () => {
        const newResource = new model(request.payload);
        return await newResource.save();
      };

      const document = await override(defaultHandler, opts.handler, request, h, model);

      const jsonDocument = models.documentToJson(document);

      opts.url = request.url;
      resource = hateoas.addResourceLinks(jsonDocument, opts);
    } catch (e) {
      if (e.message != null && e.message.includes('E11000')) {
        const collection = opts.collectionName;
        // TODO: Add tests with keyPattern and keyValue
        const key = e.keyPattern ? Object.keys(e.keyPattern).join(', ') : 'unknown';
        const value = e.keyValue ? JSON.stringify(e.keyValue) : 'unknown';

        return Boom.badRequest(
          `Duplicate key error. [collection = ${collection}, key = ${key}]. The given value already exists: ${value}`
        );
      }

      return Boom.badImplementation(e.message);
    }
    return resource;
  };
}

/**
 * Build a default handler for the update resource action.
 *
 * @param {any} model Mongoose model generated from the collection schema definition.
 * @param {string} opts.collectionName Collection name will be used to build hateoas links.
 * @param {string} opts.url Api endpoint URL will be used to build hateoas links.
 */
function updateResourceHandlerBuilder(model, opts) {
  return async (request, h) => {
    let resource;
    try {
      const defaultHandler = async () => {
        await model.updateOne({ _id: request.params.identifier }, request.payload);
        return await model.findOne({ _id: request.params.identifier });
      };

      const document = await override(defaultHandler, opts.handler, request, h, model);

      const jsonDocument = models.documentToJson(document);

      opts.url = request.url;
      resource = hateoas.addResourceLinks(jsonDocument, opts);
    } catch (e) {
      return Boom.badImplementation(e.message);
    }
    return resource;
  };
}

/**
 * Build a default handler for the delete resource action.
 *
 * @param {any} model Mongoose model generated from the collection schema definition.
 * @param {string} opts.collectionName Collection name will be used to build hateoas links.
 * @param {string} opts.url Api endpoint URL will be used to build hateoas links.
 */
function deleteResourceHandlerBuilder(model, opts) {
  return async (request, h) => {
    let document;
    try {
      const defaultHandler = async () => await model.deleteOne({ _id: request.params.identifier });

      document = await override(defaultHandler, opts.handler, request, h, model);
    } catch (e) {
      return Boom.badImplementation(e.message);
    }
    return document;
  };
}

module.exports = {
  getCollectionHandlerBuilder,
  getResourceHandlerBuilder,
  createResourceHandlerBuilder,
  updateResourceHandlerBuilder,
  deleteResourceHandlerBuilder,
};
