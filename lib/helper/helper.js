var _ = require('lodash')


//http://purplebamboo.github.io/2014/12/17/javascript-unicode-doublebyte-handle/
if (!String.fromCodePoint) {
  (function() {
    var defineProperty = (function() {
      // IE 8 only supports `Object.defineProperty` on DOM elements
      try {
        var object = {}
        var $defineProperty = Object.defineProperty
        var result = $defineProperty(object, object, object) && $defineProperty
      } catch (error) {}
      return result
    }());
    var stringFromCharCode = String.fromCharCode
    var floor = Math.floor
    var fromCodePoint = function() {
      var MAX_SIZE = 0x4000
      var codeUnits = []
      var highSurrogate
      var lowSurrogate
      var index = -1
      var length = arguments.length
      if (!length) {
        return ''
      }
      var result = ''
      while (++index < length) {
        var codePoint = Number(arguments[index])
        if (!isFinite(codePoint) || // `NaN`, `+Infinity`, or `-Infinity`
          codePoint < 0 || // not a valid Unicode code point
          codePoint > 0x10FFFF || // not a valid Unicode code point
          floor(codePoint) != codePoint // not an integer
        ) {
          throw RangeError('Invalid code point: ' + codePoint)
        }
        if (codePoint <= 0xFFFF) { // BMP code point
          codeUnits.push(codePoint)
        } else { // Astral code point; split in surrogate halves
          // http://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
          codePoint -= 0x10000
          highSurrogate = (codePoint >> 10) + 0xD800
          lowSurrogate = (codePoint % 0x400) + 0xDC00
          codeUnits.push(highSurrogate, lowSurrogate)
        }
        if (index + 1 == length || codeUnits.length > MAX_SIZE) {
          result += stringFromCharCode.apply(null, codeUnits)
          codeUnits.length = 0
        }
      }
      return result
    };
    if (defineProperty) {
      defineProperty(String, 'fromCodePoint', {
        'value': fromCodePoint,
        'configurable': true,
        'writable': true
      })
    } else {
      String.fromCodePoint = fromCodePoint
    }
  }());
}


if (!String.prototype.codePointAt) {
  (function() {
    'use strict'; // needed to support `apply`/`call` with `undefined`/`null`
    var codePointAt = function(position) {
      if (this == null) {
        throw TypeError()
      }
      var string = String(this)
      var size = string.length
      // `ToInteger`
      var index = position ? Number(position) : 0
      if (index != index) { // better `isNaN`
        index = 0
      }
      // Account for out-of-bounds indices:
      if (index < 0 || index >= size) {
        return undefined;
      }
      // Get the first code unit
      var first = string.charCodeAt(index)
      var second;
      if ( // check if it’s the start of a surrogate pair
        first >= 0xD800 && first <= 0xDBFF && // high surrogate
        size > index + 1 // there is a next code unit
      ) {
        second = string.charCodeAt(index + 1)
        if (second >= 0xDC00 && second <= 0xDFFF) { // low surrogate
          // http://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
          return (first - 0xD800) * 0x400 + second - 0xDC00 + 0x10000
        }
      }
      return first
    }
    if (Object.defineProperty) {
      Object.defineProperty(String.prototype, 'codePointAt', {
        'value': codePointAt,
        'configurable': true,
        'writable': true
      });
    } else {
      String.prototype.codePointAt = codePointAt
    }
  }());
}


/**
 * 字体里面的unicode千奇百怪有很多种形式，需要进行转换成16进制的unicode
 * 返回最终的16进制值组成的字符串
 */
function str2unicode(str) {
  //没有管\\u的情况
  str = str.replace(/&#(x?[a-f\d]+)(;?)/ig, function(m, u) {
    var HEX_BASE = 10;
    if (u.indexOf('x') === 0) {
      HEX_BASE = 16;
      u = u.substr(1);
    }
    return String.fromCodePoint(parseInt(u, HEX_BASE));
  });
  //将ascii码转换成unicode
  str = str.replace(/[\x00-\xff]/g, function($0) {
    return '&#' + $0.codePointAt(0) + ';'
  });
  //将汉字转成unicode
  str = str.replace(/[^\u0000-\u00FF]/g, function($0) {
    return escape($0).replace(/(%u)(\w{4})/gi, "\&#x$2;")
  });
  //将十进制的unicode转换成16进制的。
  str = str.replace(/\&\#(\d+)/g, function($0, $1) {
    return '&#x' + parseInt($1).toString(16)
  });

  return str;

}

function toUnicode(str) {
  var uArray = []
  var u = str2unicode(str)
  uArray = u.split(';')
  uArray.pop()
  uArray = _.map(uArray, function(unicode) {
    return unicode + ';'
  })

  return uArray
}

exports.str2unicode = str2unicode

exports.toUnicode = toUnicode

exports.normalizeUnicode = function(str) {
  return toUnicode(str)[0]
}


exports.toLine = function(str) {
  return str.replace(/([A-Z]{1})/g, function($, $1) {
    return '-' + $1.toString().toLowerCase()
  })
}

exports.key2underline = function(obj) {
  var result = {}
  var that = this
  _.each(obj, function(v, k) {

    k = that.toLine(k)
    result[k] = v
  })
  return result
}

exports.showError = function(err) {
  function _getErrorString(err) {
    if (err.stack) {
      return err.stack.replace(/^/gm, '  ') + '\n\n'
    }
    return err.toString()
  }
  console.log(_getErrorString(err))
}