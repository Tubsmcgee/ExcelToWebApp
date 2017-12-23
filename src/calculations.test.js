import {
  preprocessCells,
  dependsOn,
  calculateCell,
  excelFuncToJS
} from './calculations.js';

const cells = {
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

describe.only('excelFuncToJS', () => {
  /*
  should ignore strings
  should replace excel range notation with cell names (A1:A3)=(A1,A2,A3)
  should remove dollar signs
  should replace excel & string concatination
  should replace sheet name references with JS sheet references sheet2!A1 = Sheets["sheet2"].cells.A1.v
  */
  it('should replace sheet name references with JS sheet references', () => {
    expect(excelFuncToJS('sheet2!A2')).toBe('Sheets["sheet2"].cells.A2.v');
  });
});

describe('calculateCell', () => {
  it('should return correct value', () => {
    expect(calculateCell('A2', cells).v).toBe(15);
  });
});

describe('dependsOn', () => {
  it('should return true if dependent', () => {
    expect(dependsOn('A1', 'A2', cells)).toBeTruthy();
  });
  it('should return false if not dependent', () => {
    expect(dependsOn('A4', 'A2', cells)).toBeFalsy();
  });
  it('should return true if indirectly dependent', () => {
    expect(dependsOn('A1', 'A4', cells)).toBeTruthy();
  });
});

describe('preprocessCells', () => {
  it.skip('should calculate simple things', () => {
    const calculated = preprocessCells({
      A1: {v: 5},
      A2: {v: 6},
      A3: {f: 'A1+A2'}
    });
    expect(calculated.cells.A3.v).toBe(11);
    expect(calculated.functionCellIds).toEqual(['A3']);
  });

  it.skip('should calculate things in the right order', () => {
    const calculated = preprocessCells({
      A1: {v: 5},
      A3: {f: 'A1+A2'},
      A2: {f: 'B1+A1'},
      B1: {v: 7}
    });
    expect(calculated.cells.A2.v).toBe(12);
    expect(calculated.cells.A3.v).toBe(17);
    expect(calculated.functionCellIds).toEqual(['A2', 'A3']);
  });
});

// todo: add test for dependsOn
