import React, { useState } from 'react';
import { Space,Button, Upload, Tabs } from 'antd';
import type { TabsProps } from 'antd';
import { UploadOutlined,DownloadOutlined,EyeOutlined,FormOutlined,DeleteOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';

import { Table, Select } from 'antd';
import type { TableColumnsType } from 'antd';

const onChange = (key: string) => {
  console.log(key);
};

const props: UploadProps = {
  action: '//jsonplaceholder.typicode.com/posts/',
  listType: 'picture',
  previewFile(file) {
    console.log('Your upload file:', file);
    // Your process logic. Here we just mock to the same file
    return fetch('https://next.json-generator.com/api/json/get/4ytyBoLK8', {
      method: 'POST',
      body: file,
    })
      .then((res) => res.json())
      .then(({ thumbnail }) => thumbnail);
  },
};

interface DataType {
  key: React.Key;
  name: string;
  address: string;
}

const OnboardingContainer = () => {

  const [showOwnerTable, setShowOwnerTable] = useState(true);

  const handleAddOwnerClick = () => {
    setShowOwnerTable(false);
  };
  
  const OwnerMaster=()=>{
    return (
      <>
      {showOwnerTable ? (
        <>
          <Owner onAddOwnerClick={handleAddOwnerClick} />
          <OwnerTable />
        </>
      ) : (
        <TruckOwnerForm />
      )}
    </>
    )
  }
  const items: TabsProps['items'] = [
    {
      key: '1',
      label: 'Owner Master',
      children: <OwnerMaster />,
    },
    {
      key: '2',
      label: 'Truck Master',
      children:<OwnerMaster />,
    },
    {
      key: '3',
      label: 'Master Data',
      children:<OwnerMaster />,
    },
    {
      key: '4',
      label: 'Owner Transfer Log',
      children:<OwnerMaster />,
    },
    {
      key: '5',
      label: 'Activity Log',
      children:<OwnerMaster />,
    },
  ];
  
const OwnerTable = () => {
  const columns: TableColumnsType<DataType> = [
    {
      title: 'Sl. No',
      width: 80,
      dataIndex: 'name',
      key: 'name',
      fixed: 'left',
    },
    {
      title: 'Owner Name',
      dataIndex: 'address',
      key: '1',
      width: 80,
    },
    {
      title: 'District',
      dataIndex: 'address',
      key: '2',
      width: 80,
    },
    {
      title: 'State',
      dataIndex: 'address',
      key: '3',
      width: 80,
    },
    {
      title: 'Email ID',
      dataIndex: 'address',
      key: '4',
      width: 80,
    },

    {
      title: 'Action',
      key: 'action',
      
      width: 80,
      render: (_, record) => (
        <Space size="middle">
          <a onClick={handleAddOwnerClick}><EyeOutlined /></a>
          <a><FormOutlined /></a>
          <a><DeleteOutlined /></a>
        </Space>
      ),
    },
  ];

  const data: DataType[] = [];
  for (let i = 0; i < 10; i++) {
    data.push({
      key: i,
      name: `${i + 1}`,
      address: `data ${i}`,
    });
  }

  return <Table columns={columns} dataSource={data} scroll={{ x: 800, y: 320 }} />;
};

const Owner = ({ onAddOwnerClick }: { onAddOwnerClick: () => void }) => {
  return (
    <div className='flex gap-2 justify-between p-2'>
      <Select
        showSearch
        style={{ width: 300, marginBottom: "20px" }}
        placeholder="Search by Owner Name / Truck No"
        optionFilterProp="children"
        filterOption={(input, option) => (option?.label ?? '').includes(input)}
        filterSort={(optionA, optionB) =>
          (optionA?.label ?? '').toLowerCase().localeCompare((optionB?.label ?? '').toLowerCase())
        }
        options={[
          {
            value: '1',
            label: 'Bengaluru',
          },
          {
            value: '2',
            label: 'Chennai',
          },
          {
            value: '3',
            label: 'Hyderabad',
          },
          {
            value: '4',
            label: 'Mumbai',
          },
          {
            value: '5',
            label: 'Madurai',
          },
        ]}
      />
      <div className='flex gap-2'>

       <Upload {...props}>
    <Button icon={<UploadOutlined />}></Button>
  </Upload>
  <Upload {...props}>
    <Button icon={<DownloadOutlined />}></Button>
  </Upload>

      <Button onClick={onAddOwnerClick} className='bg-[#1572B6] text-white'> ADD TRUCK OWNER</Button>
    </div>
    </div>

  );
};
  const TruckOwnerForm = () => {
    return <div onClick={()=>{setShowOwnerTable(true)}}>Form for adding truck owner</div>;
  };

  return (
    <>
      <Tabs defaultActiveKey="1" items={items} onChange={onChange} />
    </>
  );
};

export default OnboardingContainer;
