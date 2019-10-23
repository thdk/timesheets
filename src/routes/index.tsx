import * as React from 'react';
import { App } from '../internal';
import { Route, RoutesConfig } from 'mobx-router';
import timesheetsRoutes from './timesheets';
import settingsRoutes from './settings';
import reportRoutes from './reports';
import userRoutes from './users';
import projectRoutes from './projects';
import dashboardRoures from './projects';

import { goToOverview } from '../internal';
import store from '../stores/root-store';

const routes: RoutesConfig = {
  root: new Route({
    path: '/',
    component: <App></App>,
    onEnter: () => {
      goToOverview(store); // TODO: verify if we can't use the global store inside goToOverview
    },
    // beforeEnter,
    title: "Root"
  }),
  ...timesheetsRoutes,
  ...settingsRoutes,
  ...reportRoutes,
  ...userRoutes,
  ...projectRoutes,
  ...dashboardRoures,
};
export default routes;