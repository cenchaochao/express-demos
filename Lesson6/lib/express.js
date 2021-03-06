const http = require('http')
const methods = require('./methods')
const Layer = require('./Layer')

module.exports = function () {
  function app (req, res) {
    app.handle(req, res)
  }
  Object.setPrototypeOf(app, proto)
  app.init()
  return app
}

const proto = Object.create(null)

proto.listen = function () {
  const server = http.createServer(this)
  server.listen(...arguments)
}

proto.init = function () {
  this.router = []
}

methods.forEach(method => {
  proto[method] = function () {
    let path
    let fns
    if (typeof arguments[0] === 'string') {
      [path, ...fns] = [...arguments]
    } else {
      fns = [...arguments]
    }
    fns.forEach(fn => {
      if (typeof fn !== 'function') return
      const layer = new Layer (method, path, fn)
      this.router.push(layer)
    })
  }
})

proto.handle = function (req, res) {
  const router = this.router
  let id = 0
  next()
  function next (err) {
    if (id === router.length) {
      !res.finished && res.end()
      return
    }
    if (err) return router[id++].handleError(err, req, res, next)
    router[id++].handleRequest(req, res, next)
  }
}

