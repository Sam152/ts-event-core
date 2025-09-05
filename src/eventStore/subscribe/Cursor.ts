export type Cursor = {
  position: () => Promise<number>;
  update: (position: number) => Promise<void>;
};
