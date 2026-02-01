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
    id                  BIGSERIAL PRIMARY KEY,
    "aggregateRootType" TEXT        NOT NULL,
    "aggregateRootId"   TEXT        NOT NULL,
    "stateVersion"      TEXT        NOT NULL,
    "aggregateVersion"  INT,
    "recordedAt"        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    state               JSONB       NOT NULL,
    CONSTRAINT "snapshotAccess" UNIQUE ("aggregateRootType", "aggregateRootId", "stateVersion")
);

CREATE TABLE event_core.cursor
(
    id       TEXT PRIMARY KEY,
    position BIGINT NOT NULL DEFAULT 0
);

CREATE TYPE event_core.command_queue_status AS ENUM ('pending', 'complete');

# @todo add an "issuedAt" column
CREATE TABLE event_core.command_queue
(
    id                  BIGSERIAL PRIMARY KEY,
    "aggregateRootType" TEXT                            NOT NULL,
    "aggregateRootId"   TEXT                            NOT NULL,
    "commandName"       TEXT                            NOT NULL,
    "commandData"       JSONB                           NOT NULL,
    "raisedEvents"      BIGINT[]                        NOT NULL DEFAULT '{}',
    attempts            INT4                            NOT NULL DEFAULT 0,
    status              event_core.command_queue_status NOT NULL DEFAULT 'pending'
);

CREATE INDEX idx_command_queue_pending
    ON event_core.command_queue (id) WHERE status = 'pending';
