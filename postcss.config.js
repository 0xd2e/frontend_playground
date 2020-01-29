'use strict';

/* eslint-env node, amd */
/* eslint global-require: "off" */
/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */


const autoprefixerOptions = {
  cascade: true,
  add: true,
  remove: true,
  supports: false,
  flexbox: false,
  grid: false,
  ignoreUnknownVersions: false
};


// https://github.com/postcss/postcss/blob/master/docs/plugins.md
module.exports = {
  plugins: [
    require('autoprefixer')(autoprefixerOptions)
  ]
};
