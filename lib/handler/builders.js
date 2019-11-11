const Boom = require('@hapi/boom');

const hateoas = require('../hateoas');
const models = require('../models');

/**
 * Build a default handler for the get collection action.
 *
 * @param {any} model Mongoose model generated from the collection schema definition.
 * @param {string} opts.collectionName Collection name will be used to build hateoas links.
 * @param {string} opts.url Api endpoint URL will be used to build hateoas links.
 */
function getCollectionHandlerBuilder(model, opts) {
  return async (request, h) => {
    let collection;
    try {
      const documents = await model.find();

      const jsonDocuments = documents.map(models.documentToJson);
      collection = hateoas.addCollectionLinks(jsonDocuments, opts);
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
      const document = await model.findOne({ _id: request.params.identifier });

      if (!document) {
        return Boom.notFound(`Not found resource with ${request.params.identifier}`);
      }

      const jsonDocument = models.documentToJson(document);
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
      const newResource = new model(request.payload);
      const document = await newResource.save();

      const jsonDocument = models.documentToJson(document);
      resource = hateoas.addResourceLinks(jsonDocument, opts);
    } catch (e) {
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
      await model.updateOne({ _id: request.params.identifier }, request.payload);
      const document = await model.findOne({ _id: request.params.identifier });

      const jsonDocument = models.documentToJson(document);
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
      document = await model.deleteOne({ _id: request.params.identifier });
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
  deleteResourceHandlerBuilder
};
