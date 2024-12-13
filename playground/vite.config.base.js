import path from 'path';
import { ViteWordPress } from 'vite-wordpress';

const environment = process.env.ENVIRONMENT;

const globals = {
  jquery: 'jQuery',
  lodash: '_',
  react: 'React',
  'react-dom': 'ReactDOM',
  'wp-blocks': 'wp.blocks',
  'wp-block-editor': 'wp.blockEditor',
  'wp-i18n': 'wp.i18n',
};

const config = {
  root: `playground`,
  plugins: [],
};

if (environment === 'wordpress') {
  config.plugins.push(
    ViteWordPress({
      preserveDirs: false,
      input: [
        'wordpress-environment/main.js',
        'wordpress-environment/blocks/example-block/index.js',
        'wordpress-environment/blocks/example-block/view.js',
        'wordpress-environment/blocks/example-block/render.php',
        'wordpress-environment/blocks/example-block/block.json',
        'wordpress-environment/blocks/example-block/style.pcss',
      ],
    })
  );
} else {
  config.build = {
    outDir: 'build',
    rollupOptions: {
      input: {
        'jquery-bundle': path.resolve(__dirname, 'src', 'general-environment', 'jquery', 'my-jquery-bundle.js'),
        'lodash-bundle': path.resolve(__dirname, 'src', 'general-environment', 'lodash', 'my-lodash-bundle.js'),
        'react-bundle': path.resolve(__dirname, 'src', 'general-environment', 'react', 'my-react-bundle.jsx'),
        'wp-block-bundle': path.resolve(__dirname, 'src', 'general-environment', 'blocks', 'my-wp-block-bundle.jsx'),
      },
      output: {
        entryFileNames: ({ name }) => `${name}.js`,
        assetFileNames: '[name][extname]',
        globals,
      },
      external: Object.keys(globals),
    },
  };
}

const pluginOptions = {
  debug: true,
};

export { config, pluginOptions };
