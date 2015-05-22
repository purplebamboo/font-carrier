var Foo = Class(function(){
   // please note that privateCounter and privateEcho are
   // private static. They are shared over Foo's instances
   var privateCounter = 0;

   function privateEcho(msg) {
      return msg;
   }

   return {
      constructor: function(name) {
         Foo.$super.call(this, name);
         privateCounter++;
      },

      echo: privateEcho
   }
});
