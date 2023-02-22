import { Project, Workspace, Locator, StreamReport, structUtils, MessageName, Descriptor, Configuration } from '@yarnpkg/core';
import { Command, Option } from 'clipanion';
import BaseCommand from './BaseCommand';
import parsePackageList from './utils/parsePackageList';
import reportProgressViaCounter from './utils/reportProgressViaCounter';
import { applyCascade, isNumber, isInteger, isAtMost, isAtLeast } from 'typanion';
import createRestrictDependencyVersionExcludesChecker from './utils/createRestrictDependencyVersionExcludesChecker';
import resolveSatifyingVersion from './utils/resolveSatifyingVersion';
import createFormatString from './utils/createFormatString';

class SetDependencyCommand extends BaseCommand {
  static override paths = [
    ['dependency', 'set']
  ];

  static override usage = Command.Usage({
    category: 'Dependency Manager',
    description: 'Sets the version on the dependency map.',
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

  parallel = Option.String('-p, --parallel', {
    required: false,
    validator: applyCascade(isNumber(), [
      isInteger(),
      isAtLeast(1),
      isAtMost(100)
    ])
  });

  packages = Option.Rest({
    name: 'packages',
    required: 0
  });

  async handle ({ project }: { project: Project; workspace: Workspace; locator: Locator; }): Promise<number | void> {
    const streamReport = await StreamReport.start({
      configuration: project.configuration,
      stdout: this.context.stdout,
      json: false
    }, async report => {
      const { configuration } = project;
      const checkIfShouldExclude = await createRestrictDependencyVersionExcludesChecker(configuration.get('restrictDependencyVersionExcludes'));
      const fString = createFormatString(configuration);

      const packageList = await report.startTimerPromise('Parsing package list', {}, async () => parsePackageList(
        this.packages && this.packages.length > 0
          ? this.packages
          : Array.from(project.configuration.get('dependencyVersionMap').keys())
      )
        .filter(descriptor => {
          const name = structUtils.stringifyIdent(descriptor);

          if (checkIfShouldExclude(name)) {
            report.reportWarning(
              MessageName.UNNAMED,
              `${fString.applyColor(name, 'yellow')} passed one of the excludes pattern, skipping.`
            );
            return false;
          }

          report.reportInfo(
            MessageName.UNNAMED,
            `'${fString.applyColor(name, 'green')}' will be included.`
          );
          return true;
        })
      );

      const packageMap = await report.startTimerPromise('Resolving package versions', { skipIfEmpty: false }, async () => {
        const versions: Map<Descriptor, string> = new Map();

        await reportProgressViaCounter(report, packageList, async descriptor => {
          const version = await resolveSatifyingVersion(descriptor);

          versions.set(descriptor, version);
          report.reportInfo(
            MessageName.UNNAMED,
            `${fString.applyColor(structUtils.stringifyDescriptor(descriptor), 'green')}: ${fString.applyColor(version, 'yellow')}`
          );
        }, this.parallel ?? 5);

        return versions;
      });

      await report.startTimerPromise('Updating top-level workspace\'s yarnrc config', {}, async () => {
        report.reportInfo(MessageName.UNNAMED, 'Generating the new dependency version map.');
        const newMap = new Map(configuration.get('dependencyVersionMap'));
        for (const [descriptor, value] of packageMap) {
          newMap.set(structUtils.stringifyIdent(descriptor), value);
        }

        report.reportInfo(MessageName.UNNAMED, 'Updating yarnrc config file');
        Configuration.updateConfiguration(project.topLevelWorkspace.cwd, current => ({
          ...current,
          dependencyVersionMap: Object.fromEntries(newMap)
        }));
      });
    });

    return streamReport.exitCode();
  }
}

export default SetDependencyCommand;
