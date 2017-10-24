import {getRow, colToNum, getCol, numToCol} from './utils.js';

export const rangeReplacer = matchString => {
  const [start, end] = matchString.split(':').map(cellName => ({
    row: getRow(cellName),
    colNum: colToNum(getCol(cellName))
  }));
  const result = [];
  for (let row = start.row; row <= end.row; row++) {
    for (let col = start.colNum; col <= end.colNum; col++) {
      result.push(numToCol(col) + row);
    }
  }
  return result.join(',');
};
