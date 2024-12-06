import { defineConfig } from 'vite';
import { VitePhpAssetFile } from '../src';
import { config, pluginOptions } from './vite.config.base';

config.plugins.push(VitePhpAssetFile(pluginOptions));

export default defineConfig(config);
