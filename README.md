# RESTHapi Gen

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE) [![npm version](https://img.shields.io/npm/v/rest-hapi-gen.svg?style=flat)](https://www.npmjs.com/package/rest-hapi-gen) [![CircleCI](https://circleci.com/gh/dani8art/rest-hapi-gen.svg?style=svg)](https://circleci.com/gh/dani8art/rest-hapi-gen) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)]() [![tested with jest](https://img.shields.io/badge/tested_with-jest-99424f.svg)](https://github.com/facebook/jest) [![jest](https://facebook.github.io/jest/img/jest-badge.svg)](https://github.com/facebook/jest)

> RESTHapi Gen is a [@hapijs/hapi](https://github.com/hapijs/hapi) plugin which generates a CRUD RESTful API from a given [joi](https://github.com/hapijs/joi) model.

### Compatibility

| RESTHapi Gen version | Hapi JS version       | Joi Version        |
| -------------------- | --------------------- | ------------------ |
| `2.x.x` and `3.x.x`  | `20.x.x` and `21.x.x` | `joi^17.x.x`       |
| `1.x.x`              | `19.x.x`              | `@hapi/joi^17.x.x` |
| `0.x.x`              | `18.x.x`              | `@hapi/joi^15.x.x` |

## TL;DR;

```
$ npm i @hapi/hapi joi mongoose rest-hapi-gen
```

```javascript
const Hapi = require('@hapi/hapi');
const Joi = require('joi');
const Mongoose = require('mongoose');

const RestHapiGen = require('rest-hapi-gen');

(async () => {
  await Mongoose.connect('mongodb://localhost:27017/testdb', { useNewUrlParser: true, useUnifiedTopology: true });

  const server = Hapi.server({ port: 4000 });

  const petsCollectionConf = {
    collection: { name: 'pets' },
    schema: Joi.object({
      name: Joi.string().required(),
      tags: Joi.array().items(Joi.string()).default([]),
    }),
  };

  await server.register([{ plugin: RestHapiGen, options: petsCollectionConf }]);
  await server.start();

  console.log('Server running on %s', server.info.uri);
})();
```

## Plugin configuration

| Option                            | Type       | Description                                                                                                 |
| --------------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------- |
| auth.enabled                      | `boolean`  | `Optional` Whether to activate auth or not. Default: `false`                                                |
| auth.client.id                    | `string`   | `Required` OAuth 2.0 client id. It is required if `$.auth.enabled === true`                                 |
| auth.client.secret                | `string`   | `Required` OAuth 2.0 client secret. It is required if `$.auth.enabled === true`                             |
| auth.client.kind                  | `string`   | `Optional` OAuth 2.0 server kind. Default: `keycloak`                                                       |
| auth.scope.read                   | `string[]` | `Optional` OAuth 2.0 required scope list to access read actions. Default `false`                            |
| auth.scope.write                  | `string[]` | `Optional` OAuth 2.0 required scope list to access write actions. Default `false`                           |
| auth.server.url                   | `string`   | `Required` OAuth 2.0 server. It is required if `$.auth.enabled === true`                                    |
| auth.server.realm                 | `string`   | `Optional` OAuth 2.0 server realm. Default: `master`                                                        |
| auth.session.cookie.name          | `string`   | `Optional` Name for the session cookie. Default: `rest-hapi-gen-session`                                    |
| auth.session.enabled              | `boolean`  | `Optional` Whether to enable session or just bearer only auth mechanism. Default: `true`                    |
| auth.session.password             | `string`   | `Optional` The session encryption password. Default: Random generated                                       |
| basePath                          | `string`   | `Optional` Base path where the CRUD endpoints are attached. Default: `'/'`                                  |
| collection.name                   | `string`   | `Required` Name for the collection that is created.                                                         |
| health.enabled                    | `boolean`  | `Optional` Whether to enable a health endpoint. Default: `true`                                             |
| health.path                       | `string`   | `Optional` Target path where the health endpoint will be set, it must start with `/`. Default: `/_healthz`. |
| overrides.actions.GET_COLLECTION  | `Function` | `Optional` Async function that will override the default handler for GET_COLLECTION action.                 |
| overrides.actions.GET_RESOURCE    | `Function` | `Optional` Async function that will override the default handler for GET_RESOURCE action.                   |
| overrides.actions.CREATE_RESOURCE | `Function` | `Optional` Async function that will override the default handler for CREATE_RESOURCE action.                |
| overrides.actions.UPDATE_RESOURCE | `Function` | `Optional` Async function that will override the default handler for UPDATE_RESOURCE action.                |
| overrides.actions.DELETE_RESOURCE | `Function` | `Optional` Async function that will override the default handler for DELETE_RESOURCE action.                |
| rootPathRedirect                  | `boolean`  | `Optional` Whether redirect from root path (`/`) to `basePath` path. Default: `false`                       |
| schema                            | `Joi`      | `Required` Joi schema for the collection that is created.                                                   |
| tls                               | `boolean`  | `Optional` Whether the server is using TLS externally/internally or not. Default: `false`                   |

### Override an action

If an action needs to be overrided, you must provide an `async function` that will be executed instead of the default one. This function will receive three args: `request` that will be a @hapijs/hapi [request object](https://hapi.dev/api/?v=20.0.2#request), `h` that will be a @hapijs/hapi [request toolkit](https://hapi.dev/api/?v=20.0.2#response-toolkit) and a `model` that will be a [mongoose model](https://mongoosejs.com/docs/models.html) which is based on the given schema.

> NOTE: Your custom function must return an object that must to be valid against the **Joi** schema otherwise the server will return an internal server error.

```js
...
const { ActionType } = RestHapiGen;
...
  const petsCollectionConf = {
    collection: { name: 'pets' },
    schema: Joi.object({
      name: Joi.string().required(),
      tags: Joi.array().items(Joi.string()).default([])
    }),
    // Override actions
    overrides: {
      actions: {
        // Override GET collection action
        [ActionType.GET_COLLECTION]: async (request, h, model) => {
          return await model.find();
        },
      },
    },
  };
...
```

In addition, you could configure Hapi server adding `debug.request` so you can see schema validation errors, to do so you must apply the following configuration to your Hapi server

```js
...
const server = Hapi.server({
  port: 4000,
  debug: {
    request: ['*'],
  },
});
...
```

### Configure authentication

Currently, RESTHapi Gen only support `keycloak` as authentication provider, a generated resource can be protected using OAuth 2.0 and keycloak server, see the following example.

```javascript
const petsCollectionConf = {
  collection: { name: 'pets' },
  schema: Joi.object({
    name: Joi.string().required(),
    tags: Joi.array().items(Joi.string()).default([]),
  }),
  auth: {
    enabled: true,
    server: { url: 'https://auth.example.io', realm: 'pets' },
    client: { id: 'example-client', secret: 'example-client-secret' },
    scope: { read: ['pets:ro'], write: ['pets:rw'] },
  },
};
```

## Deploy MongoDB

**Docker**

```shell
$ docker run -d --rm --name mymongo -p 27017:27017 mongo
```

**Docker Compose**

```yaml
version: '3.7'

services:
  mongo:
    image: mongo
    ports:
      - 27017:27017
```

```shell
$ curl -sSL https://raw.githubusercontent.com/dani8art/rest-hapi-gen/master/docker-compose.yaml > docker-compose.yaml
$ docker-compose up -d
```

## License

RESTHapi Gen is [MIT licensed](./LICENSE).
