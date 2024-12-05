import { inspect } from 'util';
import { createLogger, format, Logger, transports } from 'winston';
import { KnapsackProEnvConfig } from './config';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { name: clientName } = require('../package.json');

export class KnapsackProLogger {
  public static objectInspect(object: object): string {
    return inspect(object, {
      showHidden: false,
      depth: null,
      colors: true,
    });
  }

  private logger: Logger;

  constructor(logLevel: string = KnapsackProEnvConfig.logLevel) {
    this.logger = createLogger({
      level: logLevel,
      format: format.combine(
        format.label({ label: clientName }),
        format.timestamp(),
        format.colorize(),
        format.printf(
          ({ timestamp, label, level, message }) =>
            `\n${timestamp} [${label}] ${level}: ${message}`,
        ),
      ),
      transports: [new transports.Console()],
    });
  }

  public error(message: string): void {
    this.logger.error(message);
  }

  public warn(message: string): void {
    this.logger.warn(message);
  }

  public info(message: string): void {
    this.logger.info(message);
  }

  public verbose(message: string): void {
    this.logger.verbose(message);
  }

  public debug(message: string): void {
    this.logger.debug(message);
  }

  public silly(message: string): void {
    this.logger.silly(message);
  }
}
