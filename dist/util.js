"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.emphasize = emphasize;
exports.inspect = inspect;
exports.last = last;
exports.wrap = wrap;
exports.isEmptyArray = isEmptyArray;
exports.ensure = ensure;
exports.unthunk = unthunk;
exports.validateSqlAST = validateSqlAST;
exports.objToCursor = objToCursor;
exports.cursorToObj = cursorToObj;
exports.maybeQuote = maybeQuote;
exports.buildWhereFunction = buildWhereFunction;
exports.handleUserDbCall = handleUserDbCall;
exports.compileSqlAST = compileSqlAST;

var _util = _interopRequireDefault(require("util"));

var _assert = _interopRequireDefault(require("assert"));

var _nesthydrationjs = require("@stem/nesthydrationjs");

var _dispatcher = _interopRequireDefault(require("./stringifiers/dispatcher"));

var _resolveUnions = _interopRequireDefault(require("./resolve-unions"));

var _deprecate = _interopRequireDefault(require("deprecate"));

var _defineObjectShape = _interopRequireDefault(require("./define-object-shape"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const debug = require('debug')('join-monster');

function emphasize(str, colorCode = 33) {
  return `\n\x1b[1;${colorCode}m${str}\x1b[0m\n`;
}

function inspect(obj, options = {}) {
  return _util.default.inspect(obj, _objectSpread({
    depth: 12
  }, options));
}

function last(arr) {
  return arr[arr.length - 1];
}

function wrap(maybeArr) {
  if (maybeArr.constructor === Array) {
    return maybeArr;
  }

  return [maybeArr];
}

function isEmptyArray(val) {
  return Array.isArray(val) && val.length === 0;
}

function ensure(obj, prop, name) {
  if (!obj[prop]) {
    throw new Error(`property "${prop}" must be defined on object: ${name || _util.default.inspect(obj)}`);
  }

  return obj[prop];
}

function unthunk(val, ...args) {
  return typeof val === 'function' ? val(...args) : val;
}

function validateSqlAST(topNode) {
  (0, _assert.default)(topNode.sqlJoin == null, 'root level field can not have "sqlJoin"');
}

function objToCursor(obj) {
  const str = JSON.stringify(obj);
  return Buffer.from(str).toString('base64');
}

function cursorToObj(cursor) {
  const str = Buffer.from(cursor, 'base64').toString();
  return JSON.parse(str);
}

function maybeQuote(value, dialectName) {
  if (value == null) {
    return 'NULL';
  }

  if (typeof value === 'number') return value;
  if (value && typeof value.toSQL === 'function') return value.toSQL();

  if (value instanceof Buffer && typeof value === 'object' && typeof value.toString === 'function') {
    return `X'${value.toString('hex')}'`;
  }

  if (dialectName === 'oracle' && value.match(/\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(.\d+)?Z?/)) {
    return value.replace(/(\d{4}-\d\d-\d\d)T(\d\d:\d\d:\d\d)(.\d+)?Z?/, 'TIMESTAMP \'$1 $2$3 UTC\'');
  }

  let hasBackslash = false;
  let escaped = '\'';

  for (let i = 0; i < value.length; i++) {
    let c = value[i];

    if (c === '\'') {
      escaped += c + c;
    } else if (c === '\\') {
      escaped += c + c;
      hasBackslash = true;
    } else {
      escaped += c;
    }
  }

  escaped += '\'';

  if (hasBackslash === true) {
    escaped = ' E' + escaped;
  }

  return escaped;
}

function getDialectName(options) {
  if (options.dialectModule) {
    return options.dialectModule.name;
  }

  return options.dialect || 'sqlite3';
}

function buildWhereFunction(type, condition, options) {
  const name = getDialectName(options);

  if (typeof condition === 'function') {
    return condition;
  }

  const quote = ['mysql', 'mysql8', 'mariadb'].includes(name) ? '`' : '"';
  const uniqueKey = type._typeConfig.uniqueKey;

  if (Array.isArray(uniqueKey)) {
    _assert.default.equal(condition.length, uniqueKey.length, `The unique key for the "${type.name}" type is a composite. You must provide an array of values for each column.`);

    return table => uniqueKey.map((key, i) => `${table}.${quote}${key}${quote} = ${maybeQuote(condition[i])}`).join(' AND ');
  }

  return table => `${table}.${quote}${uniqueKey}${quote} = ${maybeQuote(condition)}`;
}

function handleUserDbCall(dbCall, sql, sqlAST, shapeDefinition) {
  if (dbCall.length === 2) {
    return new Promise((resolve, reject) => {
      dbCall(sql, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          rows = validate(rows);

          if (debug.enabled) {
            debug(emphasize('RAW_DATA'), inspect(rows.slice(0, 8)));
            debug(`${rows.length} rows...`);
          }

          const data = (0, _nesthydrationjs.nest)(rows, shapeDefinition);
          (0, _resolveUnions.default)(data, sqlAST);

          if (debug.enabled) {
            debug(emphasize('SHAPED_DATA', inspect(data)));
          }

          resolve(data);
        }
      });
    });
  }

  const result = dbCall(sql);

  if (typeof result.then === 'function') {
    return result.then(rows => {
      rows = validate(rows);

      if (debug.enabled) {
        debug(emphasize('RAW DATA'), inspect(rows.slice(0, 8)));
        debug(`${rows.length} rows...`);
      }

      const data = (0, _nesthydrationjs.nest)(rows, shapeDefinition);
      (0, _resolveUnions.default)(data, sqlAST);

      if (debug.enabled) {
        debug(emphasize('SHAPED_DATA'), inspect(data));
      }

      return data;
    });
  }

  throw new Error('must return a promise of the data or use the callback');
}

function validate(rows) {
  if (Array.isArray(rows)) return rows;
  if (rows && rows.rows) return rows.rows;
  throw new Error(`"dbCall" function must return/resolve an array of objects where each object is a row from the result set.
    Instead got ${_util.default.inspect(rows, {
    depth: 3
  })}`);
}

async function compileSqlAST(sqlAST, context, options) {
  if (debug.enabled) {
    debug(emphasize('SQL_AST'), inspect(sqlAST));
  }

  options.dialect = options.dialect || 'sqlite3';

  if (options.dialect === 'standard') {
    (0, _deprecate.default)('dialect "standard" is deprecated, because there is no true implementation of the SQL standard', '"sqlite3" is the default');
    options.dialect = 'sqlite3';
  }

  const sql = await (0, _dispatcher.default)(sqlAST, context, options);

  if (debug.enabled) {
    debug(emphasize('SQL'), sql);
  }

  const shapeDefinition = (0, _defineObjectShape.default)(sqlAST);

  if (debug.enabled) {
    debug(emphasize('SHAPE_DEFINITION'), inspect(shapeDefinition));
  }

  return {
    sql,
    shapeDefinition
  };
}