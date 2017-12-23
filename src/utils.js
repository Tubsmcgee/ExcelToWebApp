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

export const setIn = (path, val, obj = {}) =>
  path.length
    ? {...obj, [path[0]]: setIn(path.slice(1), val, obj[path[0]])}
    : val;

export const isIndexEven = (el, i) => !(i % 2);

export const sheetNameReplacer = str =>
  `sheets["${str.slice(0, -1).replace(/'/g, '')}"].`;

export const objectMapper = (func, obj) => {
  console.log(Object.keys(obj));
  Object.keys(obj).reduce((res, key) => {
    res[key] = func(key, obj[key], obj);
    return res;
  }, {});
};
