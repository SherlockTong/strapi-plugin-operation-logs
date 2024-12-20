# Strapi plugin strapi-plugin-operation-logs

This plugin is used to help administrators record user operations on various modules of the Strapi management backend.

# Installation

`npm install strapi-plugin-operation-logs`

`yarn add strapi-plugin-operation-logs`



# Configuration

The default depth can be customized via the plugin config. To do so create or edit you plugins.js file.

## Config

standard config add the following config to your config/plugins.js

```
module.exports = ({ env }) => ({
  'operation-logs': {
    enabled: true,
  },
});
```
# Usages

## List View Page

![list.png](https://github.com/SherlockTong/images/blob/main/strapi/operation-log-list-view.png)

## Detail View Page

![detail.png](https://github.com/SherlockTong/images/blob/main/strapi/operation-log-detail-view.png)


# Contributions
Please open issues before making a pull request so that we can talk about what you want to change for the best results.