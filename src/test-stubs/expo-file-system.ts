export class File {
  readonly uri: string;
  size: number | null = 1024 * 1024;
  exists = true;

  constructor(...chemins: (string | { uri: string })[]) {
    const premier = chemins[0];
    this.uri = typeof premier === 'string' ? premier : (premier?.uri ?? '');
  }
}
