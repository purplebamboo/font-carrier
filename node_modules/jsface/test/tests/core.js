var context       = this,
    extend        = jsface.extend,
    mapOrNil      = jsface.mapOrNil,
    arrayOrNil    = jsface.arrayOrNil,
    functionOrNil = jsface.functionOrNil,
    stringOrNil   = jsface.stringOrNil,
    classOrNil    = jsface.classOrNil;

// --------- UTILITIES --------- //

test("Check type with mapOrNil", function() {
  var emptyMap = {},
      fooMap = { one: 1, two: 2 };

  equal(mapOrNil(emptyMap), emptyMap, "jsface.mapOrNil works incorrectly");
  equal(mapOrNil(fooMap), fooMap, "jsface.mapOrNil works incorrectly");

  equal(mapOrNil(), null, "jsface.mapOrNil works incorrectly");
  equal(mapOrNil(""), null, "jsface.mapOrNil works incorrectly");
  equal(mapOrNil("Hello"), null, "jsface.mapOrNil works incorrectly");
  equal(mapOrNil([]), null, "jsface.mapOrNil works incorrectly");
  equal(mapOrNil([ 1, 2, 3 ]), null, "jsface.mapOrNil works incorrectly");
  equal(mapOrNil(1234), null, "jsface.mapOrNil works incorrectly");
});

test("Check type with jsface.mapOrNil on iframe", function() {
  var frame, iframe, IObject;

  iframe = document.createElement("iframe");
  document.body.appendChild(iframe);

  frame = window.frames[window.frames.length - 1];

  // getObject returns JavaScript Object in iframe context
  frame.getObject = function() {
    return Object;
  };

  IObject = frame.getObject();

  var map = new IObject();
  map.one = 1;
  map.two = 2;

  equal(mapOrNil(map), map, "jsface.mapOrNil works incorrectly in iframe");
  document.body.removeChild(iframe);
});

test("Check type with jsface.arrayOrNil", function() {
  var emptyArray = [],
      fooArray = [ 1, 2, 3, 4 ];
  equal(arrayOrNil(emptyArray), emptyArray, "jsface.arrayOrNil works incorrectly");
  equal(arrayOrNil(fooArray), fooArray, "jsface.arrayOrNil works incorrectly");
  equal( !arrayOrNil(), true, "jsface.arrayOrNil works incorrectly");

  // jsface.arrayOrNil does not consider String as Array of characters
  equal( !arrayOrNil(""), true, "jsface.arrayOrNil works incorrectly");
  equal( !arrayOrNil("Hello"), true, "jsface.arrayOrNil works incorrectly");
  equal( !arrayOrNil({}), true, "jsface.arrayOrNil works incorrectly");
  equal( !arrayOrNil({ one: 1, two: 2 }), true, "jsface.arrayOrNil works incorrectly");
  equal( !arrayOrNil(1), true, "jsface.arrayOrNil works incorrectly");
});

test("Check type with jsface.arrayOrNil on iframe", function() {
  var frame, iframe, IArray, array;

  iframe = document.createElement("iframe");
  document.body.appendChild(iframe);

  frame = window.frames[window.frames.length - 1];
  frame.getArray = function() {
    return Array;
  };

  IArray = frame.getArray();

  array = new IArray(1, 2, 3);

  equal(arrayOrNil(array), array, "jsface.arrayOrNil works incorrectly in iframe");
  document.body.removeChild(iframe);
});

test("Check type with jsface.functionOrNil", function() {
  var fn = function(){};

  equal(functionOrNil(fn), fn, "jsface.functionOrNil works incorrectly");
  equal(functionOrNil([]), null, "jsface.functionOrNil works incorrectly");
  equal(functionOrNil([ 1, 2, 3, 4 ]), null, "jsface.functionOrNil works incorrectly");
  equal(functionOrNil(), null, "jsface.functionOrNil works incorrectly");
  equal(functionOrNil(""), null, "jsface.functionOrNil works incorrectly");
  equal(functionOrNil("Hello"), null, "jsface.functionOrNil works incorrectly");
  equal(functionOrNil({}), null, "jsface.functionOrNil works incorrectly");
  equal(functionOrNil({ one: 1, two: 2 }), null, "jsface.functionOrNil works incorrectly");
  equal(functionOrNil(1), null, "jsface.functionOrNil works incorrectly");
});

test("Check type with jsface.functionOrNil on iframe", function() {
  var frame, iframe, IFunction, fn;

  iframe = document.createElement("iframe");
  document.body.appendChild(iframe);

  frame = window.frames[window.frames.length - 1];
  frame.getFunction = function() {
    return Function;
  };

  IFunction = frame.getFunction();

  fn = new IFunction();
  equal(functionOrNil(fn), fn, "jsface.functionOrNil works incorrectly");
  document.body.removeChild(iframe);
});

test("Check type with jsface.classOrNil", function() {
  var fn = function(){};

  equal(classOrNil(fn), fn, "jsface.classOrNil works incorrectly on function");
  equal( !classOrNil(), true, "jsface.classOrNil works incorrectly passing empty param");
  equal( !classOrNil(undefined), true, "jsface.classOrNil works incorrectly undefined");
  equal( !classOrNil(null), true, "jsface.classOrNil works incorrectly on null");
  equal( !classOrNil(""), true, "jsface.classOrNil works incorrectly empty string");
  equal( !classOrNil("   "), true, "jsface.classOrNil works incorrectly blank string");
  equal( !classOrNil({}), true, "jsface.classOrNil works incorrectly empty map");
  equal( !classOrNil([]), true, "jsface.classOrNil works incorrectly empty array");
  equal( !classOrNil(0), true, "jsface.classOrNil works incorrectly on 0");
  equal( !classOrNil(1), true, "jsface.classOrNil works incorrectly on 1");
  equal( !classOrNil(true), true, "jsface.classOrNil works incorrectly on true");
  equal( !classOrNil(false), true, "jsface.classOrNil works incorrectly on false");
  equal( !classOrNil([ 1, 2, 3, 4 ]), true, "jsface.classOrNil works incorrectly on array");
  equal( !classOrNil("Hello"), true,"jsface.classOrNil works incorrectly on string");
  equal( !classOrNil({ one: 1, two: 2 }), true, "jsface.classOrNil works incorrectly on map");

  // jsface's Class/Singleton
  var Foo = Class({}),
      Bar = Class({
        constructor: function(){}
      }),
      Util = Class({
        $singleton: true
      });

  equal(classOrNil(Foo), Foo, "jsface.classOrNil works incorrectly on an empty class");
  equal(classOrNil(Bar), Bar, "jsface.classOrNil works incorrectly on a simple class");
  equal(classOrNil(Util), null, "jsface.classOrNil works incorrectly a singleton class (singleton is a map, not a class)");
});

// --------- CLASS --------- //

test("Special syntax", function() {
  var Test = Class();
  equal(classOrNil(Test), Test, "Class definition must be a class");

  var Foo = Class({});
  equal(classOrNil(Foo), Foo, "Class definition must be a class");

  var Bar = Class(Object, {});
  equal(classOrNil(Bar), Bar, "Class definition must be a class");
});

test("Create a simple class", function() {
  var Foo = Class({
        constructor: function(name) {
          this.name = name;
        },

        sayHi: function() {
          return "Hello World " + this.name;
        }
      });

  var foo = new Foo("John Rambo");

  equal(functionOrNil(Foo), Foo, "Class definition must be a function");
  equal(classOrNil(Foo), Foo, "Class definition must be a class");
  equal(mapOrNil(foo), foo, "Class instance must be a map");
  equal(foo.sayHi(), "Hello World John Rambo", "Error invoking method on class instance");
  equal(foo.name, "John Rambo", "Invalid constructor initialization");
});

test("Class with default constructor", function() {
  var Foo = Class({
        sayBye: function() {
          return "Bye!";
        }
      });

  var foo = new Foo();

  equal(functionOrNil(Foo), Foo, "Default constructor must be a function");
  equal(foo.sayBye(), "Bye!", "Error invoking method on class instance");
});

test("Private properties and methods", function() {
  var Foo = Class(function() {
        var bye = "Bye!";

        function hi() {
          return "Hi!";
        }

        return {
          sayHi: hi,

          sayBye: function() {
            return bye;
          }
        };
      });

  var foo = new Foo();

  equal(functionOrNil(Foo), Foo, "Default constructor must be a function");
  equal(foo.sayBye(), "Bye!", "Error invoking method on class instance");
  equal(foo.sayHi(), "Hi!", "Invalid private implementation");
  equal( !foo.hi, true, "Invalid private implementation");
  equal( !foo.bye, true, "Invalid private implementation");
});

test("Create a sub class", function() {
  var Foo = Class({
        constructor: function(name) {
          this.name = name;
        },

        welcome: function() {
          return "Welcome " + this.name;
        },

        sayHi: function() {
          return "Hello World " + this.name;
        }
      });

  var Bar = Class(Foo, {
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

  var bar = new Bar("John Rambo");

  equal(bar.name, "John Rambo", "Subclass must be able to invoke parent constructor");
  equal(bar.welcome(), "Welcome John Rambo", "Subclass must be able to inherit parent methods");
  equal(bar.sayHi(), "Hello World John Rambo", "Subclass must be able to invoke parent method");
  equal(bar.sayBye(), "Bye!", "Error invoking subclass method");
});

test("Multiple level class inheritance", function() {
  var Foo = Class({
        constructor: function(name) {
          this.name = name;
        },

        sayHi: function() {
          return "Hello " + this.name;
        }
      });

  var Bar = Class(Foo, {
        constructor: function(name) {
          Bar.$super.call(this, name);
        },

        sayHi: function() {
          return Bar.$superp.sayHi.call(this);
        }
      });

  var Child = Class(Bar, {
        constructor: function(name) {
          Child.$super.call(this, name);
        },

        sayHi: function() {
          return Child.$superp.sayHi.call(this);
        }
      });

  var child = new Child("John Rambo");

  equal(child.name, "John Rambo", "Subclass must be able to invoke parent constructor");
  equal(child.sayHi(), "Hello John Rambo", "Subclass must be able to invoke parent method");
});

test("Static methods", function() {
  var Bar = Class({
        constructor: function(name) {
          this.name = name;
        },

        $statics: {
          sayBye: function() {
           return "Bye!";
          }
        }
      });

  var bar = new Bar("John Rambo");

  equal(Bar.sayBye(), "Bye!", "Error invoking static method");
  equal(bar.sayBye(), "Bye!", "Error invoking static method from class instance");
  equal(bar.sayBye, Bar.sayBye, "Static method must be the same on both class and class instance");
});

test("Singleton class", function() {
  var Foo = Class({
        $singleton: true,

        sayHi: function() {
          return "Hello World";
        }
      });

  equal(mapOrNil(Foo), Foo, "Singleton class must be a map object");
  equal(Foo.sayHi(), "Hello World", "Error invoking method on singleton class");
});

test("Singleton inheritance", function() {
  var Foo = Class({
        $singleton: true,

        sayHi: function() {
          return "Hello World";
        }
      });

  var Bar = Class(Foo, {
        $singleton: true,

        sayBye: function() {
          return "Bye!";
        }
      });

  equal(mapOrNil(Bar), Bar, "Singleton class must be a map object");
  equal(Bar.sayHi(), "Hello World", "Error invoking method on singleton class");
  equal(Bar.sayBye(), "Bye!", "Error invoking method on singleton class");
});

test("Inherit from a singleton", function() {
  var Foo = Class({
        $singleton: true,

        sayHi: function() {
          return "Hello World";
        }
      });

  var Bar = Class(Foo, {
        sayBye: function() {
          return "Bye!";
        }
      });

  var bar = new Bar();

  equal(classOrNil(Bar), Bar, "Class definition must be a class");
  equal(bar.sayHi, Bar.sayHi, "Static method must be the same on both class and class instance");
  equal(bar.sayHi, Foo.sayHi, "Static method must be the same on both class and class instance");
  equal(Foo.sayHi, Bar.sayHi, "Static method must be the same on both class");
  equal(Bar.sayHi(), "Hello World", "Error invoking method on singleton class");
  equal(bar.sayHi(), "Hello World", "Error invoking method on singleton class");
  equal(bar.sayBye(), "Bye!", "Error invoking method on class");
});

test("Mixin: class extends class", function() {
  var Foo = Class({
        constructor: function(name) {
          this.name = name;
        },

        welcome: function() {
          return "Welcome " + this.name;
        },

        sayHi: function() {
          return "Hello World " + this.name;
        }
      });

  var Bar = Class({
        constructor: function(name) {
          this.name = name;
        },

        welcome: function() {
          return "invalid";
        },

        sayBye: function() {
          return "Bye!";
        }
      });

  extend(Bar, Foo); // note: extend is different from inherit: Foo's properties will override Bar's properties

  var bar = new Bar("John Rambo");

  equal(bar.name, "John Rambo", "Invalid extend() behavior, constructor must be bound correctly");
  equal(bar.welcome(), "Welcome John Rambo", "Invalid extend() behavior, property must be overriden properly");
  equal(bar.sayHi(), "Hello World John Rambo", "Invalid extend() behavior");
  equal(bar.sayBye(), "Bye!", "Invalid extend() behavior");
});

test("Mixin: instance extends class", function() {
  var Foo = Class({
        constructor: function(name) {
          this.name = name;
        },

        welcome: function() {
          return "Welcome " + this.name;
        },

        sayHi: function() {
          return "Hello World " + this.name;
        }
      });

  var Bar = Class({
        constructor: function(name) {
          this.name = name;
        },

        welcome: function() {
          return "invalid";
        },

        sayBye: function() {
          return "Bye!";
        }
      });

  var bar = new Bar("John Rambo");

  extend(bar, Foo);

  equal(bar.name, "John Rambo", "Invalid extend() behavior, constructor must be bound correctly");
  equal(bar.welcome(), "Welcome John Rambo", "Invalid extend() behavior, property must be overriden properly");
  equal(bar.sayHi(), "Hello World John Rambo", "Invalid extend() behavior");
  equal(bar.sayBye(), "Bye!", "Invalid extend() behavior");
});

test("Mixin: instance extends multiple classes", function() {
  var Foo = Class({
        constructor: function(name) {
          this.name = name;
        },

        welcome: function() {
          return "Welcome " + this.name;
        },

        sayHi: function() {
          return "Hello World " + this.name;
        }
      });

  var Properties = Class({
        setProperty: function(key, value) {
          this[key] = value;
        },
        getProperty: function(key) {
          return this[key];
        }
      });

  var Bar = Class({
        constructor: function(name) {
          this.name = name;
        },

        welcome: function() {
          return "invalid";
        },

        sayBye: function() {
          return "Bye!";
        }
      });

  var bar = new Bar("John Rambo");

  extend(bar, [ Foo, Properties ]);
  bar.setProperty("fooKey", "fooValue");

  equal(bar.name, "John Rambo", "Invalid extend() behavior, constructor must be bound correctly");
  equal(bar.welcome(), "Welcome John Rambo", "Invalid extend() behavior, property must be overriden properly");
  equal(bar.sayHi(), "Hello World John Rambo", "Invalid extend() behavior");
  equal(bar.sayBye(), "Bye!", "Invalid extend() behavior");
  equal(bar.getProperty("fooKey"), "fooValue", "Invalid extend() behavior");
});


test("Mixin: instance extends class and instance", function() {
  var Foo = Class({
        constructor: function(name) {
          this.name = name;
        },

        welcome: function() {
          return "Welcome " + this.name;
        },

        sayHi: function() {
          return "Hello World " + this.name;
        }
      });

  var Properties = Class({
        setProperty: function(key, value) {
          this[key] = value;
        },
        getProperty: function(key) {
          return this[key];
        }
      });

  var Bar = Class({
        constructor: function(name) {
          this.name = name;
        },

        welcome: function() {
          return "invalid";
        },

        sayBye: function() {
          return "Bye!";
        }
      });

  var bar = new Bar("John Rambo");

  extend(bar, [ Foo, new Properties() ]);
  bar.setProperty("fooKey", "fooValue");

  equal(bar.name, "John Rambo", "Invalid extend() behavior, constructor must be bound correctly");
  equal(bar.welcome(), "Welcome John Rambo", "Invalid extend() behavior, property must be overriden properly");
  equal(bar.sayHi(), "Hello World John Rambo", "Invalid extend() behavior");
  equal(bar.sayBye(), "Bye!", "Invalid extend() behavior");
  equal(bar.getProperty("fooKey"), "fooValue", "Invalid extend() behavior");
});


test("Mixin: class extends singleton", function() {
  var Foo = Class({
        $singleton: true,

        welcome: function() {
          return "Welcome " + this.name;
        },

        sayHi: function() {
          return "Hello World " + this.name;
        }
      });

  var Bar = Class({
        constructor: function(name) {
          this.name = name;
        },

        welcome: function() {
          return "invalid";
        },

        sayBye: function() {
          return "Bye!";
        }
      });

  extend(Bar, Foo);

  var bar = new Bar("John Rambo");

  equal(bar.welcome(), "Welcome John Rambo", "Invalid extend() behavior, property must be overriden properly");
  equal(bar.sayHi(), "Hello World John Rambo", "Invalid extend() behavior");
  equal(bar.sayBye(), "Bye!", "Invalid extend() behavior");
});

test("Mixin: singleton extends class", function() {
  var Foo = Class({
        $singleton: true,

        welcome: function() {
          return "Welcome " + this.name;
        },

        sayHi: function() {
          return "Hello World " + this.name;
        }
      });

  var Bar = Class({
        $statics: {
          sample: 1,
          fn: function() { return 2; }
        },

        constructor: function(name) {
          this.name = name;
        },

        welcome: function() {
          return "invalid";
        },

        sayBye: function() {
          return "Bye!";
        }
      });

  extend(Foo, Bar);

  equal(Foo.sample, 1, "Invalid extend() behavior, property must be overriden properly");
  equal(Foo.fn(), 2, "Invalid extend() behavior");
});

test("Mixin: class extends multiple classes", function() {
  var Options = Class({
        setOptions: function(opts) {
          this.opts = opts;
        }
      });

  var Events = Class({
        bind: function(event, fn) {
          return true;
        },
        unbind: function(event, fn) {
          return false;
        }
      });

  var Foo = Class({
        constructor: function(name) {
          this.name = name;
        }
      });

  extend(Foo, [ Options, Events ]);

  var bar = new Foo("Bar");
  bar.setOptions("nothing");

  equal(bar.name, "Bar", "Invalid extend() behavior, constructor must be bound correctly");
  equal(bar.opts, "nothing", "Invalid extend() behavior, constructor must be bound correctly");
  ok(bar.bind(), "Invalid extend() behavior");
  equal( !bar.unbind(), true, "Invalid extend() behavior");
});


test("Mixin: class extends both class and instance", function() {
  var Options = Class({
        setOptions: function(opts) {
          this.opts = opts;
        }
      });

  var Events = Class({
        bind: function(event, fn) {
          return true;
        },
        unbind: function(event, fn) {
          return false;
        }
      });

  var Foo = Class({
        constructor: function(name) {
          this.name = name;
        }
      });

  extend(Foo, [ Options, new Events() ]);

  var foo = new Foo("Bar");
  foo.setOptions("nothing");

  equal(foo.name, "Bar", "Invalid extend() behavior, constructor must be bound correctly");
  equal(foo.opts, "nothing", "Invalid extend() behavior, constructor must be bound correctly");
  equal(Foo.bind(), true, "Invalid extend() behavior");
  equal( !Foo.unbind(), true, "Invalid extend() behavior");
  equal(foo.bind(), true, "Invalid extend() behavior");
  equal( !foo.unbind(), true, "Invalid extend() behavior");
});

test("Mixin: extending native objects", function() {
  extend(String, {
    trim: function() {
      return this.replace(/^\s+|\s+$/g, "");
    }
  });

  equal("    Hello World   ".trim(), "Hello World", "Invalid extend() binding String.prototype");

  extend(Array, {
    sum: function() {
      var s = 0, len = this.length;
      while (len--) {
        s += this[len];
      }
      return s;
    }
  });

  var a = [ 1, 2, 3, 4, 5 ];
  ok(a.sum, "Invalid extend() binding native object");
  ok(Array.sum, "Invalid extend() binding native object");
  ok(Array.prototype.sum, "Invalid extend() binding native object");
  equal(a.sum(), 15, "Invalid extend() binding native object");
});

test("Mixin: extending native objects (prototype only)", function() {
  delete Array.sum;

  extend(Array.prototype, {
    sum: function() {
      var s = 0, len = this.length;
      while (len--) {
        s += this[len];
      }
      return s;
    }
  });

  var a = [ 1, 2, 3, 4, 5 ];

  ok(a.sum, "Invalid extend() binding native object");
  ok( !Array.sum, "Invalid extend() binding native object");
  ok(Array.prototype.sum, "Invalid extend() binding native object");
  equal(a.sum(), 15, "Invalid extend() binding native object");
  delete Array.prototype.sum;
});

test("Test public static void main ;-)", function() {
  var passed;

  var Person = Class({
    constructor: function(name) {
      this.name = name;
    },

    getName: function() {
      passed = true;
      return this.name;
    },

    main: function(Person) {
      // Note that main has access to Person in its arguments only, not the person declared as var outside
      var p = new Person("Rika");
      p.getName();
    }
  });

  ok(passed, "main method must be executed correctly");
  equal(undefined, Person.main, "main must not bound to Person");
  equal(undefined, Person.prototype.main, "main must not bound to Person.prototype");
});

// --------- PLUGINS --------- //

test("Develop a Class plugin", function() {
  var Logger = Class({
    log: function(msg) {
      console.log(msg);
    }
  });

  Class.plugins.$log = function(clazz, parent, api) {
    extend(clazz, Logger);
  }

  var Foo = Class();
  var foo = new Foo();

  equal(functionOrNil(Foo.prototype.log), Foo.prototype.log, "Class plugins mechanism works incorrectly");
  equal(functionOrNil(foo.log), foo.log, "Class plugins mechanism works incorrectly");
  delete Class.plugins.$log;
});
