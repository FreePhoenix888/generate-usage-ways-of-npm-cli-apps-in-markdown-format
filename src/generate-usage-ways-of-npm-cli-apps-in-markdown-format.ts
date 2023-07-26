import fsExtra from 'fs-extra';
import { type PackageJson } from 'types-package-json';

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
   * Header level of the root header. Example: If you want generated headers to have 4 hashes, then specify 3 here
   * 
   * @defaultValue
   * 3
   */
  rootHeaderLevel?: number;
}

/**
 * Generates usage ways of CLI applications of npm package in markdown format
 */
export async function generateUsageWaysOfNpmCliAppsInMarkdownFormat(options: GenerateUsageWaysOfNpmCliAppsInMarkdownFormatOptions) {
  const rootHeaderLevel = options.rootHeaderLevel ?? 2;

  const cliUtilityNames: Array<string> = options.cliUtilityNames ?? await fsExtra.readJson('./package.json').catch((error) => {
    throw new Error(`Either specify cliUtilities in options or make sure that package.json exists in the current directory. Error: ${error}`)
  }).then((packageJson: PackageJson) => {
    if(!packageJson.bin) {
      throw new Error(`Either specify cliUtilities in options or make sure that package.json has bin property in the current directory.`)
    }
    return Object.keys(packageJson.bin)
  });

  const packageName = await fsExtra.readJson('./package.json').catch((error) => {
    throw new Error(`Either specify packageName in options or make sure that package.json exists in the current directory. Error: ${error}`)
  }).then((packageJson: PackageJson) => packageJson.name);

  // Prepare a place to collect all help messages

  const allHelpMessages = `
If you are going to use this package in a project - it is recommended to install it is [Locally](#local-installation)  
If you are going to use this package for yourself - it is recommended to install it [Globally](#global-installation) or run it directly using [npx](#directly-running-using-npx)
${`#`.repeat(rootHeaderLevel+1)} Directly running using npx
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

#### Global Installation
##### Global installation and running using binary name
\`\`\`shell
npm install --global ${packageName}
${
  cliUtilityNames.map(cliUtilityName => {
    return cliUtilityName
  }).join('\n')
}
\`\`\`

##### Global installation and running using npx
\`\`\`shell
npm install --global ${packageName}
${
  cliUtilityNames.map(cliUtilityName => {
    return `npx ${cliUtilityName}`
  }).join('\n')
}
\`\`\`

#### Local installation

##### Local installation and running using npx
\`\`\`shell
npm install ${packageName}
${
  cliUtilityNames.map(cliUtilityName => {
    return `npx ${cliUtilityName}`
  }).join('\n')
}
\`\`\`

##### Local installation and running using npm script
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
  
  return allHelpMessages
}
