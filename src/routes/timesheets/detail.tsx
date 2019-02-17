import * as React from 'react';
import { RoutesConfig, Route } from 'mobx-router';

import { App } from '../../components/App';
import { Registration } from '../../components/Registration';
import { setTitleForRoute, setBackToOverview, beforeEnter } from '../actions';
import { goToOverview } from '../../internal';
import { reaction } from '../../../node_modules/mobx';
import store, { IRootStore } from '../../stores/RootStore';
import { IViewAction } from '../../stores/ViewStore';

const path = "/timesheetsdetail";

export const goToRegistration = (id?: string) => {
    store.router.goTo(id ? routes.registrationDetail : routes.newRegistration, { id }, store);
}

const onEnter = (route: Route, params: { id?: string }, s: IRootStore) => {
    if (params.id) {
        s.timesheets.registrationId = params.id;
        if (!s.timesheets.registration) {
            // registration not in memory yet, request it
            s.timesheets.registrations
                .getAsync(params.id)
                .then(() => s.timesheets.registrationId = params.id);
        }
    }

    const deleteAction: IViewAction = {
        action: () => {
            s.timesheets.registrationId && s.timesheets.registrations.deleteAsync(s.timesheets.registrationId);
            goToOverview(s);
        },
        icon:  { label: "Delete", content: "delete" },
        shortKey: { key: "Delete", ctrlKey: true }
    }

    const saveAction: IViewAction = {
        action: () => {
            s.timesheets.save();
            goToOverview(s);
        },
        icon:  { label: "Save", content: "save" },
        shortKey: { key: "s", ctrlKey: true }
    }

    s.view.setActions([
        saveAction,
        deleteAction
    ]);

    setBackToOverview(() => s.timesheets.save(), s.timesheets.registration && s.timesheets.registration.data!.date!.getDate());
    setTitleForRoute(route);

    const u = reaction(() => s.timesheets.registration, () => {
        // use icon as unique id of action
        s.view.actions.replace([]);
        u();
    });
};

const beforeExit = (_route: Route, _params: any, s: IRootStore) => {
    s.timesheets.registrationId = undefined;
    s.view.setNavigation("default");
};

const routes = {
    newRegistration: new Route({
        path,
        component: <App><Registration></Registration></App>,
        title: "New registration",
        onEnter,
        beforeExit,
        beforeEnter: (route: Route, params: any, s: IRootStore) => {
            return beforeEnter(route, params, s)
                .then(() => {
                    s.timesheets.newRegistration();

                    return true;
                })
        }
    }),
    registrationDetail: new Route({
        path: path + '/:id',
        component: <App><Registration></Registration></App>,
        title: "Edit registration",
        onEnter,
        beforeExit,
        beforeEnter
    })
} as RoutesConfig;

export default routes;
