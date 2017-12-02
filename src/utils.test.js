import {setIn} from './utils.js';

const sheets = {
  sheet1: {
    cells: {
      A1: {
        v: 1
      },
      A2: {v: 2}
    }
  }
};

describe.only('setIn', () => {
  it('should set value in object without modifying object', () => {
    expect(setIn(['sheet1', 'cells', 'A1', 'v'], 5, sheets)).toEqual({
      sheet1: {
        cells: {
          A1: {
            v: 5
          },
          A2: {v: 2}
        }
      }
    });
  });
});
