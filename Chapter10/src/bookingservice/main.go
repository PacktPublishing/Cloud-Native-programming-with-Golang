package main

import (
	"flag"
	"fmt"
	"net/http"

	"github.com/Shopify/sarama"
	"github.com/martin-helmich/cloudnativego-backend/src/bookingservice/listener"
	"github.com/martin-helmich/cloudnativego-backend/src/bookingservice/rest"
	"github.com/martin-helmich/cloudnativego-backend/src/lib/configuration"
	"github.com/martin-helmich/cloudnativego-backend/src/lib/msgqueue"
	msgqueue_amqp "github.com/martin-helmich/cloudnativego-backend/src/lib/msgqueue/amqp"
	"github.com/martin-helmich/cloudnativego-backend/src/lib/msgqueue/kafka"
	"github.com/martin-helmich/cloudnativego-backend/src/lib/persistence/dblayer"
	"github.com/prometheus/client_golang/prometheus/promhttp"
	"github.com/streadway/amqp"
)

func panicIfErr(err error) {
	if err != nil {
		panic(err)
	}
}

func main() {
	var eventListener msgqueue.EventListener
	var eventEmitter msgqueue.EventEmitter

	confPath := flag.String("conf", "./configuration/config.json", "flag to set the path to the configuration json file")
	flag.Parse()

	//extract configuration
	config, _ := configuration.ExtractConfiguration(*confPath)

	switch config.MessageBrokerType {
	case "amqp":
		conn, err := amqp.Dial(config.AMQPMessageBroker)
		panicIfErr(err)

		eventListener, err = msgqueue_amqp.NewAMQPEventListener(conn, "events", "booking")
		panicIfErr(err)

		eventEmitter, err = msgqueue_amqp.NewAMQPEventEmitter(conn, "events")
		panicIfErr(err)
	case "kafka":
		conf := sarama.NewConfig()
		conf.Producer.Return.Successes = true
		conn, err := sarama.NewClient(config.KafkaMessageBrokers, conf)
		panicIfErr(err)

		eventListener, err = kafka.NewKafkaEventListener(conn, []int32{})
		panicIfErr(err)

		eventEmitter, err = kafka.NewKafkaEventEmitter(conn)
		panicIfErr(err)
	default:
		panic("Bad message broker type: " + config.MessageBrokerType)
	}

	dbhandler, _ := dblayer.NewPersistenceLayer(config.Databasetype, config.DBConnection)

	processor := listener.EventProcessor{eventListener, dbhandler}
	go processor.ProcessEvents()

	go func() {
		fmt.Println("Serving metrics API")
		h := http.NewServeMux()
		h.Handle("/metrics", promhttp.Handler())

		http.ListenAndServe(":9100", h)
	}()

	rest.ServeAPI(config.RestfulEndpoint, dbhandler, eventEmitter)
}
