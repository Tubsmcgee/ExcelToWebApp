const SUM = (...args) =>
  args.reduce((sum, el) => (isNaN(el) ? sum : el + sum), 0);

const AVERAGE = (...args) => SUM(...args) / args.length;

const IF = (a, b, c) => (a ? b : c);

const ISBLANK = a => !a;

const AND = (...args) => args.every(el => el);

export default {
  SUM,
  AVERAGE,
  IF,
  ISBLANK,
  AND
};
