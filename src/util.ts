export const pipe = <T>(...fns: Array<(n: T) => T>) => (t: T): T =>
  fns.reduce((v, f) => f(v), t);
