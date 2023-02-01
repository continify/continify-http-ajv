const tap = require('tap')
const Continify = require('continify')
const ContinifyHTTP = require('continify-http')
const ContinifyAJV = require('..')

tap.test('ajv: no schema', async t => {
  const ins = Continify()
  ins.register(ContinifyHTTP, { port: 4000 })
  ins.register(ContinifyAJV)

  t.plan(9)
  await ins.ready()

  ins.route({
    method: 'POST',
    url: '/ajv/:p1/:p2',
    handler (req, rep) {
      t.equal(req.$params.p1, '111')
      t.equal(req.$params.p2, 'bbb')
      t.equal(req.$query.q1, '1111')
      t.equal(req.$query.q2, 'bbbb')
      t.equal(req.$body.b1, 123)
      t.equal(req.$body.b2, 'cccc')
      rep.send({
        r1: 789,
        r2: 'YYYY'
      })
    }
  })

  const res = await ins.inject({
    method: 'POST',
    url: '/ajv/111/bbb?q1=1111&q2=bbbb',
    payload: {
      b1: 123,
      b2: 'cccc'
    }
  })

  t.equal(res.statusCode, 200)
  const data = res.json()
  t.equal(data.r1, 789)
  t.equal(data.r2, 'YYYY')

  await ins.close()
})

tap.test('ajv: params schema', async t => {
  const ins = Continify()
  ins.register(ContinifyHTTP, { port: 4001 })
  ins.register(ContinifyAJV)

  t.plan(11)
  await ins.ready()

  ins.route({
    schema: {
      params: {
        additionalProperties: false,
        type: 'object',
        properties: {
          p1: { type: 'number' }
        }
      }
    },
    method: 'POST',
    url: '/ajv/:p1/:p2',
    handler (req, rep) {
      t.equal(req.$params.p1, 111)
      t.equal(req.$params.p2, undefined)
      t.equal(req.$query.q1, '1111')
      t.equal(req.$query.q2, 'bbbb')
      t.equal(req.$body.b1, 123)
      t.equal(req.$body.b2, 'cccc')
      rep.send({
        r1: 789,
        r2: 'YYYY'
      })
    }
  })

  const res1 = await ins.inject({
    method: 'POST',
    url: '/ajv/111/bbb?q1=1111&q2=bbbb',
    payload: {
      b1: 123,
      b2: 'cccc'
    }
  })

  t.equal(res1.statusCode, 200)
  const data1 = res1.json()
  t.equal(data1.r1, 789)
  t.equal(data1.r2, 'YYYY')

  const res2 = await ins.inject({
    method: 'POST',
    url: '/ajv/aaa/bbb?q1=1111&q2=bbbb',
    payload: {
      b1: 123,
      b2: 'cccc'
    }
  })
  t.equal(res2.statusCode, 400)
  t.equal(res2.payload, 'data/p1 must be number')

  await ins.close()
})

tap.test('ajv: query schema', async t => {
  const ins = Continify()
  ins.register(ContinifyHTTP, { port: 4002 })
  ins.register(ContinifyAJV)

  t.plan(11)
  await ins.ready()

  ins.route({
    schema: {
      params: {
        type: 'object',
        additionalProperties: false,
        properties: {
          p1: { type: 'number' }
        }
      },
      query: {
        type: 'object',
        additionalProperties: false,
        properties: {
          q1: { type: 'number' }
        }
      }
    },
    method: 'POST',
    url: '/ajv/:p1/:p2',
    handler (req, rep) {
      t.equal(req.$params.p1, 111)
      t.equal(req.$params.p2, undefined)
      t.equal(req.$query.q1, 1111)
      t.equal(req.$query.q2, undefined)
      t.equal(req.$body.b1, 123)
      t.equal(req.$body.b2, 'cccc')
      rep.send({
        r1: 789,
        r2: 'YYYY'
      })
    }
  })

  const res1 = await ins.inject({
    method: 'POST',
    url: '/ajv/111/bbb?q1=1111&q2=bbbb',
    payload: {
      b1: 123,
      b2: 'cccc'
    }
  })

  t.equal(res1.statusCode, 200)
  const data1 = res1.json()
  t.equal(data1.r1, 789)
  t.equal(data1.r2, 'YYYY')

  const res2 = await ins.inject({
    method: 'POST',
    url: '/ajv/1111/bbb?q1=aaaa&q2=bbbb',
    payload: {
      b1: 123,
      b2: 'cccc'
    }
  })
  t.equal(res2.statusCode, 400)
  t.equal(res2.payload, 'data/q1 must be number')

  await ins.close()
})

tap.test('ajv: body schema', async t => {
  const ins = Continify()
  ins.register(ContinifyHTTP, { port: 4003 })
  ins.register(ContinifyAJV)

  t.plan(11)
  await ins.ready()

  ins.route({
    schema: {
      params: {
        type: 'object',
        additionalProperties: false,
        properties: {
          p1: { type: 'number' }
        }
      },
      query: {
        type: 'object',
        additionalProperties: false,
        properties: {
          q1: { type: 'number' }
        }
      },
      body: {
        type: 'object',
        additionalProperties: false,
        properties: {
          b1: { type: 'number' }
        }
      }
    },
    method: 'POST',
    url: '/ajv/:p1/:p2',
    handler (req, rep) {
      t.equal(req.$params.p1, 111)
      t.equal(req.$params.p2, undefined)
      t.equal(req.$query.q1, 1111)
      t.equal(req.$query.q2, undefined)
      t.equal(req.$body.b1, 123)
      t.equal(req.$body.b2, undefined)
      rep.send({
        r1: 789,
        r2: 'YYYY'
      })
    }
  })

  const res1 = await ins.inject({
    method: 'POST',
    url: '/ajv/111/bbb?q1=1111&q2=bbbb',
    payload: {
      b1: 123,
      b2: 'cccc'
    }
  })

  t.equal(res1.statusCode, 200)
  const data1 = res1.json()
  t.equal(data1.r1, 789)
  t.equal(data1.r2, 'YYYY')

  const res2 = await ins.inject({
    method: 'POST',
    url: '/ajv/1111/bbb?q1=111&q2=bbbb',
    payload: {
      b1: 'aaa',
      b2: 'cccc'
    }
  })
  t.equal(res2.statusCode, 400)
  t.equal(res2.payload, 'data/b1 must be number')

  await ins.close()
})

tap.test('ajv: reply schema', async t => {
  const ins = Continify()
  ins.register(ContinifyHTTP, { port: 4004 })
  ins.register(ContinifyAJV)

  t.plan(11)
  await ins.ready()

  ins.route({
    schema: {
      params: {
        type: 'object',
        additionalProperties: false,
        properties: {
          p1: { type: 'number' }
        }
      },
      query: {
        type: 'object',
        additionalProperties: false,
        properties: {
          q1: { type: 'number' }
        }
      },
      body: {
        type: 'object',
        additionalProperties: false,
        properties: {
          b1: { type: 'number' }
        }
      },
      reply: {
        type: 'object',
        additionalProperties: false,
        properties: {
          r1: { type: 'number' }
        }
      }
    },
    method: 'POST',
    url: '/ajv/:p1/:p2',
    handler (req, rep) {
      t.equal(req.$params.p1, 111)
      t.equal(req.$params.p2, undefined)
      t.equal(req.$query.q1, 1111)
      t.equal(req.$query.q2, undefined)
      t.equal(req.$body.b1, 123)
      t.equal(req.$body.b2, undefined)
      rep.send({
        r1: 789,
        r2: 'YYYY'
      })
    }
  })

  ins.route({
    url: '/ajv-reply',
    schema: {
      reply: {
        type: 'object',
        additionalProperties: false,
        properties: {
          b1: { type: 'number' }
        }
      }
    },
    handler (req, rep) {
      rep.send({ b1: 'aaaa' })
    }
  })

  const res1 = await ins.inject({
    method: 'POST',
    url: '/ajv/111/bbb?q1=1111&q2=bbbb',
    payload: {
      b1: 123,
      b2: 'cccc'
    }
  })

  t.equal(res1.statusCode, 200)
  const data1 = res1.json()
  t.equal(data1.r1, 789)
  t.equal(data1.r2, undefined)

  const res2 = await ins.inject({
    url: '/ajv-reply'
  })

  t.equal(res2.statusCode, 400)
  t.equal(res2.payload, 'data/b1 must be number')

  await ins.close()
})
