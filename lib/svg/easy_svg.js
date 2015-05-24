
var DOMParser = require('xmldom').DOMParser
var svgpath = require('svgpath');

var Path = require('./path.js')
var Viewbox = require('./view_box.js')
var svgPathify = require('svg_pathify')

/**
 * 翻转svgpath
 * @param  {string} path     path序列
 * @return {string}         反转后的path序列
 */

exports.reversal = function(path){
  return svgpath(path).scale(-1,1).toString()
}

/**
 * 转换svg为一个path,并且按照目标高度，偏移进行拉伸
 * @param  {string} svg     原始svg
 * @param  {object} options 配置
 * @return {string}         path序列
 */
exports.generatePath = function(svg,options) {
  debugger
  var svgDocNode = new DOMParser().parseFromString(svgPathify(svg),'application/xml')
  var svgNode = svgDocNode.getElementsByTagName('svg')[0]

  //解决所有的变换，生成一个path
  var path = Path.normalizePath(svgNode)


  var trans = svgpath(path)
  //根据目标viewbox进行变换
  var targetHeight = options.targetHeight
  var descent = options.descent

  if (targetHeight) {
    var viewTransForms = Viewbox.generateAmendTrans(svgNode,targetHeight)
    _.each(viewTransForms,function(viewTrans){
      trans[viewTrans[0]].apply(trans,viewTrans[1])
    })
  }

  //做偏移
  if (descent) {
    trans.translate(0,-descent)
  }

  return trans.toString()

}