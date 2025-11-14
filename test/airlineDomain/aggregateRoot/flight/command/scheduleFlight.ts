import type { FlightEvent, FlightState } from "../aggregateRoot.ts";

export function scheduleFlight(
  flight: FlightState,
  { departureTime, sellableSeats }: {
    departureTime: Date;
    sellableSeats: number;
  },
): FlightEvent {
  if (flight.status !== "NOT_YET_SCHEDULED") {
    return {
      type: "FLIGHT_SCHEDULING_FAILED",
      reason: "FLIGHT_ALREADY_SCHEDULED",
    };
  }
  return {
    type: "FLIGHT_SCHEDULED",
    sellableSeats,
    departureTime,
  };
}
