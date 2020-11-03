# RESTHapi Gen

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE) [![npm version](https://img.shields.io/npm/v/rest-hapi-gen.svg?style=flat)](https://www.npmjs.com/package/rest-hapi-gen) [![CircleCI](https://circleci.com/gh/dani8art/rest-hapi-gen.svg?style=svg)](https://circleci.com/gh/dani8art/rest-hapi-gen) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)]() [![tested with jest](https://img.shields.io/badge/tested_with-jest-99424f.svg)](https://github.com/facebook/jest) [![jest](https://facebook.github.io/jest/img/jest-badge.svg)](https://github.com/facebook/jest)

> RESTHapi Gen is a [@hapijs/hapi](https://github.com/hapijs/hapi) plugin which generates a CRUD RESTful API from a given [@hapijs/joi](https://github.com/hapijs/joi) model.

### Compatibility

| RESTHapi Gen version | Hapi version | Joi Version |
| -------------------- | ------------ | ----------- |
| `1.x.x`              | `19.x.x`     | `17.x.x`    |
| `0.x.x`              | `18.x.x`     | `15.x.x`    |

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

| Option         | Type     | Description                                                                |
| -------------- | -------- | -------------------------------------------------------------------------- |
| basePath       | `string` | `Optional` Base path where the CRUD endpoints are attached. Default: `'/'` |
| collectionName | `string` | `Required` Name for the collection that is created.                        |
| schema         | `Joi`    | `Required` Joi schema for the collection that is created.                  |

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
