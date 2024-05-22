import { useState,useEffect } from 'react';
import { Tabs } from 'antd';
import type { TabsProps } from 'antd';
import Acknowledgement from './Acknowledgement';
import Receive from './Receive';

const ReceiveContainer = ({onData}) => {  
  const [showTabs, setShowTabs] = useState(true);
  
  const items: TabsProps['items'] = [
    {
      key: '1',
      label: 'Acknowledgement',
      children: <Acknowledgement onData={onData} showTabs={showTabs} setShowTabs={setShowTabs}/>,
    },
    {
      key: '2',
      label: 'Receive Register',
      children: <Receive onData={onData} showTabs={showTabs} setShowTabs={setShowTabs}/>,
    }
  ];
  const [activeTabKey, setActiveTabKey] = useState('1');

  useEffect(() => {
    const savedTabKey = localStorage.getItem('activeTabKey');
    if (savedTabKey) {
      setActiveTabKey(savedTabKey);
    }
  }, []);
  const handleTabChange = (key) => {
    setActiveTabKey(key);
    localStorage.setItem('activeTabKey', key);
  };

  return (
    <>
    
    <div className={showTabs ? '' : 'receive-tabs-hidden'}>
        <Tabs activeKey={activeTabKey} items={items} onChange={handleTabChange} />
      </div>

      {/* <Tabs defaultActiveKey="1" items={items} /> */}
    </>
  );
};

export default ReceiveContainer;
