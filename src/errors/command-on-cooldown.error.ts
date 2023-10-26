export class CommandOnCooldownError extends Error {
  constructor(
    public readonly command: string,
    public readonly timeLeft: number,
  ) {
    super();
  }
}
