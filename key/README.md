# 微信小程序上传私钥（不要提交到 Git）

1. 登录 [微信公众平台](https://mp.weixin.qq.com/) → **开发** → **开发管理** → **开发设置**。
2. 在 **小程序代码上传** 处生成并下载密钥（仅管理员可操作）。
3. 将下载的 `private.xxx.key` 放到本目录，文件名与 `.env.upload` 里的 `WECHAT_PRIVATE_KEY_PATH` 一致，例如：

   `WECHAT_PRIVATE_KEY_PATH=key/private.wx1234567890.key`

4. 将 `project.config.json` 中的 `appid` 改为你的正式 AppID（与 `WECHAT_APPID` 一致）。
