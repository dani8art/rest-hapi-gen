module.exports = {
  isRegistered(server, plugin) {
    const pkg = plugin.pkg || plugin.plugin.pkg;
    const name = pkg ? pkg.name : undefined;

    return Object.keys(server.registrations).find((key) => key === name);
  },
};
