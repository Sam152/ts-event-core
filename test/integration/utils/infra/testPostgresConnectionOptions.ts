import type { Options } from "postgres";

export const testPostgresConnectionOptions: Options<never> = {
  host: "127.0.0.1",
  user: "postgres",
  pass: "ts-event-core",
  port: 28940,
  database: "postgres",
  connect_timeout: 10000,
};
