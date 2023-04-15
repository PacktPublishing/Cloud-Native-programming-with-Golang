## Start Mongo
### Setup Local Mongo
See installation instructions here: https://docs.mongodb.com/manual/installation/#tutorials

### Or, Start a mongo image using Docker
* Install Docker. See instrcutions here: https://docs.docker.com/
* Run following command:
```docker run -p 27017:27017 --name nativegomongo -d mongo```
It should start a mongo instance on your machine. 
* On success, you can connect to mongo server at `0.0.0.0:27017`. Alternatively, to test, you can use MongoDB UI Client such as Robo 3T https://robomongo.org/

## Build and Run
* Use `go build` to build source-code of chapter02
* Run the application 

## Test using `curl`

### Create New Event
You can create a New Event:
```
curl -X POST http://localhost:8181/events -H "Content-Type: application/json" -d "@post_body.json"
```
You should see output such as `{"id":5a65f3261d3ea32e67d5cf46}`

### Find All Events
```
curl --request GET http://localhost:8181/events
```

