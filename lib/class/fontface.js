var Base = require('./base.js')
var config = require('../config')

var Fontface = Base.extend({
  defaultOptions: config.DEFAULT_OPTIONS.fontface,
  init: function(options) {
    this.setOptions(options)
  }
})

module.exports = Fontface