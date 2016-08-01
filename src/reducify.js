import _ from 'lodash';

function isNotNullFunction(arg) {
  return arg !== null && arg !== undefined && _.isFunction(arg);
}

function normalizeArray(arr) {
  if (!_.isArray(arr) || arr.length < 2) {
    return arr;
  }
  const reducerOrActions = arr.pop();
  let defaultsTo, select, merge;
  if (arr.length === 2) {
    if (isNotNullFunction(arr[1])) {
      [select, merge] = arr;
    } else {
      [defaultsTo, select] = arr;
    }
  } else if (arr.length === 1) {
    [defaultsTo] = arr;
  } else if (arr.length === 3) {
    [defaultsTo, select, merge] = arr;
  }
  if (isNotNullFunction(reducerOrActions)) {
    return {defaultsTo, select, merge, reducer: arr};
  } else {
    return {defaultsTo, select, merge, ...reducerOrActions};
  }
}


function normalizeActions(config) {
  if (isNotNullFunction(config.reducer)) {
    return config;
  }
  const notFn = Object.keys(config).filter(key => !isNotNullFunction(config[key]));
  const actors = _.omit(config, [...Object.keys(defaults), ...notFn]);

  const reducer = (function composedConfiguredReducer(state, action, ...args) {
    const actor = actors[action && action.type];
    if (actor) {
      return actor(state, action, ...args);
    }
    return state;
  });

  return {
    ..._.omit(config, Object.keys(actors)),
    reducer
  };
}

function injectDefaults(config) {
  return _.defaults(config, defaults);
}

function configToReducer({select, merge, reducer, defaultsTo}) {
  return (function reducified(state = defaultsTo, action = {}, ...rest) {
    const selected = select.call(this, state, action, ...rest);
    const result = reducer.call(this, selected, action, ...rest);
    return merge.call(this, result, state, action, ...rest);
  });
}

const defaults = {
  select: _.identity,
  merge: _.identity,
  reducer: _.identity
};

function isStatic(config) {

  if (!_.isObject(config)) {
    return true;
  }
  const vals = _(config)
    .omit(Object.keys(defaults))
    .omit(['$', '_', 'default', 'defaultsTo']) //aliases and defaults
    .values().value();
  return vals.length > 0 && !_.some(vals, isNotNullFunction);
}

function toStaticReducer(config) {
  let defaultValue;
  if (!_.isObject(config)) {
    defaultValue = config;
  } else {
    defaultValue = _.omit(config, Object.keys(defaults));
  }

  const {select, merge} = {...defaults, ...config};

  return (function composedStaticReducer(state = defaultValue, action) {
    return merge(select(state, action), action);
  });
}


function isValidSelectKey(key) {
  return _.isString(key) || _.isSymbol(key) || _.isArray(key);
}

function composeSelectMerge(config) {
  const selector = _.isArray(config) ? config : [config];
  // for each key in a selector, pull that value from the state
  const select = state => {
    if (!_.isObject(state)) {
      throw new ConfigError("Can't key select when a when state is not an object. Pass in a default object.");
    }
    return selector.reduce((pointer, key) => pointer[key], state);
  };
  // for each key in a selector, push that value into the state
  const merge = (result, state) =>
    ({
      ...state,
      ..._.reverse([...selector]).reduce(
          (pointer, key) => ({[key]: pointer}),
          result
        )
    });

  return {select, merge};
}

function ConfigError(message) {
  this.name = 'Reducify Configuration Error';
  this.message = message;
  this.stack = (new Error()).stack;
}
ConfigError.prototype = new Error;
/*
 @param reducer config
 */
function normalizeSelect(config) {
  let {select, merge, $, _, ...rest} = config;
  merge = merge || _;
  select = select || $;
  if (isNotNullFunction(select)) {
    if (!isNotNullFunction(merge)) {
      throw new ConfigError('Merge must be a function if select is a function');
    }
  } else if (merge === undefined && select !== undefined) {
    if (!isValidSelectKey(select)) {
      throw new ConfigError(select, 'is not a valid select key');
    }
    return {...composeSelectMerge(select), ...rest};
  }
  return {select, merge, ...rest};
}

function normalizeDefaults(config) {
  const defaultsTo = config.defaultsTo === undefined ? config['default'] : config.defaultsTo;
  return {
    ..._.omit(config, ['default']),
    defaultsTo
  }
}

/*
  @param reducer argument - one of the steps passed to pipeline(...)
  Returns {select<Function>, merge<Function>, reducer<Function>}
 */
function reducify(...reducerArgs) {
  const scope = this;
  const reducerArgRaw = reducerArgs.length > 1 ? reducerArgs : reducerArgs[0];
  // already a reducer - not messing around with it
  if (isNotNullFunction(reducerArg)) {
    return reducerArg;
  }
  let reducerArg = normalizeArray(reducerArgRaw);
  if (isStatic(reducerArg)) {
    return toStaticReducer(reducerArg);
  }
  return _(reducerArg)
    .thru(normalizeSelect) // turns selector keys into select, merge - handles select alias
    .thru(normalizeDefaults) // pulls defaultsTo
    .thru(normalizeActions) // actions to reducer
    .thru(injectDefaults) // if anything's missing - add it in
    .thru(configToReducer) // make a reducer function from a given config
    .value().bind(scope);
}
export default reducify;
