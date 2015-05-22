
/**
 * 字体里面的unicode千奇百怪有很多种形式，需要进行转换成16进制的unicode
 * 返回最终的16进制值
 */
function str2unicode(str){
  //没有管\\u的情况
  str = str.replace(/&#(x?[a-f\d]+);/ig, function (m, u) {
      var HEX_BASE = 10;
      if (u.indexOf('x') === 0) {
        HEX_BASE = 16;
        u = u.substr(1);
      }
      return  String.fromCharCode(parseInt(u, HEX_BASE));
  });
  //将ascii码转换成unicode
  str = str.replace(/[\x00-\xff]/g,function($0){return '&#'+$0.charCodeAt(0)+';'});
  //将汉字转成unicode
  str = str.replace(/[^\u0000-\u00FF]/g,function($0){return escape($0).replace(/(%u)(\w{4})/gi,"\&#x$2;")});
  //将十进制的unicode转换成16进制的。
  str = str.replace(/\&\#(\d+)/g,function($0,$1){return '&#x'+parseInt($1).toString(16)});

  return str;

}

function toUnicode(str){
  var uArray = [];
  var u = str2unicode(str);
  u = u.replace(/[&#x]/g,'');
  uArray = u.split(';');
  uArray.pop();
  return uArray;
}

exports.str2unicode = str2unicode;

//转换为16进制unicode
//返回一个数组
exports.toUnicode = toUnicode;


exports.showError = function(msg){
  throw new Error(msg)
}







