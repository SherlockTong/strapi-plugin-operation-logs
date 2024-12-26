"use strict";

const plugin = "plugin::operation-logs.operation-log";
module.exports = {
  async createLog({ event, user, request, response }) {
    return strapi.entityService.create(plugin, {
      data: {
        module: event.module,
        method: request.method,
        model: event.model || "-",
        action: event.type,
        actionDesc: event.desc,
        relationIds: event.relationIds
            ? JSON.stringify(event.relationIds)
            : "-",
        operator: `${user.firstname || "Anonymous"} ${
            user.lastname || ""
        }`.trim(),
        date: new Date(),
        request: getRequestParams(request),
        response: response.body,
        url: request.url,
      },
    });
  },
  async findPage(request) {
    const { page = 1, pageSize = 10, filters = {} } = request.query; // 获取分页参数，默认第一页，默认每页10条
    console.log(`filters : ${JSON.stringify(filters)}`);
    return await strapi.entityService.findPage(plugin, {
      page: page,
      pageSize: pageSize,
      sort: {date: "desc"},
      populate: "*",
      filters, //动态传入过滤条件
    });
  },

  async findOne(request) {
    const { id } = request.params; // 获取分页参数，默认第一页，默认每页10条
    return await strapi.entityService.findOne(plugin, id);
  },
};

/**
 * 获取请求参数
 */
function getRequestParams(request) {
  if (request.body && Object.keys(request.body).length > 0) {
    return request.body;
  }
  if (request.query && Object.keys(request.query).length > 0) {
    return request.query;
  }
  const regex = /\/(\d+)(?:[/?]|$)/;
  const match = request.url.match(regex);
  if (match) {
    return {
      id: match[1],
    };
  }
  return null;
}
