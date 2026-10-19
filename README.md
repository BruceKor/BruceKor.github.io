# Rolling Stone

简约的公开个人博客，记录 AI / LLM 洞察、学习思考与研究实践。目标地址是 <https://brucekor.github.io/>。

这是纯静态网站：没有登录、私密文章或在线后台。**提交到这个仓库的所有内容都应视为公开。** `content/` 中目前有三篇标记为「示例」的排版演示文章。

## 写文章

1. 在 `content/` 新建 Markdown 文件，例如 `my-first-note.md`。可以像编辑 README 一样使用 GitHub 网页编辑器，或在本地用任意 Markdown 编辑器写作。
2. 在 `content/posts.json` 增加一条记录，填写标题、日期、栏目、摘要、`slug` 和 `file`。栏目 ID 可用 `ai`、`learning`、`research`。这里的文章全部公开；请勿在仓库中保存私密内容或未准备公开的草稿。
3. 提交到 `main`。GitHub Actions 会重新生成网页并发布到 GitHub Pages。若只想保存草稿，请放在本机，不要提交到公开仓库。

现有示例的格式可直接参照。`sample: true` 会在文章旁显示「示例」；正式文章不需要此字段。`content/about.md` 是「关于」页面。`site.json` 存放网站标题、作者和正式网址。

本地预览：

```sh
npm ci
npm run build
python3 -m http.server 4173 --directory dist
```

打开 <http://127.0.0.1:4173/>。构建会生成 HTML、RSS 和站点地图；若文章元数据仍标记为私密或草稿，构建会报错。

## GitHub Pages

仓库名须为 `BruceKor.github.io`，默认分支 `main`。在仓库 **Settings → Pages → Build and deployment** 中将 Source 设为 **GitHub Actions**。工作流文件是 `.github/workflows/pages.yml`，发布目录为 `dist/`。
