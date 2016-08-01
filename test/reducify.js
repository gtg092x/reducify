import reducify from '../src/reducify';
import _ from 'lodash';
import chai from 'chai';

const {assert, expect} = chai;

export default function () {

  const testActions = [
    {type: 'ADD', data: 10},
    {type: 'SUBTRACT', data: 5},
    {type: 'REVERSE'},
    {type: 'APPEND', data: 'bass'}
  ];


  const checkSignature = (result) => {
    it('should be a function', function() {
        assert.isFunction(result);
    });
  };

  const checkIntegrity = (reducer, defaultsTo, state) => {
    it('should not alter a state', function() {
        const stateCopy = _.cloneDeep(state);
        testActions.forEach(action => reducer(state, action));
        assert.deepEqual(stateCopy, state);
    });

    it('should produce an identity when no action is passed', function() {
        assert.deepEqual(state, reducer(state));
    });

    it('should return the default value when nothing is passed', function() {
      assert.deepEqual(defaultsTo, reducer());
    });
  };

  const checkMathOperations = (reducer, select = _.identity) => {

    it('addition actions should work', function() {
      const toAdd = 10;
      const defaultValue = 100;
      assert.equal(toAdd, select(reducer(0, {type: 'ADD', data: toAdd})));
      assert.equal(defaultValue + toAdd, select(reducer(defaultValue, {type: 'ADD', data: toAdd})));
    });

    it('subtraction actions should work', function() {
      const toSubtract = 10;
      const defaultValue = 50;
      assert.equal(0 - toSubtract, select(reducer(0, {type: 'SUBTRACT', data: toSubtract})));
      assert.equal(defaultValue - toSubtract, select(reducer(defaultValue, {type: 'SUBTRACT', data: toSubtract})));
    });
  };

  const checkMathOperationsEquality = (reducerOne, reducerTwo) => {

    it('should have identical behavior', function() {
      const toAdd = 10;
      const defaultValue = 100;
      const action = {type: 'ADD', data: toAdd};
      assert.deepEqual(reducerOne(defaultValue, action), reducerTwo(defaultValue, action));
      const toSubtract = 15;
      const action2 = {type: 'SUBTRACT', data: toSubtract};
      assert.deepEqual(reducerOne(defaultValue, action2), reducerTwo(defaultValue, action2));
    });
  };

  const checkStringOperations = (reducer, select = _.identity) => {

    it('reverse actions should work', function() {
      const defaultValue = "yes";
      assert.equal(defaultValue.split("").reverse().join(""), select(reducer(defaultValue, {type: 'REVERSE'})));
    });

    it('append actions should work', function() {
      const toAppend = "bar";
      const defaultValue = "foo";
      assert.equal(defaultValue + toAppend, select(reducer(0, {type: 'APPEND', data: toAppend})));
    });
  };

  const checkStringOperationsEquality = (reducerOne, reducerTwo) => {

    it('should have identical behavior', function() {
      const defaultValue = "yes";
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

  describe('function', function () {


    const reducer = reducify(_.identity);
    checkSignature(reducer);
    checkIntegrity(reducer, undefined, {foo: 'buzz'});


    const reducer2 = reducify(mathReducer);
    checkSignature(reducer2);
    checkIntegrity(reducer2, 10, 15);
    checkMathOperations(reducer2);

    checkStringOperations(reducify(stringReducer));
  });

  describe('config object long', function () {


    const arg = {select: state => state, merge: (result, state) => result, reducer: _.identity};
    const reducer = reducify(arg);

    checkSignature(reducer);
    checkIntegrity(reducer, {foo: 'bar'}, {foo: 'buzz'});

    const reducer2 = reducify({select: state => state, merge: (result, state) => result, reducer: mathReducer});
    checkSignature(reducer2);
    checkIntegrity(reducer2, 10, 15);
    checkMathOperations(reducer2);
    expect.fail(reducify.bind(this, {select: _.noop, reducer: _.identity}));

    const reducer3 = reducify({select: state => state, merge: (result, state) => result, reducer: stringReducer});
    checkStringOperations(reducer3);

    const selector = (state) => state.test;
    let defaultsTo = {test: 10};
    const reducer4 = reducify(
      {
        defaultsTo,
        select: state => state.test, merge: (result, state) => ({...state, test:result}), reducer: mathReducer
      }
    );
    checkSignature(reducer4);
    checkIntegrity(reducer4, 10, 15);
    checkMathOperations(reducer4, selector);

    describe('aliases', function() {
      checkMathOperationsEquality(
        reducify({select: state => state.test, merge: (result, state) => ({...state, test:result}), reducer: mathReducer}),
        reducify({$: state => state.test, _: (result, state) => ({...state, test:result}), reducer: mathReducer})
      );
    });
    defaultsTo = {test: 'foo'};
    const reducer5 = reducify(
      {
        defaultsTo,
        select: state => state.test, merge: (result, state) => ({...state, test:result}), reducer: stringReducer
      }
    );
    checkStringOperations(reducer5, selector);
    describe('aliases', function() {
      checkMathOperationsEquality(
        reducify({select: state => state.test, merge: (result, state) => ({...state, test:result}), reducer: stringReducer}),
        reducify({$: state => state.test, _: (result, state) => ({...state, test:result}), reducer: stringReducer})
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
    checkIntegrity(reducer2, 10, 15);
    checkMathOperations(reducer2);

    const reducer3 = reducify([state => state, (result, state) => result, stringReducer]);
    checkStringOperations(reducer3);
  });


  describe('config default array long', function () {

    const defaultTo = {foo: 'bar'};
    const arg = [defaultTo, state => state, (result, state) => result, _.identity];
    const reducer = reducify(arg);

    checkSignature(reducer);
    checkIntegrity(reducer, defaultTo, {foo: 'buzz'});

    const selector = (state) => state.test;
    const reducer4 = reducify(
      [
        {test: 10},
        state => state.test,
        (result, state) => ({...state, test:result}),
        mathReducer
      ]
    );
    checkSignature(reducer4);
    checkIntegrity(reducer4, 10, 15);
    checkMathOperations(reducer4, selector);

    const reducer5 = reducify(
      [
        {test: 'foo'},
        state => state.test,
        (result, state) => ({...state, test:result}),
        stringReducer
      ]
    );
    checkStringOperations(reducer5, selector);
    // don't allow bad merge select combinations
    expect.fail(reducify.bind(this,[defaultTo, state => state, 'oops', _.identity]));
    expect.fail(reducify.bind(this,[state => state, _.identity]));
  });

  describe('config object short', function () {

    const select = 'foo';
    let defaultsTo = {foo: 'bar'};

    const reducer = reducify({defaultsTo, select, reducer: _.identity});

    checkSignature(reducer);
    checkIntegrity(reducer, defaultsTo, {foo: 'buzz'});

    expect.fail(reducify.bind(this,{defaultsTo, select, merge: _.identity, reducer: _.identity}));

    defaultsTo = {foo: 10};
    const reducer2 = reducify({select, defaultsTo, reducer: mathReducer});
    checkSignature(reducer2);
    checkIntegrity(reducer2, {foo: 10}, {foo: 15});
    checkMathOperations(reducer2, state => state.foo);
    describe('aliases', function() {
      checkMathOperationsEquality(
        reducer2,
        reducify({$: select, reducer: mathReducer, defaultsTo})
      );
    });

    defaultsTo = {foo: 'bar'};
    const reducer3 = reducify({defaultsTo, select, reducer: stringReducer});
    checkStringOperations(reducer3, state => state.foo);
    describe('aliases', function() {
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

    expect.fail(reducify.bind(this,[defaultsTo, select, _.identity, _.identity]));

    defaultsTo = {foo: 10};
    const reducer2 = reducify([select, defaultsTo, mathReducer]);
    checkSignature(reducer2);
    checkIntegrity(reducer2, {foo: 10}, {foo: 15});
    checkMathOperations(reducer2, state => state.foo);

    defaultsTo = {foo: 'bar'};
    const reducer3 = reducify([defaultsTo, select, stringReducer]);
    checkStringOperations(reducer3, state => state.foo);


  });

  describe('config arg spread', function () {
    const select = 'foo';
    let defaultsTo = {foo: 'bar'};

    const reducer = reducify(select, defaultsTo, mathReducer);
    checkSignature(reducer);
    checkIntegrity(reducer, defaultsTo, {foo: 'buzz'});
    checkStringOperations(reducer, state => state.foo);

    const reducer2 = reducify([select, defaultsTo, mathReducer]);
    checkStringOperationsEquality(
      reducer,
      reducer2
    );

  });

  describe('statics', function () {
    const defaultsTo = {foo: 'bar'};
    const reducer = reducify(defaultsTo);

    checkSignature(reducer);
    checkIntegrity(reducer, defaultsTo, {foo: 'buzz'});

  });
}
