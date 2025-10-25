import {FlightState} from "../state/FlightState.ts";
import {FlightEvent} from "../state/FlightEvent.ts";
import {withScheduledFlight} from "../util/withScheduledFlight.ts";

export const confirmLanding = withScheduledFlight('CONFIRM_LANDING', (_flight: FlightState): FlightEvent => {
  return {
    type: "FLIGHT_LANDED",
  };
});
