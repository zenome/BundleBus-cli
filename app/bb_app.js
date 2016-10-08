/**
 * Copyright (c) 2016-present ZENOME, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the MIT-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

module.exports = run

var fs = require('fs')
var fse = require('fs-extra')
var spawn = require('child_process').spawn

function run (args, cb) {
  // ID/password를 보내고 뭔가를 받자.

  /*
     login 
       0    
  */
  new Menu(cb).showMenu()
}

function Menu (cb) {
  this.depth = 0
  this.callback = cb
  this.file_index = -1
  this.compose_in = ''
  this.compose_out = '   '
}

Prompt = [
  'Input your email address : ',
  'Password : '
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
      case 0: // Input ID 
        this.id = line.trim()
        break
      case 1: // Input password
        this.password = line.trim()
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
    this.callback()
  })
}

function help () {
  console.log(
    [ '\nUsage: bundlebus login'
      , ''
      , 'You have to enter ID/password in console'
    ].join('\n'))
}
