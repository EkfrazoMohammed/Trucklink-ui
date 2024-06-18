import { useState, useEffect } from 'react';
import { Button, Table, Space, Form, Tooltip, Popconfirm, Input, DatePicker, message, InputNumber, Select } from 'antd';
import { FormOutlined, DeleteOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { API } from "../../API/apirequest";
const dateFormat = "DD/MM/YYYY";

const DailyCashBook1 = ({ onData, showTabs, setShowTabs }) => {
  const [dataSource, setDataSource] = useState([]);
  const [amountData, setAmountData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(0);
  const [form] = Form.useForm();
  const [editingKey, setEditingKey] = useState('');
  const [selectedDate, setSelectedDate] = useState({ month: 6, year: 2024 });
  const authToken = localStorage.getItem("token");
  const selectedHubId = localStorage.getItem("selectedHubID");
  const headersOb = {
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${authToken}`
    }
  };

  const isEditing = (record) => record.key === editingKey;

  const getTableData = async (month, year) => {
    try {
      setLoading(true);
      const response = await API.get(`get-cash-book-by-month/${month}/${year}/${selectedHubId}`, headersOb);
      const { cashBookEntries, amounts } = response.data || [];
      if (cashBookEntries && cashBookEntries.length > 0) {
        const dataSource = cashBookEntries.map((entry) => ({
          key: entry._id,
          date: entry.entryDate,
          debit: entry.debit,
          credit: entry.credit,
          narration: entry.narration,
        }));
        setDataSource(dataSource);
        setCount(dataSource.length);
      }
      else {
        setDataSource([]);
      }
      if (amounts) {
        setAmountData(amounts);
      } else {
        setAmountData([]);
      }
      setLoading(false);
    } catch (err) {
      setLoading(false);
      message.error("Error fetching data. Please try again later", 2);
    }
  };

  const createCashBookEntry = async (row) => {
    const { date, debit, credit, narration } = row;
    const formattedDate = dayjs(date).format("DD/MM/YYYY");
    try {
      await API.post(`create-cash-book`, {
        entryDate: formattedDate,
        debit: debit,
        credit: credit,
        narration: narration,
        hubId: selectedHubId
      }, headersOb)
        .then(() => {
          message.success("Successfully Added Cash Book Entry");
          const { month, year } = selectedDate;
          getTableData(month, year);
        })
        .catch((error) => {
          const { response } = error;
          const { data } = response;
          const { message: msg } = data;
          message.error(msg);
        });
    } catch (err) {
      console.log(err);
    }
  };

  const updateCashBookEntry = async (key, row) => {
    const { date, debit, credit, narration } = row;
    const formattedDate = dayjs(date).format("DD/MM/YYYY");
    try {
      await API.put(`update-cash-book/${key}`, {
        entryDate: formattedDate,
        debit: debit,
        credit: credit,
        narration: narration
      }, headersOb)
        .then(() => {
          message.success("Successfully Updated Cash Book Entry");
          const { month, year } = selectedDate;
          getTableData(month, year);
        })
        .catch((error) => {
          const { response } = error;
          const { data } = response;
          const { message: msg } = data;
          message.error(msg);
        });
    } catch (err) {
      console.log(err);
    }
  };

  const handleMonthChange = (date, dateString) => {
    if (date) {
      const month = date.month() + 1;
      const year = date.year();
      setSelectedDate({ month, year });
      getTableData(month, year);
    }
  };

  useEffect(() => {
    const { month, year } = selectedDate;
    getTableData(month, year);
  }, [selectedDate]);

  const handleAdd = () => {
    const newData = {
      key: count.toString(),
      date: null,
      debit: 0,
      credit: 0,
      narration: '',
    };
    setEditingKey(newData.key);
    setDataSource([newData, ...dataSource]);
    setCount(count + 1);
  };

  const save = async (key) => {
    try {
      const row = await form.validateFields();
      const newData = [...dataSource];
      const index = newData.findIndex((item) => key === item.key);
      if (index > -1) {
        const item = newData[index];
        newData.splice(index, 1, { ...item, ...row });
        setDataSource(newData);
        setEditingKey('');
        await updateCashBookEntry(key, newData[index]);
      }
    } catch (errInfo) {
      console.log('Validate Failed:', errInfo);
    }
  };

  const edit = (record) => {
    // console.log(record);
    form.setFieldsValue({
      date: dayjs(record.date, dateFormat),
      debit: record.debit,
      credit: record.credit,
      narration: record.narration,
    
    });
    setEditingKey(record.key);
  };

  const cancel = () => {
    setEditingKey('');
  };

  const columns = [
    {
      title: 'Sl No',
      dataIndex: 'serialNumber',
      key: 'serialNumber',
      render: (text, record, index) => index + 1,
      width: 80,
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      width:160,
      render: (date, record) => {
        const editable = isEditing(record);
        return editable ? (
          <Form.Item
            name="date"
            style={{ margin: 0 }}
            rules={[{ required: true, message: 'Please input date!' }]}
          >
            <DatePicker />
          </Form.Item>
        ) : (
          // dayjs(date).format('DD/MM/YYYY')
          date
        );
      }
    },
    {
      title: 'Narration',
      dataIndex: 'narration',
      key: 'narration',
      width:320,
      render: (text, record) => {
        const editable = isEditing(record);
        return editable ? (
          <Form.Item
            name="narration"
            style={{ margin: 0 }}
            rules={[{ required: true, message: 'Please input narration!' }]}
          >
            <Input />
          </Form.Item>
        ) : (
          text
        );
      }
    },
    {
      title: 'Debit',
      dataIndex: 'debit',
      key: 'debit',
      width:160,
      render: (text, record) => {
        const editable = isEditing(record);
        return editable ? (
          <Form.Item
            name="debit"
            style={{ margin: 0 }}
            rules={[{ required: true, message: 'Please input debit amount!' }]}
          >
            <InputNumber />
          </Form.Item>
        ) : (
          text
        );
      }
    },
    {
      title: 'Credit',
      dataIndex: 'credit',
      key: 'credit',
      width:160,
      render: (text, record) => {
        const editable = isEditing(record);
        return editable ? (
          <Form.Item
            name="credit"
            style={{ margin: 0 }}
            rules={[{ required: true, message: 'Please input credit amount!' }]}
          >
            <InputNumber />
          </Form.Item>
        ) : (
          text
        );
      }
    },
    {
      title: 'Action',
      key: 'operation',
      fixed:'right',
      render: (_, record) => {
        const editable = isEditing(record);
        return editable ? (
          <Space size="middle">
            <a onClick={() => save(record.key)}>
            save
            </a>
            <a onClick={cancel}>
              {/* <CloseOutlined /> */}
              {/* <DeleteOutlined /> */}
              cancel
            </a>
          </Space>
        ) : (
          <Space size="middle">
            <Tooltip placement="top" title="Edit">
            <a  onClick={() => edit(record)}><FormOutlined /></a>
              
            </Tooltip>
            <Popconfirm title="Sure to delete?" onConfirm={() => handleDeleteOwnerData(record.key)}>
              <Tooltip placement="top" title="Delete">
            
                  <DeleteOutlined />
               
              </Tooltip>
            </Popconfirm>
          </Space>
        );
      }
    }
  ];

  const handleDeleteOwnerData = async (key) => {
    try {
      await API.delete(`delete-cash-book/${key}`, headersOb)
        .then(() => {
          message.success("Successfully Deleted Cashbook Entry");
          const { month, year } = selectedDate;
          getTableData(month, year);
        })
        .catch((error) => {
          const { response } = error;
          const { data } = response;
          const { message: msg } = data;
          message.error(msg);
        });
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className='flex gap-2 items-center'>
          <DatePicker
            size='large'
            placeholder='By Month'
            picker="month"
            onChange={handleMonthChange}
          />
        </div>
        <Button
          onClick={handleAdd}
          type="primary"
        >
          Create Daily Cash
        </Button>
      </div>
      <Form form={form} component={false}>
        <Table
          rowKey={(record) => record.key}
          bordered
          dataSource={dataSource}
          columns={columns}
          pagination={false}
          loading={loading}
          scroll={{  y: 300 }}
          
         
          
        />
        <div  className="flex my-4 text-md" style={{ backgroundColor: "#eee",padding:"1rem" }}>
           <div style={{ textAlign: 'right',width:'80px' }}>
           </div>
           <div  style={{ fontWeight: 'bold',width:'480px' }}>
             Current Month balance
           </div>
           <div style={{ fontWeight: 'bold' ,width:'160px'}}>
             {(amountData.monthlyTotalDebit)}
           </div>
           <div style={{ fontWeight: 'bold',width:'160px' }}>
             {(amountData.monthlyTotalCredit)}
           </div>
           <div style={{ fontWeight: 'bold' }}>
             {amountData.monthlyOutstanding > 0 ? <p style={{ color: "green" }}>{amountData.monthlyOutstanding}</p> : <p style={{ color: "red" }}>{amountData.monthlyOutstanding}</p>}
           </div>
           </div>
         
      </Form>
    </div>
  );
};

export default DailyCashBook1;
