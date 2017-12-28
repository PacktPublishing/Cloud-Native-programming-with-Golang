package rest

import "github.com/prometheus/client_golang/prometheus"

var bookingCount = prometheus.NewCounterVec(prometheus.CounterOpts{
	Name: "bookings_count",
	Namespace: "myevents",
	Help: "Amount of booked tickets",
}, []string{"eventID", "eventName"})

var seatsPerBooking = prometheus.NewHistogram(prometheus.HistogramOpts{
	Name: "seats_per_booking",
	Namespace: "myevents",
	Help: "Amount of seats per booking",
	Buckets: []float64{1,2,3,4},
})

func init() {
	prometheus.MustRegister(bookingCount)
	prometheus.MustRegister(seatsPerBooking)
}