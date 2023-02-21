import React from 'react';
import consoler from 'lib/consoler';
import Matrix from './index';
import { getTestData, getTestData2 } from './example.data';

const TreeDemo: React.FC = () => {
  const data = getTestData();
  const data2 = getTestData2();
  consoler.log(`data`, data, `data2`, data2);

  return (
    <Matrix
      data={data}
      // id={row => row.id as string}
      // parent={row => row.parent as string}
    />
  );
};

export default TreeDemo;
