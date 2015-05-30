var _ = require("lodash")

var Class = (function() {
  var _mix = function(r, s) {
    for (var p in s) {
      if (s.hasOwnProperty(p)) {
        r[p] = s[p]
      }
    }
  }
  var _extend = function() {
    //开关 用来使生成原型时,不调用真正的构成流程init
    this.initPrototype = true
    var prototype = new this()
    this.initPrototype = false

    var items = Array.prototype.slice.call(arguments) || []
    var item

    //支持混入多个属性，并且支持{}也支持 Function
    while (item = items.shift()) {
      _mix(prototype, item.prototype || item)
    }
    var SubClass = function() {
      if (!SubClass.initPrototype && this.init) {
        this.init.apply(this, arguments) //调用init真正的构造函数
      }

    }

    // 赋值原型链，完成继承
    SubClass.prototype = prototype

    // 改变constructor引用
    SubClass.prototype.constructor = SubClass

    // 为子类也添加extend方法
    SubClass.extend = _extend

    return SubClass
  }
    //超级父类
  var Class = function() {}
    //为超级父类添加extend方法
  Class.extend = _extend

  return Class
})()

var BASE = Class.extend({
  defaultOptions: {},
  init: function(options) {
    this.setOptions(options)
  },
  setOptions: function(options) {
    if (!this.options) {
      this.options = _.extend({}, this.defaultOptions)
    }
    _.extend(this.options, options)

  },
  get: function(key) {
    //todo 支持getter,setter
    return this.options[key]
  },
  set: function(key, value) {
    //todo 支持getter,setter
    this.options[key] = value
  }

})

module.exports = BASE