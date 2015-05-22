Class({
  constructor: function(name) {
    this.name = name;
  },

  getName: function() {
    return this.name;
  },

  main: function(Person) {
    var p = new Person("Rika");
    console.log(p.getName());
  }
});
