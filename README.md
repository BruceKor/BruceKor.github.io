# Bruce's Blog

我的公开个人博客：[brucekor.github.io](https://brucekor.github.io/)。文章用 Markdown 写作；提交到 `main` 后，GitHub Actions 会自动生成并更新网站。当前的三篇文章是标有「示例」的排版演示，可以逐篇替换。

## 发布一篇新 Post

只需改两个地方，直接在 GitHub 网页上完成即可：

1. 打开仓库的 [`content` 文件夹](https://github.com/BruceKor/BruceKor.github.io/tree/main/content)，点 **Add file → Create new file**，输入英文文件名，例如 `my-first-post.md`。正文像写 README 一样使用 Markdown：`#` 标题、`##` 小节、`-` 列表、代码块、链接等。写完点 **Commit changes**。
2. 打开 [`content/posts.json`](https://github.com/BruceKor/BruceKor.github.io/blob/main/content/posts.json)，点右上角铅笔图标，把下面这样的一条记录加到数组里，再点 **Commit changes**。数组中相邻记录之间要有逗号。

```json
{
  "slug": "my-first-post",
  "title": "我的第一篇文章",
  "date": "2026-10-19",
  "categoryId": "ai",
  "description": "用一句话概括文章内容。",
  "file": "my-first-post.md",
  "tags": ["AI", "LLM"]
}
```

`slug` 决定文章网址，只用小写英文字母、数字和连字符，并且不能与已有文章重复。`file` 必须与第 1 步的文件名一致。`date` 使用 `YYYY-MM-DD`。`categoryId` 可选 `ai`（技术洞见）、`learning`（随想记录）、`research`（研究手记）；分类名称会自动生成，不用另外填写。`tags` 可以留空或删去。正式文章不要添加 `sample: true`，它只用于标记现有示例。

提交后到仓库的 **Actions** 页查看发布结果，通常稍等片刻就能在网站上看到新文章。若发布失败，先检查 `posts.json` 的逗号、引号、文件名和日期。

## 修改 About

打开 [`content/about.md`](https://github.com/BruceKor/BruceKor.github.io/blob/main/content/about.md)，点铅笔图标，直接修改文字并提交。它同样支持 Markdown；提交成功后 About 页面会自动更新。网站名称、描述和地址则在 [`site.json`](https://github.com/BruceKor/BruceKor.github.io/blob/main/site.json) 中修改。

## 私密文件与草稿

**不能把单个文件推送到这个公开仓库，同时让它仅自己可见。** [GitHub 的仓库可见性规则](https://docs.github.com/en/repositories/creating-and-managing-repositories/about-repositories#about-repository-visibility)以整个仓库为单位；公开仓库的文件和提交历史均可被查看。把文件从最新版本删除，也不会自动从历史记录中抹去。

未准备公开的文章可以先放在本机的 `drafts/` 或 `private/` 文件夹；这两个文件夹已加入 `.gitignore`，普通提交不会带上它们。若需要跨设备保存私密草稿，另建一个 **Private** GitHub 仓库，写好后只把打算公开的最终版本复制到本仓库。About 页面本身向所有访客开放，因此要显示在 About 上的文字也必然是公开的。

## 本地预览

在本仓库目录运行：

```sh
npm ci
npm run build
python3 -m http.server 4173 --directory dist
```

然后打开 <http://127.0.0.1:4173/>。构建会生成 HTML、RSS 和站点地图；RSS 仍可通过 `/feed.xml` 订阅，只是不占用顶部导航。发布配置位于 `.github/workflows/pages.yml`；Pages 的 Source 使用 **GitHub Actions**。
