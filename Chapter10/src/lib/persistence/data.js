//users
{
    _id: 32323232,
   firstname: "Jack",
   lastname:"Kal",
   Age: 36,
   Bookings: [{
        date: 73246872364, //maybe use native datetime type?
        eventid: 9324324324,
        seats: 4
   },{
        date: 73246872364,
        eventid: 9324324324,
        seats: 4
   }]
}

//events
{
    _id:323243432,
    name: "opera aida",
    startdate: 768346784368,
    enddate: 43988943,
    duration: 120, //in minutes
    location:{
        id : 3 , //=>assign as an index
        name: "West Street Opera House",
        address: "11 west street, AZ 73646",
        country: "U.S.A",
        opentime: 7,
        clostime: 20
        Hall: {
            name : "Cesar hall",
            location : "second floor, room 2210",
            capacity: 10
        }
    }
}