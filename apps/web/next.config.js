//@ts-check

const { composePlugins, withNx } = require('@nx/next');

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {};

const plugins = [withNx];

module.exports = composePlugins(...plugins)(nextConfig);
