import { useState, useEffect } from 'react';
import { Table, Input } from 'antd';
const { Search } = Input;
import { API } from "../../API/apirequest"

const OwnerActivityLog = () => {
  const authToken=localStorage.getItem("token");
  const headersOb = {
    headers: {
      "Content-Type": "application/json",
      "Authorization":`Bearer ${authToken}`
    }
  }

  const ActivityLogHeader = () => {
    return (

        <div className='flex gap-2 justify-between  py-3'>

        <Search
          placeholder="Search by Vehicle Number"
          size='large'
          style={{ width: 320 }}
        />
      </div>

    );
  };


  const [ActivityData, setActivityData] = useState([])
  const getActivityDetails = async () => {
    await API.get("get-all-logs",headersOb)
      .then((res) => {
        setActivityData(res.data.logsDetails);
      }).catch((err) => {
        console.log(err)
      })


  }
  useEffect(() => {
    getActivityDetails()
  }, [])
  const ActivityLogTable = ({ ActivityData }) => {
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
        width: 50,
      },
      {
        title: 'Login ID',
        dataIndex: 'userEmail',
        key: 'userEmail',
        width: 80,
      },
      {
        title: 'IP Address',
        dataIndex: 'ipAddress',
        key: 'ipAddress',
        width: 80,
      },
      {
        title: 'Login Time',
        dataIndex: 'loginTime',
        key: 'loginTime',
        width: 80,

        render: (text, record) => {
          const date = new Date(record.loginTime);
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
      },
      {
        title: 'Agent',
        dataIndex: 'browserAgent',
        key: 'browserAgent',
        width: 80,
      },

      {
        title: 'Logout Time',
        dataIndex: 'logoutTime',
        key: 'logoutTime',
        width: 80,
        render: (text, record) => {
          console.log(record)
          const date = new Date(record.logoutTime);
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
      },
      {
        title: 'Duration Time',
        dataIndex: 'durationTime',
        key: 'durationTime',
        width: 80,
      },
    ];
    return (
      <>

        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={ActivityData}
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

      {/* <ActivityLogHeader /> */}
      <ActivityLogTable ActivityData={ActivityData} />

    </>
  )
}

export default OwnerActivityLog