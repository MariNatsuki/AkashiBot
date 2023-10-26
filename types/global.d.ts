/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  type Awaitable<T> = PromiseLike<T> | T;
  type ResourcePath<T> = _ResourcePath<T> extends string | keyof T ? _ResourcePath<T> : keyof T;
  type _ResourcePath<T> = __ResourcePath<T, keyof T> | keyof T;
  type __ResourcePath<T, Key extends keyof T> = Key extends string
    ? T[Key] extends Record<string, any>
      ?
          | `${Key}.${__ResourcePath<T[Key], Exclude<keyof T[Key], keyof any[]>> & string}`
          | `${Key}.${Exclude<keyof T[Key], keyof any[]> & string}`
      : never
    : never;
  type PickupPaths<T extends object> = ResourcePath<T>;
  type PickupKeys<T extends Record<string, any>, K = keyof T> = K extends string
    ? ResourcePath<T[K]>
    : never;
  type IsEmptyObject<T> = [keyof T] extends [never] ? true : false;
  type IsNever<T> = [T] extends [never] ? true : false;
}

export {};
