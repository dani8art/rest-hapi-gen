const Boom = require('@hapi/boom');
const Joi = require('joi');

const KeycloakApdapterConfig = require('../keycloak-adapter-config');
const HapiRequestUtil = require('../hapi-request-util');
const UrlUtil = require('../url-util');
const LoggerUtil = require('../logger-util');
const Response = require('./response');

module.exports = class LoginRoute {
  constructor(server, adapterConfig, keycloakConfig, grantStoreFactory, grantManager, replyStrategy) {
    LoggerUtil.initialize(server);

    const getGrantByCode = async (code, authRedirectUrl, session) => {
      const request = { session: { auth_redirect_uri: authRedirectUrl } };

      return await grantManager.obtainFromCode(request, code, session.id, session.host);
    };

    this.path = KeycloakApdapterConfig.getRoutePath(adapterConfig.basePath, adapterConfig.paths.login);
    this.method = 'GET';

    this.config = {
      auth: false,
      cors: { origin: adapterConfig.cors },
      description: 'Redirects to the identity provider to generate an access token',
      notes: [
        "This endpoint can't be tested using this Swagger UI, this section is documentation only. This endpoint performs a redirection which depends on the request query values.",
        '<ul><li>If auth_callback is equal to 1 and code contains a valid OAuth 2.0 server authorization code then it request an valid access token, store it in session and redirect to the API base path.</li>',
        '<li>Else it redirects to the authorization endpoint of the configured OAuth 2.0 server</li></ul>',
      ],
      tags: ['api', 'auth'],
      validate: {
        query: Joi.object({
          auth_callback: Joi.number().min(0).max(1),
          error: Joi.string(),
          error_description: Joi.string(),
          code: Joi.string(),
          state: Joi.string(),
          session_state: Joi.string(),
        }),
      },
      response: {
        status: {
          403: Response.forbidden(),
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
