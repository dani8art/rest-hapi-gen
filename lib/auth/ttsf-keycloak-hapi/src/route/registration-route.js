const KeycloakApdapterConfig = require('../keycloak-adapter-config');
const UrlUtil = require('../url-util');
const HapiRequestUtil = require('../hapi-request-util');
const LoggerUtil = require('../logger-util');
const Response = require('./response');

module.exports = class RegistrationRoute {
  constructor(server, adapterConfig, keycloakConfig, grantStoreFactory, replyStrategy) {
    const log = server.log.bind(server);

    this.path = KeycloakApdapterConfig.getRoutePath(adapterConfig.basePath, adapterConfig.paths.register);
    this.method = 'GET';

    this.config = {
      auth: false,
      cors: { origin: adapterConfig.cors },
      description: 'Redirects to the identity provider to register a new user',
      notes: [
        "This endpoint can't be tested using this Swagger UI, this section is documentation only. This endpoint performs a redirection to the registration page of the configured OAuth 2.0 server.",
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

      grantStoreFactory.getSessionGrantStore().clearGrant(request);

      const baseUrl = UrlUtil.base(server, request, adapterConfig.baseUrl, adapterConfig.basePath);
      const loginRedirectUrl = UrlUtil.loginRedirect(baseUrl, adapterConfig.paths.login);

      const locale = HapiRequestUtil.locale(request);
      const { realmUrl, clientId } = keycloakConfig;

      const registrationUrl = UrlUtil.registration(realmUrl, clientId, loginRedirectUrl, locale);

      LoggerUtil.debug(`User is not authenticated - redirecting to ${registrationUrl}`);

      return h.redirect(registrationUrl);
    };
  }
};
