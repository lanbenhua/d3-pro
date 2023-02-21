import React from 'react';
import consoler from 'lib/consoler';
import Matrix from './index';
import { getTestData, getTestData2 } from './example.data';
import TaskInstanceStatusConstructor, {
  TaskInstanceStatus,
} from 'biz/bizcommon/task-instance-status';

const MatrixDemo: React.FC = () => {
  const data = getTestData();
  const data2 = getTestData2();
  consoler.log(`data`, data, `data2`, data2);

  const colors: [
    TaskInstanceStatus,
    string
  ][] = TaskInstanceStatusConstructor.getList().map(item => [
    item.key,
    item.color,
  ]);

  return (
    <Matrix
      data={data}
      colorMap={colors}
      // id={row => row.id as string}
      // parent={row => row.parent as string}
    />
  );
};

export default MatrixDemo;
