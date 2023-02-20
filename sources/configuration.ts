import { ConfigurationDefinitionMap, SettingsType } from '@yarnpkg/core';

declare module '@yarnpkg/core' {
  interface ConfigurationValueMap {
    dependencyVersionMap: Map<string, string>;
    restrictDependencyVersion: boolean;
    restrictDependencyVersionExcludes: string[];
  }
}

const configuration: Partial<ConfigurationDefinitionMap> = {
  dependencyVersionMap: {
    description: 'The list of all allowed dependencies to install and their expected version.',
    type: SettingsType.MAP,
    valueDefinition: {
      description: 'The version of the dependency to install.',
      type: SettingsType.STRING
    }
  },
  restrictDependencyVersion: {
    description: 'Determine whether to restrict the installed dependency version to the one found on the `dependencyVersionMap`.',
    type: SettingsType.BOOLEAN,
    default: true
  },
  restrictDependencyVersionExcludes: {
    description: 'The list of package patterns to exclude from dependency version restriction check. This typically the list of all local workspaces.',
    type: SettingsType.STRING,
    isArray: true,
    default: []
  }
};

export default configuration;
