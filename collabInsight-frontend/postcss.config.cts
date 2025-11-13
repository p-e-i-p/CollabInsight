// postcss.config.cts（根目录下）
// 移除类型导入，直接导出配置
module.exports = {
  plugins: {
    tailwindcss: {
      config: './tailwind.config.cts', // 指向 Tailwind 的 CTS 配置
    },
    autoprefixer: {},
  },
};
