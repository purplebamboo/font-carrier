var context    = this,
    Class      = jsface.Class,
    extend     = jsface.extend,
    pointcut   = jsface.pointcut;

test("Pointcut over constructor", function() {
  var Person = Class({
    constructor: function(name) {
      this.name = name;
    },

    getName: function() {
      return name;
    }
  });

  Person = pointcut(Person, {
    constructor: {
      before: function() {
        this.age = 23;
      },
      after: function() {
        this.email = "test@foo.com";
      }
    }
  });

  var p = new Person("Kim");

  equal(p.name, "Kim", "Pointcut makes constructor work incorrectly");
  equal(p.age, 23, "Pointcut before works incorrectly");
  equal(p.email, "test@foo.com", "Pointcut after works incorrectly");
});

test("Pointcut over constructor: sugar before syntax", function() {
  var Person = Class({
    constructor: function(name) {
      this.name = name;
    }
  });

  Person = pointcut(Person, {
    constructor: function() {
      this.age = 23;
    }
  });

  var p = new Person("Kim");

  equal(p.name, "Kim", "Pointcut makes constructor work incorrectly");
  equal(p.age, 23, "Pointcut before works incorrectly");
});

test("Pointcut over constructor: skip actual constructor", function() {
  var Person = Class({
    constructor: function(name) {
      this.name = name;
    }
  });

  Person = pointcut(Person, {
    constructor: function() {
      this.age = 23;
      return { $skip: true };       // skip actual constructor
    }
  });

  var p = new Person("Kim");

  notEqual(p.name, "Kim", "Pointcut makes constructor work incorrectly");
  equal(p.age, 23, "Pointcut before works incorrectly");
});

test("Pointcut over method", function() {
  var Person = Class({
    constructor: function(name) {
      this.name = name;
    },

    getName: function() {
      return this.name;
    }
  });

  Person = pointcut(Person, {
    getName: {
      before: function() {
        this.age = 23;
      },
      after: function() {
        this.email = "test@foo.com";
      }
    }
  });

  var p = new Person("Kim");

  equal(p.name, "Kim", "Pointcut makes method work incorrectly");
  equal(p.getName(), "Kim", "Pointcut makes method work incorrectly");
  equal(p.age, 23, "Pointcut before works incorrectly");
  equal(p.email, "test@foo.com", "Pointcut after works incorrectly");
});

test("Pointcut over method: sugar before syntax", function() {
  var Person = Class({
    constructor: function(name) {
      this.name = name;
    },

    getName: function() {
      return this.name;
    }
  });

  Person = pointcut(Person, {
    getName: function() {
      this.age = 23;
    }
  });

  var p = new Person("Kim");

  equal(p.name, "Kim", "Pointcut makes method work incorrectly");
  equal(p.getName(), "Kim", "Pointcut makes method work incorrectly");
  equal(p.age, 23, "Pointcut before works incorrectly");
});

test("Pointcut over method: skip actual method", function() {
  var Person = Class({
    constructor: function(name) {
      this.name = name;
    },

    getName: function() {
      return this.name;
    }
  });

  Person = pointcut(Person, {
    getName: function() {
      return {
        $skip: true,
        $data: "intercepted value"
      };
    }
  });

  var p = new Person("Kim");

  equal(p.name, "Kim", "Pointcut makes constructor work incorrectly");
  equal(p.getName(), "intercepted value", "Pointcut { $skip, $data } works incorrectly");
});

test("Pointcut: special syntax", function() {
  var Person = Class({
    constructor: function(name) {
      this.name = name;
    },

    getName: function() {
      return this.name;
    }
  }), flag = true, error;

  try {
    pointcut(Person, {});
    pointcut(Person, new Date());
    pointcut(Person, new Object());
  } catch (e) {
    error = e;
    flag = false;
  }

  ok(flag, error);
});

test("Pointcut with invalid params", function() {
  var Person = Class({
    constructor: function(name) {
      this.name = name;
    },

    getName: function() {
      return this.name;
    },

    setName: function(name) {
      this.name = name;
    }
  });

  raises(function() {
    pointcut();
  });

  raises(function() {
    pointcut(Person);
  });

  var collection = [ undefined, null, "", " ", "a string", new String(), 0, 1234, Infinity, [] ];
  for (var i in collection) {
    raises(function() {
      pointcut(Person, collection[i]);
    });
  }

  collection = [{
    constructor: 123
  }, {
    constructor: "invalid constructor pointcut"
  }, {
    constructor: {
      before: "invalid before"
    }
  }, {
    constructor: {
      after: "invalid after"
    }
  }];

  for (i in collection) {
    raises(function() {
      pointcut(Person, collection[i]);
    });
  };
});

test("Pointcut over native method", function() {
  var before, after;

  pointcut(Array, {
    join: {
      before: function() {
        before = true;
      },
      after: function() {
        after = true;
      }
    }
  });

  [ 1, 2, 3, 4 ].join(",");

  ok(before, "before pointcut over Array.join works incorrectly");
  ok(after, "after pointcut over Array.join works incorrectly");
  });

  test("Multiple levels pointcut", function() {
  var r = [];

  var Person = Class({
    constructor: function(name) {
      r.push("constructor");
    },
    foo: function() {
      r.push("foo");
    }
  });

  // Pointcut 1
  Person = pointcut(Person, {
    constructor: {
      before: function() {
        r.push("c:before:1");
      },
      after: function() {
        r.push("c:after:1");
      }
    },
    foo: {
      before: function() {
        r.push("foo:before:1");
      },
      after: function() {
        r.push("foo:after:1");
      }
    }
  });

  // Pointcut 2
  Person = pointcut(Person, {
    constructor: {
      before: function() {
        r.push("c:before:2");
      },
      after: function() {
        r.push("c:after:2");
      }
    },
    foo: {
      before: function() {
        r.push("foo:before:2");
      },
      after: function() {
        r.push("foo:after:2");
      }
    }
  });

  // Pointcut 3
  Person = pointcut(Person, {
    constructor: {
      before: function() {
        r.push("c:before:3");
      },
      after: function() {
        r.push("c:after:3");
      }
    },
    foo: {
      before: function() {
        r.push("foo:before:3");
      },
      after: function() {
        r.push("foo:after:3");
      }
    }
  });

  var person = new Person("Rika");
  person.foo();

  equal(r[0], "c:before:3", "Multiple levels pointcut works incorrectly");
  equal(r[1], "c:before:2", "Multiple levels pointcut works incorrectly");
  equal(r[2], "c:before:1", "Multiple levels pointcut works incorrectly");
  equal(r[3], "constructor", "Multiple levels pointcut works incorrectly");
  equal(r[4], "c:after:3", "Multiple levels pointcut works incorrectly");
  equal(r[5], "c:after:2", "Multiple levels pointcut works incorrectly");
  equal(r[6], "c:after:1", "Multiple levels pointcut works incorrectly");
  equal(r[7], "foo:before:3", "Multiple levels pointcut works incorrectly");
  equal(r[8], "foo:before:2", "Multiple levels pointcut works incorrectly");
  equal(r[9], "foo:before:1", "Multiple levels pointcut works incorrectly");
  equal(r[10], "foo", "Multiple levels pointcut works incorrectly");
  equal(r[11], "foo:after:3", "Multiple levels pointcut works incorrectly");
  equal(r[12], "foo:after:2", "Multiple levels pointcut works incorrectly");
  equal(r[13], "foo:after:1", "Multiple levels pointcut works incorrectly");
});

test("Pointcuts over static methods", function() {
  var Counter = Class({
    constructor: function(num) {
      this.num = num;
    },
    $statics: {
      counter: 0,

      inc: function(n) {
        this.num += n;
      }
    }
  });

  Counter = pointcut(Counter, {
    inc: {
      before: function(n) {
        this.num += n;
        Counter.counter += 1;
      },
      after: function(n) {
        this.num += n;
        Counter.counter += 1;
      }
    }
  });

  var p = new Counter(100);
  p.inc(1);
  Counter.inc(0);
  equal(p.num, 103, "Pointcut over static methods works incorrectly");
  equal(Counter.counter, 4, "Pointcut over static methods works incorrectly");
});

test("Pointcuts over instances", function() {
  var Counter = Class({
    constructor: function(num) {
      this.num = num;
    },
    inc: function(n) {
      this.num += n;
    }
  });

  var p = new Counter(100);
  pointcut(p, {
    inc: {
      before: function(n) {
        this.num += n;
      },
      after: function(n) {
        this.num += n;
      }
    }
  });

  p.inc(1);
  equal(p.num, 103, "Pointcut over instances works incorrectly");
});

test("Pointcuts and $super", function() {
  var Counter = Class({
    constructor: function(num) {
      this.num = num;
    },
    inc: function(n) {
      this.num += n;
    }
  });

  var Child = Class(Counter, {
    constructor: function(num) {
      Child.$super.call(this, num);
    },
    inc: function(n) {
      Child.$superp.inc.call(this, n);
    }
  });

  Child = pointcut(Child, {
    constructor: {
      before: function() {
        this.before = true;
      },
      after: function() {
        this.after = true;
      }
    },
    inc: {
      before: function() {
        this.iBefore = true;
      },
      after: function() {
        this.iAfter = true;
      }
    }
  });

  var p = new Child(100);
  p.inc(1);

  equal(p.num, 101, "Pointcut works incorrectly with $super");
  equal(true, p.before, "Pointcut works incorrectly with $super");
  equal(true, p.after, "Pointcut works incorrectly with $super");
  equal(true, p.iBefore, "Pointcut works incorrectly with $super");
  equal(true, p.iAfter, "Pointcut works incorrectly with $super");
});

test("Remove all pointcuts", function() {
  var impl = {
    constructor: function(name) {
    },
    foo: function() {
    }
  };

  var advisor = {
    constructor: {
      before: function before() {},
      after: function after() {}
    },
    foo: {
      before: function before() {},
      after: function after() {}
    }
  };

  var Person = Class(impl);

  // apply advisor
  Person = pointcut(Person, advisor);

  // remove all pointcut
  Person = pointcut(Person, "remove");

  equal(impl.constructor, Person, "unpointcut works incorrectly");
  equal(impl.constructor, Person.prototype.constructor, "unpointcut works incorrectly");
  equal(impl.foo, Person.prototype.foo, "unpointcut works incorrectly");
});

test("Remove some pointcuts", function() {
  var impl = {
    constructor: function(name) {
    },
    foo: function() {
    }
  };

  var advisor = {
    constructor: {
      before: function before() {},
      after: function after() {}
    },
    foo: {
      before: function before() {},
      after: function after() {}
    }
  };

  var Person = Class(impl);
  Person = pointcut(Person, advisor);
  Person = pointcut(Person, "remove constructor foo");

  equal(impl.constructor, Person, "unpointcut works incorrectly");
  equal(impl.constructor, Person.prototype.constructor, "unpointcut works incorrectly");
  equal(impl.foo, Person.prototype.foo, "unpointcut works incorrectly");
});

test("Remove a pointcut explicitly", function() {
  var impl = {
    constructor: function(name) {
    },
    foo: function() {
    }
  };

  var advisor = {
    constructor: {
      before: function before() {},
      after: function after() {}
    },
    foo: {
      before: function before() {},
      after: function after() {}
    }
  };

  var Person = Class(impl);
  Person = pointcut(Person, advisor);
  Person = pointcut(Person, "remove", advisor);

  equal(impl.constructor, Person, "unpointcut works incorrectly");
  equal(impl.constructor, Person.prototype.constructor, "unpointcut works incorrectly");
  equal(impl.foo, Person.prototype.foo, "unpointcut works incorrectly");
});

test("Remove a pointcut over static method", function() {
  var impl = {
    $statics: {
      foo: function() {
      }
    }
  };

  var advisor = {
    foo: {
      before: function before() {},
      after: function after() {}
    }
  };

  var Person = Class(impl);
  Person = pointcut(Person, advisor);
  Person = pointcut(Person, "remove");

  equal(impl.$statics.foo, Person.prototype.foo, "Removing pointcut over prototype method unsuccessfully");
  equal(impl.$statics.foo, Person.foo, "Removing pointcut over static method unsuccessfully");
});

test("Remove a pointcut over static method, remove advisor", function() {
  var impl = {
    $statics: {
      foo: function() {
      }
    }
  };

  var advisor = {
    foo: {
      before: function before() {},
      after: function after() {}
    }
  };

  var Person = Class(impl);
  Person = pointcut(Person, advisor);
  Person = pointcut(Person, "remove", advisor);

  equal(impl.$statics.foo, Person.prototype.foo, "Removing pointcut over prototype method unsuccessfully");
  equal(impl.$statics.foo, Person.foo, "Removing pointcut over static method unsuccessfully");
});
