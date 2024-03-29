const Mongoose = require('mongoose');
const Hapi = require('@hapi/hapi');
const Inert = require('@hapi/inert');
const Vision = require('@hapi/vision');
const Joi = require('joi');
const HapiSwagger = require('hapi-swagger');
const Pack = require('../package');

const RestHapiGen = require('../lib/index');
// const { ActionType } = RestHapiGen;

const init = async () => {
  await Mongoose.connect('mongodb://localhost:27017/testdb', { useNewUrlParser: true, useUnifiedTopology: true });

  const server = Hapi.server({ port: 4000, debug: { request: ['*'], log: ['*'] } });

  const authEnabled = false;
  const hapiSwaggerConfig = {
    jsonPath: '/api/v1/oas.json',
    documentationPath: '/api/v1/docs',
    swaggerUIPath: '/api/v1/',
    routesBasePath: '/api/v1/',
    info: { title: 'Pets API Documentation', version: Pack.version },
    grouping: 'tags',
    securityDefinitions: authEnabled
      ? {
          oauth2: {
            type: 'oauth2',
            description:
              'This authentication mechanism redirects to the authorization server and optains an access token in order to authenticate users',
            flow: 'accessCode',
            authorizationUrl: `${process.env['AUTH_SERVER_URL']}/realms/${process.env['AUTH_SERVER_REALM']}/protocol/openid-connect/auth`,
            tokenUrl: `${process.env['AUTH_SERVER_URL']}/realms/${process.env['AUTH_SERVER_REALM']}/protocol/openid-connect/token`,
            scopes: {
              openid: 'OpenID Connect built-in scope',
              email: 'OpenID Connect built-in scope: email',
              profile: 'OpenID Connect built-in scope: profile',
            },
          },
        }
      : undefined,
    security: authEnabled ? [{ oauth2: [] }] : undefined,
  };

  const commonConfig = { basePath: '/api/v1', tls: false, rootPathRedirect: true };

  const commonAuthConfig = {
    enabled: authEnabled,
    server: { url: process.env['AUTH_SERVER_URL'], realm: process.env['AUTH_SERVER_REALM'] },
    client: { id: process.env['AUTH_CLIENT_ID'], secret: process.env['AUTH_CLIENT_SECRET'] },
  };

  const petsConfig = {
    ...commonConfig,
    collection: { name: 'pets', pages: { limit: 2 } },
    schema: Joi.object({
      name: Joi.string()
        .meta({ _mongoose: { unique: true } })
        .required(),
      tags: Joi.array().items(Joi.string()).default([]),
    }),
    //// You can override actions and properties that are built automatically
    // overrides: {
    //   actions: {
    //     // Override GET collection action
    //     [ActionType.GET_COLLECTION]: async (request, h, model) => {
    //       return await model.find();
    //     },
    //   },
    // },
    auth: { ...commonAuthConfig },
  };

  const tagsConfig = {
    ...commonConfig,
    collection: { name: 'tags' },
    schema: Joi.object({
      name: Joi.string()
        .meta({ _mongoose: { unique: true } })
        .required(),
    }),
    auth: { ...commonAuthConfig, scope: { read: ['tags:ro'], write: ['tags:rw'] } },
  };

  await server.register([
    Inert,
    Vision,
    { plugin: HapiSwagger, options: hapiSwaggerConfig },
    { plugin: RestHapiGen, options: petsConfig },
    { plugin: RestHapiGen, options: tagsConfig },
  ]);

  await server.start();
  console.log('Server running on %s and attached on %s', server.info.uri, server.info.address);
};

process.on('unhandledRejection', (err) => {
  console.log(err);
  process.exit(1);
});

init();
