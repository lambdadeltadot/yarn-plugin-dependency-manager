import { Descriptor, structUtils } from '@yarnpkg/core';

async function resolveVersionUsingRegistry (descriptor: Descriptor): Promise<string> {
  const { default: yarnExec } = await import('./yarnExec');

  const stdout = await yarnExec(['npm', 'info', structUtils.stringifyDescriptor(descriptor), '--fields', 'name,version', '--json']);
  return (JSON.parse(stdout) as { version: string }).version;
}

async function resolveFromDistTags (descriptor: Descriptor): Promise<string> {
  const { default: yarnExec } = await import('./yarnExec');

  const stdout = await yarnExec(['npm', 'info', structUtils.stringifyDescriptor(descriptor), '--fields', 'dist-tags', '--json']);
  return (JSON.parse(stdout) as { 'dist-tags': Record<string, string> })['dist-tags'][descriptor.range];
}

async function resolveSatifyingVersion (descriptor: Descriptor): Promise<string> {
  const registryVersion = await resolveVersionUsingRegistry(descriptor);
  const range = descriptor.range;
  const { satisfies } = await import('semver');

  if (satisfies(registryVersion, range)) return registryVersion;

  const distTagVersion = await resolveFromDistTags(descriptor);
  if (distTagVersion) return distTagVersion;

  throw new Error(`'${structUtils.stringifyDescriptor(descriptor)}' does not satisfy the fetched registry version '${registryVersion}' or not found on its 'dist-tags'.`);
}

export default resolveSatifyingVersion;
