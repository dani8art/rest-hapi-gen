const Boom = require('@hapi/boom');
const Joi = require('joi');
const { join } = require('path');

const KeycloakApdapterConfig = require('../keycloak-adapter-config');
const UrlUtil = require('../url-util');
const Response = require('./response');

module.exports = class TokenRoute {
  constructor(server, adapterConfig, keycloakConfig, replyStrategy) {
    this.path = KeycloakApdapterConfig.getRoutePath(adapterConfig.basePath, adapterConfig.paths.api.token);
    this.method = 'GET';

    this.options = {
      description: 'Shows the current access token and id token info',
      tags: ['api', 'auth'],
      notes: ['This endpoint returns the current access token and id token with all the user info.'],
      response: {
        status: {
          200: this.getJoiObject(),
          401: Response.unauthorized(),
          500: Response.internal(),
        },
      },
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

  getJoiObject() {
    const getStringArray = () => Joi.array().items(Joi.string()).label('_string_array');
    const getTokenAccess = () => Joi.object({ roles: getStringArray() }).label('_token_access');

    const getTokenContentCommon = () => {
      return {
        exp: Joi.number().required(),
        iat: Joi.number().required(),
        auth_time: Joi.number().required(),
        jti: Joi.string().required(),
        iss: Joi.string().required(),
        aud: Joi.string().required(),
        sub: Joi.string().required(),
        typ: Joi.string().required(),
        azp: Joi.string().required(),
        session_state: Joi.string().required(),
        acr: Joi.string().required(),
        sid: Joi.string().required(),
        email_verified: Joi.boolean(),
        name: Joi.string(),
        preferred_username: Joi.string(),
        given_name: Joi.string(),
        family_name: Joi.string().allow(''),
      };
    };

    return Joi.object({
      name: Joi.string().required(),
      scope: getStringArray().required(),
      access_token: Joi.object({
        value: Joi.string().required(),
        content: Joi.object({
          ...getTokenContentCommon(),
          'allowed-origins': getStringArray(),
          realm_access: getTokenAccess(),
          resource_access: Joi.object({ account: getTokenAccess() }).label('_resource_access'),
          scope: Joi.string().required(),
        })
          .label('_access_token_content')
          .required(),
      })
        .label('_access_token')
        .required(),
      id_token: Joi.object({
        value: Joi.string().required(),
        content: Joi.object({
          ...getTokenContentCommon(),
          at_hash: Joi.string().required(),
        })
          .label('_id_token_content')
          .required(),
      })
        .label('_id_token')
        .required(),
      url: Joi.any().required(),
    })
      .label('_token')
      .description('Current access token and id token data');
  }
};
