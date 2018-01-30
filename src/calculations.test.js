import {
  processSheets,
  calculateCell,
  excelFuncToJS,
  getVarNames,
  calculate
} from './calculations.js';

const parsedSheets = {
  Sheet1: {
    '!ref': 'A1:E10',
    A1: {t: 's', v: 'test', r: '<t>test</t>', h: 'test', w: 'test'},
    A2: {t: 'n', v: 1, w: '1'},
    C2: {t: 's', v: 'Style', r: '<t>Style</t>', h: 'Style', w: 'Style'},
    A3: {t: 'n', v: 2, w: '2'},
    B3: {t: 'n', v: 3, f: 'SUM(A2,A3)', w: '3'},
    B4: {t: 'n', v: 3, f: 'A2+A3', w: '3'},
    C4: {t: 's', v: 'border', r: '<t>border</t>', h: 'border', w: 'border'},
    E4: {
      t: 's',
      v: 'turd3borderpoop33',
      f: 'CONCATENATE("turd",B4,C4,"poop",SUM(A2:A3),COUNTA(A5:A7))',
      h: 'turd3borderpoop33',
      w: 'turd3borderpoop33'
    },
    A5: {t: 'n', v: 3, w: '3'},
    A6: {t: 'n', v: 4, w: '4'},
    E6: {
      t: 's',
      v: 'turd 12& border12',
      f: '"turd " & C7 & "& " & C4 & SUM(A5:A7)',
      h: 'turd 12&amp; border12',
      w: 'turd 12& border12'
    },
    A7: {t: 'n', v: 5, w: '5'},
    C7: {t: 'n', v: 12, f: 'SUM(A5:A7)', w: '12'},
    A9: {t: 'n', v: 1, w: '1'},
    B9: {t: 'n', v: 1, w: '1'},
    C9: {t: 'n', v: 1, w: '1'},
    D9: {t: 'n', v: 8, f: 'SUM(A9:C10)', w: '8'},
    A10: {t: 'n', v: 1, w: '1'},
    B10: {t: 'n', v: 3, w: '3'},
    C10: {t: 'n', v: 1, w: '1'},
    E10: {t: 'n', v: 4, f: 'C10+Sheet2!A2', w: '4'},
    '!margins': {
      left: 0.7,
      right: 0.7,
      top: 0.75,
      bottom: 0.75,
      header: 0.3,
      footer: 0.3
    }
  },
  Sheet2: {
    '!ref': 'A1:A3',
    A1: {t: 'n', v: 2, w: '2'},
    A2: {t: 'n', v: 3, w: '3'},
    A3: {t: 'n', v: 4, w: '4'},
    '!margins': {
      left: 0.7,
      right: 0.7,
      top: 0.75,
      bottom: 0.75,
      header: 0.3,
      footer: 0.3
    }
  },
  Sheet3: {
    A1: {t: 'n', v: 5, f: 'Sheet1!A2+Sheet1!E10', w: '5'},
    '!margins': {
      left: 0.7,
      right: 0.7,
      top: 0.75,
      bottom: 0.75,
      header: 0.3,
      footer: 0.3
    },
    '!ref': 'A1'
  }
};

describe('excelFuncToJS', () => {
  const sheetNames = ['Sheet1', 'sheet2', '.'];
  it('should ignore strings', () => {
    expect(excelFuncToJS('("Poop", A2)', sheetNames, 0)).toBe(`("Poop", A2_0)`);
    expect(excelFuncToJS('"A1:A2"', sheetNames, 0)).toBe('"A1:A2"'); //unchanged
  });
  it('should replace excel range notation with cell names', () => {
    expect(excelFuncToJS('(A1:A3)', sheetNames, 0)).toBe('(A1_0,A2_0,A3_0)');
    expect(excelFuncToJS('SUM(A1:D1)', sheetNames, 0)).toBe(
      'SUM(A1_0,B1_0,C1_0,D1_0)'
    );
    expect(excelFuncToJS('SUM(A1:B3)', sheetNames, 0)).toBe(
      'SUM(A1_0,B1_0,A2_0,B2_0,A3_0,B3_0)'
    );
  });
  it('should remove dollar signs', () => {
    expect(excelFuncToJS('$A1', sheetNames, 0)).toBe('A1_0');
  });
  it('should replace excel & string concatination', () => {
    expect(excelFuncToJS('"welcome " & C10', sheetNames, 0)).toBe(
      '"welcome " +""+ C10_0'
    );
  });
  it('should replace sheet name references with JS sheet references', () => {
    expect(excelFuncToJS('sheet2!A2', sheetNames, 0)).toBe('A2_1');
    expect(excelFuncToJS("'.'!A2", sheetNames, 0)).toBe('A2_2');
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
describe('calculateCell', () => {
  it('should return correct value', () => {
    expect(calculateCell('A2', cells).v).toBe(15);
  });
});

// describe('addDependencies', () => {
//   it('should find dependencies', () => {
//     const sheets = preprocessCells();
//     expect(addDependencies({stuff: {}})).toEqual({});
//   });
// });
//
// describe('preprocessCells', () => {
//   it('should modify the sheet by providing cells and IDs', () => {
//     const calculated = preprocessCells(
//       {
//         A1: {v: 5},
//         A2: {v: 6},
//         A3: {f: 'A1+A2'}
//       },
//       'Sheet1'
//     );
//     // expect(calculated.functionCellIds).toEqual(['A3']);
//     // expect(calculated.cells.A1.id).toEqual('A1');
//     // expect(calculated.cells.A3.vars).toEqual(['A1', 'A2']);
//   });
// });

describe('processSheets', () => {
  const processed = processSheets(parsedSheets);
  it('should find dependencies', () => {
    expect(processed.cells.A2_0.deps.sort()).toEqual([
      'A1_2',
      'B3_0',
      'B4_0',
      'E4_0'
    ]);
  });
});

describe('calculate', () => {
  const cells = {
    A1: {
      v: 2,
      deps: ['B1', 'C1']
    },
    B1: {
      func: A1 => A1 + 5,
      vars: ['A1'],
      deps: ['C1'],
      v: 6
    },
    C1: {
      func: (A1, B1) => A1 + B1,
      vars: ['A1', 'B1'],
      deps: [],
      v: 7
    }
  };
  it('should calculate', () => {
    expect(calculate(cells, 'A1').C1.v).toEqual(9);
  });
});
