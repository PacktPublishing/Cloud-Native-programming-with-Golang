package kafka

import (
	"encoding/json"
	"log"
	"os"
	"strings"
	"time"

	"github.com/Shopify/sarama"
	"github.com/martin-helmich/cloudnativego-backend/src/lib/helper/kafka"
	"github.com/martin-helmich/cloudnativego-backend/src/lib/msgqueue"
)

type kafkaEventEmitter struct {
	producer sarama.SyncProducer
}

type messageEnvelope struct {
	EventName string      `json:"eventName"`
	Payload   interface{} `json:"payload"`
}

func NewKafkaEventEmitterFromEnvironment() (msgqueue.EventEmitter, error) {
	brokers := []string{"localhost:9092"}

	if brokerList := os.Getenv("KAFKA_BROKERS"); brokerList != "" {
		brokers = strings.Split(brokerList, ",")
	}

	client := <-kafka.RetryConnect(brokers, 5*time.Second)
	return NewKafkaEventEmitter(client)
}

func NewKafkaEventEmitter(client sarama.Client) (msgqueue.EventEmitter, error) {
	producer, err := sarama.NewSyncProducerFromClient(client)
	if err != nil {
		return nil, err
	}

	emitter := kafkaEventEmitter{
		producer: producer,
	}

	return &emitter, nil
}

func (k *kafkaEventEmitter) Emit(evt msgqueue.Event) error {
	jsonBody, err := json.Marshal(messageEnvelope{
		evt.EventName(),
		evt,
	})
	if err != nil {
		return err
	}

	msg := &sarama.ProducerMessage{
		Topic: "events",
		Value: sarama.ByteEncoder(jsonBody),
	}

	log.Printf("published message with topic %s: %v", evt.EventName(), jsonBody)
	_, _, err = k.producer.SendMessage(msg)

	return err
}
