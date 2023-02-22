import { Ident, structUtils } from '@yarnpkg/core';
import { SpawnOptions } from 'node:child_process';

/**
 * Spawn a yarn command with the following arguments.
 *
 * @param workspace the workspace where to run the yarn command, `null` to use the top level one
 * @param args the arguments to pass to the yarn command
 * @param options additional options for running the command
 *
 * @return a promise that resolves to the return code when successful, otherwise reject with an error
 */
async function yarnSpawn (workspace: string | Ident = null, args: string | string[] = [], options: SpawnOptions = {}): Promise<number> {
  const { spawn } = await import('node:child_process');

  return new Promise((resolve, reject) => {
    let errorEncountered: Error;

    spawn(
      'yarn',
      [].concat(
        workspace ? ['workspace', typeof workspace === 'string' ? workspace : structUtils.stringifyIdent(workspace)] : [],
        typeof args === 'string' ? [args] : args
      ),
      { env: process.env, ...options }
    )
      .on('error', error => {
        errorEncountered = error;
      })
      .on('exit', code => {
        if (code === 0) return resolve(code);
        return reject(errorEncountered ?? new Error(`process exited with a non-zero code (${code})`));
      });
  });
}

export default yarnSpawn;
