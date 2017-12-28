import * as React from "react";
import {EventBookingForm} from "./event_booking_form";
import {Event} from "../model/event";

export interface EventBookingFormContainerProps {
    eventID: string;
    eventServiceURL: string;
    bookingServiceURL: string;
}

export interface EventBookingFormState {
    state: "loading"|"ready"|"saving"|"done"|"error";
    event?: Event;
}

export class EventBookingFormContainer extends React.Component<EventBookingFormContainerProps, EventBookingFormState> {
    constructor(p: EventBookingFormContainerProps) {
        super(p);

        this.state = {
            state: "loading"
        };

        fetch(p.eventServiceURL + "/events/" + p.eventID)
            .then<Event>(resp => resp.json())
            .then(event => {
                this.setState({
                    state: "ready",
                    event: event
                });
            })
    }

    render() {
        if (this.state.state === "loading") {
            return <div>Loading...</div>;
        }

        if (!this.state.event) {
            return <div>Unknown error</div>;
        }

        if (this.state.state === "done") {
            return <div className="alert alert-success">Booking successfully completed!</div>
        }

        return <EventBookingForm event={this.state.event} onSubmit={amount => this.handleSubmit(amount)}/>
    }

    private handleSubmit(seats: number) {
        const url = this.props.bookingServiceURL + "/events/" + this.props.eventID + "/bookings";
        const payload = {seats: seats};

        this.setState({
            event: this.state.event,
            state: "saving"
        });

        fetch(url, {method: "POST", body: JSON.stringify(payload)})
            .then(response => {
                console.log("foo")
                this.setState({
                    event: this.state.event,
                    state: response.ok ? "done" : "error"
                });
            })
    }
}