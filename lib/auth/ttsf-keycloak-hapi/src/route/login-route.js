const Boom = require('@hapi/boom');

const KeycloakApdapterConfig = require('../keycloak-adapter-config');
const HapiRequestUtil = require('../hapi-request-util');
const UrlUtil = require('../url-util');
const LoggerUtil = require('../logger-util');

module.exports = class LoginRoute {
  constructor(server, adapterConfig, keycloakConfig, grantStoreFactory, grantManager, replyStrategy) {
    LoggerUtil.initialize(server);

    const getGrantByCode = async (code, authRedirectUrl, session) => {
      const request = { session: { auth_redirect_uri: authRedirectUrl } };

      return await grantManager.obtainFromCode(request, code, session.id, session.host);
    };

    this.path = KeycloakApdapterConfig.getRoutePath(adapterConfig.basePath, adapterConfig.paths.login);
    this.method = 'GET';

    this.config = { auth: false, cors: { origin: adapterConfig.cors } };

    this.handler = async (request, h) => {
      const baseUrl = UrlUtil.base(server, request, adapterConfig.baseUrl, adapterConfig.basePath);

      const grantStore = grantStoreFactory.getSessionGrantStore();

      if (grantStore.canRetrieveGrantFrom(request)) {
        return h.redirect(baseUrl);
      }

      const loginRedirectUrl = UrlUtil.loginRedirect(baseUrl, adapterConfig.paths.login);
      if (!request.query.auth_callback) {
        const { realmUrl, clientId } = keycloakConfig;

        const loginUrl = UrlUtil.login(realmUrl, clientId, loginRedirectUrl);
        LoggerUtil.debug(`User is not authenticated - redirecting to ${loginUrl}`);

        return h.redirect(loginUrl);
      } else {
        LoggerUtil.debug(`Processing Keycloak callback after redirection to ${request.raw.req.url}`);

        if (request.query.error) {
          const { error, error_description: message } = request.query;
          const errorMessage = `Unable to authenticate - ${error}. ${message || ''}`;

          LoggerUtil.error(errorMessage);

          return replyStrategy(h).representation(Boom.forbidden(errorMessage));
        }

        try {
          LoggerUtil.debug(`Processing authorization code`);

          const session = { id: request.yar.id, host: HapiRequestUtil.host(request) };
          const grant = await getGrantByCode(request.query.code, loginRedirectUrl, session);
          grantStore.saveGrant(request, grant);

          LoggerUtil.debug(`Access token has been successfully obtained from the authorization code:\n${grant}`);

          return h.redirect(baseUrl);
        } catch (err) {
          const errorMessage = `Unable to authenticate - could not obtain grant code. ${err}`;

          LoggerUtil.error(errorMessage);

          return replyStrategy(h).representation(Boom.forbidden(errorMessage));
        }
      }
    };
  }
};
