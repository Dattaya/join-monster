import {
  GraphQLObjectType as OriginalGraphQLObjectType,
  GraphQLUnionType as OriginalGraphQLUnionType,
  GraphQLInterfaceType as OriginalGraphQLInterfaceType
} from 'graphql'
import pick from 'lodash/pick'

/**
 * Monkey patching GraphQLObjectType, GraphQLUnionType, and GraphQLInterfaceType
 *
 * @link https://github.com/acarl005/join-monster/issues/352
 *
 * */

const keys = [ 'alwaysFetch', 'sqlTable', 'uniqueKey' ]

export class GraphQLObjectType extends OriginalGraphQLObjectType {
  constructor(objectTypeConfig) {
    const joinMonsterConfig = pick(objectTypeConfig, keys)

    super(objectTypeConfig)

    this._typeConfig = joinMonsterConfig
  }
}

export class GraphQLUnionType extends OriginalGraphQLUnionType {
  constructor(objectTypeConfig) {
    const joinMonsterConfig = pick(objectTypeConfig, keys)

    super(objectTypeConfig)

    this._typeConfig = joinMonsterConfig
  }
}


export class GraphQLInterfaceType extends OriginalGraphQLInterfaceType {
  constructor(objectTypeConfig) {
    const joinMonsterConfig = pick(objectTypeConfig, keys)

    super(objectTypeConfig)

    this._typeConfig = joinMonsterConfig
  }
}
