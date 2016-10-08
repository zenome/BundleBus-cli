/**
 * Copyright (c) 2016-present ZENOME, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the MIT-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

module.exports = run

const readline = require('readline')
const os = require('os')
const fs = require('fs')
const jsonfile = require('jsonfile')

const config = require('./variables')
const utils = require('./utils.js')

function run (args, main_callback) {
  //      bundle   server   http://...
  // ->            args[0]  arg[1] 

  let bb_config = null
  try {
    bb_config = jsonfile.readFileSync(config.BUNDLE_BUS_GLOBAL_CONFIG)
  } catch (e) {
    console.log('Error to read jsonfile')
    console.log(e)
    main_callback()
    return
  }

  if (bb_config === null || bb_config === undefined) {
    console.log('BUNDLE BUS config file is null or undefined.')
    main_callback()
    return
  }

  if (args.length === 1) {
    help();
    main_callback();
    return;
  }

  if (args[1] === '-h') {
    help();
    main_callback();
    return;
  }

  let address = bb_config[config.SERVER];
  if (address === undefined || address == null) {
  } else {
    console.log('Current server address : ' + address);
  }

  console.log('Will be updated to : ' + args[1]);
  bb_config[config.SERVER] = args[1];

  jsonfile.writeFileSync(config.BUNDLE_BUS_GLOBAL_CONFIG, bb_config, {spaces: 2});
  main_callback();
}

function help () {
  console.log('\nUsage: bundlebus server <http://address:port>');
}
