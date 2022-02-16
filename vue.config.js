module.exports = {
  devServer: {
    open: true,
    proxy: {
      '/': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
}