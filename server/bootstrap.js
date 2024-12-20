"use strict";

const { actions } = require("./config/permissions");
module.exports = ({ strapi }) => {
  strapi.admin.services.permission.actionProvider.registerMany(actions);
};
