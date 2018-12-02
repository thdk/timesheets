//components
import { App } from '../internal'
import * as React from 'react';

//models
import { Route, RoutesConfig } from 'mobx-router';

// routes
import timesheetsRoutes from './timesheets/index';
import { goTo as goToOverview } from '../internal';

const routes: RoutesConfig = {
  root: new Route({
    path: '/',
    component: <App></App>,
    onEnter: () => {
      goToOverview();
    },
    title: "Root"
  }),
  ...timesheetsRoutes
};
export default routes;