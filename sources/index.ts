import { Plugin } from '@yarnpkg/core';
import configuration from './configuration';
import hooks from './hooks';

const plugin: Plugin = {
  configuration,
  hooks
};

export default plugin;
