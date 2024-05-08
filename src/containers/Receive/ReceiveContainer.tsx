import { Tabs } from 'antd';
import type { TabsProps } from 'antd';
import Acknowledgement from './Acknowledgement';
import ReceiveRegister from './ReceiveRegister';

const ReceiveContainer = () => {  
  const items: TabsProps['items'] = [
    {
      key: '1',
      label: 'Acknowledgement',
      children: <Acknowledgement />,
    },
    {
      key: '2',
      label: 'ReceiveRegister',
      children: <ReceiveRegister />,
    }
  ];

  return (
    <>
      <Tabs defaultActiveKey="1" items={items} />
    </>
  );
};

export default ReceiveContainer;
