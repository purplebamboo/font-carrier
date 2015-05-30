var svgpath = require('svgpath')
var _ = require('lodash')

function generatePath(path, transforms) {
  var t = svgpath(path).abs()
  _.each(transforms, function(transform) {
    t.transform(transform)
  })
  return t.toString()
}

function getTransform(node) {
  return node.getAttribute('transform')
}

function parseNode(node, transforms) {
  var path = ''
  var newTransForms = transforms ? _.clone(transforms) : []

  if (node.getAttribute && node.getAttribute('transform')) {
    newTransForms.push(node.getAttribute('transform'))
  }

  if (!node.hasChildNodes() && node.tagName === 'path') {
    path = generatePath(node.getAttribute('d'), newTransForms)
  }

  if (node.hasChildNodes()) {
    _.each(node.childNodes, function(childNode) {

      path += parseNode(childNode, newTransForms)

    })
  }

  return path

}


exports.normalizePath = function(svgNode) {

  return parseNode(svgNode)
}