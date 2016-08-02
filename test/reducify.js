import reducify from '../src/reducify';
import _ from 'lodash';
import chai from 'chai';

const {assert} = chai;

const xdescribe = _.noop;

export default function () {

  const testActions = [
    {type: 'ADD', data: 10},
    {type: 'SUBTRACT', data: 5},
    {type: 'REVERSE'},
    {type: 'APPEND', data: 'bass'}
  ];

  const testFailure = method => {
    try {
      method();
      assert.fail();
    } catch (e) {

    }
  };

  const checkSignature = (result) => {
    it('should be a function', function () {
      assert.isFunction(result);
    });
  };

  const checkMathOperations = (reducer, defaultValue = 0, select = _.identity) => {

    const initialState = _.isObject(defaultValue) ? {} : 0;

    it('addition actions should work', function () {
      const toAdd = 10;

      assert.equal(toAdd, select(reducer(initialState, {type: 'ADD', data: toAdd})));
      assert.equal(select(defaultValue) + toAdd, select(reducer(defaultValue, {type: 'ADD', data: toAdd})));
    });

    it('subtraction actions should work', function () {
      const toSubtract = 10;

      assert.equal(0 - toSubtract, select(reducer(initialState, {type: 'SUBTRACT', data: toSubtract})));
      assert.equal(select(defaultValue) - toSubtract, select(reducer(defaultValue, {
        type: 'SUBTRACT',
        data: toSubtract
      })));
    });
  };

  const checkMathOperationsEquality = (reducerOne, reducerTwo) => {

    it('should have identical behavior', function () {
      const toAdd = 10;
      const defaultValue = {data: 100};
      const action = {type: 'ADD', data: toAdd};
      assert.deepEqual(reducerOne(defaultValue, action), reducerTwo(defaultValue, action));
      const toSubtract = 15;
      const action2 = {type: 'SUBTRACT', data: toSubtract};
      assert.deepEqual(reducerOne(defaultValue, action2), reducerTwo(defaultValue, action2));
    });
  };

  const checkStringOperations = (reducer, defaultValue = '', select = _.identity) => {

    it('reverse actions should work', function () {
      assert.equal(select(defaultValue).split("").reverse().join(""), select(reducer(defaultValue, {type: 'REVERSE'})));
    });

    it('append actions should work', function () {
      const toAppend = "bar";
      assert.equal(select(defaultValue) + toAppend, select(reducer(defaultValue, {type: 'APPEND', data: toAppend})));
    });
  };

  const checkStringOperationsEquality = (reducerOne, reducerTwo) => {

    it('should have identical behavior', function () {
      const defaultValue = {data: "yes"};
      const action = {type: 'REVERSE'};
      assert.deepEqual(reducerOne(defaultValue, action), reducerTwo(defaultValue, action));
      const toAppend = "no";
      const action2 = {type: 'APPEND', data: toAppend};
      assert.deepEqual(reducerOne(defaultValue, action2), reducerTwo(defaultValue, action2));
    });
  };

  const mathReducer = function (state = 0, action) {
    switch (action.type) {
      case "ADD":
        return state + action.data;
      case "SUBTRACT":
        return state - action.data;
      default:
        return state;
    }
  };

  const stringReducer = function (state = '', action) {
    switch (action.type) {
      case "REVERSE":
        return state.split("").reverse().join("");
      case "APPEND":
        return state + action.data;
      default:
        return state;
    }
  };

  const checkIntegrity = (reducer, defaultsTo, state) => {
    it('should not alter a state', function () {
      const stateCopy = _.cloneDeep(state);
      testActions.forEach(action => reducer(state, action));
      assert.deepEqual(stateCopy, state);
    });

    it('should produce an identity when no action is passed', function () {
      assert.deepEqual(state, reducer(state, {}));
    });

    it('should return the default value when nothing is passed', function () {
      assert.deepEqual(defaultsTo, reducer(undefined, {}));
    });
  };

  describe('function', function () {


    const reducer = reducify(_.identity);
    checkSignature(reducer);
    checkIntegrity(reducer, undefined, {foo: 'buzz'});


    const reducer2 = reducify(mathReducer);
    checkSignature(reducer2);
    checkIntegrity(reducer2, 0, 15);
    checkMathOperations(reducer2);

    checkStringOperations(reducify(stringReducer));
  });

  describe('config object long', function () {


    const arg = {select: state => state, merge: (result, state) => result, reducer: _.identity};
    const reducer = reducify(arg);

    checkSignature(reducer);
    checkIntegrity(reducer, undefined, {foo: 'buzz'});

    const reducer2 = reducify({select: state => state, merge: (result, state) => result, reducer: mathReducer});
    checkSignature(reducer2);
    checkIntegrity(reducer2, 0, 15);
    checkMathOperations(reducer2);
    testFailure(reducify.bind(this, {select: _.noop, reducer: _.identity}));

    const reducer3 = reducify({select: state => state, merge: (result, state) => result, reducer: stringReducer});
    checkStringOperations(reducer3);

    const selector = (state) => state.test;
    let defaultsTo = {test: 10};
    const reducer4 = reducify(
      {
        defaultsTo,
        select: state => state.test, merge: (result, state) => ({...state, test: result}), reducer: mathReducer
      }
    );
    checkSignature(reducer4);
    checkIntegrity(reducer4, defaultsTo, {test: 15});
    checkMathOperations(reducer4, defaultsTo, selector);

    describe('aliases', function () {
      checkMathOperationsEquality(
        reducify({
          select: state => state.test,
          merge: (result, state) => ({...state, test: result}),
          reducer: mathReducer
        }),
        reducify({$: state => state.test, _: (result, state) => ({...state, test: result}), reducer: mathReducer})
      );
    });
    defaultsTo = {test: 'foo'};
    const reducer5 = reducify(
      {
        defaultsTo,
        select: state => state.test, merge: (result, state) => ({...state, test: result}), reducer: stringReducer
      }
    );
    checkStringOperations(reducer5, defaultsTo, selector);
    describe('aliases', function () {
      checkMathOperationsEquality(
        reducify({
          select: state => state.test,
          merge: (result, state) => ({...state, test: result}),
          reducer: stringReducer
        }),
        reducify({$: state => state.test, _: (result, state) => ({...state, test: result}), reducer: stringReducer})
      );
    });
  });

  describe('config array long', function () {

    const arg = [state => state, (result, state) => result, _.identity];
    const reducer = reducify(arg);

    checkSignature(reducer);
    checkIntegrity(reducer, undefined, {foo: 'buzz'});

    const reducer2 = reducify([state => state, (result, state) => result, mathReducer]);
    checkSignature(reducer2);
    checkIntegrity(reducer2, 0, 15);
    checkMathOperations(reducer2);

    const reducer3 = reducify([state => state, (result, state) => result, stringReducer]);
    checkStringOperations(reducer3);
  });


  describe('config default array long', function () {

    let defaultTo = {foo: 'bar'};
    const arg = [defaultTo, state => state, (result, state) => result, _.identity];
    const reducer = reducify(arg);

    checkSignature(reducer);
    checkIntegrity(reducer, defaultTo, {foo: 'buzz'});

    defaultTo = {test: 10};
    const selector = (state) => state.test;
    const reducer4 = reducify(
      [
        defaultTo,
        state => state.test,
        (result, state) => ({...state, test: result}),
        mathReducer
      ]
    );
    checkSignature(reducer4);
    checkIntegrity(reducer4, defaultTo, {test: 15});
    checkMathOperations(reducer4, defaultTo, selector);

    defaultTo = {test: 'foo'};
    const reducer5 = reducify(
      [
        defaultTo,
        state => state.test,
        (result, state) => ({...state, test: result}),
        stringReducer
      ]
    );
    checkStringOperations(reducer5, defaultTo, selector);
    // don't allow bad merge select combinations
    testFailure(reducify.bind(this, [defaultTo, state => state, 'oops', _.identity]));
    testFailure(reducify.bind(this, [state => state, _.identity]));
  });

  describe('config object short', function () {

    const select = 'foo';
    let defaultsTo = {foo: 'bar'};

    const reducer = reducify({defaultsTo, select, reducer: _.identity});

    checkSignature(reducer);
    checkIntegrity(reducer, defaultsTo, {foo: 'buzz'});

    testFailure(reducify.bind(this, {defaultsTo, select, merge: _.identity, reducer: _.identity}));

    defaultsTo = {foo: 10};
    const reducer2 = reducify({select, defaultsTo, reducer: mathReducer});
    checkSignature(reducer2);
    checkIntegrity(reducer2, defaultsTo, {foo: 15});

    checkMathOperations(reducer2, defaultsTo, state => state.foo);

    describe('aliases', function () {
      checkMathOperationsEquality(
        reducer2,
        reducify({$: select, reducer: mathReducer, defaultsTo})
      );
    });

    defaultsTo = {foo: 'bar'};
    const reducer3 = reducify({defaultsTo, select, reducer: stringReducer});
    checkStringOperations(reducer3, defaultsTo, state => state.foo);
    describe('aliases', function () {
      checkStringOperationsEquality(
        reducer3,
        reducify({$: select, reducer: stringReducer, defaultsTo})
      );
    });

  });

  describe('config array short', function () {

    const select = 'foo';
    let defaultsTo = {foo: 'bar'};

    const reducer = reducify([defaultsTo, select, _.identity]);

    checkSignature(reducer);
    checkIntegrity(reducer, defaultsTo, {foo: 'buzz'});

    testFailure(reducify.bind(this, [defaultsTo, select, _.identity, _.identity]));

    defaultsTo = {foo: 10};
    const reducer2 = reducify([defaultsTo, select, mathReducer]);
    checkSignature(reducer2);
    checkIntegrity(reducer2, defaultsTo, {foo: 15});
    checkMathOperations(reducer2, defaultsTo, state => state.foo);

    defaultsTo = {foo: 'bar'};
    const reducer3 = reducify([defaultsTo, select, stringReducer]);
    checkStringOperations(reducer3, defaultsTo, state => state.foo);


  });

  describe('config object compact', function () {
    const select = 'foo';
    let defaultsTo = {foo: 0};

    let reducer;
    describe('plain config', function () {

      reducer = reducify({
        defaultsTo, select,
        "ADD": (state = 0, action) => state + action.data,
        "SUBTRACT": (state = 0, action) => state - action.data
      });
      checkSignature(reducer);
      checkIntegrity(reducer, defaultsTo, {foo: 'buzz'});
      checkMathOperations(reducer, defaultsTo, state => state.foo);
    });

    describe('mixed config', function () {

      reducer = reducify({
        defaultsTo, select,
        "ADD": (state = 0, action) => state + action.data,
        reducer(state = 0, action) {
          switch (action.type) {
            case "SUBTRACT":
              return state - action.data;
            default:
              return state;
          }
        }
      });
      checkSignature(reducer);
      checkIntegrity(reducer, defaultsTo, {foo: 'buzz'});
      checkMathOperations(reducer, defaultsTo, state => state.foo);
    });

    describe('array config', function () {
      reducer = reducify([
        defaultsTo, select,
        {
          "ADD": (state = 0, action) => state + action.data,
          "SUBTRACT": (state = 0, action) => state - action.data
        }
      ]);
      checkSignature(reducer);
      checkIntegrity(reducer, defaultsTo, {foo: 'buzz'});
      checkMathOperations(reducer, defaultsTo, state => state.foo);
    });

  });

  describe('statics', function () {
    const defaultsTo = {foo: 'bar'};
    const reducer = reducify(defaultsTo);

    checkSignature(reducer);
    checkIntegrity(reducer, defaultsTo, {foo: 'buzz'});

  });

  describe('defaults', function () {
    const defaultsTo = 10;
    const reducer = reducify({
      defaultsTo,
      reducer(state, action){
        if (state !== defaultsTo) {
          assert.fail();
        }
      }
    });

    const reducer2 = reducify({
      reducer(state = 1, action){
        if (state === defaultsTo) {
          assert.fail();
        }
      }
    });

    it ('should handle defaults', function() {
      reducer();
      reducer2();
      assert.ok(1);
    });
  });

  describe('action partial', function () {
    const reducer = reducify({
      actionPart: {test: 'val'},
      reducer(state, {test}){
        return test;
      }
    });

    const reducer2 = reducify({
      actionPart(action) {
        return {...action, test: 'val'};
      },
      reducer(state, {test}){
        return test;
      }
    });

    it ('should inject action partials', function() {
      const result = reducer();

      assert.equal(reducer(), 'val');
      assert.equal(reducer2(), 'val');
    });
  });

  describe('extra arguments', function () {

    const reducer = reducify((state, action, foo) => {
      if (foo === undefined || foo !== 2) {
        assert.fail();
      }
    });

    it("should respect extra arguments", function() {
      reducer({}, {}, 2);
      assert.ok(1);
    });


  });
}
