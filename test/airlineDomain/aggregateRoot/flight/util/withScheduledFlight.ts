import { FlightState, ScheduledFlightState } from "../state/FlightState.ts";
import { FlightEvent } from "../state/FlightEvent.ts";

type CommandThatHandlesScheduledFlights = (
  flight: ScheduledFlightState,
  data: never,
) => FlightEvent | FlightEvent[];

type DecoratedCommand<TCommandFunc extends CommandThatHandlesScheduledFlights> = (
  flight: FlightState,
  data: Parameters<TCommandFunc>[1],
) => ReturnType<TCommandFunc>;

/**
 * A higher order function which wraps commands, and returns failure events if a flight
 * has not yet been scheduled.
 *
 * This is useful because it is a key assumption of a number of different commands within
 * the domain.
 */
export function withScheduledFlight<TCommandFunc extends CommandThatHandlesScheduledFlights>(
  commandName: string,
  command: TCommandFunc,
): DecoratedCommand<TCommandFunc> {
  return ((state: Parameters<TCommandFunc>[0], data: Parameters<TCommandFunc>[1]) => {
    if (state === undefined) {
      return {
        type: "COMMAND_FAILED",
        commandName,
        reason: "FLIGHT_NOT_YET_SCHEDULED",
      };
    }
    return command(state, data);
  }) as DecoratedCommand<TCommandFunc>;
}
