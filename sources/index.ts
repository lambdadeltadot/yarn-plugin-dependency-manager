import { Plugin } from '@yarnpkg/core';
import commands from './commands';
import configuration from './configuration';
import hooks from './hooks';

const plugin: Plugin = {
  commands,
  configuration,
  hooks
};

export default plugin;
