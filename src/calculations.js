import functions from './functions.js';

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

export const calculate = cells =>
  Object.keys(cells).reduce((res, key) => {
    const cell = cells[key];
    res[key] = cell.func ? calculateCell(cell, cells) : cell;
    return res;
  }, {});
