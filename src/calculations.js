import functions from './functions.js';
import {unique} from './utils.js';
import {rangeReplacer} from './rangeReplacer.js';

const calculateCell = (cell, cells) => {
  const args = cell.vars.map(
    varName =>
      functions[varName] ||
      (cells[varName]
        ? +cells[varName].v
        : console.error(varName, 'in', cell, 'not found'))
  );
  const result = cell.func(...args);
  if (result !== cell.v) return {...cell, v: result};
  return cell;
};

const dependsOn = (a, b, cells) =>
  a.vars.some(v => {
    if (v === b.id) return true;
    if (cells[v] && cells[v].vars) return dependsOn(cells[v], b, cells);
    return false;
  });

export const calculate = cells => {
  // todo: do this in preprocessCells
  const calculatedCells = Object.values(cells)
    .filter(c => c.func)
    .sort(
      (a, b) => (dependsOn(a, b, cells) ? 1 : dependsOn(b, a, cells) ? -1 : 0)
    )
    .map(cell => calculateCell(cell, cells))
    .reduce((res, cell) => {
      res[cell.id] = cell;
      return res;
    }, {});

  console.log('calculatedCells', calculatedCells);

  return Object.keys(cells).reduce((res, key) => {
    res[key] = calculatedCells[key] || cells[key];
    return res;
  }, {});
};

export const preprocessCells = parsed => {
  const cells = Object.keys(parsed)
    .filter(key => key[0] !== '!')
    .reduce((res, key) => {
      res[key] = parsed[key];
      res[key].id = key;
      return res;
    }, {});

  Object.keys(cells).forEach(key => {
    const cell = cells[key];
    if (cell.f) {
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
    }
  });

  return calculate(cells);
};
