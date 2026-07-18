const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '..');

const config = getDefaultConfig(projectRoot);

// Let Metro see the monorepo-level shared/ package (outside mobile/'s own root)
// and resolve the @shared/* alias used to import cycle math, schemas, and
// onboarding logic shared with frontend/.
config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
];
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  '@shared': path.resolve(workspaceRoot, 'shared'),
};

module.exports = withNativeWind(config, { input: './src/global.css' });
