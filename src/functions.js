const SUM = (...args) => args.reduce((sum, el) => (isNaN(el) ? sum : el + sum), 0);
const AVERAGE = (...args) => SUM(...args) / args.length;

export default {
  SUM,
  AVERAGE
};
