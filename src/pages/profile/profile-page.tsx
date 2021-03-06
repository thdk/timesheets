import React, { useMemo, useEffect, useCallback } from "react";
import { observer } from "mobx-react-lite";
import { useViewStore } from "../../contexts/view-context";
import { ITabData, Tabs } from "../../components/tabs";
import { useUserStore } from "../../contexts/user-context";
import { Preferences } from "./preferences";
import { withAuthentication } from "../../containers/users/with-authentication";
import { RedirectToLogin } from "../../internal";
import { DivisionsTabContent } from "./division-tab-content";
import { goToUserProfile, ProfileTab, ProfileRouteQueryParams } from "../../routes/users/profile";
import { useRouterStore } from "../../stores/router-store";
import { canAddRegistrations } from "../../rules";
import { Connections } from "./connections";

export const ProfilePage = withAuthentication(observer(() => {
    const view = useViewStore();
    const router = useRouterStore();

    const { divisionUser } = useUserStore();

    useEffect(() => {
        view.title = "User profile";
        view.setNavigation("default");
    }, [view]);

    const tabData: ITabData<ProfileTab>[] = useMemo(() => [
        {
            id: "preferences",
            text: "Preferences",
            canOpen: () => canAddRegistrations(divisionUser),
            tabContent: <Preferences />,
            icon: "list_alt",
        },
        {
            id: "divisions",
            tabContent: <DivisionsTabContent />,
            text: "My divisions",
            icon: "groups",
            canOpen: () => !!divisionUser,
        },
        { id: "connections", text: "Connections", tabContent: <Connections /> },
    ], [divisionUser]);

    const onTabChange = useCallback((tabId: ProfileTab) => {
        goToUserProfile(router, tabId);
    }, [goToUserProfile, router]);

    const query: { tab: ProfileTab } = router.queryParams as ProfileRouteQueryParams;
    const { tab: activeTab = undefined } = query || {};

    return (
        <Tabs
            tabData={tabData}
            activeTab={activeTab}
            onTabChange={onTabChange}
        />
    );
}), <RedirectToLogin />);
ProfilePage.displayName = "ProfilePage";
