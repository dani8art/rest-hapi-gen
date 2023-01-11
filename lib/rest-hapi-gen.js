var Crypto = require('crypto');

const Hoek = require('@hapi/hoek');
const models = require('./models');
const RouteBuilders = require('./route-builders');
const { join } = require('path');

module.exports.plugin = {
  name: 'rest-hapi-gen',
  multiple: true,
  register: async function (server, options) {
    const { collectionName, basePath, overrides, tls } = options;

    const authn = Hoek.applyToDefaults(
      {
        enabled: false,
        kind: 'keycloak',
        session: {
          enabled: true,
          cookie: { name: 'keycloak-session' },
          password: Crypto.randomBytes(16).toString('hex'),
        },
        server: { realm: 'master' },
      },
      options.authn
    );

    if (authn.enabled) {
      switch (authn.kind) {
        case 'keycloak':
          if (authn.session.enabled === true) {
            const { session } = authn;

            await server.register({
              plugin: require('@hapi/yar'),
              options: {
                storeBlank: false,
                name: session.cookie.name,
                maxCookieSize: 0,
                cookieOptions: {
                  password: session.password,
                  isSecure: tls,
                },
              },
            });
          }

          const authnBasePath = join(basePath, 'authn');
          await server.register({
            plugin: require('keycloak-hapi'),
            options: {
              serverUrl: authn.server.url,
              realm: authn.server.realm,
              clientId: authn.client.id,
              clientSecret: authn.client.secret,
              bearerOnly: !authn.session.enabled,
              loginUrl: join(authnBasePath, 'login'),
              logoutUrl: join(authnBasePath, 'logout'),
              registerUrl: join(authnBasePath, 'register'),
              principalUrl: null,
            },
          });

          server.auth.strategy('keycloak', 'keycloak');
          server.auth.default('keycloak');

          break;
        default:
          break;
      }
    }

    const newResourceSchemaName = `new ${collectionName}`;
    const schema = options.schema.label(newResourceSchemaName);

    const model = models.buildModel(collectionName, schema);

    const builderOptions = {
      basePath: basePath || '/',
      collectionName,
      schema,
      model,
      server,
      overrides,
    };

    server.route(RouteBuilders.buildGetCollectionRoute(builderOptions));

    server.route(RouteBuilders.buildGetResourceRoute(builderOptions));

    server.route(RouteBuilders.buildCreateResourceRoute(builderOptions));

    server.route(RouteBuilders.buildUpdateResourceRoute(builderOptions));

    server.route(RouteBuilders.buildDeleteResourceRoute(builderOptions));
  },
};
