/**
 * Copyright (c) 2016-present ZENOME, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the MIT-style license found in the
 * LICENSE file in the root directory of this source tree.
 */


const os = require('os')

var SERVER_ADDRESS_DEV1 = 'http://192.168.0.15:3000'
var SERVER_ADDRESS_PRODUCTION = ''

var curServer = SERVER_ADDRESS_DEV1
var configFile = process.cwd() + '/.bundlebus.config'
var accessKey = 'AccessKey'

module.exports = {
  SERVER: curServer,
  SERVER_REGISTER: curServer + '/api/register',
  SERVER_RELEASE: curServer + '/api/release',
  SERVER_RELEASE_STATUS: curServer + '/api/status',
  SERVER_RELEASE_NOT_DEPLOY: curServer + '/api/notdeployedlist',
  SERVER_DEPLOY: curServer + '/api/deploy',
  BUNDLE_BUS_CONFIG: configFile,
  ACCESS_KEY: accessKey
}
