import { Hooks } from '@yarnpkg/plugin-essentials';
import { resolveVersionRangeToUseForDescriptor } from './utils/resolveVersionRangeToUseForDescriptor';

const afterWorkspaceDependencyAddition: Hooks['afterWorkspaceDependencyAddition'] = async (workspace, _$target, descriptor) => {
  const configuration = workspace.project.configuration;
  descriptor.range = await resolveVersionRangeToUseForDescriptor(descriptor, configuration);
};

export default afterWorkspaceDependencyAddition;
