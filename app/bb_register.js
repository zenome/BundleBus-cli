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
const needle = require('needle')
const fs = require('fs')
const jsonfile = require('jsonfile')

const config = require('./variables')
const stringUtil = require('./stringutil.js')

// Register app name, git clone url, token.
// Response : appkey
//
// App key is stored in user folder with app name.
//
// If user is already register apps, then the login's result should be the dictionary with (appname, appkey)

function run (args, cb) {
  var packageFile = {}
  try {
    packageFile = jsonfile.readFileSync(process.cwd() + '/package.json')
  } catch (e) {
    console.log('Run this command in your app root directory where package.json is.')
    cb()
    return
  }

  new Menu(cb, packageFile).showMenu()
}

function Menu (cb, packageFile) {
  this.appname = packageFile.name
  this.depth = 0
  this.callback = cb
  this.file_index = -1
  this.compose_in = ''
  this.compose_out = '   '
}

var Prompt = [
  'Repository clone url : ',
  'Repository - github token : '
]

Menu.prototype.showMenu = function () {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })
  rl.setPrompt(Prompt[this.depth])
  rl.prompt()

  rl.on('line', (line) => {
    switch (this.depth) {
      case 0:
        this.path = line.trim()
        this.depth = 1
        break
      case 1:
        this.key = line.trim()
        this.depth = -1
        break
    }

    if (this.depth === -1) {
      rl.close()
    } else {
      rl.setPrompt(Prompt[this.depth])
      rl.prompt()
    }
  }).on('close', () => {
    registerApp(this.appname, this.path, this.key, this.callback)
  })
}

function registerApp (appname, path, key, callback) {
  if (!stringUtil.hasSomething(appname)) {
    console.log('appname is missed : ' + appname)
    callback()
    return
  }

  if (!stringUtil.hasSomething(path)) {
    console.log('clone path is missed : ' + path)
    callback()
    return
  }

  if (!stringUtil.hasSomething(key)) {
    console.log('github token is missed' + key)
    callback()
    return
  }

  var post_Data = {
    'appname': appname,
    'cloneurl': path,
    'github_token': key
  }

  var post_options = {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(post_Data)
    }
  }

  needle.post(config.SERVER_REGISTER, post_Data, post_options, function (err, resp) {
    if (err) {
      console.log('http error : ' + JSON.stringify(err));
      callback();
      return;
    }

    if (resp.body.status !== 0) {
      console.log('Got error : (' + resp.body.status + ') : ' + resp.body.message);
      console.log(resp.body.result);
      callback();
      return;
    }

    console.log('Got successful response')
    var configFile = config.BUNDLE_BUS_CONFIG

    // Check whether the file is already exists.
    //   If the file is already existed, append the result if app name is not exist.

    let bbConfigJson = {}
    try {
      fs.accessSync(configFile, fs.F_OK)
      bbConfigJson = jsonfile.readFileSync(configFile)
    } catch (e) {
      if (e.code === 'ENOENT') {
        console.log('Create config file')
        fs.writeFileSync(configFile, '{}')
        bbConfigJson = jsonfile.readFileSync(configFile)
      }
    }

    bbConfigJson[config.ACCESS_KEY] = resp.body.result.appkey;
    console.log(bbConfigJson);
    jsonfile.writeFileSync(configFile, bbConfigJson, {spaces: 2});
    
    callback();
  })
}

function help () {
  console.log(
    [ '\nUsage: bundlebus register'
      , ''
    ].join('\n'))
}
