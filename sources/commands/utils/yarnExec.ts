/**
 * Execute a yarn command with the following arguments.
 *
 * @param args the arguments to pass to the yarn command
 *
 * @returns a promise that resolves to the output from stdout or rejects the error encountered
 */
async function yarnExec (args: string | string[] = []): Promise<string> {
  const { exec } = await import('node:child_process');

  return new Promise((resolve, reject) => {
    exec(
      `yarn ${typeof args === 'string' ? args : args.join(' ')}`,
      (error, stdout) => error ? reject(error) : resolve(stdout)
    );
  });
}

export default yarnExec;
