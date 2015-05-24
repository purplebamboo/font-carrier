var Base = require('./base.js')

var Fontface = Base.extend({
  //字体默认属性
  defaultOptions: {
    fontFamily : 'fontFamily',
    fontWeight : '400',
    fontStretch : 'normal',
    unitsPerEm : '1024',
    ascent : '-212',
    descent : '812'
  },
  init: function(options) {
    this.setOptions(options)
    //this.__font = font || null
  }
})

module.exports = Fontface


