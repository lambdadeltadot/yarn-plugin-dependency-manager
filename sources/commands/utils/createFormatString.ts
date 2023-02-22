import { Configuration, formatUtils } from '@yarnpkg/core';

const createFormatString = (configuration: Configuration) => ({
  applyColor: (text: string, color: string) => formatUtils.supportsColor
    ? formatUtils.applyColor(configuration, text, color)
    : text
});

export default createFormatString;
