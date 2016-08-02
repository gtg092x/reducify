'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

// UTILS
function isNotNullFunction(arg) {
  return arg !== null && arg !== undefined && _lodash2.default.isFunction(arg);
}

function normalizeArray(arr) {
  if (!_lodash2.default.isArray(arr) || arr.length < 2) {
    return arr;
  }
  var reducerOrActions = arr.pop();
  var defaultsTo = void 0,
      select = void 0,
      merge = void 0;
  if (arr.length === 2) {
    if (isNotNullFunction(arr[1])) {
      var _arr = _slicedToArray(arr, 2);

      select = _arr[0];
      merge = _arr[1];
    } else {
      var _arr2 = _slicedToArray(arr, 2);

      defaultsTo = _arr2[0];
      select = _arr2[1];
    }
  } else if (arr.length === 1) {
    var _arr3 = _slicedToArray(arr, 1);

    defaultsTo = _arr3[0];
  } else if (arr.length === 3) {
    var _arr4 = _slicedToArray(arr, 3);

    defaultsTo = _arr4[0];
    select = _arr4[1];
    merge = _arr4[2];
  }

  if (isNotNullFunction(reducerOrActions)) {
    return { defaultsTo: defaultsTo, select: select, merge: merge, reducer: reducerOrActions };
  } else {
    return _extends({ defaultsTo: defaultsTo, select: select, merge: merge }, reducerOrActions);
  }
}

function normalizeActions(_ref) {
  var _ref$reducer = _ref.reducer;
  var baseReducer = _ref$reducer === undefined ? _lodash2.default.identity : _ref$reducer;

  var config = _objectWithoutProperties(_ref, ['reducer']);

  var notFn = Object.keys(config).filter(function (key) {
    return !isNotNullFunction(config[key]);
  });
  var actors = _lodash2.default.omit(config, [].concat(_toConsumableArray(Object.keys(defaults)), _toConsumableArray(notFn)));

  var reducer = function composedConfiguredReducer(state, action) {
    var actor = actors[action && action.type];

    for (var _len = arguments.length, args = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
      args[_key - 2] = arguments[_key];
    }

    if (actor) {
      return actor.apply(undefined, [state, action].concat(args));
    }
    return baseReducer.apply(undefined, [state, action].concat(args));
  };

  return _extends({}, _lodash2.default.omit(config, Object.keys(actors)), {
    reducer: reducer
  });
}

function injectDefaults(config) {
  return _lodash2.default.defaults(config, defaults);
}

function configToReducer(_ref2) {
  var select = _ref2.select;
  var merge = _ref2.merge;
  var reducer = _ref2.reducer;
  var defaultsTo = _ref2.defaultsTo;
  var _ref2$actionPart = _ref2.actionPart;
  var actionPart = _ref2$actionPart === undefined ? {} : _ref2$actionPart;

  return function reducified() {
    var state = arguments.length <= 0 || arguments[0] === undefined ? defaultsTo : arguments[0];
    var actionArg = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    var action = _lodash2.default.isFunction(actionPart) ? actionPart(actionArg) : _extends({}, actionPart, actionArg);

    for (var _len2 = arguments.length, rest = Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
      rest[_key2 - 2] = arguments[_key2];
    }

    var selected = select.call.apply(select, [this, state, action].concat(rest));
    var result = reducer.call.apply(reducer, [this, selected, action].concat(rest));
    return merge.call.apply(merge, [this, result, state, action].concat(rest));
  };
}

var defaults = {
  select: _lodash2.default.identity,
  merge: _lodash2.default.identity,
  reducer: _lodash2.default.identity,
  actionPart: {}
};

function isStatic(config) {

  if (!_lodash2.default.isObject(config)) {
    return true;
  }
  var vals = (0, _lodash2.default)(config).omit(Object.keys(defaults)).omit(['$', '_', 'default', 'defaultsTo']) //aliases and defaults
  .values().value();
  return vals.length > 0 && !_lodash2.default.some(vals, isNotNullFunction);
}

function toStaticReducer(config) {
  var defaultValue = void 0;
  if (!_lodash2.default.isObject(config)) {
    defaultValue = config;
  } else {
    defaultValue = _lodash2.default.omit(config, Object.keys(defaults));
  }

  var _defaults$config = _extends({}, defaults, config);

  var select = _defaults$config.select;
  var merge = _defaults$config.merge;


  return function composedStaticReducer() {
    var state = arguments.length <= 0 || arguments[0] === undefined ? defaultValue : arguments[0];
    var action = arguments[1];

    return merge(select(state, action), action);
  };
}

function isValidSelectKey(key) {
  return _lodash2.default.isString(key) || _lodash2.default.isSymbol(key) || _lodash2.default.isArray(key);
}

function composeSelectMerge(config) {
  var selector = _lodash2.default.isArray(config) ? config : [config];
  // for each key in a selector, pull that value from the state
  var select = function select(state) {
    if (!_lodash2.default.isObject(state)) {
      throw new ConfigError('Can\'t key select when a when state is not an object. Pass in a default object. ' + JSON.stringify(state));
    }
    return selector.reduce(function (pointer, key) {
      return pointer[key];
    }, state);
  };
  // for each key in a selector, push that value into the state
  var merge = function merge(result, state) {
    return _extends({}, state, _lodash2.default.reverse([].concat(_toConsumableArray(selector))).reduce(function (pointer, key) {
      return _defineProperty({}, key, pointer);
    }, result));
  };

  return { select: select, merge: merge };
}

function ConfigError() {
  this.name = 'Reducify Configuration Error';

  for (var _len3 = arguments.length, messages = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
    messages[_key3] = arguments[_key3];
  }

  this.message = messages.map(function (arg) {
    return _lodash2.default.isString(arg) ? arg : JSON.stringify(arg);
  }).join(' ');
}
ConfigError.prototype = Error.prototype;
/*
 @param reducer config
 */
function normalizeSelect(config) {
  var select = config.select;
  var merge = config.merge;
  var selectAlias = config.$;
  var mergeAlias = config._;

  var rest = _objectWithoutProperties(config, ['select', 'merge', '$', '_']);

  merge = merge || mergeAlias;
  select = select || selectAlias;
  if (isNotNullFunction(select)) {
    if (!isNotNullFunction(merge)) {
      throw new ConfigError('Merge must be a function if select is a function');
    }
  } else if (merge === undefined && select !== undefined) {
    if (!isValidSelectKey(select)) {
      throw new ConfigError(select, 'is not a valid select key');
    }
    return _extends({}, composeSelectMerge(select), rest);
  }
  return _extends({ select: select, merge: merge }, rest);
}

function normalizeDefaults(config) {
  var defaultsTo = config.defaultsTo === undefined ? config['default'] : config.defaultsTo;
  return _extends({}, _lodash2.default.omit(config, ['default']), {
    defaultsTo: defaultsTo
  });
}

/*
 @param reducer argument - one of the steps passed to pipeline(...)
 Returns {select<Function>, merge<Function>, reducer<Function>}
 */
function reducify(reducerArgRaw) {
  var scope = this;

  // already a reducer - not messing around with it
  if (isNotNullFunction(reducerArgRaw)) {
    return reducerArgRaw;
  }
  var reducerArg = normalizeArray(reducerArgRaw);
  if (isStatic(reducerArg)) {
    return toStaticReducer(reducerArg);
  }
  return (0, _lodash2.default)(reducerArg).thru(normalizeSelect) // turns selector keys into select, merge - handles select alias
  .thru(normalizeDefaults) // pulls defaultsTo
  .thru(normalizeActions) // actions to reducer
  .thru(injectDefaults) // if anything's missing - add it in
  .thru(configToReducer) // make a reducer function from a given config
  .value().bind(scope);
}
exports.default = reducify;
//# sourceMappingURL=data:application/json;base64,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SUFKSSxDQUlDLGNBSkQsRUFJaUI7QUFKakIsR0FLSixJQUxJLENBS0MsZUFMRCxFQUtrQjtBQUxsQixHQU1KLEtBTkksR0FNSSxJQU5KLENBTVMsS0FOVCxDQUFQO0FBT0Q7a0JBQ2MsUSIsImZpbGUiOiJyZWR1Y2lmeS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBfIGZyb20gJ2xvZGFzaCc7XG5cbi8vIFVUSUxTXG5mdW5jdGlvbiBpc05vdE51bGxGdW5jdGlvbihhcmcpIHtcbiAgcmV0dXJuIGFyZyAhPT0gbnVsbCAmJiBhcmcgIT09IHVuZGVmaW5lZCAmJiBfLmlzRnVuY3Rpb24oYXJnKTtcbn1cblxuZnVuY3Rpb24gbm9ybWFsaXplQXJyYXkoYXJyKSB7XG4gIGlmICghXy5pc0FycmF5KGFycikgfHwgYXJyLmxlbmd0aCA8IDIpIHtcbiAgICByZXR1cm4gYXJyO1xuICB9XG4gIGNvbnN0IHJlZHVjZXJPckFjdGlvbnMgPSBhcnIucG9wKCk7XG4gIGxldCBkZWZhdWx0c1RvLCBzZWxlY3QsIG1lcmdlO1xuICBpZiAoYXJyLmxlbmd0aCA9PT0gMikge1xuICAgIGlmIChpc05vdE51bGxGdW5jdGlvbihhcnJbMV0pKSB7XG4gICAgICBbc2VsZWN0LCBtZXJnZV0gPSBhcnI7XG4gICAgfSBlbHNlIHtcbiAgICAgIFtkZWZhdWx0c1RvLCBzZWxlY3RdID0gYXJyO1xuICAgIH1cbiAgfSBlbHNlIGlmIChhcnIubGVuZ3RoID09PSAxKSB7XG4gICAgW2RlZmF1bHRzVG9dID0gYXJyO1xuICB9IGVsc2UgaWYgKGFyci5sZW5ndGggPT09IDMpIHtcbiAgICBbZGVmYXVsdHNUbywgc2VsZWN0LCBtZXJnZV0gPSBhcnI7XG4gIH1cblxuICBpZiAoaXNOb3ROdWxsRnVuY3Rpb24ocmVkdWNlck9yQWN0aW9ucykpIHtcbiAgICByZXR1cm4ge2RlZmF1bHRzVG8sIHNlbGVjdCwgbWVyZ2UsIHJlZHVjZXI6IHJlZHVjZXJPckFjdGlvbnN9O1xuICB9IGVsc2Uge1xuICAgIHJldHVybiB7ZGVmYXVsdHNUbywgc2VsZWN0LCBtZXJnZSwgLi4ucmVkdWNlck9yQWN0aW9uc307XG4gIH1cbn1cblxuXG5mdW5jdGlvbiBub3JtYWxpemVBY3Rpb25zKHtyZWR1Y2VyOiBiYXNlUmVkdWNlciA9IF8uaWRlbnRpdHksIC4uLmNvbmZpZ30pIHtcbiAgY29uc3Qgbm90Rm4gPSBPYmplY3Qua2V5cyhjb25maWcpLmZpbHRlcihrZXkgPT4gIWlzTm90TnVsbEZ1bmN0aW9uKGNvbmZpZ1trZXldKSk7XG4gIGNvbnN0IGFjdG9ycyA9IF8ub21pdChjb25maWcsIFsuLi5PYmplY3Qua2V5cyhkZWZhdWx0cyksIC4uLm5vdEZuXSk7XG5cbiAgY29uc3QgcmVkdWNlciA9IChmdW5jdGlvbiBjb21wb3NlZENvbmZpZ3VyZWRSZWR1Y2VyKHN0YXRlLCBhY3Rpb24sIC4uLmFyZ3MpIHtcbiAgICBjb25zdCBhY3RvciA9IGFjdG9yc1thY3Rpb24gJiYgYWN0aW9uLnR5cGVdO1xuICAgIGlmIChhY3Rvcikge1xuICAgICAgcmV0dXJuIGFjdG9yKHN0YXRlLCBhY3Rpb24sIC4uLmFyZ3MpO1xuICAgIH1cbiAgICByZXR1cm4gYmFzZVJlZHVjZXIoc3RhdGUsIGFjdGlvbiwgLi4uYXJncyk7XG4gIH0pO1xuXG4gIHJldHVybiB7XG4gICAgLi4uXy5vbWl0KGNvbmZpZywgT2JqZWN0LmtleXMoYWN0b3JzKSksXG4gICAgcmVkdWNlclxuICB9O1xufVxuXG5mdW5jdGlvbiBpbmplY3REZWZhdWx0cyhjb25maWcpIHtcbiAgcmV0dXJuIF8uZGVmYXVsdHMoY29uZmlnLCBkZWZhdWx0cyk7XG59XG5cbmZ1bmN0aW9uIGNvbmZpZ1RvUmVkdWNlcih7c2VsZWN0LCBtZXJnZSwgcmVkdWNlciwgZGVmYXVsdHNUbywgYWN0aW9uUGFydCA9IHt9fSkge1xuICByZXR1cm4gKGZ1bmN0aW9uIHJlZHVjaWZpZWQoc3RhdGUgPSBkZWZhdWx0c1RvLCBhY3Rpb25BcmcgPSB7fSwgLi4ucmVzdCkge1xuICAgIGNvbnN0IGFjdGlvbiA9IF8uaXNGdW5jdGlvbihhY3Rpb25QYXJ0KVxuICAgICAgPyBhY3Rpb25QYXJ0KGFjdGlvbkFyZylcbiAgICAgIDogey4uLmFjdGlvblBhcnQsIC4uLmFjdGlvbkFyZ307XG4gICAgY29uc3Qgc2VsZWN0ZWQgPSBzZWxlY3QuY2FsbCh0aGlzLCBzdGF0ZSwgYWN0aW9uLCAuLi5yZXN0KTtcbiAgICBjb25zdCByZXN1bHQgPSByZWR1Y2VyLmNhbGwodGhpcywgc2VsZWN0ZWQsIGFjdGlvbiwgLi4ucmVzdCk7XG4gICAgcmV0dXJuIG1lcmdlLmNhbGwodGhpcywgcmVzdWx0LCBzdGF0ZSwgYWN0aW9uLCAuLi5yZXN0KTtcbiAgfSk7XG59XG5cbmNvbnN0IGRlZmF1bHRzID0ge1xuICBzZWxlY3Q6IF8uaWRlbnRpdHksXG4gIG1lcmdlOiBfLmlkZW50aXR5LFxuICByZWR1Y2VyOiBfLmlkZW50aXR5LFxuICBhY3Rpb25QYXJ0OiB7fVxufTtcblxuZnVuY3Rpb24gaXNTdGF0aWMoY29uZmlnKSB7XG5cbiAgaWYgKCFfLmlzT2JqZWN0KGNvbmZpZykpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICBjb25zdCB2YWxzID0gXyhjb25maWcpXG4gICAgLm9taXQoT2JqZWN0LmtleXMoZGVmYXVsdHMpKVxuICAgIC5vbWl0KFsnJCcsICdfJywgJ2RlZmF1bHQnLCAnZGVmYXVsdHNUbyddKSAvL2FsaWFzZXMgYW5kIGRlZmF1bHRzXG4gICAgLnZhbHVlcygpLnZhbHVlKCk7XG4gIHJldHVybiB2YWxzLmxlbmd0aCA+IDAgJiYgIV8uc29tZSh2YWxzLCBpc05vdE51bGxGdW5jdGlvbik7XG59XG5cbmZ1bmN0aW9uIHRvU3RhdGljUmVkdWNlcihjb25maWcpIHtcbiAgbGV0IGRlZmF1bHRWYWx1ZTtcbiAgaWYgKCFfLmlzT2JqZWN0KGNvbmZpZykpIHtcbiAgICBkZWZhdWx0VmFsdWUgPSBjb25maWc7XG4gIH0gZWxzZSB7XG4gICAgZGVmYXVsdFZhbHVlID0gXy5vbWl0KGNvbmZpZywgT2JqZWN0LmtleXMoZGVmYXVsdHMpKTtcbiAgfVxuXG4gIGNvbnN0IHtzZWxlY3QsIG1lcmdlfSA9IHsuLi5kZWZhdWx0cywgLi4uY29uZmlnfTtcblxuICByZXR1cm4gKGZ1bmN0aW9uIGNvbXBvc2VkU3RhdGljUmVkdWNlcihzdGF0ZSA9IGRlZmF1bHRWYWx1ZSwgYWN0aW9uKSB7XG4gICAgcmV0dXJuIG1lcmdlKHNlbGVjdChzdGF0ZSwgYWN0aW9uKSwgYWN0aW9uKTtcbiAgfSk7XG59XG5cblxuZnVuY3Rpb24gaXNWYWxpZFNlbGVjdEtleShrZXkpIHtcbiAgcmV0dXJuIF8uaXNTdHJpbmcoa2V5KSB8fCBfLmlzU3ltYm9sKGtleSkgfHwgXy5pc0FycmF5KGtleSk7XG59XG5cbmZ1bmN0aW9uIGNvbXBvc2VTZWxlY3RNZXJnZShjb25maWcpIHtcbiAgY29uc3Qgc2VsZWN0b3IgPSBfLmlzQXJyYXkoY29uZmlnKSA/IGNvbmZpZyA6IFtjb25maWddO1xuICAvLyBmb3IgZWFjaCBrZXkgaW4gYSBzZWxlY3RvciwgcHVsbCB0aGF0IHZhbHVlIGZyb20gdGhlIHN0YXRlXG4gIGNvbnN0IHNlbGVjdCA9IHN0YXRlID0+IHtcbiAgICBpZiAoIV8uaXNPYmplY3Qoc3RhdGUpKSB7XG4gICAgICB0aHJvdyBuZXcgQ29uZmlnRXJyb3IoYENhbid0IGtleSBzZWxlY3Qgd2hlbiBhIHdoZW4gc3RhdGUgaXMgbm90IGFuIG9iamVjdC4gUGFzcyBpbiBhIGRlZmF1bHQgb2JqZWN0LiAke0pTT04uc3RyaW5naWZ5KHN0YXRlKX1gKTtcbiAgICB9XG4gICAgcmV0dXJuIHNlbGVjdG9yLnJlZHVjZSgocG9pbnRlciwga2V5KSA9PiBwb2ludGVyW2tleV0sIHN0YXRlKTtcbiAgfTtcbiAgLy8gZm9yIGVhY2gga2V5IGluIGEgc2VsZWN0b3IsIHB1c2ggdGhhdCB2YWx1ZSBpbnRvIHRoZSBzdGF0ZVxuICBjb25zdCBtZXJnZSA9IChyZXN1bHQsIHN0YXRlKSA9PlxuICAgICh7XG4gICAgICAuLi5zdGF0ZSxcbiAgICAgIC4uLl8ucmV2ZXJzZShbLi4uc2VsZWN0b3JdKS5yZWR1Y2UoXG4gICAgICAgIChwb2ludGVyLCBrZXkpID0+ICh7W2tleV06IHBvaW50ZXJ9KSxcbiAgICAgICAgcmVzdWx0XG4gICAgICApXG4gICAgfSk7XG5cbiAgcmV0dXJuIHtzZWxlY3QsIG1lcmdlfTtcbn1cblxuZnVuY3Rpb24gQ29uZmlnRXJyb3IoLi4ubWVzc2FnZXMpIHtcbiAgdGhpcy5uYW1lID0gJ1JlZHVjaWZ5IENvbmZpZ3VyYXRpb24gRXJyb3InO1xuICB0aGlzLm1lc3NhZ2UgPSBtZXNzYWdlcy5tYXAoYXJnID0+IF8uaXNTdHJpbmcoYXJnKSA/IGFyZyA6IEpTT04uc3RyaW5naWZ5KGFyZykpLmpvaW4oJyAnKTtcbn1cbkNvbmZpZ0Vycm9yLnByb3RvdHlwZSA9IEVycm9yLnByb3RvdHlwZTtcbi8qXG4gQHBhcmFtIHJlZHVjZXIgY29uZmlnXG4gKi9cbmZ1bmN0aW9uIG5vcm1hbGl6ZVNlbGVjdChjb25maWcpIHtcbiAgbGV0IHtzZWxlY3QsIG1lcmdlLCAkOiBzZWxlY3RBbGlhcywgXzogbWVyZ2VBbGlhcywgLi4ucmVzdH0gPSBjb25maWc7XG4gIG1lcmdlID0gbWVyZ2UgfHwgbWVyZ2VBbGlhcztcbiAgc2VsZWN0ID0gc2VsZWN0IHx8IHNlbGVjdEFsaWFzO1xuICBpZiAoaXNOb3ROdWxsRnVuY3Rpb24oc2VsZWN0KSkge1xuICAgIGlmICghaXNOb3ROdWxsRnVuY3Rpb24obWVyZ2UpKSB7XG4gICAgICB0aHJvdyBuZXcgQ29uZmlnRXJyb3IoJ01lcmdlIG11c3QgYmUgYSBmdW5jdGlvbiBpZiBzZWxlY3QgaXMgYSBmdW5jdGlvbicpO1xuICAgIH1cbiAgfSBlbHNlIGlmIChtZXJnZSA9PT0gdW5kZWZpbmVkICYmIHNlbGVjdCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgaWYgKCFpc1ZhbGlkU2VsZWN0S2V5KHNlbGVjdCkpIHtcbiAgICAgIHRocm93IG5ldyBDb25maWdFcnJvcihzZWxlY3QsICdpcyBub3QgYSB2YWxpZCBzZWxlY3Qga2V5Jyk7XG4gICAgfVxuICAgIHJldHVybiB7Li4uY29tcG9zZVNlbGVjdE1lcmdlKHNlbGVjdCksIC4uLnJlc3R9O1xuICB9XG4gIHJldHVybiB7c2VsZWN0LCBtZXJnZSwgLi4ucmVzdH07XG59XG5cbmZ1bmN0aW9uIG5vcm1hbGl6ZURlZmF1bHRzKGNvbmZpZykge1xuICBjb25zdCBkZWZhdWx0c1RvID0gY29uZmlnLmRlZmF1bHRzVG8gPT09IHVuZGVmaW5lZCA/IGNvbmZpZ1snZGVmYXVsdCddIDogY29uZmlnLmRlZmF1bHRzVG87XG4gIHJldHVybiB7XG4gICAgLi4uXy5vbWl0KGNvbmZpZywgWydkZWZhdWx0J10pLFxuICAgIGRlZmF1bHRzVG9cbiAgfVxufVxuXG4vKlxuIEBwYXJhbSByZWR1Y2VyIGFyZ3VtZW50IC0gb25lIG9mIHRoZSBzdGVwcyBwYXNzZWQgdG8gcGlwZWxpbmUoLi4uKVxuIFJldHVybnMge3NlbGVjdDxGdW5jdGlvbj4sIG1lcmdlPEZ1bmN0aW9uPiwgcmVkdWNlcjxGdW5jdGlvbj59XG4gKi9cbmZ1bmN0aW9uIHJlZHVjaWZ5KHJlZHVjZXJBcmdSYXcpIHtcbiAgY29uc3Qgc2NvcGUgPSB0aGlzO1xuXG4gIC8vIGFscmVhZHkgYSByZWR1Y2VyIC0gbm90IG1lc3NpbmcgYXJvdW5kIHdpdGggaXRcbiAgaWYgKGlzTm90TnVsbEZ1bmN0aW9uKHJlZHVjZXJBcmdSYXcpKSB7XG4gICAgcmV0dXJuIHJlZHVjZXJBcmdSYXc7XG4gIH1cbiAgbGV0IHJlZHVjZXJBcmcgPSBub3JtYWxpemVBcnJheShyZWR1Y2VyQXJnUmF3KTtcbiAgaWYgKGlzU3RhdGljKHJlZHVjZXJBcmcpKSB7XG4gICAgcmV0dXJuIHRvU3RhdGljUmVkdWNlcihyZWR1Y2VyQXJnKTtcbiAgfVxuICByZXR1cm4gXyhyZWR1Y2VyQXJnKVxuICAgIC50aHJ1KG5vcm1hbGl6ZVNlbGVjdCkgLy8gdHVybnMgc2VsZWN0b3Iga2V5cyBpbnRvIHNlbGVjdCwgbWVyZ2UgLSBoYW5kbGVzIHNlbGVjdCBhbGlhc1xuICAgIC50aHJ1KG5vcm1hbGl6ZURlZmF1bHRzKSAvLyBwdWxscyBkZWZhdWx0c1RvXG4gICAgLnRocnUobm9ybWFsaXplQWN0aW9ucykgLy8gYWN0aW9ucyB0byByZWR1Y2VyXG4gICAgLnRocnUoaW5qZWN0RGVmYXVsdHMpIC8vIGlmIGFueXRoaW5nJ3MgbWlzc2luZyAtIGFkZCBpdCBpblxuICAgIC50aHJ1KGNvbmZpZ1RvUmVkdWNlcikgLy8gbWFrZSBhIHJlZHVjZXIgZnVuY3Rpb24gZnJvbSBhIGdpdmVuIGNvbmZpZ1xuICAgIC52YWx1ZSgpLmJpbmQoc2NvcGUpO1xufVxuZXhwb3J0IGRlZmF1bHQgcmVkdWNpZnk7XG4iXX0=