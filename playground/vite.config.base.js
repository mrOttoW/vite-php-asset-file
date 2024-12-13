import path from 'path';

const globals = {
  jquery: 'jQuery',
  lodash: '_',
  react: 'React',
  'react-dom': 'ReactDOM',
  'wp-blocks': 'wp.blocks',
  'wp-block-editor': 'wp.blockEditor',
  'wp-i18n': 'wp.i18n',
};

export const config = {
  root: `playground`,
  build: {
    outDir: 'build',
    rollupOptions: {
      input: {
        'jquery-bundle': path.resolve(__dirname, 'src', 'jquery', 'my-jquery-bundle.js'),
        'lodash-bundle': path.resolve(__dirname, 'src', 'lodash', 'my-lodash-bundle.js'),
        'react-bundle': path.resolve(__dirname, 'src', 'react', 'my-react-bundle.jsx'),
        'wp-block-bundle': path.resolve(__dirname, 'src', 'blocks', 'my-wp-block-bundle.jsx'),
      },
      output: {
        entryFileNames: ({ name }) => `${name}.js`,
        assetFileNames: '[name][extname]',
        globals: globals,
      },
      external: Object.keys(globals),
    },
  },
  plugins: [],
};

export const pluginOptions = {};
