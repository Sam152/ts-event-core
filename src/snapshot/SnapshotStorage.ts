export type SnapshotStorage = {
  retrieve: (aggregateId: string) => void;
};
