We are building an Event Sourcing framework built in TypeScript.

Code according to these conventions:

- Use expressions, over creating local variables when variables are only used once.
- Prefer functions like forEach, reduce and map instead of for and while loops when dealing with arrays.
- All event types are SHOUTING_SNAKE_CASE.
- All aggregate types are SHOUTING_SNAKE_CASE.
- All data for tests should use types or data from the example domain in ./src/test/airlineDomain.
