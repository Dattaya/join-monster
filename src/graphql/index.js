import * as graphql from 'graphql'
import pick from 'lodash/pick'

/**
 * Monkey patching GraphQLObjectType, GraphQLUnionType, and GraphQLInterfaceType
 *
 * @link https://github.com/acarl005/join-monster/issues/352
 *
 * */

const keys = [ 'alwaysFetch', 'sqlTable', 'uniqueKey' ]

export class GraphQLObjectType extends graphql.GraphQLObjectType {
  constructor(objectTypeConfig) {
    const joinMonsterConfig = pick(objectTypeConfig, keys)

    super(objectTypeConfig)

    this._typeConfig = joinMonsterConfig
  }
}

export class GraphQLUnionType extends graphql.GraphQLUnionType {
  constructor(objectTypeConfig) {
    const joinMonsterConfig = pick(objectTypeConfig, keys)

    super(objectTypeConfig)

    this._typeConfig = joinMonsterConfig
  }
}

export class GraphQLInterfaceType extends graphql.GraphQLInterfaceType {
  constructor(objectTypeConfig) {
    const joinMonsterConfig = pick(objectTypeConfig, keys)

    super(objectTypeConfig)

    this._typeConfig = joinMonsterConfig
  }
}
