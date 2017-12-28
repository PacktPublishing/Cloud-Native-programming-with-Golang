package rest

import (
	"gocloudprogramming/chapter2/myevents/src/lib/persistence"
	"net/http"

	"github.com/gorilla/mux"
)

func ServeAPI(endpoint string, databasehandler persistence.DatabaseHandler) error {
	handler := New(databasehandler)
	r := mux.NewRouter()
	eventsrouter := r.PathPrefix("/events").Subrouter()
	eventsrouter.Methods("GET").Path("/{SearchCriteria}/{search}").HandlerFunc(handler.FindEventHandler)
	eventsrouter.Methods("GET").Path("").HandlerFunc(handler.AllEventHandler)
	eventsrouter.Methods("POST").Path("").HandlerFunc(handler.NewEventHandler)
	return http.ListenAndServe(endpoint, r)
}
