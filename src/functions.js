export default {
  SUM(...args) {
    return args.reduce((sum, el) => (isNaN(el) ? sum : el + sum), 0);
  }
};
