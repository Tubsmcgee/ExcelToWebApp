import functions from './functions.js';
import {unique, isIndexEven, sheetNameReplacer, objectMapper} from './utils.js';
import {rangeReplacer} from './rangeReplacer.js';

export const excelFuncToJS = funcStr =>
  funcStr
    .split('"')
    .map((el, i) => {
      if (i % 2) return el;
      return el
        .replace(/[A-Z]\w*:[A-Z]\w*/g, rangeReplacer)
        .replace(/\$/g, '')
        .replace(/&/g, '+""+')
        .replace(/('.+'|\w+)!([A-Z]+\d+)/g, sheetNameReplacer);
    })
    .join('"');

export const getVarNames = funcStr =>
  unique(
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

export const addDependencies = sheets => sheets;

export const calculate = sheets =>
  objectMapper(
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

export const preprocessCells = parsed => {
  const cells = Object.keys(parsed)
    .filter(key => key[0] !== '!')
    .reduce((res, key) => {
      res[key] = parsed[key];
      res[key].id = key;
      return res;
    }, {});

  const functionCells = Object.values(cells).filter(cell => cell.f);

  functionCells.forEach(cell => {
    //TODO: Make pure
    const funcStr = excelFuncToJS(cell.f);
    cell.vars = getVarNames(funcStr);
    try {
      cell.func = new Function(...cell.vars, `return ${funcStr};`); // eslint-disable-line no-new-func
    } catch (e) {
      console.error('error creating function', funcStr, cell, e);
    }

    cell.vars.forEach(id => {
      if (/^[A-Z]{1,2}\d+$/.test(id)) {
        if (!cells[id]) cells[id] = {id};
        if (!cells[id].f) cells[id].isInput = true; //TODO: support multiple sheets
        if (cells[id].v === undefined) cells[id].v = '';
      }
    });
  });

  const functionCellIds = functionCells.map(c => c.id).sort(
    (a, b) => (dependsOn(a, b, cells) ? 1 : dependsOn(b, a, cells) ? -1 : 0) //TODO: Adress multiple sheets
  );

  return {cells, functionCellIds};
};
