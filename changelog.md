# 0.4.0-beta.9 (2026-11-11)
- 使用 `@yisibl/svgpath` 替代 `svgpath`，修复半径极大的退化圆弧转字体时坐标越界报错
- 升级 `svg2ttf-new` 到 6.1.0-beta.4（基于上游 svg2ttf 6.1.0）
- 锁定 `opentype.js` 为 1.3.4，1.3.5 解析部分 TTF 时 `name.postScriptName` 为空导致 `transfer()` 报错

# 0.3.1 (2021-05-11)
- 添加 .npmignore 文件，防止发布的包体积太大
- 更新 readme.md 中的徽标

# 0.3.0 (2021-05-11)
- `convert()` 和 `font.output()` 中的 `types` 选项将自动忽略不支持的格式
- 升级相关依赖
- 更新测试用例，生成 ttx 文件，方便查看升级后的字体变化
- 由于升级的 ttf2woff2 依赖 Node.js >=12.19.0，font-carrier 不再支持小于 12.19.0 的版本
# 0.2.1 (2021-03-16)
- Engine 中的 `convert()` 方法支持转换 ttf 文件（之前只支持 svg 字体）

# 0.2.0 (2019-09-06)
- New: 支持配置 svg2ttf 的 options 参数
- Fix: 部分字体基线错位
- Fix: 升级 svgpath，修复 [arcs 解析错误](https://github.com/fontello/svgpath/issues/23)
- Update: 升级除 ttf2svg 以外的所有依赖
- Doc: 增加 MIT LICENSE，增加 changelog.md
