"use strict";
/**
 * 操作日志统一处理中间件
 */
module.exports = (config, { strapi }) => {
  const moduleConfig = {
    // 模块日志配置，log: 是否记录日志, model: 是否需要模型
    "content-types": { log: true, model: true },
    components: { log: true, model: true },
    "collection-types": { log: true, model: true },
    "single-types": { log: true, model: true },
    role: { log: true, model: true },
    "admin-folder-file": { log: true, model: true },
    "admin-folder": { log: true, model: true },
    "admin-upload": { log: true, model: true },
    user: { log: true, model: true },
    authentication: { log: true, model: true },
  };

  return async (ctx, next) => {
    await next();

    // 使用 setImmediate 异步保存日志
    setImmediate(() => {
      handleModuleLogs(ctx, moduleConfig).catch((error) => {
        strapi.log.error(`Failed to handle module logs: ${error.message}`);
        strapi.log.error(error.stack);
      });
    });
  };
};

/**
 * 处理模块日志
 */
async function handleModuleLogs(ctx, moduleConfig) {
  const { method, url, state, request, response } = ctx;

  // 仅记录 POST/PUT/DELETE 请求
  if (!["POST", "PUT", "DELETE"].includes(method)) return;

  // 判断是否成功操作,否则不记录日志
  console.log(response.status);
  if (response.status < 200 || response.status >= 300) return;

  try {
    const handler = state.route.handler;
    const user = state.user || {};
    const moduleName = extractModuleName(handler);
    const moduleOptions = moduleConfig[moduleName] || { log: false };
    // 未启用日志记录
    if (!moduleOptions.log) return;
    const event = getModuleEvent(handler, request, response);
    if (!event.type) return;
    //保存日志
    await saveLog(event, user, request, response);
  } catch (error) {
    strapi.log.error(`Failed to save operation log: ${error.message}`);
    strapi.log.error(error.stack);
  }
}

/**
 * 提取模块名称
 */
function extractModuleName(handler) {
  return handler.split(".")[0] || "unknown";
}

/**
 * 提取模型名称
 */
function extractModelName(request, response) {
  const regex = /(?:api::)?([a-zA-Z0-9-]+)\.([a-zA-Z0-9-]+)(?=[\/?]|$)/;

  const match = request.url.match(regex);
  // 从 URL 提取
  if (match) return match[1];
  //从响应里提取
  const uid = response.body?.data?.uid;
  if (uid) {
    const uidMatch = uid.match(regex);
    return uidMatch ? uidMatch[1] : uid;
  }
  //从请求体里面提取
  const singularName = request?.body?.contentType?.singularName;
  return singularName || null;
}

/**
 * 保存日志
 */
async function saveLog(event, user, request, response) {
  // 调用服务记录日志
  await strapi
    .plugin("operation-logs")
    .service("operationLogService")
    .createLog({ event, user, request, response });
}

/**
 * 获取事件类型及描述
 */
function getModuleEvent(handler, request, response) {
  if (!handler.includes(".")) {
    return {};
  }
  const handlerArr = handler.split(".");
  const moduleType = handlerArr[0];
  const eventType = handlerArr[1];
  const event = { type: eventType };
  // 获取关联ID
  event.relationIds = getRelationIds(request, response);
  //获取模型
  event.model = extractModelName(request, response);
  //转换事件类型
  transformEventType(event);

  if (moduleType === "content-types") {
    event.module = "Content Type";
    //事件类型
    if (eventType === "updateContentTypeConfiguration") {
      event.type = "updateView";
      event.desc = "更新视图";
    } else {
      event.desc = event.desc + "内容类型";
    }
  } else if (moduleType === "components") {
    event.module = "Component";
    event.desc = event.desc + "组件类型";
  } else if (moduleType === "collection-types") {
    event.module = "Content Manager";
    event.desc = event.desc + "条目";
  } else if (moduleType === "single-types") {
    event.module = "Content Manager";
    //事件类型
    if (eventType === "createOrUpdate") {
      event.type = request.body.id ? "update" : "create";
      event.desc = request.body.id ? "更新条目" : "新增条目";
    } else {
      event.desc = event.desc + "条目";
    }
  } else if (moduleType === "role") {
    event.module = "Roles and Permissions";
    if (eventType === "updatePermissions") {
      event.model = "permission";
      event.desc = event.desc + "角色权限信息";
    } else {
      event.model = "role";
      event.desc = event.desc + "角色";
    }
  } else if (moduleType === "admin-folder-file") {
    event.module = "Media Library";
    const fileFlag = request.body.fileIds && request.body.fileIds.length > 0;
    const folderFlag =
      request.body.folderIds && request.body.folderIds.length > 0;
    event.relationIds = [...request.body.fileIds, ...request.body.folderIds];
    const type =
      fileFlag && folderFlag
        ? "媒体资源和文件夹"
        : fileFlag
        ? "媒体资源"
        : "文件夹";
    event.model = fileFlag && folderFlag ? "-" : fileFlag ? "file" : "folder";
    event.desc = event.desc + type;
  } else if (moduleType === "admin-folder") {
    event.module = "Media Library";
    event.model = "folder";
    event.desc = event.desc + "文件夹";
  } else if (moduleType === "admin-upload") {
    event.module = "Media Library";
    event.model = "file";
    if (eventType === "upload") {
      event.type = request.query.id ? "update" : "create";
      event.desc = request.query.id ? "更新媒体资源" : "新增媒体资源";
    }
  } else if (moduleType === "user" || moduleType === "authentication") {
    event.module = "User";
    event.model = "user";
    event.desc = event.desc + "用户";
  }
  return event;
}

function transformEventType(event) {
  const eventType = event.type;
  switch (eventType) {
    case "createContentType":
    case "createComponent":
    case "create":
      event.type = "create";
      event.desc = "新增";
      break;
    case "updateContentType":
    case "updateComponent":
    case "updatePermissions":
    case "update":
      event.type = "update";
      event.desc = "更新";
      break;
    case "deleteContentType":
    case "deleteComponent":
    case "delete":
      event.type = "delete";
      event.desc = "删除";
      break;
    case "publish":
      event.desc = "发布";
      break;
    case "unpublish":
      event.desc = "取消发布";
      break;
    case "autoClone":
      event.type = "clone";
      event.desc = "复制";
      break;
    case "bulkPublish":
      event.desc = "批量发布";
      break;
    case "bulkUnpublish":
      event.desc = "批量取消发布";
      break;
    case "bulkDelete":
    case "deleteMany":
      event.type = "bulkDelete";
      event.desc = "批量删除";
      break;
    case "moveMany":
      event.type = "bulkMove";
      event.desc = "批量移动";
      break;
    case "register":
      event.type = "active";
      event.desc = "激活";
      break;
    default:
      event.type = null;
  }
}

/**
 * 提取关联 ID
 */
function getRelationIds(request, response) {
  // 1. 从请求的 body 中获取 ids
  if (request.body?.ids?.length) {
    return request.body.ids;
  }
  // 2. 从请求的 query 中获取 id
  if (request.query?.id) {
    return [Number(request.query.id)];
  }
  // 3. 从 URL 中匹配并提取 ID
  const regex = /\/(\d+)(?:[/?]|$)/;
  const match = request.url.match(regex);
  if (match) {
    return [Number(match[1])];
  }
  // 4. 从响应的 body 中获取 ID
  if (response?.body) {
    if (Array.isArray(response.body)) {
      return response.body.map((item) => item.id);
    }
    const id =
      response.body.id ||
      response.body.data?.id ||
      response.body.data?.user?.id;
    if (id) {
      return [Number(id)];
    }
  }
  // 如果没有找到相关 ID，则返回 null
  return null;
}
