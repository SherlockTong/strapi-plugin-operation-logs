// src/plugins/my-plugin/server/config/permissions.js
module.exports = {
  actions: [
    {
      section: "plugins",
      displayName: "Access the Operation Logs",
      uid: "read",
      pluginName: "operation-logs",
    },
  ],
};
