We are building an Event Sourcing framework built in TypeScript.

Code according to these conventions:

- Prefer expressions, over creating local variables when variables are only used once.
- Prefer functions like forEach, reduce and map instead of for and while loops when dealing with arrays.
- All event types and aggregate types are SHOUTING_SNAKE_CASE.
- All tests should lean on data from the example domain in ./test/airlineDomain.
- Never use the `any`, under any circumstances.
