import functions from './functions.js';
import {
  getRow,
  getCol,
  isIndexEven,
  toLongName,
  rangeReplacer
} from './utils.js';
import {uniq, map, fromPairs, merge} from 'ramda';

export const excelFuncToJS = (funcStr, sheetNames, sheetNum) =>
  funcStr
    .split('"')
    .map((el, i) => {
      if (i % 2) return el;
      return el
        .replace(/[A-Z]\w*:[A-Z]\w*/g, rangeReplacer)
        .replace(/\$/g, '')
        .replace(/&/g, '+""+')
        .replace(/('.+'|\w+)!([A-Z]+\d+)/g, (full, sheetName, cellName) =>
          toLongName(sheetNames.indexOf(sheetName.replace(/'/g, '')), cellName)
        )
        .replace(/([A-Z]+\d+)\b/g, (full, cellName) =>
          toLongName(sheetNum, cellName)
        );
    })
    .join('"');

export const getVarNames = funcStr =>
  uniq(
    (
      funcStr
        .split('"')
        .filter(isIndexEven)
        .join('"')
        .match(/(^|[^.])[A-Z]\w*/g) || []
    ).map(el => (/[A-Z]/.test(el[0]) ? el : el.slice(1)))
  );

export const calculateCell = (cellId, cells, sheets) => {
  const cell = cells[cellId];
  const args = cell.vars.map(varName => {
    if (varName === 'Sheets') return sheets;
    if (functions[varName]) return functions[varName];
    if (cells[varName] && cells[varName].v !== undefined) {
      if (isNaN(cells[varName].v)) return cells[varName].v;
      return +cells[varName].v;
    }
    console.error(varName, 'in', cells, 'not found or has no value');
    return 0;
  });
  try {
    const result = cell.func(...args);
    if (result !== cell.v) return {...cell, v: result};
    return cell;
  } catch (e) {
    console.error('error computing function', cell, e);
  }
};

export const dependsOn = (aId, bId, cells) => {
  const a = cells[aId];
  if (!a || !a.vars) return false;
  if (a.vars.includes(bId)) return true;
  return a.vars.some(el => dependsOn(el, bId, cells));
};

export const calculate = sheets =>
  map(
    sheet => ({
      ...sheet,
      cells: sheet.functionCellIds.reduce(
        (res, cellId) => ({
          ...res,
          [cellId]: calculateCell(cellId, res, sheets)
        }),
        sheet.cells
      )
    }),
    sheets
  );

export const preprocessCells = (parsed, sheetNames, sheetNum) =>
  fromPairs(
    Object.keys(parsed)
      .filter(key => key[0] !== '!')
      .map(id => {
        const cell = parsed[id];
        let vars, func, funcStr;

        if (cell.f) {
          funcStr = excelFuncToJS(cell.f, sheetNames, sheetNum);
          vars = getVarNames(funcStr);
          try {
            func = new Function(...vars, `return ${funcStr};`); // eslint-disable-line no-new-func
          } catch (e) {
            console.error('error creating function', funcStr, cell, e);
          }
        }
        id = toLongName(sheetNum, id);
        return [
          id,
          {
            v: cell.v,
            id,
            deps: [],
            ...(cell.f ? {f: cell.f, func, vars, funcStr} : {})
          }
        ];
      })
  );

// TODO: make non-mutating
export const addDependencies = cells => {
  Object.keys(cells).forEach(id => {
    (cells[id].vars || []).forEach(depId => {
      // if (!cells[v]) console.error(v, id);
      console.log('dep', id, depId);
      if (/^[A-Z]+\d+_\d+$/.test(depId)) {
        console.log(depId);
        if (!cells[depId]) cells[depId] = {id: depId, deps: []};
        if (!cells[depId].f) cells[depId].isInput = true;
        if (cells[depId].v === undefined) cells[depId].v = '';
      }

      if (cells[depId]) cells[depId].deps.push(id);
    });
  });
  return cells;
};

export const processSheets = parsedSheets => {
  const sheetNames = Object.keys(parsedSheets);

  const {cells, sheets} = sheetNames.reduce(
    (res, sheetName, i) => {
      const cells = preprocessCells(parsedSheets[sheetName], sheetNames, i);
      const rows = uniq(Object.keys(cells).map(getRow)).sort((a, b) => a - b);
      const cols = uniq(Object.keys(cells).map(getCol)).sort();
      return {
        sheets: res.sheets.concat({rows, cols, sheetName}),
        cells: merge(res.cells, cells)
      };
    },
    {sheets: [], cells: {}}
  );

  const res = {
    cells: addDependencies(cells),
    sheets
  };
  console.log('res', res);
  return res;
};
