"use strict";

module.exports = ({ strapi }) => ({
  async page(ctx) {
    const logs = await strapi
      .plugin("operation-logs")
      .service("operationLogService")
      .findPage(ctx.request);
    ctx.body = logs; // 设置响应体
  },

  async detail(ctx) {
    const log = await strapi
      .plugin("operation-logs")
      .service("operationLogService")
      .findOne(ctx.request);
    ctx.body = log; // 设置响应体
  },
});
