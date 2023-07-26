#!/usr/bin/env node
import yargs from 'yargs';
import { generateUsageWaysOfNpmCliAppsInMarkdownFormat } from '../generate-usage-ways-of-npm-cli-apps-in-markdown-format.js';
import { hideBin } from 'yargs/helpers';

const argv = yargs(hideBin(process.argv))
  .usage(`$0 [Options]`, `Generates usage ways of CLI applications of npm package in markdown format`)
  .option('package-name', {
    description: 'Name of the package',
    type: 'string',
    defaultDescription: 'Name of the package in the current directory',
  })
  .option('cli-utility-names', {
    description: 'Names of the CLI utilities',
    type: 'string',
    array: true,
    defaultDescription: 'Keys of the bin property of package.json in the current directory',
  })
  .option('root-header-level', {
    description: 'Header level of the root header. Example: If you want generated headers to have 4 hashes, then specify 4 here',
    type: 'number',
    default: 3,
  })
  .help()
  .parseSync();

generateUsageWaysOfNpmCliAppsInMarkdownFormat({
  ...argv,
  cliUtilityNames: argv.cliUtilityNames,
}).then(console.log)
