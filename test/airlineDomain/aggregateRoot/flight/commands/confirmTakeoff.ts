import {ScheduledFlightState} from "../state/FlightState.ts";
import {FlightEvent} from "../state/FlightEvent.ts";
import {withScheduledFlight} from "../util/withScheduledFlight.ts";

export const confirmTakeoff = withScheduledFlight("CONFIRM_TAKEOFF", (
  flight: ScheduledFlightState,
): FlightEvent => {
  if (flight.status !== "ON_THE_GROUND") {
    return {
      type: "CONFIRM_TAKEOFF_FAILED",
      reason: "FLIGHT_ALREADY_IN_THE_AIR",
    };
  }
  return {
    type: "FLIGHT_DEPARTED",
  };
});
