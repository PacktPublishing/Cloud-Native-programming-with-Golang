package rest

import (
	"encoding/hex"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/gorilla/mux"
	"github.com/martin-helmich/cloudnativego-backend/src/contracts"
	"github.com/martin-helmich/cloudnativego-backend/src/lib/msgqueue"
	"github.com/martin-helmich/cloudnativego-backend/src/lib/persistence"
)

type eventRef struct {
	ID   string `json:"id"`
	Name string `json:"name,omitempty"`
}

type createBookingRequest struct {
	Seats int `json:"seats"`
}

type createBookingResponse struct {
	ID    string   `json:"id"`
	Event eventRef `json:"event"`
}

type CreateBookingHandler struct {
	eventEmitter msgqueue.EventEmitter
	database     persistence.DatabaseHandler
}

func (h *CreateBookingHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	routeVars := mux.Vars(r)
	eventID, ok := routeVars["eventID"]
	if !ok {
		w.WriteHeader(400)
		fmt.Fprint(w, "missing route parameter 'eventID'")
		return
	}

	eventIDMongo, _ := hex.DecodeString(eventID)
	event, err := h.database.FindEvent(eventIDMongo)
	if err != nil {
		w.WriteHeader(404)
		fmt.Fprintf(w, "event %s could not be loaded: %s", eventID, err)
		return
	}

	bookingRequest := createBookingRequest{}
	err = json.NewDecoder(r.Body).Decode(&bookingRequest)
	if err != nil {
		w.WriteHeader(400)
		fmt.Fprintf(w, "could not decode JSON body: %s", err)
		return
	}

	if bookingRequest.Seats <= 0 {
		w.WriteHeader(400)
		fmt.Fprintf(w, "seat number must be positive (was %d)", bookingRequest.Seats)
		return
	}

	eventIDAsBytes, _ := event.ID.MarshalText()
	booking := persistence.Booking{
		Date:    time.Now().Unix(),
		EventID: eventIDAsBytes,
		Seats:   bookingRequest.Seats,
	}

	msg := contracts.EventBookedEvent{
		EventID: event.ID.Hex(),
		UserID:  "someUserID",
	}
	h.eventEmitter.Emit(&msg)

	bookingCount.
		WithLabelValues(eventID, event.Name).
		Add(float64(bookingRequest.Seats))
	seatsPerBooking.
		Observe(float64(bookingRequest.Seats))

	h.database.AddBookingForUser([]byte("someUserID"), booking)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(201)

	json.NewEncoder(w).Encode(&booking)
}
