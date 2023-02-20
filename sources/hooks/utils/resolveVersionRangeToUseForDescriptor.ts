import { Configuration, Descriptor, structUtils } from '@yarnpkg/core';

export async function resolveVersionRangeToUseForDescriptor (descriptor: Descriptor, configuration: Configuration): Promise<string> {
  let rangeToUse = descriptor.range;

  if (
    configuration.get('restrictDependencyVersion')
    && !configuration.projectCwd.endsWith(`dlx-${process.pid}`)
  ) {
    const packageName = structUtils.stringifyIdent(descriptor);
    const { default: minimatch } = await import('minimatch');

    if (
      !configuration.get('restrictDependencyVersionExcludes').some(
        pattern => minimatch(
          packageName,
          pattern,
          { matchBase: true }
        )
      )
    ) {
      rangeToUse = configuration.get('dependencyVersionMap').get(packageName);

      if (!rangeToUse) {
        throw new Error(`${packageName} is not found on dependency version map, please add it first using \`dependency set\`.`);
      }
    }
  }

  return rangeToUse;
}
