package amqp

import (
	"encoding/json"
	"fmt"
	"os"
	"time"

	amqphelper "github.com/martin-helmich/cloudnativego-backend/src/lib/helper/amqp"
	"github.com/martin-helmich/cloudnativego-backend/src/lib/msgqueue"
	"github.com/streadway/amqp"
)

type amqpEventEmitter struct {
	connection *amqp.Connection
	exchange   string
	events     chan *emittedEvent
}

type emittedEvent struct {
	event     msgqueue.Event
	errorChan chan error
}

// NewAMQPEventEmitterFromEnvironment will create a new event emitter from
// the configured environment variables. Important variables are:
//
//   - AMQP_URL; the URL of the AMQP broker to connect to
//   - AMQP_EXCHANGE; the name of the exchange to bind to
//
// For missing environment variables, this function will assume sane defaults.
func NewAMQPEventEmitterFromEnvironment() (msgqueue.EventEmitter, error) {
	var url string
	var exchange string

	if url = os.Getenv("AMQP_URL"); url == "" {
		url = "amqp://localhost:5672"
	}

	if exchange = os.Getenv("AMQP_EXCHANGE"); exchange == "" {
		exchange = "example"
	}

	conn := <-amqphelper.RetryConnect(url, 5*time.Second)
	return NewAMQPEventEmitter(conn, exchange)
}

// NewAMQPEventEmitter creates a new event emitter.
// It will need an AMQP connection passed as parameter and use this connection
// to create its own channel (note: AMQP channels are not thread-safe, so just
// accepting the connection as a parameter and then creating our own private
// channel is the safest way to ensure this).
func NewAMQPEventEmitter(conn *amqp.Connection, exchange string) (msgqueue.EventEmitter, error) {
	emitter := amqpEventEmitter{
		connection: conn,
		exchange:   exchange,
	}

	err := emitter.setup()
	if err != nil {
		return nil, err
	}

	return &emitter, nil
}

func (a *amqpEventEmitter) setup() error {
	channel, err := a.connection.Channel()
	if err != nil {
		return err
	}

	defer channel.Close()

	// Normally, all(many) of these options should be configurable.
	// For our example, it'll probably do.
	err = channel.ExchangeDeclare(a.exchange, "topic", true, false, false, false, nil)
	return err
}

func (a *amqpEventEmitter) Emit(event msgqueue.Event) error {
	channel, err := a.connection.Channel()
	if err != nil {
		return err
	}

	defer channel.Close()

	// TODO: Alternatives to JSON? Msgpack or Protobuf, maybe?
	jsonBody, err := json.Marshal(event)
	if err != nil {
		return fmt.Errorf("could not JSON-serialize event: %s", err)
	}

	msg := amqp.Publishing{
		Headers:     amqp.Table{"x-event-name": event.EventName()},
		ContentType: "application/json",
		Body:        jsonBody,
	}

	err = channel.Publish(a.exchange, event.EventName(), false, false, msg)
	return err
}
