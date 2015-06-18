# EXAMPLE


## 案例一

使用svg设置一些icon

```js
//创建空白字体，使用svg生成字体
var font = fontCarrier.create()
var love = fs.readFileSync('./test/svgs/love.svg').toString()
var mail = fs.readFileSync('./test/svgs/mail.svg').toString()

//使用汉字
font.setGlyph('爱',{
  svg:love,
  glyphName:'爱'
})

//使用unicode
font.setSvg('&#xe601;',mail)

font.output({
  path:'./test'
})

```


## 案例二

从其他字体导出一些图标到自己的库里

``` js
var transFont = fontCarrier.transfer('./test/test.ttf')

var gs = transFont2.getGlyph('我是方正')
//设置到上面案例一里的字体里面
font.setGlyph(gs)

//这样font导出的字体里面就有了'我是方正'对应的svg形状了
font.output({
  path:'./test'
})


```

## 案例三

对中文字体精简

``` js
//使用上面的transFont
//会自动根据当前的输入的文字过滤精简字体
transFont.min('我是精简后的字体，我可以重复')
transFont.output({
  path:'./min'
})

```