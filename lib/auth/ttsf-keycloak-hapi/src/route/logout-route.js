const KeycloakApdapterConfig = require('../keycloak-adapter-config');
const UrlUtil = require('../url-util');
const HapiRequestUtil = require('../hapi-request-util');
const LoggerUtil = require('../logger-util');
const Response = require('./response');

module.exports = class LogoutRoute {
  constructor(server, adapterConfig, keycloakConfig, grantStoreFactory, replyStrategy) {
    LoggerUtil.initialize(server);

    this.path = KeycloakApdapterConfig.getRoutePath(adapterConfig.basePath, adapterConfig.paths.logout);
    this.method = 'GET';

    this.config = {
      auth: false,
      cors: { origin: adapterConfig.cors },
      description: 'Redirects to the identity provider to revoke an access token and logout',
      notes: [
        "This endpoint can't be tested using this Swagger UI, this section is documentation only. This endpoint performs a redirection to the logout page of the configured OAuth 2.0 server.",
      ],
      tags: ['api', 'auth'],
      response: {
        status: {
          500: Response.internal(),
        },
      },
      plugins: {
        'hapi-swagger': {
          responses: {
            302: Response.redirect(),
          },
        },
      },
    };

    this.handler = (request, h) => {
      LoggerUtil.debug('Signing out using redirection');

      const logoutRedirect = UrlUtil.base(server, request, adapterConfig.baseUrl, adapterConfig.basePath);

      const grantStore = grantStoreFactory.getSessionGrantStore();
      const grant = grantStore.getGrant(request);

      const idToken = grant && grant.id_token ? grant.id_token.token : undefined;

      const logoutUrl = new URL(
        UrlUtil.logout(keycloakConfig.realmUrl, keycloakConfig.clientId, logoutRedirect, idToken)
      );

      const locale = HapiRequestUtil.locale(request);
      if (locale) {
        logoutUrl.search = `kc_locale=${locale}`;
      }

      grantStore.clearGrant(request);

      return h.redirect(logoutUrl.toString());
    };
  }
};
