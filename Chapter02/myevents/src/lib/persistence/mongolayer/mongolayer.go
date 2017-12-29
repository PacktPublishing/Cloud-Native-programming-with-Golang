package mongolayer

import (
	"github.com/PacktPublishing/Cloud-Native-programming-with-Golang/chapter02/myevents/src/lib/persistence"

	mgo "gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"
)

const (
	DB     = "myevents"
	USERS  = "users"
	EVENTS = "events"
)

type MongoDBLayer struct {
	session *mgo.Session
}

func NewMongoDBLayer(connection string) (persistence.DatabaseHandler, error) {
	s, err := mgo.Dial(connection)
	return &MongoDBLayer{
		session: s,
	}, err
}

func (mgoLayer *MongoDBLayer) AddEvent(e persistence.Event) ([]byte, error) {
	s := mgoLayer.getFreshSession()
	defer s.Close()

	if !e.ID.Valid() {
		e.ID = bson.NewObjectId()
	}

	if !e.Location.ID.Valid() {
		e.Location.ID = bson.NewObjectId()
	}

	return []byte(e.ID), s.DB(DB).C(EVENTS).Insert(e)
}

func (mgoLayer *MongoDBLayer) FindEvent(id []byte) (persistence.Event, error) {
	s := mgoLayer.getFreshSession()
	defer s.Close()
	e := persistence.Event{}

	err := s.DB(DB).C(EVENTS).FindId(bson.ObjectId(id)).One(&e)
	return e, err
}

func (mgoLayer *MongoDBLayer) FindEventByName(name string) (persistence.Event, error) {
	s := mgoLayer.getFreshSession()
	defer s.Close()
	e := persistence.Event{}
	err := s.DB(DB).C(EVENTS).Find(bson.M{"name": name}).One(&e)
	return e, err
}

func (mgoLayer *MongoDBLayer) FindAllAvailableEvents() ([]persistence.Event, error) {
	s := mgoLayer.getFreshSession()
	defer s.Close()
	events := []persistence.Event{}
	err := s.DB(DB).C(EVENTS).Find(nil).All(&events)
	return events, err
}

func (mgoLayer *MongoDBLayer) getFreshSession() *mgo.Session {
	return mgoLayer.session.Copy()
}
