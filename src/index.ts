import { DEFAULT_OPTIONS, VITE_PLUGIN_NAME } from './constants';
import type { Plugin, ResolvedConfig } from 'vite';
import { GlobalsOption, NormalizedOutputOptions, OutputBundle, OutputChunk, PluginContext } from 'rollup';
import {
  parse,
  Node,
  Options as AcornOptions,
  Expression,
  SpreadElement,
  MemberExpression,
  CallExpression,
  VariableDeclaration,
  VariableDeclarator,
  Function,
  Pattern,
  Identifier,
} from 'acorn';
import { merge } from './utils';
import { createHash } from 'crypto';
import fs from 'fs';
import json2php from 'json2php';
import path from 'path';

interface Options {
  linebreak?: string;
  indent?: string;
  shortArraySyntax?: boolean;
  includeGlobals?: boolean;
  dependencies?: string[] | ((module: OutputChunk, dependencies: string[]) => string[]); // eslint-disable-line no-unused-vars
  jsExtensions?: string[];
  cssExtensions?: string[];
  cssNamePrefix?: string;
  hashAlgorithm?: string;
  hashMaxLength?: number;
  includeCssAsDeps?: boolean;
  acornOptions?: AcornOptions;
  debug?: boolean;
}

/**
 * VitePhpAssetFile.
 *
 * @param optionsParam
 * @constructor
 */
function VitePhpAssetFile(optionsParam: Options = {}): Plugin {
  const options: Options = merge(optionsParam, DEFAULT_OPTIONS);
  let rootConfig: ResolvedConfig;
  let scanningFile: string;

  /**
   * Log message.
   *
   * @param msg
   */
  const log = (msg: string) => {
    if (options.debug) {
      rootConfig.logger.info(`${VITE_PLUGIN_NAME}: ${msg}`, { timestamp: true });
    }
  };

  /**
   * Find globals usage in code.
   *
   * @param code
   * @param globals
   * @param usedGlobals
   */
  const findGlobalsUsage = (code: string, globals: GlobalsOption, usedGlobals: string[] = []): string[] => {
    const traverse = (node: Node) => {
      const getGlobalKey = (value: string) => Object.keys(globals).find(key => globals[key] === value);
      const addGlobalKey = (key: string | undefined) => {
        if (key && !usedGlobals.includes(key)) {
          usedGlobals.push(key);
        }
      };

      // Check for identifier nodes.
      if (node.type === 'Identifier') {
        const identifierNode: Identifier = node as Identifier;

        if (Object.values(globals).includes(identifierNode.name)) {
          addGlobalKey(getGlobalKey(identifierNode.name));
        }
      }

      // Check for call expressions.
      if (node.type === 'CallExpression') {
        const callExpression: CallExpression = node as CallExpression;

        callExpression.arguments.forEach((argument: Expression | SpreadElement) => {
          if ('name' in argument && argument.name) {
            addGlobalKey(getGlobalKey(argument.name));
          }
        });
      }

      // Check for function parameters.
      if (node.type === 'FunctionDeclaration' || node.type === 'FunctionExpression') {
        const functionNode: Function = node as Function;

        functionNode.params.forEach((param: Pattern) => {
          if ('name' in param && Object.values(globals).includes(param.name)) {
            addGlobalKey(param.name);
          }
        });
      }

      // Check for variable declarations.
      if (node.type === 'VariableDeclaration') {
        (node as VariableDeclaration).declarations.forEach((declaration: VariableDeclarator) => {
          if (declaration.init && declaration.init.type === 'MemberExpression') {
            traverse(declaration.init);
          }
        });
      }

      // Check for any MemberExpression nodes.
      if (node.type === 'MemberExpression') {
        const memberExpression: MemberExpression = node as MemberExpression;

        if (memberExpression.object && 'name' in memberExpression.object) {
          for (const key in globals) {
            if (
              globals[key] === memberExpression.object.name ||
              ('name' in memberExpression.property && globals[key] === `${memberExpression.object.name}.${memberExpression.property.name}`)
            ) {
              addGlobalKey(key);
            }
          }
        }
      }

      // Recursively traverse all child nodes.
      for (const key in node) {
        if (node[key] && typeof node[key] === 'object') {
          traverse(node[key]);
        }
      }
    };

    traverse(parse(code, options.acornOptions));

    return usedGlobals;
  };

  /**
   * Create the dependency array.
   *
   * @param module
   * @param globals
   */
  const createDependencyArray = (module: OutputChunk, globals: GlobalsOption): string[] => {
    const dependencies = [...(Array.isArray(options.dependencies) ? options.dependencies : [])];
    scanningFile = module.fileName;

    // Add dependencies based on externals/imports we've found inside the file
    if (options.includeGlobals) {
      log(`---- Scanning "${scanningFile}" for globals`);
      findGlobalsUsage(module.code, globals).forEach(dependency => {
        log(`Found: "${dependency}"`);
        if (!dependencies.includes(dependency)) {
          dependencies.push(
            dependency
              .replace(/([a-z0-9])([A-Z])/g, '$1-$2') // Convert camelCase to kebab-case
              .replace(/@/g, '') // Remove @ signs
              .replace(/[/]/g, '-') // Replace / with -
          );
        }
      });
    }

    return typeof options.dependencies === 'function' ? options.dependencies(module, dependencies) : dependencies;
  };

  /**
   * Create imported assets list.
   *
   * @param module
   * @param assets
   */
  const createImportedAssetsList = (module: OutputChunk, assets: Record<string, string> = {}) => {
    if (module.viteMetadata && module.viteMetadata.importedCss) {
      module.viteMetadata.importedCss.forEach(function (filePath) {
        if (options.cssExtensions.some(ext => filePath.endsWith(ext))) {
          const fileName = path.basename(filePath, path.extname(filePath)).replace(/(\.[a-zA-Z0-9]+)(?=\.\w+$|$)/, '');
          const prefixedFileName = options.cssNamePrefix ? `${options.cssNamePrefix}-${fileName}` : fileName;
          assets[prefixedFileName] = filePath;
        }
      });
    }

    return assets;
  };

  /**
   * Create hash version.
   *
   * @param module
   */
  const createHashVersion = (module: OutputChunk) => {
    const hash = createHash(options.hashAlgorithm);

    for (const moduleId of module.moduleIds) {
      if (options.cssExtensions.some(ext => moduleId.endsWith(ext)) || options.jsExtensions.some(ext => moduleId.endsWith(ext))) {
        hash.update(fs.readFileSync(moduleId));
      }
    }

    return hash.digest('hex').slice(0, options.hashMaxLength);
  };

  /**
   * Create the PHP asset file.
   *
   * @param plugin
   * @param bundleOptions
   * @param module
   */
  const createPhpAssetFile = (plugin: PluginContext, bundleOptions: NormalizedOutputOptions, module: OutputChunk) => {
    if (!bundleOptions.dir || !module.facadeModuleId) {
      return;
    }
    const phpPrinter = json2php.make({
      linebreak: options.linebreak,
      indent: options.indent,
      shortArraySyntax: options.shortArraySyntax,
    });
    const dependencies = createDependencyArray(module, bundleOptions.globals);
    const version = createHashVersion(module);
    const assets = createImportedAssetsList(module);

    if (options.includeCssAsDeps) {
      Object.entries(assets).forEach(([cssFileName]) => {
        dependencies.push(cssFileName);
      });
    }

    plugin.emitFile({
      type: 'asset',
      fileName: `${module.name}.asset.php`,
      source: '<?php return ' + phpPrinter({ dependencies, version, assets }) + ';',
    });
  };

  /**
   * Vite Plugin.
   */
  return {
    name: VITE_PLUGIN_NAME,
    enforce: 'post',

    /**
     * Get Resolved Config.
     *
     * @param c
     */
    configResolved(c) {
      rootConfig = c;
    },

    /**
     * Generate Bundle Hook.
     *
     * @param bundleOptions
     * @param bundle
     */
    async generateBundle(bundleOptions: NormalizedOutputOptions, bundle: OutputBundle) {
      for (const module of Object.values(bundle)) {
        if (module.type === 'chunk' && options.jsExtensions && options.jsExtensions.some(ext => module.facadeModuleId!.endsWith(ext))) {
          createPhpAssetFile(this, bundleOptions, module);
        }
      }
    },
  };
}

export { VitePhpAssetFile };
