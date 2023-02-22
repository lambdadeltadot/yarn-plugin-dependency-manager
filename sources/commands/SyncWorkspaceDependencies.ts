import { Project, Workspace, Locator, StreamReport, structUtils, MessageName } from '@yarnpkg/core';
import { stringifyIdent } from '@yarnpkg/core/lib/structUtils';
import { Command, Option } from 'clipanion';
import BaseCommand from './BaseCommand';
import createFormatString from './utils/createFormatString';
import reportProgressViaCounter from './utils/reportProgressViaCounter';
import yarnSpawn from './utils/yarnSpawn';

class SyncWorkspaceDependencies extends BaseCommand {
  static override paths = [
    ['dependency', 'sync']
  ];

  static override usage = Command.Usage({
    category: 'Dependency Manager',
    description: 'Sync the version of the packages installed on the each workspace to the dependency version map. Note that this will only sync the packages registered on the dependency version map.',
    examples: [
      [
        'Sets packages\' latest versions',
        '$0 dependency set axios react'
      ],
      [
        'Sets packages\' specific versions',
        '$0 dependency set axios@1.1.3 react@18.2.0'
      ],
      [
        'Sets package\' latest version on the given range',
        '$0 dependency set axios@^1 react@~18.2'
      ],
      [
        'Update all registered package to latest',
        '$0 dependency set'
      ]
    ]
  });

  packages = Option.Array('-p, --package', {
    description: 'Whitelist for the packages to update',
    required: false
  });

  workspaces = Option.Rest({
    name: 'workspaces',
    required: 0
  });

  async handle ({ project }: { project: Project; workspace: Workspace; locator: Locator; }): Promise<number | void> {
    const streamReport = await StreamReport.start({
      configuration: project.configuration,
      stdout: this.context.stdout,
      json: false
    }, async report => {
      const { configuration } = project;
      const fString = createFormatString(configuration);

      const [workspacesToSync, packagesToSync] = await report.startTimerPromise('Resolving workspace and packages to sync', {}, async () => {
        const { default: minimatch } = await import('minimatch');

        report.reportInfo(MessageName.UNNAMED, 'Resolving workspaces to sync.');
        const workspacePatterns = !this.workspaces || this.workspaces.length <= 0 ? ['*'] : this.workspaces;
        const workspacesToSync = project.workspaces.filter(
          workspace => {
            return workspacePatterns.some(
              pattern => minimatch(
                structUtils.stringifyIdent(workspace.manifest.name),
                pattern,
                { matchBase: true }
              )
            );
          }
        );

        report.reportInfo(MessageName.UNNAMED, 'Resolving packages to sync.');
        const packagePatterns = !this.packages || this.packages.length <= 0 ? ['*'] : this.packages;
        const packagesToSync = Array.from(configuration.get('dependencyVersionMap').keys()).filter(
          packageName => packagePatterns.some(
            pattern => minimatch(
              packageName,
              pattern,
              { matchBase: true }
            )
          )
        );

        return [workspacesToSync, packagesToSync] as const;
      });

      await reportProgressViaCounter(report, workspacesToSync, async workspace => {
        const workspaceName = stringifyIdent(workspace.manifest.name);

        await report.startTimerPromise(`Working on ${fString.applyColor(workspaceName, 'green')}`, {}, async () => {
          const installMap = new Map([
            ['dependencies', [workspace.manifest.dependencies, [] as string[]]],
            ['devDependencies', [workspace.manifest.devDependencies, ['--dev'] as string[]]],
            ['peerDependencies', [workspace.manifest.peerDependencies, ['--peer'] as string[]]]
          ] as const);

          for (const [key, [list, args]] of installMap) {
            const toInstall = Array.from(list.values())
              .map(packageEntry => structUtils.stringifyIdent(packageEntry))
              .filter(packageName => packagesToSync.includes(packageName));

            if (toInstall.length > 0) {
              report.reportInfo(MessageName.UNNAMED, `Syncing ${fString.applyColor(key, 'yellow')}.`);

              await yarnSpawn(
                workspaceName,
                ['add'].concat(
                  args,
                  toInstall.map(packageEntry => `${packageEntry}@${configuration.get('dependencyVersionMap').get(packageEntry)}`)
                ),
                { stdio: [this.context.stdin, 'ignore', this.context.stderr] }
              );

              continue;
            }

            report.reportInfo(MessageName.UNNAMED, `Nothing to sync for ${fString.applyColor(key, 'yellow')}.`);
          }

          report.reportInfo(MessageName.UNNAMED, 'Finished.');
        });
      }, 1);
    });

    return streamReport.exitCode();
  }
}

export default SyncWorkspaceDependencies;
