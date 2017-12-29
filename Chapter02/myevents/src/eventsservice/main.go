package main

import (
	"flag"
	"fmt"
	"log"

	"github.com/PacktPublishing/Cloud-Native-programming-with-Golang/chapter02/myevents/src/eventsservice/rest"
	"github.com/PacktPublishing/Cloud-Native-programming-with-Golang/chapter02/myevents/src/lib/configuration"
	"github.com/PacktPublishing/Cloud-Native-programming-with-Golang/chapter02/myevents/src/lib/persistence/dblayer"
)

func main() {

	confPath := flag.String("conf", `.\configuration\config.json`, "flag to set the path to the configuration json file")
	flag.Parse()
	//extract configuration
	config, _ := configuration.ExtractConfiguration(*confPath)

	fmt.Println("Connecting to database")
	dbhandler, _ := dblayer.NewPersistenceLayer(config.Databasetype, config.DBConnection)
	//RESTful API start
	log.Fatal(rest.ServeAPI(config.RestfulEndpoint, dbhandler))
}
