import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

describe('Test expected generated asset files & contents', () => {
  const rootDir = path.resolve(__dirname, '../'); // Root directory of the project
  const buildDir = path.join(rootDir, 'playground/build'); // Build output directory
  const isDist = process.env.NODE_ENV === 'dist';
  const bundles = ['jquery', 'lodash', 'react', 'wp-block'];

  const getAssetFilePath = bundle => path.join(buildDir, `${bundle}-bundle.asset.php`);
  const getAssetFileContent = () => {
    const fileContent = {};

    bundles.forEach(bundle => {
      fileContent[bundle] = fs.readFileSync(getAssetFilePath(bundle), 'utf-8');
    });

    return fileContent;
  };

  beforeAll(() => {
    execSync(isDist ? 'yarn playground-build-dist' : 'yarn playground-build', {
      cwd: rootDir,
      stdio: 'inherit',
    });
  });

  it('should generate PHP asset files for JS files', () => {
    bundles.forEach(bundle => {
      expect(fs.existsSync(getAssetFilePath(bundle))).toBe(true);
    });
  });

  it('should create dependency array including globals', () => {
    const fileContent = getAssetFileContent();

    expect(fileContent['jquery']).toContain(`'dependencies' => array('jquery')`);
    expect(fileContent['lodash']).toContain(`'dependencies' => array('lodash')`);
    expect(fileContent['react']).toContain(`'dependencies' => array('react', 'react-dom')`);
    expect(fileContent['wp-block']).toContain(`'dependencies' => array('wp-blocks', 'wp-i18n', 'wp-block-editor', 'react')`);
  });

  it('should generate hash version correctly', () => {
    const fileContent = getAssetFileContent();

    bundles.forEach(bundle => {
      const hashRegex = /'version' => '([a-f0-9]{20})'/;
      const match = fileContent[bundle].match(hashRegex);
      expect(match).not.toBeNull();
      expect(match[1].length).toBe(20);
    });
  });

  it('should create imported CSS assets list correctly', () => {
    const fileContent = getAssetFileContent();

    expect(fileContent['jquery']).toContain(`'assets' => array('jquery-bundle' => 'jquery-bundle.css')`);
    expect(fileContent['lodash']).toContain(`'assets' => array()`);
    expect(fileContent['react']).toContain(`'assets' => array('react-bundle' => 'react-bundle.css'`);
    expect(fileContent['wp-block']).toContain(`'assets' => array('wp-block-bundle' => 'wp-block-bundle.css')`);
  });

  afterAll(() => {
    // Clean up the build directory
    fs.rmSync(buildDir, { recursive: true, force: true });
  });
});
