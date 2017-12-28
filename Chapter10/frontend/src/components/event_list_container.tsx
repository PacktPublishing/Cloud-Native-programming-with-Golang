import * as React from "react";
import {EventList} from "./event_list";
import {Loader} from "./loader";
import {Event} from "../model/event";

export interface EventListContainerProps {
    eventServiceURL: string;
}

export interface EventListContainerState {
    loading: boolean;
    events: Event[];
}

export class EventListContainer extends React.Component<EventListContainerProps, EventListContainerState> {
    constructor(p: EventListContainerProps) {
        super(p);

        this.state = {
            loading: true,
            events: []
        };

        fetch(p.eventServiceURL + "/events", {method: "GET"})
            .then<Event[]>(response => response.json())
            .then(events => {
                this.setState({
                    loading: false,
                    events: events
                })
            })
    }

    private handleEventBooked(e: Event) {
        console.log("booking event...");
    }

    render() {
        return <Loader loading={this.state.loading} message="Loading events...">
            <EventList events={this.state.events} onEventBooked={e => this.handleEventBooked(e)}/>
        </Loader>
    }
}