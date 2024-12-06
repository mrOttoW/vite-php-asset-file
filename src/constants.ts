export const VITE_PLUGIN_NAME = 'vite-php-asset-file';
export const DEFAULT_OPTIONS = {
  linebreak: '',
  indent: '',
  shortArraySyntax: false,
  includeGlobals: true,
  dependencies: [],
  jsExtensions: ['.js', '.ts', '.jsx', '.tsx'],
  cssExtensions: ['.css', '.pcss', '.scss', '.sass', '.less'],
  hashAlgorithm: 'sha256',
  hashMaxLength: 20,
  acornOptions: { ecmaVersion: 2020, sourceType: 'module' },
};
