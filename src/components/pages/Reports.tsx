import * as React from 'react';
import { observer } from "mobx-react";
import moment from 'moment-es6';
import { goToRegistration } from '../../internal';
import store from '../../stores/RootStore';
import { FlexGroup } from '../Layout/flex';
import { GroupedRegistrations } from '../GroupedRegistrations';
import { goToOverview } from '../../routes/timesheets/overview';
import { List, ListItem, ListDivider } from '../../MaterialUI/list';
import { DateSelect } from '../Controls/DateSelect';

@observer
export class Reports extends React.Component {

    registrationClick = (id: string) => {
        goToRegistration(id);
    }

    goToDate(e: React.MouseEvent, date: Date) {
        e.preventDefault();
        goToOverview(store, {
            year: date.getFullYear(),
            month: date.getMonth() + 1,
            day: date.getDate()
        })
    }

    createTotalLabel = (date: Date) => {
        return (
            <a href="#" onClick={(e) => this.goToDate(e, date)}>
                {moment(date).format("MMMM Do")}</a>
        );
    }

    render() {
        const totalTime = Array.from(store.timesheets.registrations.docs.values())
            .reduce((p, c) => p + (c.data!.time || 0), 0);

        const totalLabel = `Total in ${store.view.moment.format('MMMM')}`;
        const total = <ListItem key={`total-month`} lines={[totalLabel]} meta={totalTime + " hours"} disabled={true}></ListItem>

        const totalList = <List style={{ width: "100%" }}><ListDivider></ListDivider>{total}<ListDivider></ListDivider></List>;

        const { month, year } = store.view;

        return (
            <>
                <FlexGroup direction="vertical">
                    <FlexGroup>
                        <DateSelect onMonthChange={this.changeMonth} onYearChange={this.changeYear} month={month ? month - 1 : undefined} year={year}></DateSelect>
                    </FlexGroup>
                    <GroupedRegistrations totalOnTop={true} createTotalLabel={this.createTotalLabel} registrationClick={this.registrationClick.bind(this)} />
                    {totalList}
                </FlexGroup>
            </>
        );
    }

    changeMonth(month: number) {
        store.view.month = month + 1;
    }

    changeYear(year: number) {
        store.view.year = year;
    }
}