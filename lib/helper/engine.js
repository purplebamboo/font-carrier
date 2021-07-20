var path = require('path')
var fs = require('fs');
var _ = require('lodash')
var helper = require('./helper.js')
var opentype = require('opentype.js')
var DOMParser = require('xmldom').DOMParser


var svg2ttf = require('svg2ttf')
var ttf2svg = require('ttf2svg')
var ttf2eot = require('ttf2eot')
var ttf2woff = require('ttf2woff')
var ttf2woff2 = require('ttf2woff2')

var fontEngine = {
  svg2svg: function(input) {
    if (Buffer.isBuffer(input)) return input
    return Buffer.from(input)
  },
  // TODO add test case
  svg2ttf: function(input, options) {
    if (Buffer.isBuffer(input)) input = input.toString()
    return Buffer.from(svg2ttf(input).buffer)
  },
  svg2eot: function(input, options) {
    var ttfBuffer = this.svg2ttf(input, options)
    return this.ttf2eot(ttfBuffer);
  },
  svg2woff: function(input, options) {
    var ttfBuffer = this.svg2ttf(input, options)
    return this.ttf2woff(ttfBuffer);
  },
  ttf2ttf: function(input) {
    if (Buffer.isBuffer(input)) return input
    return Buffer.from(input)
  },
  ttf2svg: function(input) {
    return Buffer.from(ttf2svg(input))
  },
  ttf2eot: function(input) {
    return Buffer.from(ttf2eot(input).buffer)
  },
  ttf2woff: function(input) {
    return Buffer.from(ttf2woff(input).buffer)
  },
  ttf2woff2: function(input) {
    return Buffer.from(ttf2woff2(input).buffer)
  },
}

var ALL_FONTS_TYPES = ['svg', 'ttf', 'eot', 'woff', 'woff2']



var _normalizeInput = function(input) {
  if (!input) return false
    //a buffer
  if (Buffer.isBuffer(input)) return input
    //a path
  if (_.isString(input) && fs.existsSync(input)) {
    return fs.readFileSync(input)
  }
  //a svg font string
  if (_.isString(input) && /font-face/.test(input)) {
    return Buffer.from(input)
  }
  return false
}

/**
 * 解析一个字体转换成js对象
 * @param  {[type]} input [description]
 * @return {[type]}         [description]
 */
fontEngine.parse = (function() {
  //参考  svg2ttf里面的解析代码
  //https://github.com/fontello/svg2ttf

  var _getGlyph = function(glyphElem) {
    var glyph = {};

    glyph.d = glyphElem.getAttribute('d').trim()
    glyph.unicode = helper.normalizeUnicode(glyphElem.getAttribute('unicode'))
    glyph.name = glyphElem.getAttribute('glyph-name')

    if (glyphElem.getAttribute('horiz-adv-x')) {
      glyph.horizAdvX = parseInt(glyphElem.getAttribute('horiz-adv-x'), 10)
    }

    return glyph;
  }

  var _parseTtfFont = function(ttfBuffer) {

    function toArrayBuffer(buffer) {
      var arrayBuffer = new ArrayBuffer(buffer.length)
      var data = new Uint8Array(arrayBuffer)
      for (var i = 0; i < buffer.length; i += 1) {
        data[i] = buffer[i]
      }

      return arrayBuffer
    }

    var font = opentype.parse(toArrayBuffer(ttfBuffer))

    if (!font.supported) {
      return helper.showError('Font is not supported (is this a Postscript font?)');
    }

    var hhea = font.tables.hhea
    var head = font.tables.head
    var name = font.tables.name
    var fontObjs = {
      options: {
        id: name.postScriptName.en || 'iconfont',
        horizAdvX: hhea.advanceWidthMax || 1024,
        vertAdvY: head.unitsPerEm || 1024
      },
      fontface: {
        fontFamily: name.fontFamily.en || 'iconfont',
        ascent: hhea.ascender,
        descent: hhea.descender,
        unitsPerEm: head.unitsPerEm
      },
      glyphs: {}
    }

    var path, unicode
    _.each(font.glyphs.glyphs, function(g) {
      try {
        path = g.path.toPathData()
        if (path && _.isArray(g.unicodes)) {
          _.each(g.unicodes,function(_unicode){
            unicode = '&#x' + (_unicode).toString(16) + ';'
            fontObjs.glyphs[unicode] = {
              d: path,
              unicode: unicode,
              name: g.name || 'uni' + _unicode,
              horizAdvX: g.advanceWidth,
              vertAdvY: fontObjs.options.vertAdvY
            }

          })
        } else if ([32, 12288].indexOf(g.unicode) > -1) {
          // space characters don't have path data
          unicode = '&#x' + (g.unicode).toString(16) + ';'
          fontObjs.glyphs[unicode] = {
            d: path,
            unicode: unicode,
            name: g.name || 'uni' + g.unicode,
            horizAdvX: g.advanceWidth,
            vertAdvY: fontObjs.options.vertAdvY
          }
        }
      } catch (e) {
        //todo debug options
        //helper.showError(e)
      }

    })
    return fontObjs

  }

  var _parseSvgFont = function(svgBuffer) {
    var svgStr = svgBuffer.toString()
    var doc = (new DOMParser()).parseFromString(svgStr, 'application/xml')
    var fontElem = doc.getElementsByTagName('font')[0]
    var fontFaceElem = fontElem.getElementsByTagName('font-face')[0]

    var font = {
      options: {
        id: fontElem.getAttribute('id') || 'iconfont'
      },
      fontface: {
        fontFamily: fontFaceElem.getAttribute('font-family') || 'iconfont',
        fontStretch: fontFaceElem.getAttribute('font-stretch') || 'normal'
      },
      glyphs: {}
    }

    // Get <font-face> numeric attributes
    attrs = {
      ascent: 'ascent',
      descent: 'descent',
      unitsPerEm: 'units-per-em',
      fontWeight: 'font-weight'
    }

    _.forEach(attrs, function(val, key) {
      if (fontFaceElem.hasAttribute(val)) {
        font.fontface[key] = parseInt(fontFaceElem.getAttribute(val), 10)
      }
    })
    var fontfaceHeight = font.fontface.unitsPerEm


    var attrs = {
      horizAdvX: 'horiz-adv-x',
      vertAdvY: 'vert-adv-y'
        // horizOriginX: 'horiz-origin-x',
        // horizOriginY: 'horiz-origin-y',
        // vertOriginX: 'vert-origin-x',
        // vertOriginY: 'vert-origin-y'
    }
    _.forEach(attrs, function(val, key) {
      if (fontElem.hasAttribute(val)) {
        font.options[key] = parseInt(fontElem.getAttribute(val), 10)
      }
    })
    if (!font.options.vertAdvY) {
      font.options.vertAdvY = fontfaceHeight
    }
    if (!font.options.horizAdvX) {
      font.options.horizAdvX = fontfaceHeight
    }

    _.forEach(fontElem.getElementsByTagName('glyph'), function(glyphElem) {
      var glyph = _getGlyph(glyphElem)
      font.glyphs[glyph.unicode] = glyph

      if (!glyph.horizAdvX && font.options.horizAdvX) {
        glyph.horizAdvX = font.options.horizAdvX
      }
      if (!glyph.vertAdvY) {
        glyph.vertAdvY = font.options.vertAdvY ? font.options.vertAdvY : fontfaceHeight
      }

    })

    return font
  }

  var parse = function(input) {
    var inputBuffer = _normalizeInput(input)

    if (!inputBuffer) {
      helper.showError('font convert input error,support path,buffer,string！')
      return
    }

    if (/<svg/.test(inputBuffer.toString())) return _parseSvgFont(inputBuffer)

    //不是svg字体就默认是ttf字体,就使用ttf.js进行解析
    return _parseTtfFont(inputBuffer)
  }

  return parse

})()



/**
 * 一次性的生成其余几种字体,接受一个svg字体
 *
 * @param  {string|buffer|path} fontBuffer 字体输入可以是路径，buffer对象，string 对象
 * @param  {string} outputTypes 字体输出的类型，默认是所有四种，忽略其他不支持的格式
 * @param  {string} outputPath 字体的输出路径，不需要带后缀
 * @return {array}  outFonts    返回转换后的字体 buffer 数组
 */
fontEngine.convert = (function() {

  var _normalizePath = function(p) {
    if (!p) return false

    if (path.extname(p)) {
      p = p.replace(path.extname(p), '')
    }
    return p
  }

  var _convert = function(fontBuffer, outputTypes, options) {
    var result = {}
    var input = fontBuffer
    var ttfBuffer

    if (options.inputTypes === 'ttf') {
      ttfBuffer = fontEngine.ttf2ttf(input, options)
    } else {
      ttfBuffer = fontEngine.svg2ttf(input, options)
    }

    _.each(outputTypes, function(type) {
      if (type === 'svg') {
        result[type] = input
      } else {
        result[type] = fontEngine['ttf2' + type](ttfBuffer, options)
      }
    })

    return result
  }

  var _writeFile = function(output, outFonts) {
    _.each(outFonts, function(font, type) {
      fs.writeFileSync(output + '.' + type, font)
    })
  }

  return function(options) {
    var inputBuffer = _normalizeInput(options.input)
    var outputPath = _normalizePath(options.path)
    var outputTypes = options.types || ALL_FONTS_TYPES
    // 移除不支持的字体格式，防止报错
    outputTypes = outputTypes.filter(item => ALL_FONTS_TYPES.includes(item))

    if (!inputBuffer) {
      helper.showError('font convert input error,support path,buffer,string.please check if the file exist,while the input is a path.')
      return
    }

    var outFonts = _convert(inputBuffer, outputTypes, options)
    if (outputPath) {
      _writeFile(outputPath, outFonts)
    }
    return outFonts

  }
})()


/**
 * 字体转换引擎,提供 svg 到ttf, ttf 到 woff, woff2, eot, svg 的转换
 * 提供字体的解析与转换
 */
module.exports = fontEngine
