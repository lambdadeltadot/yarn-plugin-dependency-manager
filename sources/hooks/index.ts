import { Hooks } from '@yarnpkg/plugin-essentials';
import afterWorkspaceDependencyAddition from './afterWorkspaceDependencyAddition';
import afterWorkspaceDependencyReplacement from './afterWorkspaceDependencyReplacement';

const hooks: Hooks = {
  afterWorkspaceDependencyAddition,
  afterWorkspaceDependencyReplacement
};

export default hooks;
