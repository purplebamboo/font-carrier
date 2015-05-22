var Utils = Class({
	$singleton: true,

	md5: function(msg) {
		return "Foo MD5 hash";
	}
});

var CommonUtils = Class(Utils, {
   $singleton: true,

   sh1: function(msg) {
      return "Foo SH1 hash";
   }
});