package amqp

import (
	"github.com/streadway/amqp"
	"log"
	"time"
)

// RetryConnect implements a retry mechanism for establishing the AMQP connection.
// This is necessary in container environments where individual components may be
// started out-of-order, so we might have to wait for upstream services like RabbitMQ
// to actually become available.
//
// Alternatives:
//   - use an entrypoint script in your container in which you wait for the service
//     to be available [1]
//   - use a script like wait-for-it [2] in your entrypoint
//
// [1] http://stackoverflow.com/q/25503412/1995300
// [1] https://github.com/vishnubob/wait-for-it/blob/master/wait-for-it.sh
func RetryConnect(amqpURL string, retryInterval time.Duration) chan *amqp.Connection {
	result := make(chan *amqp.Connection)

	go func() {
		defer close(result)
		for {
			conn, err := amqp.Dial(amqpURL)
			if err == nil {
				log.Println("connection successfully established")
				result <- conn
				return
			}

			log.Printf("AMQP connection failed with error (retrying in %s): %s", retryInterval.String(), err)
			time.Sleep(retryInterval)
		}
	}()

	return result
}
