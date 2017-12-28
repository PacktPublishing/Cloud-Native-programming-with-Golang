package main

import (
	"flag"
	"fmt"

	"net/http"

	"github.com/Shopify/sarama"

	"github.com/martin-helmich/cloudnativego-backend/src/eventservice/rest"
	"github.com/martin-helmich/cloudnativego-backend/src/lib/configuration"
	"github.com/martin-helmich/cloudnativego-backend/src/lib/msgqueue"
	msgqueue_amqp "github.com/martin-helmich/cloudnativego-backend/src/lib/msgqueue/amqp"
	"github.com/martin-helmich/cloudnativego-backend/src/lib/msgqueue/kafka"
	"github.com/martin-helmich/cloudnativego-backend/src/lib/persistence/dblayer"
	"github.com/prometheus/client_golang/prometheus/promhttp"
	"github.com/streadway/amqp"
)

func main() {
	var eventEmitter msgqueue.EventEmitter

	confPath := flag.String("conf", `.\configuration\config.json`, "flag to set the path to the configuration json file")
	flag.Parse()
	//extract configuration
	config, _ := configuration.ExtractConfiguration(*confPath)

	switch config.MessageBrokerType {
	case "amqp":
		conn, err := amqp.Dial(config.AMQPMessageBroker)
		if err != nil {
			panic(err)
		}

		eventEmitter, err = msgqueue_amqp.NewAMQPEventEmitter(conn, "events")
		if err != nil {
			panic(err)
		}
	case "kafka":
		conf := sarama.NewConfig()
		conf.Producer.Return.Successes = true
		conn, err := sarama.NewClient(config.KafkaMessageBrokers, conf)
		if err != nil {
			panic(err)
		}

		eventEmitter, err = kafka.NewKafkaEventEmitter(conn)
		if err != nil {
			panic(err)
		}
	default:
		panic("Bad message broker type: " + config.MessageBrokerType)
	}

	fmt.Println("Connecting to database")
	dbhandler, _ := dblayer.NewPersistenceLayer(config.Databasetype, config.DBConnection)

	go func() {
		fmt.Println("Serving metrics API")
		h := http.NewServeMux()
		h.Handle("/metrics", promhttp.Handler())

		http.ListenAndServe(":9100", h)
	}()

	fmt.Println("Serving API")
	//RESTful API start
	err := rest.ServeAPI(config.RestfulEndpoint, dbhandler, eventEmitter)
	if err != nil {
		panic(err)
	}
}
