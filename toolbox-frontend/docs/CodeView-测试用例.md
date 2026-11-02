# CodeView 单元测试用例说明

- 被测文件：`src/components/ui/CodeView.jsx`
- 测试文件：`src/components/ui/CodeView.test.jsx`
- 测试框架：Vitest 5 + `react-dom/server`（`renderToStaticMarkup`）
- 运行方式：`npm test` / 覆盖率：`npm run test:coverage`

## 1. 被测逻辑概述

`CodeView` 是纯展示组件，分两层：

1. `highlightLine(line)`：先用 `esc()` 转义 `&`、`<`、`>`，再依次执行 key、字符串、数字、布尔/null 四条正则着色规则；当行内出现 `#` 且整行不匹配 `/["'].*#.*["']/` 时，`#` 之后的部分被当作注释单独着色。
2. `CodeView({ code, className, wrap })`：按 `\n` 切分并逐行着色后合并，通过 `dangerouslySetInnerHTML` 注入 `<pre>`；`wrap` 控制 `whitespace-pre-wrap break-words` 与 `whitespace-pre` 的切换，`className` 追加在尾部。

分支清单：`code || ''`、`commentIdx >= 0`、引号判断正则、`wrap ?`、`className` 默认值，以及四条着色正则各自的命中/未命中路径。

## 2. 用例清单

### 2.1 容器渲染

| 编号 | 用例名称 | 输入 | 预期结果 | 覆盖点 |
| --- | --- | --- | --- | --- |
| TC-01 | 默认开启自动换行并输出基础样式类 | `code='a: 1'` | class 同时包含 `whitespace-pre-wrap`、`break-words`、`overflow-auto`、`rounded-lg`、`border-line`、`bg-muted`、`font-mono`、`text-xs`、`leading-relaxed`、`text-fg` | `wrap` 默认值、基础样式 |
| TC-02 | `wrap=false` 切换为不换行样式 | `code='a: 1', wrap=false` | 包含 `whitespace-pre`，且不含 `whitespace-pre-wrap`、`break-words` | `wrap` 三元 false 分支 |
| TC-03 | 追加自定义 className | `className='my-code-view extra-cls'` | 两个类均出现在 class 中，且位于 `text-fg` 之后 | `className` 插值位置 |
| TC-04 | `code` 为 `undefined` | `code=undefined` | `<pre>` 内部为空，结构完整闭合 | `code \|\| ''` 假值分支 |
| TC-05 | `code` 为 `null` | `code=null` | `<pre>` 内部为空 | 同上 |
| TC-06 | `code` 为空字符串 | `code=''` | `<pre>` 内部为空 | 同上 |
| TC-07 | `code` 为数字 0（假值） | `code=0` | `<pre>` 内部为空 | `code \|\| ''` 假值分支 |
| TC-08 | 多行代码保留换行结构 | `code='first: 1\nsecond: 2'` | 内部包含 1 个 `\n`，切分后 2 段，分别包含 `first`、`second` | `split('\n').join('\n')` |

### 2.2 语法着色

| 编号 | 用例名称 | 输入 | 预期结果 | 覆盖点 |
| --- | --- | --- | --- | --- |
| TC-09 | JSON 带引号的 key 与字符串值均不着色 | `"name": "toolbox"` | 原样输出，不含 `text-primary`、`text-success` | key 正则未命中（见缺陷 D-01） |
| TC-10 | 高亮 YAML 裸 key | `name: toolbox` | `<span class="text-primary font-medium">name</span>: toolbox` | key 正则命中 |
| TC-11 | 高亮含点号/连字符的组合 key | `a.b-c: 1` | key 被 `text-primary font-medium` 包裹 | `[\w.$-]+` 字符集 |
| TC-12 | 无冒号行不识别为 key | `plain text without colon` | 原样输出，不含 `text-primary` | key 正则未命中 |
| TC-13 | 双引号字符串值不着色 | `msg: "hello world"` | 原样保留 `"hello world"`，不含 `text-success` | 字符串正则未命中（见缺陷 D-01） |
| TC-14 | 高亮单引号字符串值 | `msg: 'hello world'` | `'hello world'` 被 `text-success` 包裹 | 字符串正则命中 |
| TC-15 | 高亮正整数 | `count: 42` | `42` 被 `text-amber-600 dark:text-amber-400` 包裹 | 数字正则命中 |
| TC-16 | 高亮负整数 | `offset: -7` | `-7` 被数字样式包裹 | 数字正则负号分支 |
| TC-17 | 高亮小数 | `ratio: 3.14` | `3.14` 被数字样式包裹 | 数字正则小数分支 |
| TC-18 | 单词内部数字不着色 | `id: abc123` | 不含 `text-amber-600`，`abc123` 保留 | 数字 lookbehind `\w` 拒绝 |
| TC-19 | 分号前数字不着色 | `code: 12;` | 不含 `text-amber-600`，`12;` 保留 | 数字 lookahead `[\w;]` 拒绝 |
| TC-20 | 高亮 `true` | `value: true` | 被 `text-danger` 包裹 | 布尔正则命中 |
| TC-21 | 高亮 `false` | `value: false` | 被 `text-danger` 包裹 | 布尔正则命中 |
| TC-22 | 高亮 `null` | `value: null` | 被 `text-danger` 包裹 | 布尔正则命中 |
| TC-23 | `~` 不着色 | `value: ~` | 原样保留，不含 `text-danger` | `\b` 边界限制（见缺陷 D-02） |
| TC-24 | 转义 HTML 特殊字符防 XSS | `<script>alert(1)</script>` | 不含 `<script`，含 `&lt;script&gt;`、`&lt;/script&gt;`，`1` 被数字样式包裹 | `esc()` 三个 replace |

### 2.3 注释处理

| 编号 | 用例名称 | 输入 | 预期结果 | 覆盖点 |
| --- | --- | --- | --- | --- |
| TC-25 | 整行注释整体着色 | `# 这是注释` | 整体为 `<span class="text-fg-tertiary italic"># 这是注释</span>` | `commentIdx = 0` 分支 |
| TC-26 | 行尾注释与代码分开着色 | `port: 8080 # 端口` | key、数字、注释三种 span 同时存在，注释位于数字之后 | 注释切分分支 |
| TC-27 | 引号内 `#` 不切分注释 | `note: "a#b"` | 不含 `text-fg-tertiary`，输出 `...: "a#b"` | 引号正则命中，`&&` 第二条件为假 |
| TC-28 | 引号内 `#` + 行尾 `#` 整行不切分 | `note: "a#b" # tail` | 不含 `text-fg-tertiary`，保留 `# tail` | 引号正则命中 |
| TC-29 | 单引号内 `#` 不切分注释 | `note: 'a#b'` | 不含 `text-fg-tertiary`，`'a#b'` 被 `text-success` 包裹 | 单引号分支 |

> 说明：`it.each` 展开后共 26 个测试用例，与执行结果中的 `26 passed` 一致（TC-04~06、TC-20~22 为参数化用例）。

## 3. 发现的实现缺陷（未修改源码，测试固化当前行为）

| 编号 | 位置 | 问题 | 影响 | 建议 |
| --- | --- | --- | --- | --- |
| D-01 | `esc()` 与字符串正则 | `esc()` 不转义 `"`，而字符串正则写作 `(&quot;.*?&quot;)`，该分支永不命中；同时 key 正则中可选的 `(&quot;)?` 因引号未被转义也无法匹配带引号 key | JSON 输入的双引号 key 与字符串值完全不着色 | 在 `esc()` 中增加 `.replace(/"/g, '&quot;')`，或把字符串正则改为直接匹配 `"..."` |
| D-02 | 布尔/null 正则 | `\b(true\|false\|null\|~)\b` 中 `~` 是非单词字符，`\b` 在 `~` 两侧无法成立 | YAML 的 `~`（null 简写）不会被高亮 | 将 `~` 拆出单独匹配，如 `\b(true\|false\|null)\b\|(?<!\w)~(?!\w)` |
| D-03 | 注释判定正则 | `/["'].*#.*["']/` 采用贪婪匹配，只要行内任意位置存在「引号 + # + 引号」就放弃整行注释切分 | `note: "a#b" # tail` 这类行尾注释同样不会着色 | 改为「最后一个引号之外的 `#`」判定，或仅在 `#` 前做引号配对计数 |

## 4. 验证结果

| 项目 | 结果 |
| --- | --- |
| 测试执行 | 26/26 通过 |
| 语句覆盖率 | 100%（14/14） |
| 分支覆盖率 | 100%（12/12） |
| 函数覆盖率 | 100%（3/3） |
| 行覆盖率 | 100%（11/11） |
| `validate-coverage.mjs` | PASS（行 ≥90%，分支 ≥80%） |
| 项目构建 `npm run build` | 成功 |