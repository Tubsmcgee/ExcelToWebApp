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
  parseInt(cellName.replace(/^[A-Z]+/g, ''), 10);

export const getCol = cellName => cellName.replace(/\d/g, '');

export const unique = arr =>
  arr.reduce((res, v) => {
    if (!res.includes(v)) res.push(v);
    return res;
  }, []);
