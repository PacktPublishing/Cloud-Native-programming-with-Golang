package contracts

// EventBookedEvent is emitted whenever an event is booked
type EventBookedEvent struct {
	EventID string `json:"eventId"`
	UserID  string `json:"userId"`
}

// EventName returns the event's name
func (c *EventBookedEvent) EventName() string {
	return "eventBooked"
}
