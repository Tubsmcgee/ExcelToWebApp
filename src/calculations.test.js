import {preprocessCells, dependsOn, calculateCell} from './calculations.js';

const cellsArray = {
  A1: {
    id: 'A1',
    vars: ['SUM', 'A2', 'A3'],
    func: (SUM, A2, A3) => SUM(A2, A3)
  },
  A2: {id: 'A2', vars: ['SUM', 'A3', 'A4'], func: (SUM, A3, A4) => SUM(A3, A4)},
  A3: {id: 'A3', v: 10},
  A4: {id: 'A4', v: 5},
  C1: {id: 'C1', vars: ['B17'], func: B17 => B17}
};

describe.only('calculateCell', () => {
  it('should return correct value', () => {
    expect(calculateCell(cellsArray.A2, cellsArray).v).toBe(15);
  });
});

describe('dependsOn', () => {
  it('should return true if dependent', () => {
    expect(dependsOn(cellsArray.A1, cellsArray.A2, cellsArray)).toBeTruthy();
  });
  it('should return false if not dependent', () => {
    expect(dependsOn(cellsArray.A4, cellsArray.A2, cellsArray)).toBeFalsy();
  });
  it('should return true if indirectly dependent', () => {
    expect(dependsOn(cellsArray.A1, cellsArray.A4, cellsArray)).toBeTruthy();
  });
});

describe('preprocessCells', () => {
  it('should calculate simple things', () => {
    const calculated = preprocessCells({
      A1: {v: 5},
      A2: {v: 6},
      A3: {f: 'A1+A2'}
    });
    expect(calculated.A3.v).toBe(11);
  });

  it('should calculate things in the right order', () => {
    const calculated = preprocessCells({
      A1: {v: 5},
      A3: {f: 'A1+A2'},
      A2: {f: 'B1+A1'},
      B1: {v: 7}
    });
    expect(calculated.A3.v).toBe(17);
  });
});

// todo: add test for dependsOn
