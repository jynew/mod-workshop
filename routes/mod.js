const router = require('koa-router')()
const Mod = require('../controllers/mod')

router.get('/getAllMods', Mod.getAllMods)

router.post('/createMod', Mod.createMod)

router.get('/deleteById', Mod.deleteById)

module.exports = router
