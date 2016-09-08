/**
 * Copyright (c) 2016-present ZENOME, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the MIT-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

module.exports = run

const readline = require('readline')
const needle = require('needle')
const os = require('os')
const fs = require('fs')
const timers = require('timers')
const async = require('async')
const jsonfile = require('jsonfile')

const config = require('./variables')
const utils = require('./utils.js')

var Menu = require('terminal-menu')

function run (args, main_callback) {
  // bundle release   --> package.json에 있는 appname, version을 release 한다.
  //
  //      bundle   release   <os>
  // ->             args[0]  arg[1] 

  var package_file = {}
  try {
    jsonfile.readFileSync(process.cwd() + '/package.json')
  } catch (e) {
    console.log(e)
    main_callback()
    return
  }

  var bb_config = null
  try {
    bb_config = jsonfile.readFileSync(config.BUNDLE_BUS_CONFIG)
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

  var appkey = bb_config[config.ACCESS_KEY]
  if (args.length === 1) { // User entered 'bundlebus release'
    showSupportOSList(appkey, main_callback)
  } else { // User entered 'bundlebus release <os>'
    if (args[1] === '-h') {
      help()
      main_callback()
      return
    }

    var ostype = args[1]
    if (!utils.isSupportedOS(ostype)) {
      console.log(ostype + ' is not supported ostype. It should be ' + utils.getSupportedOS())
      main_callback()
      return
    }

    req_release(appkey, ostype, main_callback)
  }
}

function isHTTPSuccess (err, resp) {
  if (err) {
    console.log(err)
    return false
  }

  if (resp.statusCode !== 200) {
    console.log('HTTP Error : ' + resp.code)
    return false
  }

  return true
}

var checkComplete = function (post_data, post_options, main_callback) {
  async.waterfall([
    function (callback) {
      needle.post(config.SERVER_RELEASE_STATUS, post_data, post_options, function (err, resp) {
        if (!isHTTPSuccess(err, resp)) {
          callback(true)
        } else if (resp.body.status === 0) {
          // console.log(resp.body.status + '(' + resp.body.message + ') : ' + JSON.stringify(resp.body.result));
          process.stdout.write('.')
          if (resp.body.result.release_status === 'RELEASING') {
            callback(false)
          } else if (resp.body.result.release_status === 'REGISTERED') {
            console.log('\nBecause of error, release was stopped.');
            callback(true)
          }
        } else {
          console.log(resp.body.status + '(' + resp.body.message + ') : ' + resp.body.result)
          callback(true)
        }
      })
    }], function (result) {
    if (result) {
      main_callback()
    } else {
      timers.setTimeout(checkComplete, 1000, post_data, post_options, main_callback)
    }
  })
}

function req_release (appkey, ostype, main_callback) {
  var post_data = {
    appkey: appkey,
    os: ostype
  }

  var post_options = {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(post_data)
    }
  }

  needle.post(config.SERVER_RELEASE_STATUS, post_data, post_options, function (err, resp) {
    if (!isHTTPSuccess(err, resp)) {
      main_callback()
      return
    }

    // console.log(resp.body);
    if (resp.body.status !== 0) {
      console.log(resp.body.status + '(' + resp.body.message + ') : ' + JSON.stringify(resp.body.result));
      main_callback()
      return
    }

    console.log('App is available to release...')
    needle.post(config.SERVER_RELEASE, post_data, post_options, function (err, resp) {
      if (!isHTTPSuccess(err, resp)) {
        main_callback()
        return
      }

      if (resp.body.status !== 0) {
        console.log(resp.body.status + '(' + resp.body.message + ') : ' + JSON.stringify(resp.body.result));
        main_callback();
        return;
      }

      timers.setTimeout(checkComplete, 1000, post_data, post_options, main_callback)
    })
  })
}

function showSupportOSList (appkey, callback) {
  var menu = Menu({width: 30, x: 4, y: 2})
  menu.reset()
  menu.write('  SUPPORTED OS LIST  \n')
  menu.write('-----------------------\n')

  var osList = utils.getSupportedOS()
  for (var i = 0; i < osList.length; i++) {
    menu.add(osList[i])
  }

  menu.write('-----------------------\n')
  menu.add('EXIT')
  menu.on('select', function (options) {
    menu.close()
    if (options === 'EXIT') {
    } else {
      req_release(appkey, options, callback)
    }
  })

  process.stdin.pipe(menu.createStream()).pipe(process.stdout)
  process.stdin.setRawMode(true)

  menu.on('close', function (options) {
    process.stdin.setRawMode(false)
    process.stdin.end()
  })
}

function help () {
  console.log(
    [ '\nUsage: bundlebus release <os>'
      , ''
      , 'where <os> is the os type to build for.'
      , 'It should be "android" or "ios"'

    ].join('\n'))
}
