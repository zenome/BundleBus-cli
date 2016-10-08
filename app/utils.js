/**
 * Copyright (c) 2016-present ZENOME, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the MIT-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';


const stringutil = require('./stringutil')

var getSupportedOS = function () {
  return [ 'android', 'ios' ]
}

var isSupportedOS = function (ostype) {
  if (stringutil.hasSomething(ostype)) {
    var supportedList = getSupportedOS()

    for (var i = 0; i < supportedList.length; i++) {
      if (ostype.toLowerCase() === supportedList[i]) {
        return true
      }
    }
  }

  return false
}

module.exports = {
  isSupportedOS: isSupportedOS,
  getSupportedOS: getSupportedOS
}
