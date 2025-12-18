export class Redis {
  constructor(_: { url: string; token: string }) {}
  get(_key: string): Promise<string | null> {
    return Promise.resolve(null);
  }
  set(_key: string, _value: string): Promise<void> {
    return Promise.resolve();
  }
}
