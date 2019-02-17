import * as React from 'react';
import { observer } from '../../node_modules/mobx-react';
import { TopAppBar } from '../mdc/appbars';
import store from '../stores/RootStore';

// TODO: move to  mdc/TopAppBar
export interface ITopAppBarProps {
    navigation: JSX.Element;
}

export enum NavigationType {
    menu,
    back,
    up
}

@observer
export class TopNavigation extends React.Component {
    navigationClick = (e: React.MouseEvent) => {
        e.preventDefault();
        const action = store.view.navigationAction;
        if (action) action.action();
    }

    render() {
        const { navigationAction: { icon: navigationIcon = {content: "menu", label: "Menu"}} = {}, title } = store.view;

        const selectionLength = Array.from(store.view.selection.keys()).length;
        const titleText = selectionLength
         ? `${selectionLength} selected`
         : title;

        return (
            <TopAppBar mode={selectionLength ? "contextual" : "standard"} navigationIcon={navigationIcon.content} title={titleText} navigationClick={this.navigationClick} showNavigationIcon={true}></TopAppBar>
        )
    }
}