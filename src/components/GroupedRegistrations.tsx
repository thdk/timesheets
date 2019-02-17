import * as React from 'react';
import store from '../stores/RootStore';
import { IReactProps } from '../types';
import { observer } from 'mobx-react';
import { GroupedRegistration } from './GroupedRegistration';
import { IRegistration } from '../stores/TimesheetsStore';

export enum SortOrder {
    Ascending = 1,
    Descending = -1
}

export interface IGroupedRegistrationsProps extends IReactProps {
    registrationClick: (id: string) => void;
    registrationToggleSelect?: (id: string, data: IRegistration) => void;
    createTotalLabel: (date: Date) => React.ReactNode;
    totalOnTop?: boolean;
    sortOrder?: SortOrder
    activeDate?: number;
}

@observer
export class GroupedRegistrations extends React.Component<IGroupedRegistrationsProps> {
    private activeRegistrationRef: React.RefObject<GroupedRegistration>;
    constructor(props: IGroupedRegistrationsProps) {
        super(props);
        this.activeRegistrationRef = React.createRef<GroupedRegistration>();
    }
    render() {
        const { sortOrder = SortOrder.Ascending } = this.props;

        return (sortOrder > 0 ? store.timesheets.registrationsGroupedByDay : store.timesheets.registrationsGroupedByDayReversed).map((g, i) => {
            return <GroupedRegistration ref={g.groupKey && g.groupKey.getDate() === this.props.activeDate ? this.activeRegistrationRef : null} denseList={true} key={`group-${i}`} group={g} {...this.props}></GroupedRegistration>
        });
    }

    componentDidMount() {
        this.activeRegistrationRef.current && this.activeRegistrationRef.current.scrollIntoView();
    }
}