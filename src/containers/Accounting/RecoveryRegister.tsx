import { useState, useEffect } from 'react';
import { Table, Input, Select, Space, Button, Upload, Tabs, Tooltip, Breadcrumb, Col, List, Row, Switch } from 'antd';

import { API } from "../../API/apirequest"
const { Search } = Input;
import backbutton_logo from "../../assets/backbutton.png"


const RecoveryRegister = () => {
  const authToken = localStorage.getItem("token");
  const selectedHubId = localStorage.getItem("selectedHubID");
  const headersOb = {
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${authToken}`
    }
  }
  const [searchQuery, setSearchQuery] = useState('');
  const handleSearch = (value) => {
    setSearchQuery(value);
  };

  const RecoveryRegisterHeader = () => {
    return (
      <div className='flex gap-2 justify-between  py-3'>
        <Search
          placeholder="Search by Vehicle Number"
          size='large'
          onSearch={handleSearch}
          style={{ width: 320 }}
        />
      </div>

    );
  };

  
  const [transferData, setTransferData] = useState([])
  const getTransferDetails = async () => {
    let response = await API.get(`get-all-users-logs/${selectedHubId}`, headersOb)
      .then((res) => {
        if (res.status == 201) {
          setTransferData(res.data.ownerDetails);
        } else {
          console.log('error')
        }
      }).catch((err) => {
        console.log(err)
      })


  }
  useEffect(() => {
    getTransferDetails()
  }, [])
  const RecoveryRegisterTable = ({ transferData }) => {
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys);
    };


    const rowSelection = {
      selectedRowKeys,
      onChange: onSelectChange,
    };

    const columns = [
      {
        title: 'Sl No',
        dataIndex: 'serialNumber',
        key: 'serialNumber',
        render: (text, record, index: any) => index + 1,
        width: 40,
      },
      {
        title: 'Vehicle Number',
        dataIndex: 'vehicleNumber',
        key: 'vehicleNumber',
        width: 80,
      },
      {
        title: 'Transfer From (owner)',
        dataIndex: 'ownerTransferId',
        key: 'ownerTransferId',
        render: (text, record) => record.oldOwnerId?.name || 'N/A',
        width: 110,
      },

      {
        title: 'Transfer To (owner)',
        dataIndex: 'ownerTransferId',
        key: 'ownerTransferId',
        render: (text, record) => record.newOwnerId?.name,
        width: 110,
      },

      {
        title: 'Transfer From Date',
        dataIndex: 'ownerTransferDate',
        key: 'ownerTransferDate',
        render: (text, record) => {
          const date = new Date(record.ownerTransferDate);
          const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            
            hour12: true
          };
          return date.toLocaleDateString('en-US', options);
        },
        width: 80, // Adjust width as needed
      },

      {
        title: 'Transfer To Date',
        dataIndex: 'ownerTransferToDate',
        key: 'ownerTransferToDate',
        render: (text, record) => {
          const date = new Date(record.ownerTransferToDate);
          const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
           
            hour12: true
          };
          return date.toLocaleDateString('en-US', options);
        },
        width: 80,
      },
    ];
    return (
      <>

        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={[]}
          scroll={{ x: 767, y: 360 }}
          rowKey="_id"
          pagination={{
            position: ['bottomCenter'],
            showSizeChanger: false,
          }}
        />
      </>
    );
  };
  return (
    <>

      <RecoveryRegisterHeader />
      <RecoveryRegisterTable transferData={transferData} />

    </>
  )
}

export default RecoveryRegister