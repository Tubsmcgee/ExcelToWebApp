import functions from './functions.js';
import {unique} from './utils.js';
import {rangeReplacer} from './rangeReplacer.js';

export const calculateCell = (cellId, cells) => {
  const cell = cells[cellId];
  const args = cell.vars.map(
    varName =>
      functions[varName] ||
      (cells[varName] && cells[varName].v !== undefined
        ? +cells[varName].v
        : console.error(varName, 'in', cells, 'not found or has no value'))
  );
  const result = cell.func(...args);
  if (result !== cell.v) return {...cell, v: result};
  return cell;
};

// export const dependsOn = (a, b, cells) => !!a.vars && a.vars.includes(b.id);
export const dependsOn = (aId, bId, cells) => {
  const a = cells[aId];
  if (!a || !a.vars) return false;
  if (a.vars.includes(bId)) return true;
  return a.vars.some(el => dependsOn(el, bId, cells));
};

export const calculate = (cells, functionCellIds) =>
  functionCellIds.reduce((res, cellId) => {
    res[cellId] = calculateCell(cellId, res);
    return res;
  }, cells);

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
    cell.f = cell.f.replace(/[A-Z]\w*:[A-Z]\w*/g, rangeReplacer);
    cell.vars = unique(cell.f.match(/[A-Z]\w*/g));
    cell.func = new Function(...cell.vars, `return ${cell.f};`); // eslint-disable-line no-new-func
    // console.log(cell.func);
    cell.vars.forEach(id => {
      if (/^[A-Z]{1,2}\d+$/.test(id)) {
        if (!cells[id]) cells[id] = {id};
        if (!cells[id].f) cells[id].isInput = true;
      }
    });
  });

  const functionCellIds = functionCells
    .map(c => c.id)
    .sort(
      (a, b) => (dependsOn(a, b, cells) ? 1 : dependsOn(b, a, cells) ? -1 : 0)
    );

  console.log('functionCellIds', functionCellIds);

  return {
    cells: calculate(cells, functionCellIds),
    functionCellIds
  };
};
