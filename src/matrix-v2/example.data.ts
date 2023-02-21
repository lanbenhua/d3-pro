import TaskInstanceStatusConstructor from 'biz/bizcommon/task-instance-status';
import random from 'utils/random';
import { MatrixDataum } from './type';

type D = {};
const randomDuration = () => random.N(0, 500);
const randomDate = () =>
  random
    .s([
      new Date('2022-08-20 12:00:00'),
      new Date('2022-08-21 06:00:00'),
      new Date('2022-08-21 12:00:00'),
      new Date('2022-08-21 18:00:00'),
      new Date('2022-08-22 00:00:00'),
      new Date('2022-08-22 06:00:00'),
      new Date('2022-08-22 12:00:00'),
      new Date('2022-08-22 18:00:00'),
      new Date('2022-08-23 00:00:00'),
      new Date('2022-08-23 06:00:00'),
      new Date('2022-08-23 12:00:00'),
      new Date('2022-08-23 18:00:00'),
      new Date('2022-08-24 00:00:00'),
      new Date('2022-08-24 06:00:00'),
      new Date('2022-08-24 12:00:00'),
    ])
    .toISOString();
const randomStatus = () =>
  random.s(TaskInstanceStatusConstructor.getList().map(item => item.key));
const randomMatrix = () => {
  return {
    id: random.s(['1', '2', '3', '4', '5', '6']),
    parent: random.s(['1', '2', '3', '4', '5', '6']),
    name: random.S(),
    date: randomDate(),
    status: randomStatus(),
    data: random.L(() => {
      return {
        status: randomStatus(),
        name: random.S(),
        date: randomDate(),
        slices: random.L(
          () => ({
            duration: randomDuration(),
            status: randomStatus(),
            name: random.S(),
            date: randomDate(),
            d: {},
          }),
          1,
          4
        ),
      };
    }),
  };
};

// eslint-disable-next-line
const getTestData = function(): MatrixDataum<D> {
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
