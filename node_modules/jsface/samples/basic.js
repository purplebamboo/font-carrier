var Events = Class({
   bind: function(type, fn) {
   }
});

var Options = Class({
   setOptions: function(opts) {
      this.opts = opts;
   },
   getOptions: function() {
      return this.opts;
   }
});

var Foo = Class({
   $statics: {
      VERSION: "1.3"
   },

   constructor: function(name) {
      this.name = name;
   },

   welcome: function() {
      return "Welcome " + this.name;
   },

   version: function() {
      return this.VERSION;  // same as Foo.VERSION
   }
});

var Bar = Class([ Foo, Events, Options ], {
   constructor: function(name) {
      Bar.$super.call(this, name);
   },

   sayHi: function() {
      return Bar.$superp.sayHi.call(this);
   },

   sayBye: function() {
      return "Bye!";
   }
});
