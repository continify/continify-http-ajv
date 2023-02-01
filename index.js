const { default: AJV } = require('ajv')
const getValue = require('get-value')
const merge = require('lodash.merge')
const ContinifyPlugin = require('continify-plugin')

const {
  kSchemaParams,
  kSchemaQuery,
  kSchemaBody,
  kSchemaReply
} = require('./symbols')

module.exports = ContinifyPlugin(
  async function (ins, options) {
    const { $options } = ins
    const envOption = getValue($options, 'ajv', {
      default: {}
    })
    const ajvOptions = merge(options, envOption)
    const ajv = new AJV(ajvOptions)

    ins.addHook('onRoute', async function (route) {
      const schema = route.schema || {}
      if (schema.params) {
        route[kSchemaParams] = ajv.compile(schema.params)
      }

      if (schema.query) {
        route[kSchemaQuery] = ajv.compile(schema.query)
      }

      if (schema.body) {
        route[kSchemaBody] = ajv.compile(schema.body)
      }

      if (schema.reply) {
        route[kSchemaReply] = ajv.compile(schema.reply)
      }
    })

    ins.addHook('beforeHandler', async function (req, rep) {
      const { $route } = req

      const vParams = $route[kSchemaParams]
      const vQuery = $route[kSchemaQuery]
      const vBody = $route[kSchemaBody]

      if (vParams) {
        const valid = vParams(req.$params)
        if (!valid) throw new Error(ajv.errorsText(vParams.errors))
      }

      if (vQuery) {
        const valid = vQuery(req.$query)
        if (!valid) throw new Error(ajv.errorsText(vQuery.errors))
      }

      if (vBody) {
        const valid = vBody(req.$body)
        if (!valid) throw new Error(ajv.errorsText(vBody.errors))
      }
    })

    ins.addHook('beforeDeserializer', async function (req, rep) {
      const { $route } = rep

      const vReply = $route[kSchemaReply]

      if (vReply) {
        const valid = vReply(rep.$payload)
        if (!valid) throw new Error(ajv.errorsText(vReply.errors))
      }
    })

    ins.decorate('$ajv', ajv)
  },
  {
    coerceTypes: true,
    allErrors: true,
    removeAdditional: true,
    continify: '>=0.1.6'
  }
)
