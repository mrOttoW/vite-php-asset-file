import { DEFAULT_OPTIONS, VITE_PLUGIN_NAME } from './constants';
import type { Plugin } from 'vite';
import { GlobalsOption, NormalizedOutputOptions, OutputBundle, OutputChunk, PluginContext } from 'rollup';
import { merge } from './utils';
import { createHash } from 'crypto';
import fs from 'fs';
import json2php from 'json2php';
import { parse, Node, Options as AcornOptions } from 'acorn';

interface Options {
  linebreak?: string;
  indent?: string;
  shortArraySyntax?: boolean;
  includeGlobals?: boolean;
  dependencies?: string[] | ((module: OutputChunk) => string[]);
  jsExtensions?: string[];
  cssExtensions?: string[];
  hashAlgorithm?: string;
  hashMaxLength?: number;
  acornOptions?: AcornOptions;
}

/**
 * VitePhpAssetFile.
 *
 * @param optionsParam
 * @constructor
 */
function VitePhpAssetFile(optionsParam: Options = {}): Plugin {
  const options: Options = merge(optionsParam, DEFAULT_OPTIONS);

  /**
   * Find globals usage in code.
   *
   * @param code
   * @param globals
   * @param usedGlobals
   */
  const findGlobalsUsage = (code: string, globals: GlobalsOption, usedGlobals: string[] = []): string[] => {
    const traverse = (node: Node | any) => {
      // Check for variable declarations
      if (node.type === 'VariableDeclaration') {
        node.declarations.forEach(declaration => {
          if (declaration.init && declaration.init.type === 'MemberExpression') {
            const globalKey = Object.keys(globals).find(
              key =>
                globals[key] === declaration.init.object.name ||
                globals[key] === `${declaration.init.object.name}.${declaration.init.property.name}`
            );

            if (globalKey && !usedGlobals.includes(globalKey)) {
              usedGlobals.push(globalKey);
            }
          }
        });
      }

      // Check for any MemberExpression nodes
      if (node.type === 'MemberExpression') {
        if (node.object && node.object.name) {
          for (let key in globals) {
            if (
              (globals[key] === node.object.name || globals[key] === `${node.object.name}.${node.property.name}`) &&
              !usedGlobals.includes(key)
            ) {
              usedGlobals.push(key);
            }
          }
        }
      }

      // Recursively traverse all child nodes
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
    const dependencies = [
      ...(typeof options.dependencies === 'function'
        ? options.dependencies(module)
        : Array.isArray(options.dependencies)
          ? options.dependencies
          : []),
    ];

    // Add dependencies based on externals/imports we've found inside the file
    if (options.includeGlobals) {
      findGlobalsUsage(module.code, globals).forEach(dependency => {
        if (!dependencies.includes(dependency)) {
          dependencies.push(dependency);
        }
      });
    }

    return dependencies;
  };

  /**
   * Create imported assets list.
   *
   * @param module
   * @param assets
   */
  const createImportedAssetsList = (module: OutputChunk, assets: string[] = []) => {
    if (module.viteMetadata && module.viteMetadata.importedCss) {
      module.viteMetadata.importedCss.forEach(function (value) {
        if (options.cssExtensions.some(ext => value.endsWith(ext))) {
          assets.push(value);
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
   * Create PHP asset file name.
   *
   * @param filename
   */
  const createPhpAssetFileName = (filename: string) => {
    for (let ext of options.jsExtensions) {
      if (filename.endsWith(ext)) {
        return filename.slice(0, -ext.length) + '.asset.php';
      }
    }
    throw new Error(`VitePhpAssetFile: No matching extension found for file: ${filename}`);
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
      linebreak: '',
      indent: '',
      shortArraySyntax: false,
    });

    plugin.emitFile({
      type: 'asset',
      fileName: createPhpAssetFileName(module.fileName),
      source:
        '<?php return ' +
        phpPrinter({
          dependencies: createDependencyArray(module, bundleOptions.globals),
          version: createHashVersion(module),
          assets: createImportedAssetsList(module),
        }) +
        ';',
    });
  };

  /**
   * Vite Plugin.
   */
  return {
    name: VITE_PLUGIN_NAME,
    enforce: 'post',
    apply: 'build',

    /**
     * Generate Bundle Hook.
     *
     * @param bundleOptions
     * @param bundle
     */
    async generateBundle(bundleOptions: NormalizedOutputOptions, bundle: OutputBundle) {
      for (let module of Object.values(bundle)) {
        if (module.type === 'chunk' && options.jsExtensions && options.jsExtensions.some(ext => module.facadeModuleId!.endsWith(ext))) {
          createPhpAssetFile(this, bundleOptions, module);
        }
      }
    },
  };
}

export { VitePhpAssetFile };
