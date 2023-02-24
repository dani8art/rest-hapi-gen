class NoGrantStore {
  canRetrieveGrantFrom() {
    return true;
  }

  getGrant() {
    return null;
  }
}

module.exports = NoGrantStore;
