import { BaseCommand as YarnBaseCommand } from '@yarnpkg/cli';
import { Configuration, Project } from '@yarnpkg/core';

abstract class BaseCommand extends YarnBaseCommand {
  /**
   * Handles the execution of the command.
   *
   * @param projectInfo the resolved project information
   */
  abstract handle (projectInfo: Awaited<ReturnType<typeof Project.find>>): Promise<number | void>;

  /**
   * @inheritdoc
   */
  async execute (): Promise<number | void> {
    const configuration = await Configuration.find(this.context.cwd, this.context.plugins);
    const projectInfo = await Project.find(configuration, this.context.cwd);

    try {
      return await this.handle(projectInfo);
    } catch (error) {
      return 1;
    }
  }
}

export default BaseCommand;
