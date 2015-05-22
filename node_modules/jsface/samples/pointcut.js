Person = Class({
  constructor: function(name) {
    this.name    = name;
    this.counter = 0;
  },
  foo: function(n) {
  },
  bar: function(n) {
  }
});

var advisor = {
  constructor: {
    before: function() {
      this.age = 20;
    },
    after: function() {
      this.email = "rika@sample.com";
    }
  },
  foo: function(n) {                             // sugar syntax, foo:before
    this.counter++;
  },
  bar: {
    before: function(n) {
      this.counter++;
    },
    after: function(n) {
      this.counter++;
    }
  }
};

Person = pointcut(Person, advisor);
