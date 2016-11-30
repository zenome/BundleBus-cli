/**
 * Copyright (c) 2016-present ZENOME, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the MIT-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

const fs = require('fs')
const os = require('os')
const jsonfile = require('jsonfile')

let configFile = process.cwd() + '/.bundlebus.access.config'
let globalConfig = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'] + '/.bundlebus.config'
let accessKey = 'AccessKey'
let serverAddr = 'Server'
let getCurServer = function() {
  let ret = 'http://localhost:3000';
  try {
    fs.accessSync(globalConfig, fs.F_OK);
    let config = jsonfile.readFileSync(globalConfig);
    if (config.Server) {
      ret = config.Server;
    }
  } catch (e) {
    if (e.code === 'ENOENT') {
      console.log('ENOENT');
      jsonfile.writeFileSync(globalConfig, {Server : ret}, {spaces: 2});
    } else {
      console.log(e);
    }
  }

  return ret;
}

let curServer = getCurServer();

module.exports = {
  SERVER: curServer,
  SERVER_REGISTER: curServer + '/api/register',
  SERVER_RELEASE: curServer + '/api/release',
  SERVER_RELEASE_STATUS: curServer + '/api/status',
  SERVER_RELEASE_NOT_DEPLOY: curServer + '/api/notdeployedlist',
  SERVER_DEPLOY: curServer + '/api/deploy',
  BUNDLE_BUS_CONFIG: configFile,
  BUNDLE_BUS_GLOBAL_CONFIG: globalConfig,
  ACCESS_KEY: accessKey
}
