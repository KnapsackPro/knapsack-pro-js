import type {
  FullConfig,
  FullResult,
  Suite,
  TestCase,
  TestError,
  TestResult,
  TestStep,
} from '@playwright/test/reporter';

export interface ReporterV2 {
  onConfigure?(config: FullConfig): void;
  onBegin?(suite: Suite): void;
  onTestBegin?(test: TestCase, result: TestResult): void;
  onStdOut?(chunk: string | Buffer, test?: TestCase, result?: TestResult): void;
  onStdErr?(chunk: string | Buffer, test?: TestCase, result?: TestResult): void;
  onTestEnd?(test: TestCase, result: TestResult): void;
  onEnd?(
    result: FullResult,
  ): Promise<{ status?: FullResult['status'] } | undefined | void> | void;
  onExit?(): void | Promise<void>;
  onError?(error: TestError): void;
  onStepBegin?(test: TestCase, result: TestResult, step: TestStep): void;
  onStepEnd?(test: TestCase, result: TestResult, step: TestStep): void;
  printsToStdio?(): boolean;
  version(): 'v2';
}
