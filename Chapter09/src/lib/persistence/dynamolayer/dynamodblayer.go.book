package dynamolayer

import (
	"errors"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/dynamodb"
	"github.com/aws/aws-sdk-go/service/dynamodb/dynamodbattribute"
	"github.com/minamartinteam/cloudnativego-backend/src/lib/persistence"
)

type DynamoDBLayer struct {
	service *dynamodb.DynamoDB
}

func NewDynamoDBLayerByRegion(region string) (persistence.DatabaseHandler, error) {
	sess, err := session.NewSession(&aws.Config{
		Region: aws.String(region),
	})
	if err != nil {
		return nil, err
	}
	return &DynamoDBLayer{
		service: dynamodb.New(sess),
	}, nil
}

func NewDynamoDBLayerBySession(sess *session.Session) persistence.DatabaseHandler {
	return &DynamoDBLayer{
		service: dynamodb.New(sess),
	}
}

func (dynamoLayer *DynamoDBLayer) AddEvent(event persistence.Event) ([]byte, error) {
	av, err := dynamodbattribute.MarshalMap(event)
	if err != nil {
		return nil, err
	}
	_, err = dynamoLayer.service.PutItem(&dynamodb.PutItemInput{
		TableName: aws.String(EVENTS),
		Item:      av,
	})
	if err != nil {
		return nil, err
	}
	return []byte(event.ID), nil
}

func (dynamoLayer *DynamoDBLayer) FindEvent(id []byte) (persistence.Event, error) {
	//create a GetItemInput object with the information we need to search for our event via it's ID attribute
	input := &dynamodb.GetItemInput{
		Key: map[string]*dynamodb.AttributeValue{
			"ID": {
				B: id,
			},
		},
		TableName: aws.String("events"),
	}
	//Get the item via the GetItem method
	result, err := dynamoLayer.service.GetItem(input)
	if err != nil {
		return persistence.Event{}, err
	}
	//Utilize dynamodbattribute.UnmarshalMap to unmarshal the data retrieved into an Event object
	event := persistence.Event{}
	err = dynamodbattribute.UnmarshalMap(result.Item, &event)
	return event, err
}

func (dynamoLayer *DynamoDBLayer) FindEventByName(name string) (persistence.Event, error) {
	//Create the QueryInput type with the information we need to execute the query
	input := &dynamodb.QueryInput{
		KeyConditionExpression: aws.String("EventName = :n"),
		ExpressionAttributeValues: map[string]*dynamodb.AttributeValue{
			":n": {
				S: aws.String(name),
			},
		},
		IndexName: aws.String("EventName-index"),
		TableName: aws.String("events"),
	}
	// Execute the query
	result, err := dynamoLayer.service.Query(input)
	if err != nil {
		return persistence.Event{}, err
	}
	//Obtain the first item from the result
	event := persistence.Event{}
	if len(result.Items) > 0 {
		err = dynamodbattribute.UnmarshalMap(result.Items[0], &event)
	} else {
		err = errors.New("No results found")
	}
	return event, err
}

func (dynamoLayer *DynamoDBLayer) FindAllAvailableEvents() ([]persistence.Event, error) {
	// Create the ScanInput object with the table name
	input := &dynamodb.ScanInput{
		TableName: aws.String("events"),
	}
	// Perform the scan operation
	result, err := dynamoLayer.service.Scan(input)
	if err != nil {
		return nil, err
	}
	// Obtain the results via the unmarshalListofMaps funciton
	events := []persistence.Event{}
	err = dynamodbattribute.UnmarshalListOfMaps(result.Items, &events)
	return events, err
}
