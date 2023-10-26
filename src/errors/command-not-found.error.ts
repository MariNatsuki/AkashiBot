export class CommandNotFoundError extends Error {
  constructor(public readonly command: string) {
    super();
  }
}
