import fsExtra from 'fs-extra';
import { type PackageJson } from 'types-package-json';
import debug from 'debug';

export interface BaseOutputOptions {
  /**
   * Path of the file to write the table of contents to
   */
  filePath: string;
}

export interface WriteModeOptions {
  /**
   * Write mode for the output
   */
  writeMode: 'overwrite' | 'append' | 'replace-placeholder';
}

export interface OutputOptionsWithoutPlaceholder extends BaseOutputOptions, WriteModeOptions {
  writeMode: 'overwrite' | 'append';
}

export interface Placeholder {
  /**
   * Start of the placeholder text
   */
  start: string;
  /**
   * End of the placeholder text
   */
  end: string;
}

export interface OutputOptionsWithPlaceholder extends BaseOutputOptions, WriteModeOptions {
  writeMode: 'replace-placeholder';
  placeholder: Placeholder;
}

export type OutputOptions = OutputOptionsWithoutPlaceholder | OutputOptionsWithPlaceholder;

export interface GenerateUsageWaysOfNpmCliAppsInMarkdownFormatOptions {
  /**
   * Name of the package
   * 
   * @defaultValue
   * Name of the package in the current directory
   */
  packageName?: string;
  /**
   * Names of the CLI utilities
   * 
   * @defaultValue
   * Keys of the bin property of package.json in the current directory
   */
  cliUtilityNames?: Array<string>; 
  /**
   * Header level of the root header. Example: If you want generated headers to have 4 hashes, then specify 4 here
   * 
   * @defaultValue
   * 3
   */
  rootHeaderLevel?: number;
  /**
   * Output options
   */
  output?: OutputOptions;
}

/**
 * Generates usage ways of CLI applications of npm package in markdown format
 */
export async function generateUsageWaysOfNpmCliAppsInMarkdownFormat(options: GenerateUsageWaysOfNpmCliAppsInMarkdownFormatOptions) {
  const log = debug(generateUsageWaysOfNpmCliAppsInMarkdownFormat.name);
  const rootHeaderLevel = options.rootHeaderLevel ?? 3;
  log({rootHeaderLevel})

  const cliUtilityNames: Array<string> = options.cliUtilityNames ?? await fsExtra.readJson('./package.json').catch((error) => {
    throw new Error(`Either specify cliUtilities in options or make sure that package.json exists in the current directory. Error: ${error}`)
  }).then((packageJson: PackageJson) => {
    if(!packageJson.bin) {
      throw new Error(`Either specify cliUtilities in options or make sure that package.json has bin property in the current directory.`)
    }
    return Object.keys(packageJson.bin)
  });
  log({cliUtilityNames})

  const packageName = await fsExtra.readJson('./package.json').catch((error) => {
    throw new Error(`Either specify packageName in options or make sure that package.json exists in the current directory. Error: ${error}`)
  }).then((packageJson: PackageJson) => packageJson.name);
  log({packageName})

  // Prepare a place to collect all help messages

  const allHelpMessages = `
If you are going to use this package in a project - it is recommended to install it is [Locally](#local-installation)  
If you are going to use this package for yourself - it is recommended to install it [Globally](#global-installation) or run it directly using [npx](#directly-running-using-npx)
${`#`.repeat(rootHeaderLevel)} Directly running using npx
${
  cliUtilityNames.length > 1 ? `
\`\`\`shell
${
  cliUtilityNames.map(cliUtilityName => {
    return `npx --yes --package ${packageName} ${cliUtilityName}`
  }).join('\n')
}
\`\`\`
`.trim() : `
\`\`\`shell
npx --yes ${packageName}
\`\`\`
`.trim()
}

${`#`.repeat(rootHeaderLevel)} Global Installation
${`#`.repeat(rootHeaderLevel+1)} Global installation and running using binary name
\`\`\`shell
npm install --global ${packageName}
${
  cliUtilityNames.map(cliUtilityName => {
    return cliUtilityName
  }).join('\n')
}
\`\`\`

${`#`.repeat(rootHeaderLevel+1)} Global installation and running using npx
\`\`\`shell
npm install --global ${packageName}
${
  cliUtilityNames.map(cliUtilityName => {
    return `npx ${cliUtilityName}`
  }).join('\n')
}
\`\`\`

${`#`.repeat(rootHeaderLevel)} Local installation

${`#`.repeat(rootHeaderLevel+1)} Local installation and running using npx
\`\`\`shell
npm install ${packageName}
${
  cliUtilityNames.map(cliUtilityName => {
    return `npx ${cliUtilityName}`
  }).join('\n')
}
\`\`\`

${`#`.repeat(rootHeaderLevel+1)} Local installation and running using npm script
\`\`\`shell
npm install ${packageName}
\`\`\`
Add npm script to package.json. Note that you can name  your script as you want but it must call binary file provided by the package
\`\`\`json
{
  "scripts": {
${
  cliUtilityNames.map(cliUtilityName => {
    return `    "${cliUtilityName}": "${cliUtilityName}"`
  }).join(',\n')
}
  }
}
\`\`\`
and run
\`\`\`shell
${
  cliUtilityNames.map(cliUtilityName => {
    return `npm run ${cliUtilityName}`
  }).join('\n')
}
\`\`\`
`.trim()
log({allHelpMessages})

  if(options.output) {
    if(options.output.writeMode === 'replace-placeholder') {
      const placeholderStart = options.output.placeholder.start;
      log({placeholderStart})
      const placeholderEnd = options.output.placeholder.end;
      log({placeholderEnd})
      const placeholderRegex = new RegExp(`${placeholderStart}[\\S\\s]*${placeholderEnd}`, 'g');
      log({placeholderRegex})
      const filePath = options.output.filePath;
      log({filePath})
      const markdown = fsExtra.readFileSync(filePath, 'utf-8');
      log({markdown})
      const newFileContents = markdown.replace(placeholderRegex, `${placeholderStart}\n${allHelpMessages}\n${placeholderEnd}`);
      log({newFileContents})
      fsExtra.writeFileSync(filePath, newFileContents)
    } else if(options.output.writeMode === 'append') {
      fsExtra.appendFileSync(options.output.filePath, allHelpMessages)
    } else if(options.output.writeMode === 'overwrite') {
      fsExtra.writeFileSync(options.output.filePath, allHelpMessages)
    }
  }
  
  return allHelpMessages
}
