import {FlightState} from "../state/FlightState.ts";
import {FlightEvent} from "../state/FlightEvent.ts";
import {withScheduledFlight} from "../util/withScheduledFlight.ts";

export const registerPassengerOnBoard = withScheduledFlight('REGISTER_PASSENGER_ONBOARD', (
  flight: FlightState,
  data: { passengerName: string; passportNumber: string },
): FlightEvent => {
  return {
    type: "PASSENGER_BOARDED",
    passengerName: data.passengerName,
    passportNumber: data.passportNumber,
  };
});
