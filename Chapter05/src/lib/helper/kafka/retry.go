package kafka

import (
	"github.com/Shopify/sarama"
	"log"
	"time"
)

// RetryConnect implements a retry mechanism for establishing the Kafka connection.
// This is necessary in container environments where individual components may be
// started out-of-order, so we might have to wait for upstream services like Kafka
// to actually become available.
//
// Alternatives:
//   - use an entrypoint script in your container in which you wait for the service
//     to be available [1]
//   - use a script like wait-for-it [2] in your entrypoint
//
// [1] http://stackoverflow.com/q/25503412/1995300
// [1] https://github.com/vishnubob/wait-for-it/blob/master/wait-for-it.sh
func RetryConnect(brokers []string, retryInterval time.Duration) chan sarama.Client {
	result := make(chan sarama.Client)

	go func() {
		defer close(result)
		for {
			config := sarama.NewConfig()
			conn, err := sarama.NewClient(brokers, config)
			if err == nil {
				log.Println("connection successfully established")
				result <- conn
				return
			}

			log.Printf("Kafka connection failed with error (retrying in %s): %s", retryInterval.String(), err)
			time.Sleep(retryInterval)
		}
	}()

	return result
}
