import { CommandIssuer } from "../../../command/CommandIssuer.ts";
import { airlineAggregates, AirlineEvent } from "../aggregates/airlineAggregates.ts";

export async function boardingProcessManager(
  event: AirlineEvent,
  issueCommand: CommandIssuer<typeof airlineAggregates>,
) {
  if (event.payload.type === "BOARDING_PASS_SCANNED") {
    await issueCommand({
      aggregateType: "PLANE",
      command: "confirmPassengerBoarding",
      aggregateId: "",
      data: {
        passengerName: event.payload.passengerName,
        passportNumber: event.payload.passportNumber,
      },
    });
  }
}
