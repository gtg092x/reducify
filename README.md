Reducify
================

Make [Redux][] reducers with less effort.

<http://code.mediadrake.com/reducify>

## Installation

    % npm install reducify

## Usage

```js
import { createStore } from 'redux';
import reducify from 'reducify';


const store = createStore(
  reducify({
    "ADD": (state = 0, action) => state + action.data,
    "SUBTRACT": (state = 0, action) => state - action.data
  })
);

store.dispatch({
   type: 'ADD',
   data: 10
});

// State is: 10

store.dispatch({
   type: 'SUBTRACT',
   data: 5
});

// State is: 5
```

### Turn configurations into reducer functions  

Tired of massive, unwieldly switch statements? Wish you could break up reducers into re-usable and configurable parts?

> Yes, this problem is literally ruining my life.

We thought so. With Reducify you can create reducers with a configurations and sleep a bit easier.

## Reducers Three (and a half) Ways

### Functions
 
The vanilla approach. Passing in a function just spits out the same function. 

If you've got your reducers all squared away we don't want to rock the boat.
 
```js

function myReducer(state, action) {
    switch(action.type) {
        // reducer stuff
    }
}

createStore(reducify(myReducer));
```

### Configs
 
If you pass in a config, we'll turn it into a reducer function. 

Check out the config api reference to see what you can add.
 
```js

const myConfig = {
    defaultsTo: 10
    reducer(state, action) { // state will be 10        
        // reducer stuff
    }
};

createStore(reducify(myConfig));
```

### Arrays
 
Passing in an array is just a short version of the config above.
 
```js

const myArrayConfig = [
    10,
    (state, action) => { // state will be 10        
        // reducer stuff
    }
];

createStore(reducify(myArrayConfig));
```

If you pass multiple arguments to reducify, we'll just treat it like an array (that was the half of the 3 and a half).

This is the same as above.

```js
createStore(reducify(10, 
  (state, action) => { // state will be 10        
   // reducer stuff
  }
));
```

Arrays are deconstructed with the following signature:

`[defaultsTo, [select, merge], reducerAndActions]`

Some examples:

`[10, myReducerFunction]` === `{defaultsTo: 10, reducer: myReducerFunction}`

`[{myCount: 10}, 'myCount', myReducerFunction]` === `{defaultsTo: {myCount: 10}, select: 'myCount', reducer: myReducerFunction}`

`[{myCount: 10}, state => state.myCount, (result, state) => {...state, myCount: result}, myReducerFunction]` 

is the same as:

`{defaultsTo: {myCount: 10}, select: state => state.myCount, merge: (result, state) => {...state, myCount: result}, reducer: myReducerFunction}`


## Configuration Sugar

Because we're opening the door on configuration, we get the ability to add in some user-directed magic that solves common redux boilerplate.

### Action Methods

This might bring out some pitchforks, but you don't need to do a switch statement for everything. If you pass in an action type that is a method, we'll run them before we run any declared reducers.

```js
import { createStore } from 'redux';
import reducify from 'reducify';

const store = createStore(
  reducify({
    "INCREMENT": (state = 0, action) => state + 1,    
    "DECRAMENT": (state = 0, action) => state - 1
  })
);

store.dispatch({
   type: 'INCREMENT'
});

// State is 1

store.dispatch({
   type: 'DECREMENT'
});

// State is 0

```

The following is the same as above

```js
import { createStore } from 'redux';
import reducify from 'reducify';

const store = createStore(
  function(state = 0, action) {
    switch(action.type) {
        case "INCREMENT":
            return state + 1;
        case "DECREMENT":
            return state - 1;
        default:
            return state;
    }
  }
);

// same as above

```

Nice! We went from 10 lines to 4. Not bad. 

Keep in mind, this is still Redux. So don't take any shortcuts like trying to not make copies of your objects. 

```js
// GOOD
const store = createStore(
  reducify({
    "ADD_PITCHFORK": (state = {pitchforks: 0}, action) => ({...state, pitchforks: state.pitchforks + 1}),    
    "USE_PITCHFORK": (state = {pitchforks: 0}, action) => ({...state, pitchforks: state.pitchforks - 1})
  })
);

// BAD
const store = createStore(
  reducify({
    "ADD_PITCHFORK": (state = {pitchforks: 0}, action) => {
        state.pitchforks ++;
        return state;
    },    
    "USE_PITCHFORK": (state = {pitchforks: 0}, action) => {
       state.pitchforks --;
       return state;
   }
  })
);
```

You can even combine these methods with a reducer function! The actions will always run first.

```js
import { createStore } from 'redux';
import reducify from 'reducify';

const store = createStore(
  reducify({
    "ADD_PITCHFORK": (state = {pitchforks: 0}, action) => ({...state, pitchforks: state.pitchforks + 1}),    
    "USE_PITCHFORK": (state = {pitchforks: 0}, action) => ({...state, pitchforks: state.pitchforks - 1}),
    reducer(state, action) {
        switch(action.type) {
            case "CLEAR_PITCHFORKS":
                return {...state, pitchforks: 0};
            default:
                return state;
        }
    }
  })
);
```

*get it, you won't chase us down with pitchforks because we're letting you use switch statements too? Nevermind, sigh - moving on*

### Selectors

Ever dealt with mutating a large redux object? It's not a lot of fun to try and peak at your model over a massive switch statement and just hope you're getting it right.
 
#### String selectors
 
It's even less fun to have to deal with updating your model because Brad in product design thinks that we should go from having 1 user profile picture to 10.
  
*You're a jerk Brad. I ate all of the spaghetti you brought in for lunch - it was only ok.*

```js
import { createStore } from 'redux';
import reducify from 'reducify';

const store = createStore(
  reducify({
    defaultsTo: {username: 'Brad', hasSpaghetti: true},
    select: 'hasSpaghetti',
    "EAT_SPAGHETTI": (state, action) => false
  })
);

store.dispatch({
   type: 'EAT_SPAGHETTI'
});

// State is: {username: 'Brad', hasSpaghetti: false}
```

In the example above, we passed a string to the `select` method. The string is mapped to an object key that we automatically merge and select from.


#### Selector Methods

You can pass in select and merge methods. This would be identical to the reducer above:

```js
import { createStore } from 'redux';
import reducify from 'reducify';

const store = createStore(
  reducify({
    defaultsTo: {username: 'Brad', hasSpaghetti: true},
    select: (state) => state.hasSpaghetti,
    merge: (result, state) => ({...state, hasSpaghetti: result})
    "EAT_SPAGHETTI": (state, action) => false
  })
);

store.dispatch({
   type: 'EAT_SPAGHETTI'
});

// State is: {username: 'Brad', hasSpaghetti: false}
```

And you can use some aliases - `$` for select and `_` for merge. 

```js
const store = createStore(
  reducify({
    defaultsTo: {username: 'Brad', hasSpaghetti: true},
    $: 'hasSpaghetti'
    "EAT_SPAGHETTI": (state, action) => false
  })
);

// eating Brad's spaghetti

const store = createStore(
  reducify({
    defaultsTo: {username: 'Brad', hasSpaghetti: true},
    $: (state) => state.hasSpaghetti,
    _: (result, state) => ({...state, hasSpaghetti: result})
    "EAT_SPAGHETTI": (state, action) => false
  })
);

// still eating Brad's spaghetti
```

#### Deep selectors

If you're trying to access an object that's nested into your state, you can pass in an array and we'll traverse that path for you

```js
import { createStore } from 'redux';
import reducify from 'reducify';

const store = createStore(
  reducify({
    defaultsTo: {username: 'Brad', lunch: {hasSpaghetti: true}},
    select: ['lunch', 'hasSpaghetti'],
    "EAT_SPAGHETTI": (state, action) => false
  })
);

store.dispatch({
   type: 'EAT_SPAGHETTI'
});

// State is: {username: 'Brad', lunch: {hasSpaghetti: false}}
```

### Action Partials

When you're declaring your reducer, you've got a chance to set some default values for all actions that go through it.

```js
import { createStore } from 'redux';
import reducify from 'reducify';

function incrementReducer(state = 0, {data = 1, ...action}) {
    switch (action.type) {
        case 'INCREMENT':
            return state + data;
        case 'DECREMENT':
            return state - data;
        default:
            return state;
    }
}

const store = createStore(
  reducify({    
    reducer: incrementReducer,
    actionPart: {data: 2}
  })
);

store.dispatch({
   type: 'INCREMENT'
});

// State is: 2

store.dispatch({
   type: 'DECREMENT'
});

// State is: 0
```

### Defaults

Just use the config option `defaultsTo`.

```js
import { createStore } from 'redux';
import reducify from 'reducify';

const store = createStore(
  reducify({    
    defaultsTo: {myNumber: 10}, 
    select: 'myNumber', 
    "ADD": (state = 0, action) => state + action.data,
    "SUBTRACT": (state = 0, action) => state - action.data    
  })
);

store.dispatch({
   type: 'ADD',
   data: 20
});

// State is: {myNumber: 30}

store.dispatch({
   type: 'SUBTRACT',
   data: 5
});

// State is: {myNumber: 25}
```

You will get a state with all of your reducers, so if you're relying on method signature defaults, that will get overridden.

```js
const store = createStore(
  reducify({    
    defaultsTo: {myNumber: 10}, 
    select: 'myNumber', 
    "ADD": (state = 0, action) => state + action.data,
    "SUBTRACT": (state = 0, action) => state - action.data    
  })
);
```

### Statics

A cousin of `defaultsTo`. Static reducers just return the state or default value regardless of action type.

```js
import { createStore } from 'redux';
import reducify from 'reducify';

const store = createStore(
  reducify({    
    foo: 'bar'    
  })
);

store.dispatch({
   type: 'ADD',
   data: 20
});

// State is: {foo: 'bar'}

store.dispatch({
   type: 'SUBTRACT',
   data: 5
});

// State is: {foo: 'bar'}
```

Pass in a plain object or value and that's what you'll get back every time. Good for mocking and some plugins.

## Credits

Reducify is free software under the MIT license. It was created in sunny Santa Monica by [Matthew Drake][].

[Redux]: https://github.com/reactjs/redux
[Matthew Drake]: http://www.mediadrake.com
