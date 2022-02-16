var express = require("express");
var { graphqlHTTP } = require("express-graphql");
var { buildSchema } = require("graphql");
const cors = require("cors");

const fs = require("fs");
const path = require("path");

let rawdata = fs.readFileSync(path.resolve(__dirname, "mock.json"));
let klmMock = JSON.parse(rawdata);

// Construct a schema, using GraphQL schema language
var schema = buildSchema(`
  type Query {
    passengers(id: Int): Passengers
    retrieveBooking(bookingCode: String!, lastName: String!):RetrieveBooking
  }

  type PassangerTitle {
    code: String
    name: String
  }

  type Passengers {
   
    bookingCode: String
    id: Int
    firstName: String
    lastName: String
    title: PassangerTitle
    
  }

  type ContactDetails{
    class: String
    address: String
  }
  
  type Country{
    code: String
    name: String
  }

  type City {
    IATACode: String
    name: String
    country: Country
  }

  type Origin{
    IATACode: String
    name: String
    city: City
  }

  type SellingClass {
    code: String
  }

  type ArrivalTerminal {
    name : String
  }

  type OperatingFlight {
    number: String
    carrier: Country
    duration: String
    flown: Boolean
    checkInStart: String
    localCheckInStart: String
    checkInEnd: String
    localCheckInEnd: String
    scheduledArrival: String
    localScheduledArrival: String
    scheduledDeparture: String
    localScheduledDeparture: String
    arrivalTerminal: ArrivalTerminal
    cabin: Country
    equipment: Country
  }

  type MarketingFlight {
    number: String
    carrier: Country
    status: Country
    numberOfStops: Int
    sellingClass: SellingClass
    operatingFlight: OperatingFlight

  }

  type Segments {
    id: Int
    type: String
    informational: Boolean
    departFrom: Origin
    arriveOn: Origin
    marketingFlight: MarketingFlight
  }

  type Connections{
    id: Int
    duration: String
    origin: Origin
    destination: Origin
    segments: [Segments]
  }

  type Itinerary {
    type: String
    connections:[Connections]
  }

  type RetrieveBooking {
    
    bookingCode: String
    contactDetails: [ContactDetails]
    itinerary: Itinerary
    passengers: Passengers
    
  }
`);

const getPassangers = (args) => {
  if (args.id) {
    const passangerId = args.id;
    return klmMock
      .filter((passanger) => passanger.passengers.id === passangerId)
      .map((item) => item.passengers)[0];
  } else {
    return [];
  }
};

const getRetrieveBooking = (args) => {
  if (args.bookingCode && args.lastName) {
    bookingCode = args.bookingCode;
    passangerLastName = args.lastName;
    const filteredData = klmMock.filter(
      (details) =>
        details.bookingCode === bookingCode &&
        details.passengers.lastName === passangerLastName
    )[0];
    return filteredData;
  } else {
    return {
      error: [
        {
          statusCode: 403,
          message: "There is no record with this credentials",
        },
      ],
      data: null,
    };
  }
};



// The root provides a resolver function for each API endpoint
var root = {
  passengers: getPassangers,
  retrieveBooking: getRetrieveBooking,
};

var app = express().use(cors());
app.use(
  "/graphql",
  graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true,
  })
);
app.listen(4000);
console.log("Running a GraphQL API server at http://localhost:4000/graphql");
