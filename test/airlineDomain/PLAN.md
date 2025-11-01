// Flight: Schedule flight
//  - plane model
//  - sellable seats
//  - flight number
//  - flight number

// Flight: Purchase ticket
// - Purchase price aud
// - Passenger account ID
// - Ticket number
// - Adds passenger to manifest

// On: TICKET_PURCHASED
// Passenger: addTicketToAccount

// Passenger: addNotificationPreferences
//  - Can be notified by email or phone

// Flight: delayFlight
//  - Amount delayed by
//  - New scheduled time

// On: FLIGHT_DELAYED
// Passenger: notifyOfFlightDelay

// Flight commands:
// - scheduleFlight
// - purchaseTicket
// - delayFlight

// Passenger commands:
// - addTicketToAccount
// - addNotificationPreferences
// - notifyOfFlightDelay
