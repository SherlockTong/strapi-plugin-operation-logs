import { useRBAC } from "@strapi/helper-plugin";

import { PERMISSIONS } from "../constants";

export const usePermissions = () => {
  const { allowedActions, isLoading } = useRBAC(PERMISSIONS);

  return { ...allowedActions, isLoading };
};
