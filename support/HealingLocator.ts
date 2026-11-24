import { test, type Locator } from '@playwright/test';

/**
 * Self-healing locator: a primary locator plus fallbacks, tried in order.
 *
 * The primary locator describes the element the way a user sees it (role and name). When the UI
 * changes and it no longer matches, a fallback (for example a stable id) still finds the element,
 * and the test goes on instead of failing on a locator.
 *
 * Healing is never silent: every use of a fallback is added to the test as a "self-healing"
 * annotation (visible in the HTML report) and printed as a warning, so somebody updates the
 * primary locator. A healed locator may also hide a real change in the application, which is why
 * it has to be reviewed. Set SELF_HEALING=off to use only primary locators and fail instead.
 *
 * Playwright's built-in alternative is `primary.or(fallback)`: it waits for either locator,
 * but does not tell which one matched, so it cannot report the healing.
 */
export class HealingLocator {
  private readonly name: string;
  private readonly candidates: [Locator, ...Locator[]];

  constructor(name: string, primary: Locator, ...fallbacks: Locator[]) {
    this.name = name;
    this.candidates = [primary, ...fallbacks];
  }

  /** Waits until one of the locators finds the element and returns the first one that does. */
  async resolve(): Promise<Locator> {
    const [primary, ...fallbacks] = this.candidates;
    if (process.env.SELF_HEALING === 'off' || fallbacks.length === 0) {
      return primary;
    }

    // One wait for "any candidate" (auto-waiting, up to the action timeout)...
    const anyCandidate = fallbacks.reduce((union, fallback) => union.or(fallback), primary);
    await anyCandidate.first().waitFor();

    // ...then the candidates are checked in order, so the primary locator always wins when it works
    for (const [index, candidate] of this.candidates.entries()) {
      if ((await candidate.count()) > 0) {
        if (index > 0) {
          this.report(primary, candidate);
        }
        return candidate;
      }
    }
    return primary; // the element disappeared in the meantime: let the action fail on the primary locator
  }

  async click(): Promise<void> {
    await (await this.resolve()).click();
  }

  async fill(value: string): Promise<void> {
    await (await this.resolve()).fill(value);
  }

  private report(primary: Locator, used: Locator): void {
    const description = `"${this.name}": primary locator ${String(primary)} found nothing, healed with ${String(used)}`;
    test.info().annotations.push({ type: 'self-healing', description });
    console.warn(`[self-healing] ${description}`);
  }
}
