# chromium 历史版本搜索下载

chromium 虽然有 https://chromiumdash.appspot.com/ ，但是官网并没有提供对外每个版本的下载链接，可能考虑到安全因素原因。此外，chromium 在 https://commondatastorage.googleapis.com/chromium-browser-snapshots 提供基于 chromium Position 的下载地址。

也有一些第三方网站提供了历史版本下载：
- https://vikyd.github.io/download-chromium-history-version/#/ 最后停在了m121版本
- https://chromium.en.uptodown.com/mac
- https://chromium.en.uptodown.com/windows
- https://www.gitclear.com/open_repos/chromium/chromium/ 不支持搜索
- https://chromium.woolyss.com/download/ 只保留了最新的几个版本下载
- https://github.com/ulixee/chrome-versions chrome 历史版本下载


因此，使用chromiumdash.appspot.com 官方的api 结合googleapis，提供了本工具，支持搜索。

---

# Chromium Older/Historical Version Search and Download

Although Chromium has https://chromiumdash.appspot.com/, the official website doesn't provide external download links, possibly due to security considerations. Additionally, Chromium provides download links based on Chromium Position at https://commondatastorage.googleapis.com/chromium-browser-snapshots

There are also some third-party websites offering historical version downloads:
- https://vikyd.github.io/download-chromium-history-version/#/ (last updated to m121 version)
- https://chromium.en.uptodown.com/mac
- https://chromium.en.uptodown.com/windows
- https://www.gitclear.com/open_repos/chromium/chromium/ (doesn't support search)
- https://chromium.woolyss.com/download/ (only keeps the latest few versions)


Therefore, this tool was created by using the official API from chromiumdash.appspot.com combined with googleapis, providing search functionality.