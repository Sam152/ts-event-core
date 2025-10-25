import {ScheduledFlightState} from "../state/FlightState.ts";
import {FlightEvent} from "../state/FlightEvent.ts";
import {withScheduledFlight} from "../util/withScheduledFlight.ts";

export const confirmLanding = withScheduledFlight("CONFIRM_LANDING", (flight: ScheduledFlightState): FlightEvent => {
  if (flight.status !== "IN_THE_AIR") {
    return {
      type: 'CONFIRM_LANDING_FAILED',
      reason: "FLIGHT_ALREADY_IN_THE_AIR",
    };
  }
  return {
    type: "FLIGHT_LANDED",
  };
});
