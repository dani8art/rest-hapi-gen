const Boom = require('@hapi/boom');
const GrantManager = require('keycloak-connect/middleware/auth-utils/grant-manager');
const KeycloakConfig = require('keycloak-connect/middleware/auth-utils/config');

const ActionTokenVerifier = require('./token-verifier');
const CredentialsMapper = require('./mapper/credentials-mapper');
const GrantStoreFactory = require('./factory/grant-store-factory');
const HapiRequestUtil = require('./hapi-request-util');
const KeycloakApdapterConfig = require('./keycloak-adapter-config');
const KeycloakConfigMapper = require('./mapper/keycloak-config-mapper');
const RouteFactory = require('./factory/route-factory');
const UrlUtil = require('./url-util');
const LoggerUtil = require('./logger-util');

module.exports = class KeycloakAdapter {
  constructor(server, config) {
    this.server = server;
    LoggerUtil.initialize(this.server);

    this.config = KeycloakApdapterConfig.get(config);

    this.keycloakConfig = new KeycloakConfig(KeycloakConfigMapper.toKeycloakConfig(this.config));
    this.grantManager = new GrantManager(this.keycloakConfig);
    this.actionTokenVerifier = new ActionTokenVerifier(this.grantManager);

    const { bearerOnly, keycloak } = this.config;
    this.grantStoreFactory = new GrantStoreFactory({ bearerOnly, clientId: keycloak.client.id });

    this.routeFactory = new RouteFactory(this);
  }

  async authenticate(request, h) {
    const grantStore = this.grantStoreFactory.get(request);

    const existingGrant = grantStore.getGrant(request);
    if (!existingGrant) {
      LoggerUtil.debug('No authorization grant received.');

      return null;
    }

    try {
      let grant = existingGrant;
      if (this.grantManager.isGrantRefreshable(grant)) {
        grant = await this.grantManager.ensureFreshness(grant);

        if (grant !== existingGrant) {
          LoggerUtil.debug(`Access token has been refreshed: ${grant}`);

          grant = await this.grantManager.validateGrant(grant);
          grantStore.saveGrant(request, grant);
        } else {
          grant = await this.grantManager.validateGrant(grant);
        }
      } else {
        grant = await this.grantManager.validateGrant(grant);
      }

      return CredentialsMapper.fromGrant(grant, this.config.token.nameKey, this.config.keycloak.client.id);
    } catch (err) {
      LoggerUtil.debug(`Authorization has failed - Received grant is invalid: ${err}`);

      grantStore.clearGrant(request);

      return null;
    }
  }

  getAuthScheme() {
    const keycloak = this;
    const replyStrategy = this.routeFactory.getReplyStrategy();

    return (server, options) => {
      return {
        authenticate: async (request, h) => {
          const credentials = await keycloak.authenticate(request, h);

          const user = credentials ? credentials.name : '[Anonymous]';
          LoggerUtil.debug(`Authentication request. URL: ${request.raw.req.url}, user: ${user}`);

          if (credentials) {
            return replyStrategy(h).authenticated({ credentials });
          } else {
            if (keycloak.config.onUnauthenticated(request)) {
              const { realmUrl, clientId } = keycloak.keycloakConfig;

              const baseUrl = UrlUtil.base(keycloak.server, request, keycloak.config.baseUrl, keycloak.config.basePath);
              const loginRedirectUrl = UrlUtil.loginRedirect(baseUrl, keycloak.config.paths.login);

              const loginUrl = new URL(UrlUtil.login(realmUrl, clientId, loginRedirectUrl));

              const locale = HapiRequestUtil.locale(request);
              if (locale) {
                loginUrl.searchParams.append('kc_locale', locale);
              }

              LoggerUtil.debug(`User is not authenticated - redirecting to ${loginUrl}`);

              return h.response().takeover().redirect(loginUrl.toString());
            } else {
              const data = { realm: keycloak.config.keycloak.realm };

              const boomError = Boom.unauthorized('The resource owner is not authenticated', 'bearer', data);
              return replyStrategy(h).representation(boomError);
            }
          }
        },
      };
    };
  }

  register() {
    this.server.auth.scheme('keycloak', this.getAuthScheme.bind(this)());

    const { paths } = this.config;
    if (!this.config.bearerOnly) {
      if (paths.login) {
        this.server.route(this.routeFactory.getLoginRoute());
      }

      if (paths.logout) {
        this.server.route(this.routeFactory.getLogoutRoute());
      }

      if (paths.register) {
        this.server.route(this.routeFactory.getRegistrationRoute());
      }
    }

    if (paths.api.token) {
      this.server.route(this.routeFactory.getTokenRoute());
    }
  }
};
