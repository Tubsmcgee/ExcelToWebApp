import {preprocessCells} from './calculations.js';

it('should calculate simple things', () => {
  const calculated = preprocessCells({
    A1: {v: 5},
    A2: {v: 6},
    A3: {f: 'A1+A2'}
  });
  expect(calculated.A3.v).toBe(11);
});

it('should calculate things in the right order', () => {
  const calculated = preprocessCells({
    A1: {v: 5},
    A3: {f: 'A1+A2'},
    A2: {f: 'B1+A1'},
    B1: {v: 7}
  });
  console.log(JSON.stringify(calculated, null, 2));
  expect(calculated.A3.v).toBe(17);
});

// todo: add test for dependsOn
