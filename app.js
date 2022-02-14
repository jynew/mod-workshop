const Koa = require('koa')
const app = new Koa({ proxy: true })
const json = require('koa-json')
const onerror = require('koa-onerror')
// const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')
const path = require('path')
const cors = require('koa-cors')
const body = require('koa-body')

const mod = require('./routes/mod')

// midwares
const { loggerMiddleware } = require('./midwares/logger')
const { responseHandler, errorHandler } = require('./midwares/response')

// config
const config = require('./config')

// error handler
onerror(app)

app.use(loggerMiddleware)
app.use(errorHandler)

// middlewares
app.use(body({
  multipart: true,
  formidable: {
    maxFileSize: 2000 * 1024 * 1024
  }
}))
app.use(json())
app.use(logger())

app.use(require('koa-static')(path.resolve(__dirname, config.publicPath)))

// routes
app.use(mod.routes(), mod.allowedMethods())

app.use(responseHandler)

// cors
app.use(cors())

// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});

module.exports = app
