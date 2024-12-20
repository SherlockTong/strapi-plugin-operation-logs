/**
 *
 * This component is the skeleton around the actual pages, and should only
 * contain code that should be seen on all pages. (e.g. navigation bar)
 *
 */

import React, { useEffect, useState } from "react";
import { Switch, Route, useLocation } from "react-router-dom";
import { AnErrorOccurred } from "@strapi/helper-plugin";
import pluginId from "../../pluginId";
import ListViewPage from "../ListViewPage";
import DetailViewPage from "../DetailViewPage";
import { usePermissions } from "../../hooks/usePermissions";

const App = () => {
  const { isLoading, canRead } = usePermissions();
  const [hasAccess, setHasAccess] = useState(false);

  const location = useLocation();
  useEffect(() => {
    if (!isLoading) {
      // 根据 allowedActions 判断是否有权限
      setHasAccess(canRead);
    }
  }, [location, canRead]);
  if (isLoading) {
    // 加载状态
    return <div>Loading...</div>;
  }

  if (!hasAccess) {
    // 无权限
    return <AnErrorOccurred />;
  }
  return (
    <div>
      <Switch>
        <Route path={`/plugins/${pluginId}`} component={ListViewPage} exact />
        <Route
          path={`/plugins/${pluginId}/:id`}
          component={DetailViewPage}
          exact
        />
        <Route component={AnErrorOccurred} />
      </Switch>
    </div>
  );
};

export default App;
