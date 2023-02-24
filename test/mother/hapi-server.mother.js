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

  register(register) {
    this._register = register;
    return this;
  }

  strategy(strategy) {
    this._strategy = strategy;
    return this;
  }

  default(def) {
    this._default = def;
    return this;
  }

  build() {
    return {
      version: this._version,
      realm: { modifiers: { route: { prefix: this._realmModifiersRoutePrefix } } },
      log: this._log,
      auth: this._auth,
      route: this._route,
      register: this._register,
      auth: { strategy: this._strategy, default: this._default },
    };
  }
}

const authScheme = jest.fn();
const logBind = jest.fn().mockReturnValue(jest.fn());
const route = jest.fn();
const register = jest.fn();
const strategy = jest.fn();
const configDefault = jest.fn();

const complete = () => {
  return new HapiServerBuilder()
    .version('21')
    .log({ bind: logBind })
    .auth({ scheme: authScheme })
    .route(route)
    .register(register)
    .strategy(strategy)
    .default(configDefault);
};

module.exports = { complete };
