var context       = this,
    extend        = jsface.extend,
    isMap         = jsface.isMap,
    functionOrNil = jsface.functionOrNil;

test("$ready plugin: class notifies itself", function() {
  var notified = false;

  var Foo = Class({
    $ready: function(clazz, parent, api) {
      notified = true;
      equal(this, clazz, "clazz must be equal to this");
      ok(functionOrNil(api.$ready), "$ready works incorrectly");
      ok(functionOrNil(api.echo), "$ready works incorrectly");
      ok(functionOrNil(clazz.prototype.echo), "$ready works incorrectly");
      ok( !parent, "$ready works incorrectly");
    },
    echo: function(o) {
      return o;
    }
  });

  ok(notified, "$ready must be executed");
});

test("$ready plugin: class is notified when its subclasses are ready", function() {
  var notified = false;

  var Foo = Class({
    $ready: function(clazz, parent, api) {
      notified = true;

      if (this !== clazz) {
        ok(api.echo2, "$ready works incorrectly");
        ok( !api.$ready, "$ready works incorrectly");
        ok(functionOrNil(clazz.prototype.echo2), "$ready works incorrectly");
      }
    },
    echo: function(o) {
      return o;
    }
  });

  ok(notified, "$ready must be executed when class is created");

  var Bar = Class(Foo, {
    echo2: function(o) {
      return o;
    }
  });
});

test("$ready plugin: class is notified when its subclasses are ready (multiple levels)", function() {
  var count = 0;

  var Foo = Class({
    $ready: function(clazz, parent, api) {
      if (this !== clazz) {
        count++;
      }
    }
  });

  var Bar1 = Class(Foo, {});
  var Bar2 = Class(Bar1, {});
  var Bar3 = Class(Bar2, {});

  ok(count === 3, "$ready must be executed in multiple level inheritance");
});
