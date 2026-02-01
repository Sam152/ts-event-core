CREATE SCHEMA event_core;

CREATE TABLE event_core.events
(
    id                  BIGSERIAL PRIMARY KEY,
    "aggregateRootType" TEXT        NOT NULL,
    "aggregateRootId"   TEXT        NOT NULL,
    "aggregateVersion"  INT         NOT NULL,
    "recordedAt"        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    payload             JSONB       NOT NULL,

    CONSTRAINT "aggregateIntegrity"
        UNIQUE ("aggregateRootType", "aggregateRootId", "aggregateVersion")
);

CREATE TABLE event_core.snapshots
(
    id                          BIGSERIAL PRIMARY KEY,
    "aggregateRootType"         TEXT        NOT NULL,
    "aggregateRootId"           TEXT        NOT NULL,
    "stateVersion"              TEXT        NOT NULL,
    "aggregateVersion"          INT,
    "recordedAt"                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    state                       JSONB       NOT NULL,
    CONSTRAINT "snapshotAccess" UNIQUE ("aggregateRootType", "aggregateRootId", "stateVersion")
);

CREATE TABLE event_core.cursor
(
    id       TEXT   PRIMARY KEY,
    position BIGINT NOT NULL DEFAULT 0
);

# @todo - write a schema for event_core.command_queue, it should have the following features:
# - A big serial ID
# - A "data" column
# - A "raisedEvents" biginit array column
# - A status enum column, with "pending" or "complete"
# - A partial index on all "pending" commands
# - An aggregateRootId TEXT column
# - An aggregateRootType TEXT column
