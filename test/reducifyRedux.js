import { createStore, combineReducers } from 'redux';
import chai from 'chai';
import reducify from '../src/reducify';

const {assert} = chai;

export default function () {

  describe('should integreate with redux', function () {


    it('handle all dispatches args', function () {

      const store = createStore(reducify(
        {
          "SET": (state, action) => action.data,
          "ADD": (state, action) => state + action.data,
          "SUBTRACT": (state, action) => state - action.data
        }
      ));


      const {dispatch, getState} = store;
      let toCompare = 10;
      dispatch({type: 'SET', data: toCompare});

      const toAdd = 10;
      dispatch({type: 'ADD', data: toAdd});
      toCompare += toAdd;
      assert.equal(toCompare, getState());

      const toAddAgain = 5;
      dispatch({type: 'ADD', data: toAddAgain});
      toCompare += toAddAgain;
      assert.equal(toCompare, getState());

      const toSubtract = 5;
      dispatch({type: 'SUBTRACT', data: toSubtract});
      toCompare -= toSubtract;
      assert.equal(toCompare, getState());

      const toSet = 13;
      dispatch({type: 'SET', data: toSet});
      toCompare = toSet;
      assert.equal(toCompare, getState());

      dispatch({type: 'NONE'});
      assert.equal(toCompare, getState());
    });
    it('should work with combine reducers', function () {

      const reducer = reducify(
        {
          defaultsTo: 0,
          "SET": (state, action) => action.data,
          "ADD": (state, action) => state + action.data,
          "SUBTRACT": (state, action) => state - action.data
        }
      );
      const store = createStore(combineReducers({data: reducer}));
      const {dispatch, getState} = store;
      let toCompare = 10;
      dispatch({type: 'SET', data: toCompare});

      const toAdd = 10;
      dispatch({type: 'ADD', data: toAdd});
      toCompare += toAdd;
      assert.equal(toCompare, getState().data);

      const toAddAgain = 5;
      dispatch({type: 'ADD', data: toAddAgain});
      toCompare += toAddAgain;
      assert.equal(toCompare, getState().data);

      const toSubtract = 5;
      dispatch({type: 'SUBTRACT', data: toSubtract});
      toCompare -= toSubtract;
      assert.equal(toCompare, getState().data);

      const toSet = 13;
      dispatch({type: 'SET', data: toSet});
      toCompare = toSet;
      assert.equal(toCompare, getState().data);

      dispatch({type: 'NONE'});
      assert.equal(toCompare, getState().data);

    });
  });
}
