import { Hooks } from '@yarnpkg/plugin-essentials';
import { resolveVersionRangeToUseForDescriptor } from './utils/resolveVersionRangeToUseForDescriptor';

const afterWorkspaceDependencyReplacement: Hooks['afterWorkspaceDependencyReplacement'] = async (workspace, _$target, _$fromDescriptor, toDescriptor) => {
  const configuration = workspace.project.configuration;
  toDescriptor.range = await resolveVersionRangeToUseForDescriptor(toDescriptor, configuration);
};

export default afterWorkspaceDependencyReplacement;
