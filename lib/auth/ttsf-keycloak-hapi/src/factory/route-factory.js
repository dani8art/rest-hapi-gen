const LoginRoute = require('../route/login-route');
const LogoutRoute = require('../route/logout-route');
const RegistrationRoute = require('../route/registration-route');
const TokenRoute = require('../route/token-route');

const hapi17ReplyStrategy = (reply) => {
  return {
    authenticated: (options) => reply.authenticated(options),
    representation: (obj) => obj,
  };
};

const hapi16ReplyStrategy = (reply) => {
  return {
    authenticated: (options) => reply.continue(options),
    representation: (obj) => reply(obj),
  };
};

module.exports = class RouteFactory {
  constructor(adapter) {
    this.adapter = adapter;
  }

  getTokenRoute() {
    return new TokenRoute(
      this.adapter.server,
      this.adapter.config,
      this.adapter.keycloakConfig,
      this.getReplyStrategy()
    );
  }

  getLoginRoute() {
    return new LoginRoute(
      this.adapter.server,
      this.adapter.config,
      this.adapter.keycloakConfig,
      this.adapter.grantStoreFactory,
      this.adapter.grantManager,
      this.getReplyStrategy()
    );
  }

  getRegistrationRoute() {
    return new RegistrationRoute(
      this.adapter.server,
      this.adapter.config,
      this.adapter.keycloakConfig,
      this.adapter.grantStoreFactory,
      this.getReplyStrategy()
    );
  }

  getLogoutRoute() {
    return new LogoutRoute(
      this.adapter.server,
      this.adapter.config,
      this.adapter.keycloakConfig,
      this.adapter.grantStoreFactory,
      this.getReplyStrategy()
    );
  }

  getReplyStrategy() {
    return this.adapter.server.version < '17' ? hapi16ReplyStrategy : hapi17ReplyStrategy;
  }
};
