import { useState, useEffect } from 'react';
import { Table, Input, Select, Space, Button, Upload, Tabs, Tooltip, Breadcrumb, Col, List, Row, Switch } from 'antd';
import type { TabsProps } from 'antd';
import { UploadOutlined, DownloadOutlined, EyeOutlined, FormOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';
import { API } from "../../API/apirequest"
const { Search } = Input;
import backbutton_logo from "../../assets/backbutton.png"


const OwnerTransferLog = () => {

  const [searchQuery, setSearchQuery] = useState('');
  const handleSearch = (value) => {
    setSearchQuery(value);
  };

  const TransferLogHeader = () => {
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

  const ViewTransferLogDataRow = ({ filterTruckTableData }) => {
    return (
      <div className="owner-details">

        <img src={backbutton_logo} alt="backbutton_logo" className='w-5 h-5 object-cover cursor-pointer' onClick={() => { setShowTruckTable(true) }} />
        <div className="section mx-2 my-4">
          <h2 className='font-semibold text-md'>Vehicle Information</h2>
          <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
            <Col className="gutter-row m-1" span={5}>
              <p className='flex flex-col font-normal m-2'><span className="label text-sm">Enter Truck details </span> </p>
            </Col>

          </Row>
        </div>

      </div>
    );
  };
  const [transferData, setTransferData] = useState([])
  const getTransferDetails = async () => {
    let response = await API.get("get-all-users-logs")
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
  const TransferLogTable = ({ transferData }) => {
    console.log(transferData)
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
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
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
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
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
          dataSource={transferData}
          scroll={{ x: 767, y: 360 }}
          rowKey="_id"
        />
      </>
    );
  };
  return (
    <>

      <TransferLogHeader />
      <TransferLogTable transferData={transferData} />

    </>
  )
}

export default OwnerTransferLog