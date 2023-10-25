declare global {
  type Awaitable<T> = PromiseLike<T> | T;
}
