module.exports = {
  "log-data-page": {
    type: "admin",
    routes: [
      {
        method: "GET",
        path: "/operation-logs",
        handler: "operationLogController.page",
        config: {
          policies: [],
          auth: false,
        },
      },
    ],
  },
  "log-data-detail": {
    type: "admin",
    routes: [
      {
        method: "GET",
        path: "/operation-logs/:id",
        handler: "operationLogController.detail",
        config: {
          policies: [],
          auth: false,
        },
      },
    ],
  },
};
