class DelegatingGrantStore {
  constructor(innerGrantStore, serializer) {
    this.innerGrantStore = innerGrantStore;
    this.serializer = serializer;
  }

  canRetrieveGrantFrom(request) {
    return this.innerGrantStore.canRetrieveGrantFrom(request);
  }

  getGrant(request) {
    const grant = this.innerGrantStore.getGrant(request);

    return grant ? this.serializer.deserialize(grant) : null;
  }

  saveGrant(request, grant) {
    if (!this.innerGrantStore.saveGrant) {
      return;
    }

    const grantData = this.serializer.serialize(grant);

    this.innerGrantStore.saveGrant(request, grantData);
  }

  clearGrant(request) {
    if (this.innerGrantStore.clearGrant) {
      this.innerGrantStore.clearGrant(request);
    }
  }
}

module.exports = DelegatingGrantStore;
