package main

import (
	"flag"
	"fmt"
	"gocloudprogramming/chapter2/myevents/src/eventsservice/rest"
	"gocloudprogramming/chapter2/myevents/src/lib/configuration"
	"gocloudprogramming/chapter2/myevents/src/lib/persistence/dblayer"
	"log"
)

func main() {

	confPath := flag.String("conf", `.\configuration\config.json`, "flag to set the path to the configuration json file")
	flag.Parse()
	//extract configuration
	config, _ := configuration.ExtractConfiguration(*confPath)

	fmt.Println("Connecting to database")
	dbhandler, _ := dblayer.NewPersistenceLayer(config.Databasetype, config.DBConnection)
	//RESTful API start
	log.Println(rest.ServeAPI(config.RestfulEndpoint, dbhandler))
}
