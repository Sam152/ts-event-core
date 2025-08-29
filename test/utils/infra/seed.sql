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
    "aggregateRootStateVersion" TEXT        NOT NULL,
    "aggregateVersion"          INT,
    "recordedAt"                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    state                       JSONB       NOT NULL,
    CONSTRAINT "snapshotAccess" UNIQUE ("aggregateRootType", "aggregateRootId", "aggregateRootStateVersion")
);
