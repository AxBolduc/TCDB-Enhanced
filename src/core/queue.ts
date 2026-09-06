export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export class SerialQueue<T> {
  private items: T[] = [];
  private running = false;

  constructor(
    private readonly worker: (item: T) => Promise<void>,
    private readonly delayMs: number,
  ) {}

  push(item: T): void {
    this.items.push(item);
    void this.run();
  }

  private async run(): Promise<void> {
    if (this.running) return;
    this.running = true;

    while (this.items.length) {
      const item = this.items.shift();
      if (item) await this.worker(item);
      await sleep(this.delayMs);
    }

    this.running = false;
  }
}
