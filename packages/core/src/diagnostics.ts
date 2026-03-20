import { ExecSyncOptions, spawnSync } from 'child_process';

import { KnapsackProLogger } from './knapsack-pro-logger.js';

type Command = {
  label: string;
  command: string;
  args: string[];
  options?: ExecSyncOptions;
};

export const logDiagnostics = (
  logger: KnapsackProLogger,
  endpoint: string,
): void => {
  commands(endpoint).forEach((command) => logCommand(logger, command));
  logEnv(logger);
};

const commands = (endpoint: string): Command[] => {
  const url = new URL(endpoint);
  const port = url.port || (url.protocol === 'https:' ? '443' : '80');

  return [
    {
      label: `dig ${url.hostname}`,
      command: 'dig',
      args: [url.hostname],
    },
    {
      label: `nslookup ${url.hostname}`,
      command: 'nslookup',
      args: [url.hostname],
    },
    {
      label: `curl -v ${url.protocol}//${url.hostname}:${port}`,
      command: 'curl',
      args: ['-v', `${url.protocol}//${url.hostname}:${port}`],
    },
    {
      label: `nc -vz ${url.hostname} ${port}`,
      command: 'nc',
      args: ['-vz', url.hostname, port],
    },
    {
      label: `openssl s_client -connect ${url.hostname}:${port} < /dev/null`,
      command: 'openssl',
      args: ['s_client', '-connect', `${url.hostname}:${port}`],
      options: { input: '' },
    },
  ];
};

const logCommand = (logger: KnapsackProLogger, diagnostic: Command): void => {
  logger.warn(diagnostic.label);
  logger.warn('='.repeat(diagnostic.label.length));

  const result = spawnSync(
    diagnostic.command,
    diagnostic.args,
    diagnostic.options,
  );

  logger.warn(`Exit status: ${result.status}`);
  (result.stderr.toString() + result.stdout.toString())
    .split('\n')
    .forEach((line) => logger.warn(line));
};

const logEnv = (logger: KnapsackProLogger): void => {
  logger.warn('KNAPSACK_PRO_*');
  logger.warn('==============');

  Object.entries(process.env)
    .filter(([key]) => key.startsWith('KNAPSACK_PRO') && !key.includes('TOKEN'))
    .sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey))
    .forEach(([key, value]) => logger.warn(`${key}=${value ?? ''}`));
};
