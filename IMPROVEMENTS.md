# Improvements

**Author:** Thomas Pearson
**Role:** Software eng
**Time taken:** <Let us know how many hours and minutes you spent on this task, including writing your improvements>

<Write about your suggested improvements here. Remember, software engineering is about communicating with people more than it is about writing instructions for machines>


## Path to production process

- Add CI lint -> format -> build -> unit tests -> e2e tests -> Code Coverage -> static analysis & security vulnerabilities
- SonarCloud static analysis
- Set up protection on the main branch
- Require PR's that include reviews from other github owners before merging to `main`
- Enforce CI steps all pass on a PR before merging
- Once merged or merged and tagged trigger a release workflow

## Build

- Consider using ESM, Node now has built-in support 🎉
- Upgrade node 16, as it won't be maintained for much longer as it's at End of Life.
- Depends on the stack but could still consider adding a Dockerfile to avoid "It works on my machine" scenarios.

## Documentation

- Add Swagger API Docs
- Consider using JS Docs & Hosting them internally for engineers

## Logging & Metrics

- Make use of the structured logging more
- Include a meta tag for endpoint that replaces the id's within the request url
- We have a `requestId` later down the line we might want to add a correlation id or `X-Correlation-ID` header to correlate multiple requests across a range of services handy in a microservice setting
- Add metrics
  - Could use a service like Grafana, to collect and visualize metrics
  - Could include system metrics CPU, Memory, ..
  - Could include custom metrics, like latency on external providers or carrier API's
- Add alerts
  - Could be tied or built of defined metrics
  - Poll the /healthz, include a liveness & readiness check

## Security

- HTTPS
- Content-Security Policy -> just used the default security headers but these could be reviewed
- WAF

## API Design

- Endpoint versioning, would make it easier to migrate consumers if any breaking changes are introduced.
- User/Client Authentication on endpoints, with maybe JWT Bearer authentication
  - Could use a service like Auth0
- Probably don't need to include the 'outcome' in the response
- Could make 'NO_MATCHING_QUOTE' a 404 over a 400 as it's not a syntax error.

## Design

- It would be nice to have a layer of separation between the server requests and responses where it is mapped to and from the domain entities.
  - For example we probably don't need the 'outcome' from a deriver included in the API response

- Repositories throw errors, it would be nice to keep the result pattern consistent
  - This is partly to make it easier to deal with async errors
  - Could implement a handler for this or use a third party lib like 'neverthrow'
  - It is unexpected that it should fail, due to the controller & deriver checks

- File naming conventions across the project are sometimes inconsistent for example 'getOrders.controller.ts' vs 'ordersRepo.ts'.

- There are a lot of string types this could become an issue when refactoring.
  - We could consider pre-appending a type name to the string to make the outcome somewhat unique.
  - Another option would be string enums but there are a few issues with them such as performance and dev's may forget to assign a string.
  - Could use a constant object instead.

## Persistance Design

It would be good to add an actual persistance layer, could use a Docker image to host the DB for local development.

Using a separate image makes it easy to tear down and re-run migrations for tests to get a clean state.

Quotes & bookings should have their own identifier in case so it can fetched individually. i.e `/order/:id/quote/:id`

For example quotes use the 'carrier' as an identifier but it is probably not unique enough as, later down the line, you might want to get multiple quotes from the same carrier.

Depending on DB used Object vs Relation:

- Relational DB -> We should separate out Bookings and Quotes into their own tables.
- NoSQL DB -> We could use a combination of Denormalization & Normalization where the necessary data is stored in-line along with an identifier to the full object. This would be on a case by case basis.

# Tests

- Tests are a bit hard to follow as they rely on order of execution, this means test can't be run in isolation.
- API tests aren't asserting fully e2e it would be great to assert the persistance layer here.
- Include code coverage as part of test output.
- Add some more validation tests, just to double check the request schemas.
- Add tests for controllers.


