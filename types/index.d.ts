import { Continify } from 'continify'
import { Route } from 'continify-http'
import * as ajv from 'ajv'

export type ContinifyHTTPAJVPlugin = (
  ins: Continify,
  options: ajv.Options
) => Promise<void>

export type Known =
  | {
      [key: string]: Known
    }
  | [Known, ...Known[]]
  | Known[]
  | number
  | string
  | boolean
  | null

export interface RouteSchema {
  params?: ajv.JSONSchemaType<Known>
  query?: ajv.JSONSchemaType<Known>
  body?: ajv.JSONSchemaType<Known>
  reply?: ajv.JSONSchemaType<Known>
}

declare const plugin: ContinifyHTTPAJVPlugin
export = plugin

declare module 'avvio' {
  interface Use<I, C = context<I>> {
    (fn: ContinifyHTTPAJVPlugin, options?: ajv.Options): C
  }
}

declare module 'continify' {
  interface ContinifyOptions {
    ajv?: ajv.Options
  }

  interface Continify {
    $ajv: ajv.default
  }
}

declare module 'continify-http' {
  interface RouteOptions {
    schema?: RouteSchema
  }
}
