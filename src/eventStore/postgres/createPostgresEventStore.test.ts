import { beforeAll, describe, it } from "jsr:@std/testing/bdd";
import { startTestContainers } from "../../../test/utils/startTestContainers.ts";

describe("createPostgresEventStore", () => {
  beforeAll(startTestContainers);

  it("does a thing", async () => {
    // Foo
  });
});
