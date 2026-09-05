import type { FullResult, Reporter, TestCase, TestResult } from '@playwright/test/reporter';

/**
 * Minimal custom reporter: after the run, print the slowest tests and a
 * pass/fail/flaky tally. Cheap signal for spotting a test that is quietly
 * getting slower before it becomes a timeout. Registered alongside (not
 * instead of) the HTML and Allure reporters.
 */
export default class SlowestTestsReporter implements Reporter {
  private readonly durations: Array<{ title: string; ms: number; status: string }> = [];
  private flaky = 0;

  onTestEnd(test: TestCase, result: TestResult): void {
    this.durations.push({
      title: test.titlePath().slice(2).join(' › '),
      ms: result.duration,
      status: result.status,
    });
    if (result.status === 'passed' && result.retry > 0) this.flaky += 1;
  }

  onEnd(result: FullResult): void {
    if (this.durations.length === 0) return;

    const top = [...this.durations].sort((a, b) => b.ms - a.ms).slice(0, 5);
    const total = this.durations.reduce((sum, d) => sum + d.ms, 0);

    console.log(
      [
        '',
        `Run: ${result.status}  ·  ${this.durations.length} tests  ·  ${Math.round(total / 1000)}s total  ·  ${this.flaky} flaky`,
        'Slowest:',
        ...top.map((d) => `  ${(d.ms / 1000).toFixed(1)}s  ${d.title}`),
        '',
      ].join('\n'),
    );
  }
}
