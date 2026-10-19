/** A line being typed out: letters appear one by one into `said` while the rest waits, invisible, in `unsaid` (so the box keeps its final size). */
export interface Typing {
  /** Shows the whole line at once and calls `then`. */
  skip(): void;
  /** Stops without finishing. */
  cancel(): void;
}

export function typeLine(said: HTMLElement, unsaid: HTMLElement, text: string, gapMs: number, then: () => void): Typing {
  const letters = [...text];
  let n = 0;
  let timer: number | undefined;
  const show = (upTo: number): void => {
    said.textContent = letters.slice(0, upTo).join('');
    unsaid.textContent = letters.slice(upTo).join('');
  };
  const cancel = (): void => {
    clearInterval(timer);
    timer = undefined;
  };
  const skip = (): void => {
    if (timer === undefined && n >= letters.length) return;
    cancel();
    n = letters.length;
    show(n);
    then();
  };
  show(0);
  timer = window.setInterval(() => {
    show(++n);
    if (n >= letters.length) skip();
  }, gapMs);
  return { skip, cancel };
}
