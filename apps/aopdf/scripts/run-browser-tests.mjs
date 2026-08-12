import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { delimiter, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { stdio: 'inherit', ...options });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

function availablePython() {
  for (const command of ['python3', 'python']) {
    const result = spawnSync(command, ['--version'], { stdio: 'ignore' });
    if (!result.error && result.status === 0) return command;
  }
  throw new Error('Python 3 is required for independent-reader evidence.');
}

let temporaryEnvironment;
let readerPython = process.env.AOPDF_PYPDF_PYTHON;
try {
  if (!readerPython) {
    temporaryEnvironment = mkdtempSync(join(tmpdir(), 'aopdf-pypdf-'));
    run(availablePython(), ['-m', 'venv', temporaryEnvironment]);
    readerPython = process.platform === 'win32'
      ? join(temporaryEnvironment, 'Scripts', 'python.exe')
      : join(temporaryEnvironment, 'bin', 'python');
    run(readerPython, [
      '-m',
      'pip',
      'install',
      '--disable-pip-version-check',
      '--require-hashes',
      '-r',
      resolve('tests/evidence/requirements.txt'),
    ]);
  }

  const executable = process.platform === 'win32'
    ? resolve('node_modules/.bin/playwright.cmd')
    : resolve('node_modules/.bin/playwright');
  run(executable, ['test', ...process.argv.slice(2)], {
    env: {
      ...process.env,
      AOPDF_PYPDF_PYTHON: readerPython,
      PATH: `${resolve('node_modules/.bin')}${delimiter}${process.env.PATH ?? ''}`,
    },
  });
} finally {
  if (temporaryEnvironment) {
    rmSync(temporaryEnvironment, { recursive: true, force: true });
  }
}
