const Mongoose = require('mongoose');
const Hapi = require('@hapi/hapi');
const Inert = require('@hapi/inert');
const Vision = require('@hapi/vision');
const Joi = require('@hapi/joi');
const HapiSwagger = require('hapi-swagger');
const Pack = require('../package');

const RestHapiGen = require('../lib/rest-hapi-gen');

const init = async () => {
  await Mongoose.connect('mongodb://localhost:27017/testdb', { useNewUrlParser: true, useUnifiedTopology: true });

  const server = Hapi.server({
    port: 4000
  });

  const hapiSwaggerConf = {
    jsonPath: '/api/v1/oas.json',
    basePath: '/api/v1',
    documentationPath: '/api/v1/docs',
    info: {
      title: 'Pets API Documentation',
      version: Pack.version
    },
    grouping: 'tags'
  };

  const genConf = {
    collectionName: 'pets',
    basePath: '/api/v1',
    schema: Joi.object({
      name: Joi.string().required(),
      tags: Joi.array()
        .items(Joi.string())
        .default([])
    })
  };

  await server.register([
    Inert,
    Vision,
    { plugin: HapiSwagger, options: hapiSwaggerConf },
    { plugin: RestHapiGen, options: genConf }
  ]);

  await server.start();
  console.log('Server running on %s and attached on %s', server.info.uri, server.info.address);
};

process.on('unhandledRejection', err => {
  console.log(err);
  process.exit(1);
});

init();
