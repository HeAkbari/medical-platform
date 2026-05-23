//@ts-check

const path = require('path');
const { composePlugins, withNx } = require('@nx/next');

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  turbopack: {
    root: path.join(__dirname, '../..'),
  },
  transpilePackages: [
    '@medical-platform/domain',
    '@medical-platform/auth',
    '@medical-platform/policies',
  ],
};

const plugins = [withNx];

module.exports = composePlugins(...plugins)(nextConfig);
