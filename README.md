# Cloud native programming with Golang
This is the code repository for [Cloud-Native-programming-with-Golang](https://www.packtpub.com/application-development/cloud-native-programming-golang?utm_source=github&utm_medium=repository&utm_campaign=9781787125988), published by [Packt](https://www.packtpub.com/). It contains all the supporting project files necessary to work through the book from start to finish.
## About the Book
Cloud computing and microservices are two very important concepts in modern software architecture. They represent key skills that ambitious software engineers need to acquire in order to design and build software applications capable of performing and scaling. Go is a modern cross-platform programming language that is very powerful yet simple; it is an excellent choice for microservices and cloud applications. Go is gaining more and more popularity, and becoming a very attractive skill.
### Instructions and Navigations
All of the codes are organized as per the chapters, each folder has the codes related to that chapter or appendix. Some parts of the code are dependant on the [frontend](https://github.com/martin-helmich/cloudnativego-frontend) and [backend](https://github.com/martin-helmich/cloudnativego-backend) repository.                  

For example: Cloud-Native-programming-with-Golang/Chapter04/src/bookingservice/main.go
The code will look like the following:
```
import (
	"flag"

	"github.com/Shopify/sarama"
	"github.com/martin-helmich/cloudnativego-backend/src/bookingservice/listener"
	"github.com/martin-helmich/cloudnativego-backend/src/bookingservice/rest"
	"github.com/martin-helmich/cloudnativego-backend/src/lib/configuration"
	"github.com/martin-helmich/cloudnativego-backend/src/lib/msgqueue"
	msgqueue_amqp "github.com/martin-helmich/cloudnativego-backend/src/lib/msgqueue/amqp"
	"github.com/martin-helmich/cloudnativego-backend/src/lib/msgqueue/kafka"
	"github.com/martin-helmich/cloudnativego-backend/src/lib/persistence/dblayer"
	"github.com/streadway/amqp"
)
```

## Related Products
 
  
* [Modern Golang Programming [Video]](https://www.packtpub.com/web-development/modern-golang-programming-video?utm_source=github&utm_medium=repository&utm_campaign=9781787125254)

  

