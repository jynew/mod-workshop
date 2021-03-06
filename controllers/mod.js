const fs = require('fs')
const path = require('path')
const publicIp = require('public-ip')
// 导入模型
const Mod = require('../models/mod')
// config
const config = require('../config')

// 单文件上传
function uploadFile(file, dirPath) {
    if(!file) return {}
    // 读取文件流
    const fileReader = fs.createReadStream(file.path)
    // 最终要保存到的文件夹目录
    const dir = path.join(__dirname, `../${config.publicPath}/${dirPath}`)
    // 检查文件夹是否存在如果不存在则新建文件夹
    checkDirExist(dir)
    // 组装路径
    filePath = dir + `/${file.name}`
    // 创建可写流
    writeStream = fs.createWriteStream(filePath)
    // 可读流通过管道写入可写流
    fileReader.pipe(writeStream)

    return {
        name: file.name,
        uri: `${dirPath}/${file.name}`
    }
}

//检查文件夹是否存在
function checkDirExist(p) {
    if (!fs.existsSync(p)) {
        fs.mkdirSync(p, { recursive: true })
    }
}

module.exports = {

    async getAllMods(ctx, next) {
        try {
            const data = await Mod.findAll()
            ctx.body = { msg: 1001, data }
        } catch (err) {
            ctx.body = { code: -1, msg: 1000, }
        }
        await next()
    },

    async createMod(ctx, next) {
        const req = ctx.request.body
        if (req.platform && req.name && req.version) {
            try {
                const { file, img } = ctx.request.files
                const dirPath = req.platform + '/' + req.name
                const { uri } = uploadFile(file, dirPath)
                const { uri: poster } = uploadFile(img, dirPath)
                const ip = await publicIp.v4()
                const data = await Mod.createMod({ uri: `http://${ip}:${config.port}/${uri}`, poster: poster && `http://${ip}:${config.port}/${poster}`, ...req })
                ctx.body = { msg: 1003, data }
            } catch (err) {
                ctx.body = { code: -1, msg: 1000 }
            }
        } else {
            ctx.body = { code: -1, msg: 1002 }
        }
        await next()
    },

    async deleteById(ctx, next) {
        const query = ctx.request.query // 获取get请求参数
        if (query && query.id) {
            try {
                await Mod.deleteById(query.id)
                ctx.body = { msg: 1005 }
            } catch (err) {
                ctx.body = { code: -1, msg: 1000 }
            }
        } else {
            ctx.body = { code: -1, msg: 1002 }
        }
        await next()
    },

    async auditById(ctx, next) {
        const req = ctx.request.body
        if (req.id && req.key && req.pass) {
            try {
                if (req.key === '') {
                    await Mod.updateById({ id: req.id, pass: req.pass === 'true' ? true : false })
                    ctx.body = { msg: 1006 }
                } else {
                    ctx.body = { code: -1, msg: 1002 } 
                }
            } catch (err) {
                ctx.body = { code: -1, msg: 1000 }
            }
        } else {
            ctx.body = { code: -1, msg: 1002 }
        }
        await next();
    },

    async getPassMods(ctx, next) {
        try {
            const data = await Mod.getPassMods()
            ctx.body = { msg: 1001, data }
        } catch (err) {
            ctx.body = { code: -1, msg: 1000, }
        }
        await next()
    }
}
