"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GraphQLInterfaceType = exports.GraphQLUnionType = exports.GraphQLObjectType = void 0;

var _graphql = require("graphql");

var _pick = _interopRequireDefault(require("lodash/pick"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const keys = ['alwaysFetch', 'sqlTable', 'uniqueKey'];

class GraphQLObjectType extends _graphql.GraphQLObjectType {
  constructor(objectTypeConfig) {
    const joinMonsterConfig = (0, _pick.default)(objectTypeConfig, keys);
    super(objectTypeConfig);
    this._typeConfig = joinMonsterConfig;
  }

}

exports.GraphQLObjectType = GraphQLObjectType;

class GraphQLUnionType extends _graphql.GraphQLUnionType {
  constructor(objectTypeConfig) {
    const joinMonsterConfig = (0, _pick.default)(objectTypeConfig, keys);
    super(objectTypeConfig);
    this._typeConfig = joinMonsterConfig;
  }

}

exports.GraphQLUnionType = GraphQLUnionType;

class GraphQLInterfaceType extends _graphql.GraphQLInterfaceType {
  constructor(objectTypeConfig) {
    const joinMonsterConfig = (0, _pick.default)(objectTypeConfig, keys);
    super(objectTypeConfig);
    this._typeConfig = joinMonsterConfig;
  }

}

exports.GraphQLInterfaceType = GraphQLInterfaceType;