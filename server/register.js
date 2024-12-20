"use strict";

module.exports = ({ strapi }) => {
  strapi.server.use(
    require("./middlewares/operation-log")(strapi.config, strapi)
  );
};
