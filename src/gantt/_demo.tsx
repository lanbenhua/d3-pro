/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useMemo } from 'react';
import Gantt, { Cell } from './index';

const Demo = () => {
  const data = useMemo<Cell<any, any>[]>(() => {
    return [
      {
        name: 'taskA',
        periods: [
          {
            start: new Date('2021-10-18'),
            end: new Date('2021-10-19'),
            name: 'period1',
          },
          {
            start: new Date('2021-10-22'),
            end: new Date('2021-10-25'),
            name: 'period2',
          },
        ],
      },
      {
        name: 'taskB',
        periods: [
          {
            start: new Date('2021-10-18'),
            end: new Date('2021-10-18'),
            name: 'period1',
          },
          {
            start: new Date('2021-10-18'),
            end: new Date('2021-10-23'),
            name: 'period2',
          },
        ],
      },
      {
        name: 'taskD',
        periods: [
          {
            start: new Date('2021-10-18'),
            end: new Date('2021-11-19'),
            name: 'period1',
          },
        ],
      },
      {
        name: 'taskC',
        periods: [
          {
            start: new Date('2021-10-12'),
            end: new Date('2021-10-19'),
            name: 'period1',
          },
          {
            start: new Date('2021-11-02'),
            end: new Date('2021-12-19'),
            name: 'period2',
          },
        ],
      },
      {
        name: 'taskE',
        periods: [
          {
            start: new Date('2021-10-12'),
            end: new Date('2021-10-19'),
            name: 'period1',
          },
          {
            start: new Date('2021-11-02'),
            end: new Date('2021-12-19'),
            name: 'period2',
          },
        ],
      },
      // {
      //   name: 'taskF',
      //   periods: [
      //     {
      //       start: new Date('2021-10-12'),
      //       end: new Date('2021-10-19'),
      //       name: 'period1',
      //     },
      //     {
      //       start: new Date('2021-11-02'),
      //       end: new Date('2021-12-19'),
      //       name: 'period2',
      //     },
      //   ],
      // },
      // {
      //   name: 'taskG',
      //   periods: [
      //     {
      //       start: new Date('2021-10-12'),
      //       end: new Date('2021-10-19'),
      //       name: 'period1',
      //     },
      //     {
      //       start: new Date('2021-11-02'),
      //       end: new Date('2021-12-19'),
      //       name: 'period2',
      //     },
      //   ],
      // },
      // {
      //   name: 'taskH',
      //   periods: [
      //     {
      //       start: new Date('2021-10-12'),
      //       end: new Date('2021-10-19'),
      //       name: 'period1',
      //     },
      //     {
      //       start: new Date('2021-11-02'),
      //       end: new Date('2021-12-19'),
      //       name: 'period2',
      //     },
      //   ],
      // },
      // {
      //   name: 'taskI',
      //   periods: [
      //     {
      //       start: new Date('2021-10-12'),
      //       end: new Date('2021-10-19'),
      //       name: 'period1',
      //     },
      //     {
      //       start: new Date('2021-11-02'),
      //       end: new Date('2021-12-19'),
      //       name: 'period2',
      //     },
      //   ],
      // },
      // {
      //   name: 'taskJ',
      //   periods: [
      //     {
      //       start: new Date('2021-10-12'),
      //       end: new Date('2021-10-19'),
      //       name: 'period1',
      //     },
      //     {
      //       start: new Date('2021-11-02'),
      //       end: new Date('2021-12-19'),
      //       name: 'period2',
      //     },
      //   ],
      // },
      // {
      //   name: 'taskK',
      //   periods: [
      //     {
      //       start: new Date('2021-10-12'),
      //       end: new Date('2021-10-19'),
      //       name: 'period1',
      //     },
      //     {
      //       start: new Date('2021-11-02'),
      //       end: new Date('2021-12-19'),
      //       name: 'period2',
      //     },
      //   ],
      // },
      // {
      //   name: 'taskL',
      //   periods: [
      //     {
      //       start: new Date('2021-10-12'),
      //       end: new Date('2021-10-19'),
      //       name: 'period1',
      //     },
      //     {
      //       start: new Date('2021-11-02'),
      //       end: new Date('2021-12-19'),
      //       name: 'period2',
      //     },
      //   ],
      // },
      // {
      //   name: 'taskM',
      //   periods: [
      //     {
      //       start: new Date('2021-10-12'),
      //       end: new Date('2021-10-19'),
      //       name: 'period1',
      //     },
      //     {
      //       start: new Date('2021-11-02'),
      //       end: new Date('2021-12-19'),
      //       name: 'period2',
      //     },
      //   ],
      // },
    ];
  }, []);
  return <Gantt width={1000} height={300} data={data} />;
};

export default Demo;
