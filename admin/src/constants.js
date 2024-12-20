import pluginId from "./pluginId";

export const PERMISSIONS = {
  read: [
    {
      action: `plugin::${pluginId}.read`, // the action name should be plugin::plugin-name.actionType
      subject: null,
    },
  ],
};
