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
const jsonfile = require('jsonfile')
const moment = require('moment')

const config = require('./variables')
var Menu = require('terminal-menu')
var menu = Menu({width: 80, x: 0, y: 0})
menu.reset()
menu.write('        RELEASED BUT NOT DEPLOYED VERSION LIST  \n')
menu.write('--------------------------------------------------------------\n')

function run (args, cb) {
  // bundle deploy <os> --> package.json에 등록된 버전과 이름과 입력된 os로 deploy
  //
  //      bundle   deploy     <os>
  // ->            args[0]   args[1]

  var package_file = {}
  try {
    package_file = jsonfile.readFileSync(process.cwd() + '/package.json')
  } catch (e) {
    console.log('Run this command in your app root directory where package.json is.')
    cb()
    return
  }

  var bb_config = null
  try {
    bb_config = jsonfile.readFileSync(config.BUNDLE_BUS_CONFIG)
  } catch (e) {
    console.log('Error to read jsonfile')
    console.log(e)
    cb()
    return
  }

  if (bb_config === null || bb_config === undefined) {
    console.log('BUNDLE BUS config file is null or undefined.')
    cb()
    return
  }

  if (args.length !== 2) { // User entered 'bundlebus deploy'
    help()
    cb()
    return
  }

  if (args[1] === '-h') {
    help()
    cb()
    return
  }

  var appname = package_file.name
  var appversion = package_file.version
  var appkey = bb_config[config.ACCESS_KEY]
  var osType = args[1]

  req_version_list(appname, appkey, appversion, osType, cb)
}

function req_version_list (appname, appkey, appversion, osType, callback) {
  var post_data = {
    appkey: appkey,
    appversion: appversion,
    os: osType
  }

  var post_options = {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(post_data)
    }
  }

  needle.post(config.SERVER_RELEASE_NOT_DEPLOY, post_data, post_options, function (err, resp) {
    if (err) {
      console.log(err);
      callback();
      return;
    }

    if (resp.statusCode !== 200) {
      console.log('HTTP error : ' + JSON.stringify(resp.body));
      callback();
      return;
    }

    console.log(resp.body);
    var released_list = resp.body.result;
    if (released_list.length === 0) {
      console.log('Nothing is released or all released were deployed : ' + appname);
      callback();
      return;
    }
    
    for (var i = 0; i < released_list.length; i++) {
        menu.add((i) + '| ' + moment(released_list[i].timestamp).format() + '   ' + appname + '   ' + released_list[i].appversion + '   ' + released_list[i].os);
    }

    menu.on('select', function (options) {
      menu.close();
      var index = Number(options[0]);
      req_deploy(released_list[index], callback);
    })

    process.stdin.pipe(menu.createStream()).pipe(process.stdout);
    process.stdin.setRawMode(true);

    menu.on('close', function (options) {
      process.stdin.setRawMode(false);
      process.stdin.end();
    });
  });
}

function req_deploy (released_info, callback) {
  var post_data = {
    _id: released_info._id,
    appkey: released_info.appkey,
    appversion: released_info.appversion,
    timestamp: released_info.timestamp,
    commitid: released_info.commitid,
    os: released_info.os
  }

  var post_options = {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(post_data)
    }
  }

  needle.post(config.SERVER_DEPLOY, post_data, post_options, function (err, resp) {
    if (!err && resp.statusCode === 200) {
      console.log(resp.body)
    } else {
      console.log(err)
    }

    callback()
  })
}

function help () {
  console.log(
    [ '\nUsage: bundlebus deploy <os>'
      , ''
      , 'where <os> is the os type to build for.'
      , 'It should be "android" or "ios"'

    ].join('\n'))
}
