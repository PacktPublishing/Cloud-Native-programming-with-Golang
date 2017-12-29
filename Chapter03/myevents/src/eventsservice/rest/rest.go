package rest

import (
	"net/http"

	"github.com/PacktPublishing/Cloud-Native-programming-with-Golang/chapter03/myevents/src/lib/persistence"

	"github.com/gorilla/mux"
)

func ServeAPI(endpoint, tlsendpoint string, databasehandler persistence.DatabaseHandler) (chan error, chan error) {
	handler := NewEventHandler(databasehandler)
	r := mux.NewRouter()
	eventsrouter := r.PathPrefix("/events").Subrouter()
	eventsrouter.Methods("GET").Path("/{SearchCriteria}/{search}").HandlerFunc(handler.FindEventHandler)
	eventsrouter.Methods("GET").Path("").HandlerFunc(handler.AllEventHandler)
	eventsrouter.Methods("POST").Path("").HandlerFunc(handler.NewEventHandler)
	httpErrChan := make(chan error)
	httptlsErrChan := make(chan error)

	go func() {
		httptlsErrChan <- http.ListenAndServeTLS(tlsendpoint, "cert.pem", "key.pem", r)
	}()
	go func() {
		httpErrChan <- http.ListenAndServe(endpoint, r)
	}()

	return httpErrChan, httptlsErrChan
}
