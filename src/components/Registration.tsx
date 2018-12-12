import * as React from 'react';
import { observer } from "mobx-react";
import { TextField } from '../MaterialUI/textfield';
import { Form, FormField } from '../components/Layout/form';
import store from '../store';
import { Chip, ChipSet } from '../MaterialUI/chips';
import { Doc } from '../Firestorable/Document';
import { FlexGroup } from './Layout/flex';
import { goTo as goToOverview } from '../internal';
import { Select, SelectOption } from '../MaterialUI/select';

@observer
export class Registration extends React.Component {
    render() {
        if (!(store.registrationsStore.registration instanceof (Doc))) return <></>;

        const { task = store.user.defaultTask, description, project, time, date } = store.registrationsStore.registration.data;
        const tasks = Array.from(store.tasks.docs.values())
            .filter(t => !!t.data.name) // todo move validation to Doc
            .map(t => {
                const { id: taskId, data: { name: taskName } } = t;

                return (
                    <Chip onClick={this.taskClicked} id={taskId} {...t.data} text={taskName!} key={taskId} isSelected={taskId === task}></Chip>
                );
            });

        const projects = Array.from(store.config.projects.docs.values())
            .map(p => {
                const { id, data: { name } } = p;
                return (
                    <SelectOption text={name!} value={id} key={id}></SelectOption>
                );
            });

        if (!date) throw "Date is required";
        const realDate = date.toDate();

        return (
            <>
                <Form>
                    <FlexGroup extraCssClass="row">
                        <FormField>
                            <TextField type="number" outlined={true} focus={true} tabIndex={0} onChange={this.onTimeChange} value={(time || "").toString()} id="time" hint="Time" fullWidth={false}></TextField>
                        </FormField>
                        <FormField first={false}>
                            <TextField tabIndex={-1} disabled={true} value={`${realDate.getFullYear()}-${realDate.getMonth() + 1}-${realDate.getDate()}`} id="date" hint="Date" leadingIcon="event" outlined={true}></TextField>
                        </FormField>
                    </FlexGroup>
                    <FlexGroup extraCssClass="row">
                        <FormField>
                            <TextField cols={250} rows={2} outlined={true} tabIndex={0} onChange={this.onDescriptionChange} value={description} id="description" hint="Description" fullWidth={false}></TextField>
                        </FormField>
                    </FlexGroup>
                    {/* <FlexGroup extraCssClass="row">
                        <FormField>
                            <TextField outlined={true} tabIndex={0} onChange={this.onProjectChange} value={project} id="project" hint="Project" fullWidth={false}></TextField>
                        </FormField>
                    </FlexGroup> */}
                    <FlexGroup>
                        <FormField>
                            <Select value={project} label="Project" onChange={this.onProjectChange}>{projects}</Select>
                        </FormField>
                    </FlexGroup>
                    <FlexGroup extraCssClass="row">
                        <FlexGroup direction="vertical">
                            <h3 className="mdc-typography--subtitle1">Select one of your standard tasks</h3>
                            <FormField>
                                <ChipSet type="choice">
                                    {tasks}
                                </ChipSet>
                            </FormField>
                        </FlexGroup>
                    </FlexGroup>
                </Form>
            </>
        );
    }

    onDescriptionChange = (value: string) => {
        if (store.registrationsStore.registration instanceof (Doc))
            store.registrationsStore.registration.data.description = value;
    }

    onTimeChange = (value: string) => {
        if (store.registrationsStore.registration instanceof (Doc))
            store.registrationsStore.registration!.data.time = +value;
    }

    onProjectChange = (value: string) => {
        if (store.registrationsStore.registration instanceof (Doc))
            store.registrationsStore.registration!.data.project = value;
    }

    taskClicked = (taskId: string) => {
        if (store.registrationsStore.registration instanceof (Doc))
            store.registrationsStore.registration!.data.task = taskId;
    }

    keyDown = (e: KeyboardEvent) => {
        if (e.ctrlKey && e.key === "Enter") {
            store.registrationsStore.save();
            goToOverview(store);
        }
        else if (e.key === "Escape") {
            goToOverview(store);
        }
    }

    componentDidMount() {
        document.addEventListener("keydown", this.keyDown);
    }

    componentWillUnmount() {
        document.removeEventListener("keydown", this.keyDown);
    }
}