<div align="center">
  <a href="https://vitejs.dev/">
    <img width="200" height="200" hspace="10" src="vite-logo.svg" alt="vite logo" />
  </a>
  <h1>️Vite PHP Asset File for Vite 6</h1>
  <p>
A simple Vite plugin to produce a php file that returns an array with hash of each build to 'version' your asset files for cache-busting, a dependency list derived from globals and a list of imported
CSS assets. This serves as an alternative to using a manifest file in a PHP environment.
</p>
  <img src="https://img.shields.io/github/v/release/mrOttoW/vite-php-asset-file" alt="GitHub release" />
  <img src="https://img.shields.io/npm/dependency-version/vite-php-asset-file/peer/vite" alt="npm peer dependency version" />
  <img alt="Node Current" src="https://img.shields.io/node/v/vite-php-asset-file">
  <img src="https://img.shields.io/github/last-commit/mrOttoW/vite-php-asset-file" alt="GitHub last commit"/>
  <img src="https://img.shields.io/npm/l/vite-php-asset-file" alt="licence" />
</div>

## Features

- Generates PHP asset files with dependencies, (configurable) version hash, and imported css assets.
  - The version hash is generated based on changes in the JavaScript file and all its imported CSS assets.
  - Dependencies are generated based on global variable usage in the code.
- Supports different file extensions for JavaScript and CSS files.
- Configurable options for output formatting, hash algorithm, and asset extensions.
- Integrates easily with Vite's build process.

## Installation

To use the `VitePhpAssetFile` plugin, install it via npm:

```bash
npm install --save-dev vite-php-asset-file
```

Or with yarn:

```bash
yarn add -D vite-php-asset-file
```

## Usage

with default options

```js
import { VitePhpAssetFile } from 'vite-php-asset-file';

export default {
  plugins: [VitePhpAssetFile()],
};
```

With options

```js
import { VitePhpAssetFile } from 'vite-php-asset-file';

export default {
  plugins: [
    VitePhpAssetFile({
      linebreak: '\n',
      indent: '  ',
      shortArraySyntax: true,
      includeGlobals: true,
      jsExtensions: ['.js', '.ts'],
      cssExtensions: ['.css', '.scss'],
      cssNamePrefix: 'my-plugin',
      includeCssAsDeps: true,
      hashAlgorithm: 'sha256',
      hashMaxLength: 8,
      acornOptions: { ecmaVersion: 2022 },
    }),
  ],
};
```

### Options

The following options are available to configure the plugin:

| Option             | Type                             | Default Value                                  | Description                                                                                                   |
| ------------------ | -------------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `linebreak`        | `string`                         | `''`                                           | Defines the line break character for the PHP output.                                                          |
| `indent`           | `string`                         | `''`                                           | Defines the indentation style for the PHP output.                                                             |
| `shortArraySyntax` | `boolean`                        | `false`                                        | If `true`, uses PHP short array syntax `[]` instead of `array()`.                                             |
| `includeGlobals`   | `boolean`                        | `true`                                         | If `true`, includes globally defined dependencies in the asset file (uses globals config from rollupOptions). |
| `dependencies`     | `string[]` or `function(module)` | `[]`                                           | List of dependencies to include, or a function that returns dependencies based on module.                     |
| `jsExtensions`     | `string[]`                       | `['.js', '.ts', '.jsx', '.tsx']`               | List of JavaScript file extensions to consider for generating PHP asset files.                                |
| `cssExtensions`    | `string[]`                       | `['.css', '.pcss', '.scss', '.sass', '.less']` | List of CSS file extensions to consider for generating PHP asset files.                                       |
| `cssNamePrefix`    | `string`                         | ``                                             | Set a prefix to imported CSS file names.                                                                      |
| `includeCssAsDeps` | `boolean`                        | `false`                                        | If `true`, includes imported css file names as dependencies.                                                  |
| `hashAlgorithm`    | `string`                         | `'sha256'`                                     | The hashing algorithm used to generate the version hash for each asset.                                       |
| `hashMaxLength`    | `number`                         | `20`                                           | The maximum length of the generated hash.                                                                     |
| `acornOptions`     | `AcornOptions`                   | `{ ecmaVersion: 2020, sourceType: 'module' }`  | Options for parsing JavaScript code with Acorn (used for finding global variable usage).                      |

## How It Works

- The plugin will analyze your JavaScript files during the Vite build process.
- It finds globally used variables and modules in the code and includes them as dependencies in the generated PHP asset file.
- It generates a hash based on the content of the relevant JavaScript and CSS files to version the assets.
- It creates a PHP asset file (`.asset.php`) containing the dependencies, version hash, and imported assets list, which can be used in your PHP application.

### Example PHP Output

For a JavaScript file `react-bundle.js` with imported CSS files, the plugin will generate a PHP asset file like the following:

```php
<?php return array('dependencies' => array('react', 'react-dom'), 'version' => '00472e96f3e2edf6bdc4', 'assets' => array('react-bundle' => 'react-bundle.css'));
```
