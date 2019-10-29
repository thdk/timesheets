import * as React from 'react';
import { Route } from 'mobx-router';
import Timesheet from '../../pages/registrations';
import { transaction } from 'mobx';
import { beforeEnter, setNavigationContent, goToRouteWithDate } from '../actions';
import { App } from '../../internal';
import store, { IRootStore } from '../../stores/root-store';
import { IViewAction } from '../../stores/view-store';
import { IRegistration } from '../../../common/dist';
import detailRoutes from "./detail";

export interface IDate {
    year: number;
    month: number;
    day?: number;
}

export const path = "/timesheets";

export const goToOverview = (s: IRootStore, date?: IDate, trackOptions?: { track?: boolean, currentDate?: number }) => {
    let route = routes.monthOverview;
    if ((date && date.day) || (!date && s.view.day)) {
        route = routes.overview;
        trackOptions = { ...trackOptions, currentDate: undefined };
    }

    goToRouteWithDate(route, s, date, trackOptions);
};

const routeChanged = (route: Route, params: IDate, s: IRootStore) => {
    setNavigationContent(route, !!s.view.track, s.view.track && store.view.moment ? { year: store.view.year!, month: store.view.month! } : undefined, params.day ? +params.day : undefined);

    transaction(() => {
        s.view.year = +params.year;
        s.view.month = +params.month;
        s.view.day = params.day ? +params.day : undefined;
    });
};

const setActions = (s: IRootStore, alowInserts = false) => {
    const actions: IViewAction[] = [
        {
            action: selection => {
                s.timesheets.clipboard.replace(selection);
                s.view.selection.clear();
            },
            icon: { content: "content_copy", label: "Copy" },
            shortKey: { ctrlKey: true, key: "c" },
            selection: s.view.selection,
            contextual: true
        },
        {
            action: selection => {
                if (!selection) return;

                s.timesheets.deleteRegistrationsAsync(...Array.from(selection.keys()));
                s.view.selection.clear();
            },
            icon: { content: "delete", label: "Delete" },
            shortKey: { key: "Delete", ctrlKey: true },
            selection: s.view.selection,
            contextual: true
        } as IViewAction<IRegistration>
    ];


    if (alowInserts) {
        actions.push({
            action: selection => {
                if (!selection) return;

                const docData = Array.from(selection.keys())
                    .map(regId => {
                        const reg = s.timesheets.getRegistrationById(regId);
                        return reg ? s.timesheets.cloneRegistration(reg) : undefined;
                    }) as IRegistration[];

                s.timesheets.addRegistrations(docData.filter(r => !!r));
            },
            icon: { content: "content_paste", label: "Paste" },
            shortKey: { ctrlKey: true, key: "v" },
            selection: s.timesheets.clipboard
        } as IViewAction<IRegistration>);
    }

    else {
        actions.push(
            {
                action: () => {
                    s.timesheets.setRegistrationsGroupedByDaySortOrder(s.timesheets.registrationsGroupedByDaySortOrder * -1)
                },
                icon: { content: "arrow_downward", label: "Sort ascending" },
                iconActive: { content: "arrow_upward", label: "Sort descending" },
                isActive: s.timesheets.registrationsGroupedByDaySortOrder === 1
            } as IViewAction<IRegistration>,
            {
                action: () => {
                    s.timesheets.areGroupedRegistrationsCollapsed = !s.timesheets.areGroupedRegistrationsCollapsed;
                },
                icon: { content: "unfold_more", label: "Unfold groups" },
                iconActive: { content: "unfold_less", label: "Fold groups" },
                isActive: s.timesheets.areGroupedRegistrationsCollapsed === false
            }
        )
    }

    transaction(() => {
        s.view.setActions(actions);
        s.view.setFabs([{
            action: () => {
                store.router.goTo(detailRoutes.newRegistration, {}, store);
            },
            icon: {
                content: "add",
                label: "Add new registration"
            },
            shortKey: {
                key: "a",
            },
        }]);
    });
};

const beforeTimesheetExit = (_route: Route, _params: any, s: IRootStore) => {
    transaction(() => {
        s.view.selection.size && s.view.selection.clear();
        s.view.setActions([]);
        s.view.setFabs([]);
    });
};

const routes = {
    overview: new Route({
        path: path + '/:year/:month/:day',
        component: <App><Timesheet></Timesheet></App>,
        onEnter: (route: Route, params: IDate, s: IRootStore) => {
            routeChanged(route, params, s);
            setActions(s, true);
        },
        onParamsChange: routeChanged,
        title: "Timesheet",
        beforeEnter,
        beforeExit: beforeTimesheetExit
    }),
    monthOverview: new Route({
        path: path + '/:year/:month',
        component: <App><Timesheet></Timesheet></App>,
        onEnter: (route: Route, params: IDate, s: IRootStore) => {
            store.view.track = false;
            routeChanged(route, params, s);
            setActions(s);
        },
        onParamsChange: routeChanged,
        title: "Timesheet",
        beforeEnter,
        beforeExit: beforeTimesheetExit
    })
};

export default routes;

