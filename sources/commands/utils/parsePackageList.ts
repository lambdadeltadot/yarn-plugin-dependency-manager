import { structUtils } from '@yarnpkg/core';

/**
 * Parse the list of packages to update.
 *
 * @param packageNames the input package list.
 */
const parsePackageList = (packageNames: string[]) => packageNames.map(packageName => {
  const descriptor = structUtils.parseDescriptor(packageName);
  if (descriptor.range === 'unknown') descriptor.range = 'latest';
  return descriptor;
});

export default parsePackageList;
