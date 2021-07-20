# API

## 生成一个字体

使用`fontCarrier.create(options)`生成一个空白字体对像 

* options是字体对象的构造参数，具体见下面的 font 对象部分

使用`fontCarrier.transfer(path,options)`解析一个已有字体，支持svg,ttf的字体。

* `path` 支持文件地址，也支持文件 buffer。
* `options` 是字体对象的构造参数，具体见下面的 font 对象部分

eg.

```js
// 创建空白字体
var font = fontCarrier.create()

// 从其他字体解析
var transFont = fontCarrier.transfer('./test/test.ttf')
// same as
// var buffer = fs.readFileSync('./test/test.ttf')
// var transFont = fontCarrier.transfer(buffer)
```

## 导出字体

一旦你拿到一个字体对象后，你可以选择导出它，默认会生成 svg，ttf，woff，woff2，eot 四种字体格式。

`font.output(options)`

* options.path  可选。导出的文件路径，不需要后缀
* options.types 可选。导出的字体类型默认是 ['ttf', 'eot', 'woff', woff2, 'svg']，忽略不支持的格式

返回一个对象，包含导出的所有字体的buffer

eg.

```js
font.output({
  path: './iconfont',
  types: ['ttf'],
})
```

## 相关对象

font-carrier 里面有三种对象 font，fontface，glyph。每个对象都有自己的构造参数包含一些初始化信息。所有的初始化参数后面都可以使用 `get(key)`，`set(key,value)` 来进行简单的操作。

### font 对象

一个 font 对象就表示解析后的字体对象，包含字体所有的信息

构造参数包括：

* id: 字体的 postscript name，默认是 1024
* horizAdvX: 字体的水平画布大小，默认是 1024
* vertAdvY: 字体的垂直画布大小，默认是 1024

#### `font.getFontface()`
获取对应的 fontface 对象

返回一个 fontface 对象

#### `font.setFontface(options)`
设置对应的 fontface 对象

* options 可以是一个 fontface 对象也可以是 fontface 对象的构造参数

#### `font.getSvg(keys)`
获取指定文字（keys）的 SVG。

* keys 可以是单个的字，也可以是多个字组成的字符串，也可以是数组。

如果是单个字就返回一个 SVG 字符串，否则返回一个 hash 对象，key 是 unicode，value 是对应的 SVG

#### `font.setSvg()`
用于针对字设置对应的 SVG 图形
有两种使用方式：

1. font.setSvg(key,value) 用于设置单个
  * key是对应的字，也可以是 unicode
  * value是对应的svg图形
2. font.setSvg({key,value}) 可用于设置多个
  * key,value 同上，主要可以使用 object 的方式一次性设置多个

#### `font.getGlyph(keys)`
获取指定文字（keys）的 glyph 对象。

* keys 可以是单个的字，也可以是多个字组成的字符串，也可以是数组。

如果是单个字就返回一个 glyph 对象，否则返回一个 hash 对象，key 是 unicode，value 是对应的 glyph 对象

#### `font.setGlyph()`
用于针对字设置对应的 glyph 对象
有两种使用方式：

1. font.setGlyph(key,value) 用于设置单个
  * key 是对应的字，也可以是 unicode
  * value 是对应的 glyph 对象，或者是一个 glyph 的构造参数对象
2. font.setGlyph({key,value}) 可用于设置多个
  * key，value 同上，主要可以使用 object 的方式一次性设置多个

#### `font.allGlyph()`
用于返回所有的字体对象集合

返回的是一个对象，key是 unicode，value 是对应的 glyph 对象

#### `font.toString()`
将当前字体解析成对应svg字体的字符串并返回

#### `font.clean()`
将当前字体的所有字形清空

#### `font.min(input)`
精简当前字体

* input 是一个字符串，支持 unicode，会去掉 font 里面除 input 用到的字形之外所有的字形

返回精简后的字体对象

#### `font.output(options)`
导出字体

* options.path  可选。导出的文件路径，不需要后缀
* options.types 可选。导出的字体类型默认是 ['ttf','eot','woff','svg']

返回一个对象，包含导出的所有字体的 buffer

### fontface 对象

fontface 对象包含了字体的一些特殊相关信息，参数如下：

* fontFamily: 字体的 fontfamily
* unitsPerEm: 字体的 unitsPerEm 默认是 1024
* ascent: 字体的上偏移量，默认是 812
* descent: 字体的下偏移量，默认是 -212

### glyph 字形对象

glyph 字形对象代表了具体某个字的信息。包括下面这些参数：

* unicode: 字体对应的 unicode,比如我对应的 unicode是 `&#x6211;` 实际使用时直接使用我就行，内部会帮忙转换
* glyphName: 字体对应的名称,默认是 unicode（些许变化）
* d: 字体对应的序列，这个是具体的字体形状，不是是做了变化之后的，不建议直接使用这个 `d` ，建议使用 SVG 参数替代，内部会帮忙把 SVG 转换成对应的 `d` 参数
* horizAdvX: 字体的水平画布大小，默认 1024
* vertAdvY: 字体的垂直画布大小，默认 1024

> 这边注意的是 `d` 这个参数是转化后的path序列，不建议在新建 glyph 对象的时候使用。建议使用 SVG 替代 `d`，内部会自动帮忙转换成对应的 `d` 参数。

#### `glyph.getFont()`
获取当前字形对应的字体对象

返回对应的字体对象

#### `glyph.setFont(font)`
设置当前 glyph 的字体，会按照新的字体做一系列的变换

#### `glyph.toSvg(options)`
导出当前字形对象的 SVG

* path           导出的路径，可选
* options.width  导出的 SVG 的宽度
* options.height 导出的 SVG 的高度

返回对应的 SVG 字符串
