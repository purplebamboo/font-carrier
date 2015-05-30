var _ = require('lodash')

var _getViewBox = function(svgNode) {
  if (!svgNode) return

  var viewbox = svgNode.getAttribute('viewBox').replace(',', ' ').split(' ')
  if (viewbox && viewbox.length === 4) {
    return _.map(viewbox, function(v) {
      return parseFloat(v)
    })
  }

  var width, height
  width = parseFloat(svgNode.getAttribute('width'))
  height = parseFloat(svgNode.getAttribute('height'))
  if (width != 0 && height != 0) {
    return [0, 0, width, height]
  }
  //todo  bouding box
}

var _getViewPort = function(svgNode) {
  var width, height
  width = parseFloat(svgNode.getAttribute('width'))
  height = parseFloat(svgNode.getAttribute('height'))

  var viewbox = svgNode.getAttribute('viewBox').replace(',', ' ').split(' ')
  if (!width) width = parseFloat(viewbox[2])
  if (!height) height = parseFloat(viewbox[3])

  return [width, height]
    //todo  bouding box


}

// 根据 targetHeight 缩放 width
// 如: normalizeViewport([1024, 2048], 1024)
// #=> [0,0,512, 1024]
var _getTargetViewbox = function(viewport, targetHeight) {

  var width = viewport[0]
  var height = viewport[1]

  if (height != targetHeight) {
    width = parseInt(targetHeight / height * width)
    height = targetHeight
  }

  return [0, 0, width, height]

}


function _normalizeXY(viewbox, targetViewbox) {
  var x, y, targetX, targetY

  x = viewbox[0]
  y = viewbox[1]
  targetX = targetViewbox[0]
  targetY = targetViewbox[1]
    //可能会有x,y偏移的情况，所以这边需要做出相应的转换
  if (x != targetX || y != targetY) {
    return [
      ['translate', [targetX - x, targetY - y]]
    ]
  }
  return []

}

function _normalizeWidthHeight(viewbox, targetViewbox) {

  var width, height, targetWidth, targetHeight, widthScale, heightScale

  width = viewbox[2]
  height = viewbox[3]
  targetWidth = targetViewbox[2]
  targetHeight = targetViewbox[3]

  widthScale = width / targetWidth
  heightScale = height / targetHeight
    //比较正常的等比缩放
  if (widthScale == heightScale) {
    return [
      ['scale', [1 / widthScale, 1 / widthScale]]
    ]
  }

  //下面是不等比缩放
  //不等比缩放后
  var maxScale = _.max([widthScale, heightScale])
  var transforms = [],
    newWidth, newHeight

  if (widthScale < heightScale) {
    newWidth = targetWidth * maxScale
    transforms.push(['translate', [(newWidth - width) / 2, 0]])
  } else if (widthScale > heightScale) {
    newHeight = newHeight * maxScale
    transforms.push(['translate', [0, (newHeight - height) / 2]])
  }

  transforms.push(['scale', [1 / maxScale, 1 / maxScale]])

  return transforms
}

//返回需要进行的转换数组
var _normalizeViewBox = function(viewbox, targetViewbox) {

  var transforms = []
  transforms = transforms.concat(_normalizeXY(viewbox, targetViewbox))
  transforms = transforms.concat(_normalizeWidthHeight(viewbox, targetViewbox))
  return transforms
}

exports.generateAmendTrans = function(svgNode, targetHeight) {

  var viewport = _getViewPort(svgNode)
  var viewbox = _getViewBox(svgNode)
  var targetViewbox = _getTargetViewbox(viewport, targetHeight)

  return {
    transforms: _normalizeViewBox(viewbox, targetViewbox),
    targetViewbox: targetViewbox
  }

}