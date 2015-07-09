var fs = require('fs')
//测试新建字体

var fontCarrier = require('../lib/index.js')

var circle = fs.readFileSync('./test/svgs/circle.svg').toString()
var love = fs.readFileSync('./test/svgs/love.svg').toString()
var mail = fs.readFileSync('./test/svgs/mail.svg').toString()


//创建空白字体，使用svg生成字体
var font = fontCarrier.create()

font.setGlyph('爱',{
  svg:love,
  glyphName:'爱'
})

font.setSvg('&#xe600;',circle)
font.setSvg('&#xe601;',mail)
//console.log(font.toString())

font.output({
  path:'./test/font1'
})

console.log('由于需要读取转换2m的方正字体，所以会很慢。。。')

//测试从其他字体获取字形
var transFont = fontCarrier.transfer('./test/test.ttf')
var a = transFont.getGlyph('&#xFF0C;')

font.setGlyph('哈',a)

console.log('开始解析方正字体。。。')
var transFont2 = fontCarrier.transfer('./test/fz.ttf')
console.log('解析结束，实际使用中一般不会解析这么大的字体库。。。')

//测试对象set
var gs = transFont2.getGlyph('我是方正')
font.setGlyph(gs)

font.output({
  path:'./test/font2'
})



//测试精简字体
transFont2.min('我是精简后的字体，我可以重复')
transFont2.output({
  path:'./test/font3'
})

//直接output
transFont2.output()


//导出字形
//var g = font.getGlyph('我')
//g.toSvg('./test/export.svg')

var path = font.getSvg('我')
fs.writeFileSync('./test/export.svg',path)
//测试多个
font.getSvg('我是好人')


