import { ScheduledFlightState } from "../state/FlightState.ts";
import { FlightEvent } from "../state/FlightEvent.ts";
import { withScheduledFlight } from "../util/withScheduledFlight.ts";

export const registerPassengerBoarded = withScheduledFlight("REGISTER_PASSENGER_BOARDED", (
  flight: ScheduledFlightState,
  data: { passengerName: string; passportNumber: string },
): FlightEvent => {
  if (flight.status === "IN_THE_AIR") {
    return {
      type: "REGISTER_PASSENGER_BOARDED_FAILED",
      reason: "PLANE_ALREADY_IN_THE_AIR",
    };
  }

  return {
    type: "PASSENGER_BOARDED",
    passengerName: data.passengerName,
    passportNumber: data.passportNumber,
  };
});
