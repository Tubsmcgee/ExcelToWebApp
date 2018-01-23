export const colToNum = letters =>
  letters.length
    ? letters.charCodeAt(letters.length - 1) -
      64 +
      26 * colToNum(letters.slice(0, -1))
    : 0;

export const numToCol = number =>
  (number > 26 ? numToCol(Math.floor(number / 26)) : '') +
  String.fromCharCode(number % 26 + 64);

export const getRow = cellName =>
  parseInt(cellName.split('_')[0].replace(/^[A-Z]+/g, ''), 10);

export const getCol = cellName => cellName.split('_')[0].replace(/\d/g, '');

export const isIndexEven = (el, i) => !(i % 2);

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

export const toFullId = (sheetNum, cellName) => `${cellName}_${sheetNum}`;
