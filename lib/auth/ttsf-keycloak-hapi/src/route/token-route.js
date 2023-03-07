const Boom = require('@hapi/boom');
const { join } = require('path');

const KeycloakApdapterConfig = require('../keycloak-adapter-config');
const UrlUtil = require('../url-util');

module.exports = class TokenRoute {
  constructor(server, adapterConfig, keycloakConfig, replyStrategy) {
    this.path = KeycloakApdapterConfig.getRoutePath(adapterConfig.basePath, adapterConfig.paths.api.token);
    this.method = 'GET';

    this.options = {
      description: 'Shows the current access token and id token info',
      tags: ['api', 'auth'],
    };

    this.handler = (request, h) => {
      let tokenResource = this.getTokenResource(request.auth.credentials);

      if (tokenResource && !adapterConfig.bearerOnly) {
        const { baseUrl, basePath } = adapterConfig;

        const logoutUrl = new URL(UrlUtil.base(server, request, baseUrl, basePath));
        logoutUrl.pathname = join(logoutUrl.pathname, adapterConfig.paths.logout);

        const loginUrl = new URL(UrlUtil.base(server, request, baseUrl, basePath));
        loginUrl.pathname = join(loginUrl.pathname, adapterConfig.paths.login);

        const urls = {
          url: {
            account: UrlUtil.account(keycloakConfig.realmUrl),
            login: loginUrl.toString(),
            logout: logoutUrl.toString(),
          },
        };

        tokenResource = Object.assign({}, tokenResource, urls);
      }

      if (adapterConfig.token.mapper) {
        tokenResource = adapterConfig.token.mapper(tokenResource);
      }

      return replyStrategy(h).representation(tokenResource || Boom.unauthorized('The user is not authenticated'));
    };
  }

  getTokenResource(credentials) {
    if (!credentials) {
      return credentials;
    }

    const { name, scope, accessToken, idToken } = credentials;

    const formattedToken = {
      name,
      scope,
      access_token: { value: accessToken.token, content: accessToken.content },
    };

    if (idToken) {
      formattedToken.id_token = { value: idToken.token, content: idToken.content };
    }

    return formattedToken;
  }
};
