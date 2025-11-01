import { PassengerState } from "../aggregateRoot.ts";

export function notifyOfFlightDelay(
  passenger: PassengerState,
  data: { flightNumber: string; delayedByMinutes: number },
) {
  return [];
}
