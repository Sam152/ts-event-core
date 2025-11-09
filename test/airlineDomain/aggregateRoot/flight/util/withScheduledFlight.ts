import { FlightEvent, FlightState } from "../aggregateRoot.ts";

export type ScheduledFlightState = Extract<FlightState, { status: "SCHEDULED" }>;

/**
 * A higher order function that wraps flight commands and asserts they are scheduled
 */
export function withScheduledFlight<TCommandFunc extends CommandThatHandlesScheduledFlights>(
  failureEventName: Extract<FlightEvent, { reason: string }>["type"],
  command: TCommandFunc,
): DecoratedCommand<TCommandFunc> {
  return ((state: FlightState, data: Parameters<TCommandFunc>[1]) => {
    if (state.status === "NOT_YET_SCHEDULED") {
      return {
        type: failureEventName,
        reason: "FLIGHT_NOT_YET_SCHEDULED",
      };
    }
    return command(state, data);
  }) as DecoratedCommand<TCommandFunc>;
}

type CommandThatHandlesScheduledFlights = (
  flight: ScheduledFlightState,
  data: never,
) => FlightEvent | FlightEvent[];

type DecoratedCommand<TCommandFunc extends CommandThatHandlesScheduledFlights> = (
  flight: FlightState,
  data: Parameters<TCommandFunc>[1],
) => ReturnType<TCommandFunc>;
