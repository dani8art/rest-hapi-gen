class HapiServerBuilder {
  realmModifiersRoutePrefix(realmModifiersRoutePrefix) {
    this._realmModifiersRoutePrefix = realmModifiersRoutePrefix;
    return this;
  }

  version(version) {
    this._version = version;
    return this;
  }

  log(log) {
    this._log = log;
    return this;
  }

  auth(auth) {
    this._auth = auth;
    return this;
  }

  route(route) {
    this._route = route;
    return this;
  }

  build() {
    return {
      version: this._version,
      realm: { modifiers: { route: { prefix: this._realmModifiersRoutePrefix } } },
      log: this._log,
      auth: this._auth,
      route: this._route,
    };
  }
}

const authScheme = jest.fn();
const logBind = jest.fn().mockReturnValue(jest.fn());
const route = jest.fn();

const complete = () => {
  return new HapiServerBuilder().version('21').log({ bind: logBind }).auth({ scheme: authScheme }).route(route);
};

module.exports = { complete };
