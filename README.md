# RESTHapi Gen

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE) [![npm version](https://img.shields.io/npm/v/rest-hapi-gen.svg?style=flat)](https://www.npmjs.com/package/rest-hapi-gen) [![CircleCI](https://circleci.com/gh/dani8art/rest-hapi-gen.svg?style=svg)](https://circleci.com/gh/dani8art/rest-hapi-gen) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)]() [![tested with jest](https://img.shields.io/badge/tested_with-jest-99424f.svg)](https://github.com/facebook/jest) [![jest](https://facebook.github.io/jest/img/jest-badge.svg)](https://github.com/facebook/jest)

> RESTHapi Gen is a [@hapijs/hapi](https://github.com/hapijs/hapi) plugin which generates a CRUD RESTful API from a given [joi](https://github.com/sideway/joi) model.

### Compatibility

| RESTHapi Gen version | Hapi version | Joi Version        |
| -------------------- | ------------ | ------------------ |
| `2.x.x`              | `20.x.x`     | `joi^17.x.x`       |
| `1.x.x`              | `19.x.x`     | `@hapi/joi^17.x.x` |
| `0.x.x`              | `18.x.x`     | `@hapi/joi^15.x.x` |

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
    collectionName: 'pets',
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

| Option                            | Type       | Description                                                                                  |
| --------------------------------- | ---------- | -------------------------------------------------------------------------------------------- |
| basePath                          | `string`   | `Optional` Base path where the CRUD endpoints are attached. Default: `'/'`                   |
| collectionName                    | `string`   | `Required` Name for the collection that is created.                                          |
| schema                            | `Joi`      | `Required` Joi schema for the collection that is created.                                    |
| overrides.actions.GET_COLLECTION  | `Function` | `Optional` Async function that will override the default handler for GET_COLLECTION action.  |
| overrides.actions.GET_RESOURCE    | `Function` | `Optional` Async function that will override the default handler for GET_RESOURCE action.    |
| overrides.actions.CREATE_RESOURCE | `Function` | `Optional` Async function that will override the default handler for CREATE_RESOURCE action. |
| overrides.actions.UPDATE_RESOURCE | `Function` | `Optional` Async function that will override the default handler for UPDATE_RESOURCE action. |
| overrides.actions.DELETE_RESOURCE | `Function` | `Optional` Async function that will override the default handler for DELETE_RESOURCE action. |

### Override an action

If an action needs to be overrided, you must provide an `async function` that will be executed instead of the default one. This function will receive three args: `request` that will be a @hapijs/hapi [request object](https://hapi.dev/api/?v=20.0.2#request), `h` that will be a @hapijs/hapi [request toolkit](https://hapi.dev/api/?v=20.0.2#response-toolkit) and a `model` that will be a [mongoose model](https://mongoosejs.com/docs/models.html) which is based on the given schema.

> NOTE: Your custom function must return an object that must to be valid against the **Joi** schema otherwise the server will return an internal server error.

```js
...
const { ActionType } = RestHapiGen;
...
  const petsCollectionConf = {
    collectionName: 'pets',
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
