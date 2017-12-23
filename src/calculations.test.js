import {
  preprocessCells,
  dependsOn,
  calculateCell,
  excelFuncToJS,
  getVarNames
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

describe('excelFuncToJS', () => {
  it('should ignore strings', () => {
    expect(excelFuncToJS('("Poop", A2)')).toBe('("Poop", A2)');
    expect(excelFuncToJS('"A1:A2"')).toBe('"A1:A2"');
  });
  it('should replace excel range notation with cell names', () => {
    expect(excelFuncToJS('(A1:A3)')).toBe('(A1,A2,A3)');
    expect(excelFuncToJS('SUM(A1:D1)')).toBe('SUM(A1,B1,C1,D1)');
    expect(excelFuncToJS('SUM(A1:B3)')).toBe('SUM(A1,B1,A2,B2,A3,B3)');
  });
  it('should remove dollar signs', () => {
    expect(excelFuncToJS('$A1')).toBe('A1');
  });
  it('should replace excel & string concatination', () => {
    expect(excelFuncToJS('"welcome " & C10')).toBe('"welcome " +""+ C10');
  });
  it('should replace sheet name references with JS sheet references', () => {
    expect(excelFuncToJS('sheet2!A2')).toBe('Sheets["sheet2"].cells.A2.v');
    expect(excelFuncToJS("'.'!A2")).toBe('Sheets["."].cells.A2.v');
  });
});

describe('getVarNames', () => {
  it('should ignore strings', () => {
    expect(getVarNames('CONCATENATE("A3",A2)')).toEqual(['CONCATENATE', 'A2']);
  });
  it('should not crash if there are no variables', () => {
    expect(getVarNames('5')).toEqual([]);
    expect(getVarNames('"string"')).toEqual([]);
  });
  it('should not get variables after a .', () => {
    expect(getVarNames('Sheets["sheet1"].cells.A1.v + A5')).toEqual([
      'Sheets',
      'A5'
    ]);
  });
  it('Should only have unique variable names', () => {
    expect(getVarNames('SUM(A1,A2)+SUM(A2,A3)')).toEqual([
      'SUM',
      'A1',
      'A2',
      'A3'
    ]);
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
  // it('should true if on different sheets and dependent', () => {
  //   expect(dependsOn(
  // })
});

describe('preprocessCells', () => {
  it('should modify the sheet by providing cells and IDs', () => {
    const calculated = preprocessCells({
      A1: {v: 5},
      A2: {v: 6},
      A3: {f: 'A1+A2'}
    });
    expect(calculated.functionCellIds).toEqual(['A3']);
    expect(calculated.cells.A1.id).toEqual('A1');
    expect(calculated.cells.A3.vars).toEqual(['A1', 'A2']);
  });
});

// todo: add test for dependsOn
