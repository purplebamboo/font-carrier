var Class = require("jsface").Class
var _ = require("lodash")

var Base = Class({
  defaultOptions:{},
  constructor: function(options) {
    this.setOptions(options)
  },
  setOptions:function(options){
    if (!this.options) {
      this.options = _.extend({},defaultOptions)
    }
    _.extend(this.options,options)

  },
  get:function(key){
    //todo 支持getter,setter
    this.options[key] = value
  },
  set:function(key,value){
    //todo 支持getter,setter
    return this.options[key]
  }
})

//添加extend方法
Base.extend = function(sub){
  //继承当前
  return Class(this,sub)
}

module.exports = Base


