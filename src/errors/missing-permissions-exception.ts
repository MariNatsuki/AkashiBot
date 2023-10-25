export class MissingPermissionsException {
  constructor(
    public permissions: string[],
    public message: string = 'You are missing permissions:',
  ) {}

  public toString() {
    return `${this.message} ${this.permissions.join(', ')}`;
  }
}
