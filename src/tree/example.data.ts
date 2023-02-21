import random from 'utils/random';
import { TreeDataum } from './type';

type D = {};
const randomMatrix = () => {
  return {
    id: random.s(['1', '2', '3', '4', '5', '6']),
    parent: random.s(['1', '2', '3', '4', '5', '6']),
    name: random.S(5, 50),
  };
};

// eslint-disable-next-line
const getTestData = function(): TreeDataum<D> {
  return {
    ...randomMatrix(),
    children: random.L(
      () => {
        return {
          ...randomMatrix(),
          children: random.L(
            () => {
              return {
                ...randomMatrix(),
              };
            },
            0,
            10
          ),
        };
      },
      1,
      10
    ),
  };
};

const getTestData2 = () => {
  return random.L(
    () => {
      return randomMatrix();
    },
    6,
    50
  );
};

export { getTestData, getTestData2 };
