function createTracer<T extends object>(obj: T) {
  const calls: any[] = [];
  const proxy = new Proxy(obj, {
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver);
      if (typeof value === "function") {
        return (...args: any[]) => {
          calls.push({ name: String(prop), args });
          return value.apply(target, args);
        };
      }
      return value;
    },
  });
  return { proxy, calls };
}
