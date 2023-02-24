const { applyToDefaults } = require('@hapi/hoek');

const BearerGrantStore = require('../grant-store/bearer-grant-store');
const DelegatingGrantStore = require('../grant-store/delegating-grant-store');
const GrantSerializer = require('../grant-serializer');
const NoGrantStore = require('../grant-store/no-grant-store');
const SessionGrantStore = require('../grant-store/session-grant-store');

class GrantStoreFactory {
  constructor(options = {}) {
    this.options = applyToDefaults({ bearerOnly: false }, options);

    this.stores = [new SessionGrantStore(), new BearerGrantStore(), new NoGrantStore()];

    if (!this.options.clientId) {
      throw Error("Can't create GrantStoreFactory because $.options.clientId is required");
    }

    this.serializer = new GrantSerializer(this.options.clientId);
  }

  get(request) {
    const store = this.stores
      .filter((store) => !this.options.bearerOnly || store.name !== 'session')
      .find((store) => store.canRetrieveGrantFrom(request));

    return new DelegatingGrantStore(store, this.serializer);
  }

  getSessionGrantStore() {
    const store = this.stores.find((store) => store.name === 'session');

    return new DelegatingGrantStore(store, this.serializer);
  }
}

module.exports = GrantStoreFactory;
