import { useState, useEffect } from 'react';
import { Table, Input} from 'antd';
const { Search } = Input;
import {API} from "../../API/apirequest"

const OwnerActivityLog = () => {
    

  const ActivityLogHeader = () => {
    return (
      <div className='flex gap-2 justify-between p-2'>

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
      await API.get("get-all-logs")
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
            key:  'ipAddress',
            width: 80,
          },
          {
            title: 'loginTime',
            dataIndex: 'loginTime',
            key:  'loginTime',
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
            key:'browserAgent',
            width: 80,
          },
          
          {
            title: 'logoutTime',
            dataIndex: 'logoutTime',
            key:  'logoutTime',
            width: 80,
            render: (text, record) => {
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
            title: 'durationTime',
            dataIndex: 'durationTime',
            key:'durationTime',
            width: 80,
          },
       
          
      
        ];
        console.log(ActivityData)
        return (
          <>
    
            <Table
              rowSelection={rowSelection}
              columns={columns}
              dataSource={ActivityData}
              scroll={{ x: 800, y: 320 }}
              rowKey="_id"
            />
          </>
        );
      };
    return (
      <>

        <ActivityLogHeader />
        <ActivityLogTable ActivityData={ActivityData} />

      </>
    )
  }

export default OwnerActivityLog