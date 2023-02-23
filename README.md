# yarn-plugin-dependency-manager

A Yarn v3 plugin that adds hooks and commands that restrict the version of added dependencies.

## Installation

```sh
yarn plugin import https://raw.githubusercontent.com/lambdadeltadot/yarn-plugin-dependency-manager/v0.1.0/bundles/@yarnpkg/plugin-dependency-manager.js
```

## Configs

These are the configuration keys that will be added to the `.yarnrc.yml`.

```yaml
# .yarnrc.yaml
dependencyVersionMap:
  eslint: 8.34.0
  typescript: 4.9.5dependencyVersionMap:
  eslint: 8.34.0
  typescript: 4.9.5
restrictDependencyVersion: true
restrictDependencyVersionExcludes:
  - '@local/*'
```

### **dependencyVersionMap**

These are the list of dependencies that can be added to the workspace of this project. This maps the version to install for each dependency.

### **restrictDependencyVersion**

Determine whether to restrict the version being added/replaced to the version in the `dependencyVersionMap`. Default is `true`.

### **restrictDependencyVersionExcludes**

These are the dependency name patterns to exclude from being regulated. This typically includes the local workspaces you are working with.

## Dependency Version Control

The hooks bundled in this plugin will automatically sets the version of the added/replaced dependencies to what is registered under `dependencyVersionMap` on `.yarnrc.yml`. This will throw an error when you try to add a dependency not found on that list.

## Setting the version on `dependencyVersionMap`

You can use the `yarn dependency set` command to set the version of packages. This command will use the latest version of the package within the given semver range for that package. If semver range is not given, it will default to the `latest` version.

```bash
yarn dependency set <...packages>
yarn dependency set typescript@~4.9 eslint
```

Above snippet will result to something like:

```yaml
dependencyVersionMap:
  eslint: 8.34.0
  typescript: 4.9.5
```

Then running `yarn add eslint typescript` will result to:

```json
{
  "dependencies": {
    "eslint": "8.34.0",
    "typescript": "4.9.5"
  }
}
```

**Note:** semver range given on `yarn add` arguments will be ignored if using this plugin

If you want to use a semver range for `dependencyVersionMap`, you can add them manually instead:

```yaml
dependencyVersionMap:
  eslint: ^8
  typescript: 4.9.5
```

## Syncing workspace dependencies with `dependencyVersionMap`

If you have recently updated the `dependencyVersionMap` and want to also update the versions on the workspaces, you can use `yarn dependency sync` command.

Running `yarn dependency sync` will update the versions of all the dependencies on each workspaces to the one listed in `dependencyVersionMap` (**Note** that this will just run `yarn add` on each workspace so that the hooks will be triggered).

You can pass workspace patterns to filter which workspace to update:

```bash
yarn dependency sync @local/*
```

You can also use `--package` option to filter which packages to update:

```bash
yarn dependency sync --package @types/*
```

### Syncing after Setting

You can use `--sync` option for `yarn dependency set` to automatically sync after setting the version. This will call the `yarn dependency sync` with the `--package` . You can also pass `--workspace` to filter which workspace to update.

```bash
yarn dependency set axios --sync --workspace @local/*
```
