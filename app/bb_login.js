/**
 * Copyright (c) 2016-present ZENOME, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the MIT-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

module.exports = run

var readline = require('readline')

function run (args, cb) {
  // ID/password를 보내고 뭔가를 받자.

  /*
     login 
       0    
  */
  console.log('Under construction');
  cb();
//  new Menu(cb).showMenu()
}

function Menu (cb) {
  this.depth = 0
  this.callback = cb
  this.file_index = -1
  this.compose_in = ''
  this.compose_out = '   '
}

var Prompt = [
  'Input your email address : ',
  'Password : '
]

Menu.prototype.hiddenStdin = function(query, rl, callback) {
  process.stdin.on('data', function(char) {
    char = char + '';
    switch(char) {
      case "\n" :
      case "\r" :
      case "\u0004" :
        process.stdin.pause();
        break;
      default :
        process.stdout.write("\033[2K\033[200D" + query + Array(rl.line.length + 1).join("*"));
        break;
    }
  });

  rl.question(query, function(value) {
    rl.history = rl.history.slice(1);
    callback(value);
  });
}

Menu.prototype.stdin = function(query, rl, callback) {
  rl.setPrompt(query);
  rl.prompt();

  rl.on('line', (line) => {
    callback(line.trim());
  });
}

Menu.prototype.showMenu = function () {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  this.stdin(Prompt[0], rl, (email) => {
    this.hiddenStdin(Prompt[1], rl, (password) => {
      console.log('ID : ' + email + ', Password : ' + password);
      this.callback();
    });
  });
}

function help () {
  console.log(
    [ '\nUsage: bundlebus login'
      , ''
      , 'You have to enter ID/password in console'
    ].join('\n'))
}
