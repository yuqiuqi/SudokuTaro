// babel-preset-taro 会自动处理 @tarojs 相关依赖
module.exports = {
  presets: [
    [
      'taro',
      {
        framework: 'react',
        ts: true,
      },
    ],
  ],
}
