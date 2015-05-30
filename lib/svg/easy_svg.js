var DOMParser = require('xmldom').DOMParser
var svgpath = require('svgpath')
var CONFIG = require('../config.js')
var Path = require('./path.js')
var Viewbox = require('./view_box.js')
var svgPathify = require('svg_pathify')
var _ = require('lodash')



/**
 * 翻转svgpath
 * @param  {string} path     path序列
 * @return {string}         反转后的path序列
 */
exports.reversal = function(path) {
  return svgpath(path).scale(1, -1).round(CONFIG.PATH_DECIMAL).toString()
}

/**
 * 转换svg为一个path,并且按照目标高度，偏移进行拉伸
 * @param  {string} svg     原始svg
 * @param  {object} options.targetHeight 目标高度
 * @return {object}         path序列和viewbox
 */
exports.normalizeSvg = function(svg, options) {

  var svgDocNode = new DOMParser().parseFromString(svgPathify(svg), 'application/xml')
  var svgNode = svgDocNode.getElementsByTagName('svg')[0]

  //解决所有的变换，生成一个path
  var path = Path.normalizePath(svgNode)

  var trans = svgpath(path)

  //根据目标viewbox进行变换
  var targetHeight = options.targetHeight

  if (targetHeight) {
    var viewObj = Viewbox.generateAmendTrans(svgNode, targetHeight)
    _.each(viewObj.transforms, function(viewTrans) {
      trans[viewTrans[0]].apply(trans, viewTrans[1])
    })
  }

  return {
    viewbox: viewObj.targetViewbox,
    path: trans.round(CONFIG.PATH_DECIMAL).toString()
  }

}