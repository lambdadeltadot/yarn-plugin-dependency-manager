import { Ident, structUtils } from '@yarnpkg/core';

async function createRestrictDependencyVersionExcludesChecker (excludeList: string[]) {
  const { default: minimatch } = await import('minimatch');

  return (packageInfo: string | Ident) => {
    const packageName = typeof packageInfo === 'string'
      ? packageInfo
      : structUtils.stringifyIdent(packageInfo);

    return excludeList.some(pattern => minimatch(packageName, pattern, { matchBase: true }));
  };
}

export default createRestrictDependencyVersionExcludesChecker;
