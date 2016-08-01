Reducify
================

Make [Redux][] reducers with less effort.

<http://code.mediadrake.com/reducify>

## Installation

    % npm install reducify

## Usage

### Turn configurations into reducer functions  

Tired of massive, unwieldly switch statements? Wish you could break up reducers into re-usable and configurable parts?

> Yes, this problem is literally ruining my life.

We thought so. With reducify you can create reducers with a configurations and sleep a bit easier.

## Namespacing

You might want to apply a reducer to a single state key. Well that's easy as pie.

```js
import { createStore } from 'redux';
import pipeline from 'reducify';

// If you're going to namespace, make sure your state is an object!
function rootReducer(state = {myNumber: 0, myBoolean: false}, action) {
    return state;
}

function mathReducer(state = 0, action) {
    switch(action.type) {
        case "ADD":
            return state + action.data;
        default:
            return state;
    }
}

function toggleReducer(state = false, action) {
    switch(action.type) {
        case "TOGGLE":
            return !state;
        default:
            return state;
    }    
}

const store = createStore(
  pipeline(
    rootReducer,    
    {select: 'myNumber', reducer: mathReducer}, // identical to ['myNumber', mathReducer]
    {select: 'myBoolean', reducer: toggleReducer}
  )
);

store.dispatch({
   type: 'ADD',
   data: 10
});

store.dispatch({
   type: 'TOGGLE'
});

// State is: {myNumber: 10, myBoolean: true}
```

Alternatively, you can pass in select and merge methods. The following would be identical to the pipeline above:

```js
export default createStore(
  pipeline(
    rootReducer,    
    {
        select: state => state.myBoolean, 
        merge: (result, state) => ({...state, myBoolean: result}), 
        reducer: toggleReducer
    }, 
    // alternatively you can call 
    // [state => state.myBoolean, (result, state) => ({...state, myBoolean: result}), toggleReducer]
    {
        select: state => state.myNumber, 
        merge: (result, state) => ({...state, myNumber: result}), 
        reducer: mathReducer
    }
  )
);
```


### Defaults

If you're heavy into namespacing, defaults are a pain - just pass it in instead of a reducer.

```js
import { createStore } from 'redux';
import pipeline from 'reducify';

function mathReducer(state = 0, action) {
    // ...
}

function toggleReducer(state = false, action) {
    // ...
}

const store = createStore(
  pipeline(
    {myNumber: 0, myBoolean: false}, // Just pass in an object - this will be your default state
    {select: 'myNumber', reducer: mathReducer},
    {select: 'myBoolean', reducer: toggleReducer}
  )
);

store.dispatch({
   type: 'ADD',
   data: 10
});

store.dispatch({
   type: 'TOGGLE'
});

// State is: {myNumber: 10, myBoolean: true}
```

### Nesting

Because we're just making reducers, you're free to do pipe all the way down!

```js
import { createStore } from 'redux';
import pipeline from 'reducify';

function mathReducer(state = 0, action) {
    // ...
}

function toggleReducer(state = false, action) {
    // ...
}

const store = createStore(
  pipeline(
    {data: {}, otherData: {}},
    {select: 'data', reducer: pipeline(
        {select: 'myNumber', reducer: mathReducer},
        {select: 'myBoolean', reducer: toggleReducer}
    )},
    // you can use the same shortcuts when you nest
    // this is pretty much the same thing
    ['otherData', pipeline(
        ['myNumber', mathReducer],
        ['myBoolean', toggleReducer],
    )]
  )
);

store.dispatch({
   type: 'ADD',
   data: 10
});

store.dispatch({
   type: 'TOGGLE'
});

/* 
    State is:
    {
        data: {myNumber: 10, myBoolean: true},
        otherData: {myNumber: 10, myBoolean: true}
    }
*/
```

### Configurable Reducers

Not something you absolutely need this package for, but it makes this pattern a whole lot easier.

```js
import { createStore } from 'redux';
import pipeline from 'reducify';

function genericMathReducer({add, subtract}) {
    return (state = 0, action) => {
        switch(action.type) {
            case add:
                return state + action.data;
            case subtract:
                return state - action.data;
            default:
                return state;
        }        
    };    
}

const store = createStore(
  pipeline(
    {myNumber: 0, myOtherNumber: 0}, 
    ['myNumber', genericMathReducer({add: 'ADD_NUMBER', subtract: 'SUBTRACT_NUMBER'})],
    ['myOtherNumber', genericMathReducer({add: 'ADD_OTHER_NUMBER', subtract: 'SUBTRACT_OTHER_NUMBER'})]
  )
);

store.dispatch({
   type: 'ADD_NUMBER',
   data: 10
});

store.dispatch({
   type: 'SUBTRACT_OTHER_NUMBER',
   data: 5
});

// State is: {myNumber: 10, myOtherNumber: -5}
```

### Interrupt

You might want to stop the flow of the reducer chain. This is especially true if you create a generic configurable reducer but want to surpress some actions.

```js
import pipeline from 'reducify';

function blockSubtract(state = 0, action, end) {
    switch(action.type) {        
        case "SUBTRACT":
            // Notice we're passing state to the end method
            return end(state);
        default:
            return state;
    }
}

// Math reducer would come from a library or something
function mathReducer(state = 0, action) {
    switch(action.type) {
        case "ADD":
            return state + action.data;
        case "SUBTRACT":
            return state - action.data;
        default:
            return state;
    }
}

const store = createStore(
  pipeline(
    blockSubtract, 
    mathReducer
  )
);

store.dispatch({
   type: 'ADD',
   data: 10
});

// This gets blocked
store.dispatch({
   type: 'SUBTRACT',
   data: 5
});

// State is: 10
```

Order matters! If you put an interrupting reducer last, it won't change anything because we're doing them in order.

## API

### pipeline

```js
import pipeline from 'reducify';
pipeline([steps ...]);
```

There's only one function, but it's got a few different ways to send args in. Let's look at them all.

#### Functions

```js
pipeline([<Function>...]);
```

```js
import pipeline from 'reducify';

function reducer1(state = 0, action) {
    // ...
}

function reducer2(state = 0, action) {
    // ...
}

export default createStore(
  pipeline(reducer1, reducer2)
);
// State is: Number
```

Just take any regular old reducer and pass it in. You can do one reducer or you can do 100.

#### Object Configs

```js
pipeline([{select<string>, reducer<Function>}...]);
// or
pipeline([{select<Function>, merge<Function>, reducer<Function>}...]);
// don't be afraid to mix them together either
pipeline({select<Function>, merge<Function>, reducer<Function>}, {select<string>, reducer<Function>}, <Function>);
```

```js
import pipeline from 'reducify';

function rootReducer(state = {}, action) {
    return state;
}

function reducer1(state = 0, action) {
    // ...
}

function reducer2(state = 0, action) {
    // ...
}

export default createStore(
  pipeline(
    rootReducer,
    {select: 'paramOne' ,reducer: reducer1}, 
    {select: state => state.paramTwo, merge: (result, state) => ({...state, paramTwo: result}), reducer: reducer2}
  )
);
// State is: {paramOne<Number>, paramTwo<Number>}
```

If your reducer is changing keys on an object, make sure you have a root reducer or a default value! Look at the `select` example above if this seems crazy.

#### Arrays

```js
pipeline([[<string>, <Function>]...]); // identical to {select<string>, reducer<Function>}
// or
pipeline([[<Function>, <Function>, <Function>]...]); // identical to {select<Function>, merge<Function>, reducer<Function>}
// you can mix these together too
```

```js
import pipeline from 'reducify';

function rootReducer(state = {}, action) {
    return state;
}

function reducer1(state = 0, action) {
    // ...
}

function reducer2(state = 0, action) {
    // ...
}

export default createStore(
  pipeline(
    rootReducer,
    ['paramOne', reducer1], 
    [state => state.paramTwo, (result, state) => ({...state, paramTwo: result}), reducer: reducer2]
  )
);
// State is: {paramOne<Number>, paramTwo<Number>}
```

This really just maps the array to the configs above. It gets pretty useful if you're nesting reducers.

#### Defaults

```js
pipeline([<Object>...]); // identical to (state = <Object>) => state
```

Adding that root reducer just for a default seemed kind of excessive, so if you pass in an object that doesn't match a config signature, we'll use it as a default.

```js
import pipeline from 'reducify';

function reducer1(state = 0, action) {
    // ...
}

function reducer2(state = 0, action) {
    // ...
}

export default createStore(
  pipeline(
    {foo: 'bar'},
    ['paramOne', reducer1], 
    [state => state.paramTwo, (result, state) => ({...state, paramTwo: result}), reducer: reducer2]
  )
);
// State is: {paramOne<Number>, paramTwo<Number>, foo: 'bar'}
```

Of course, if you decide to have a reducer with default values that include a string named `select` and a function named `reducer`, this obviously won't work. But let's be honest, that sounds like a silly thing to do. 

If you find yourself in that situation, just use a root reducer that sets those defaults instead - more boilerplate for you.

### debugPipeline

```js
import {debugPipeline} from 'reducify';
pipeline([steps ...]);
```

Same as the default pipeline function, just with a lot of console noise.


## Native

### This works with React Native too

Nothing special - use it like any other redux package. Check the examples if you don't believe me.

## Combine Stores

> Do I have to do anything special to use `combineStores`?

No - these are just reducers after all.

## Credits

Redux Pipeline is free software under the MIT license. It was created in sunny Santa Monica by [Matthew Drake][].

[Redux]: https://github.com/reactjs/redux
[Matthew Drake]: http://www.mediadrake.com
