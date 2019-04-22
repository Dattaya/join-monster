"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GraphQLInterfaceType = exports.GraphQLUnionType = exports.GraphQLObjectType = void 0;

var graphql = _interopRequireWildcard(require("graphql"));

var _pick = _interopRequireDefault(require("lodash/pick"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

const keys = ['alwaysFetch', 'sqlTable', 'uniqueKey'];

class GraphQLObjectType extends graphql.GraphQLObjectType {
  constructor(objectTypeConfig) {
    const joinMonsterConfig = (0, _pick.default)(objectTypeConfig, keys);
    super(objectTypeConfig);
    this._typeConfig = joinMonsterConfig;
  }

}

exports.GraphQLObjectType = GraphQLObjectType;

class GraphQLUnionType extends graphql.GraphQLUnionType {
  constructor(objectTypeConfig) {
    const joinMonsterConfig = (0, _pick.default)(objectTypeConfig, keys);
    super(objectTypeConfig);
    this._typeConfig = joinMonsterConfig;
  }

}

exports.GraphQLUnionType = GraphQLUnionType;

class GraphQLInterfaceType extends graphql.GraphQLInterfaceType {
  constructor(objectTypeConfig) {
    const joinMonsterConfig = (0, _pick.default)(objectTypeConfig, keys);
    super(objectTypeConfig);
    this._typeConfig = joinMonsterConfig;
  }

}

exports.GraphQLInterfaceType = GraphQLInterfaceType;