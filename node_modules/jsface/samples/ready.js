// $ready is a mechanism to notify parent class when its subclasses are created

var Service = Class({
   $ready: function(clazz, api, parent) {
      if (this !== clazz) {
         switch (api.scope) {
            case "prototype":
               break;
            case "request":
               break;
            case "flash":
               break;
            case "flow":
               break;
            case "conversation":
               break;
            case "session":
               break;
         }
         console.log("Create subclass with type '" + api.scope + "'");
      }
   }
});

var AuthenticationService = Class(Service, {
   scope: "request"
});