import { useState, useEffect } from 'react';
import { Button, Table, Space, Form, Tooltip, Popconfirm, Input, DatePicker, message, InputNumber, Select } from 'antd';
import { FormOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { API } from "../../API/apirequest";

const dateFormat = "DD/MM/YYYY";

const DailyCashBook = ({ onData, showTabs, setShowTabs }) => {
  const [dataSource, setDataSource] = useState([]);
  const [amountData, setAmountData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(0);
  const [form] = Form.useForm();
  const [newRow, setNewRow] = useState(null);
  const [editingRowKey, setEditingRowKey] = useState(null); // State for editable row
  // const [selectedDate, setSelectedDate] = useState({ month: 6, year: 2024 });
  // Set current month and year as default values
  const currentMonth = dayjs().month() + 1;
  const currentYear = dayjs().year();
  const [selectedDate, setSelectedDate] = useState({ month: currentMonth, year: currentYear });

  const selectedHubId = localStorage.getItem("selectedHubID");
  const authToken = localStorage.getItem("token");
  const headersOb = {
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${authToken}`
    }
  };

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
      } else {
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
          console.log(msg)

          if (msg == "Invalid ledger entry" || msg == "Invalid cash book entry." || msg == "Unable to create cash book.") {
            message.error("Enter only Debit or Credit")
          } else {
            message.error(msg)
          }
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
        narration: narration,
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
          if (msg == "Invalid ledger entry" || msg == "Invalid cash book entry.") {
            message.error("Enter only Debit or Credit")
          } else {
            message.error(msg)
          }
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
    setNewRow(newData);
    setCount(count + 1);
  };

  const saveNewRow = async () => {
    try {
      await form.validateFields().then(values => {
        const newRowData = {
          ...newRow,
          ...values,
          debit: Number(values.debit),
          credit: Number(values.credit),
        };
        createCashBookEntry(newRowData);
        setNewRow(null);
      });
    } catch (errInfo) {
      console.log("Validate Failed:", errInfo);
    }
  };

  const saveEditRow = async (key) => {
    try {
      await form.validateFields().then(values => {
        const updatedRowData = {
          ...dataSource.find(item => item.key === key),
          ...values,
          debit: Number(values.debit),
          credit: Number(values.credit),
        };
        updateCashBookEntry(key, updatedRowData);
        setEditingRowKey(null);
      });
    } catch (errInfo) {
      console.log("Validate Failed:", errInfo);
    }
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
      width: 160,
      render: (date, record) => {
        if ((newRow && newRow.key === record.key) || (editingRowKey && editingRowKey === record.key)) {
          return (
            <Form.Item
              name="date"
              style={{ margin: 0 }}
              rules={[{ required: true, message: 'Please input date!' }]}
            // initialValue={dayjs(date, dateFormat)}
            >
              <DatePicker format={dateFormat} />
            </Form.Item>
          );
        }
        return date;
      }
    },
    {
      title: 'Narration',
      dataIndex: 'narration',
      key: 'narration',
      width: 260,
      render: (text, record) => {
        if ((newRow && newRow.key === record.key) || (editingRowKey && editingRowKey === record.key)) {
          return (
            <Form.Item
              name="narration"
              style={{ margin: 0 }}
              rules={[{ required: true, message: 'Please input narration!' }]}
            // initialValue={text}
            >
              <Input />
            </Form.Item>
          );
        }
        return text;
      }
    },
    {
      title: 'Debit',
      dataIndex: 'debit',
      key: 'debit',
      width: '190',
      render: (text, record) => {
        if ((newRow && newRow.key === record.key) || (editingRowKey && editingRowKey === record.key)) {
          return (
            <Form.Item
              name="debit"
              style={{ margin: 0 }}
              rules={[{ required: true, message: 'Please input debit amount!' }]}
            // initialValue={text}
            >
              <InputNumber />
            </Form.Item>
          );
        }
        return text;
      }
    },
    {
      title: 'Credit',
      dataIndex: 'credit',
      key: 'credit',
      width: '190',
      render: (text, record) => {
        if ((newRow && newRow.key === record.key) || (editingRowKey && editingRowKey === record.key)) {
          return (
            <Form.Item
              name="credit"
              style={{ margin: 0 }}
              rules={[{ required: true, message: 'Please input credit amount!' }]}
            // initialValue={text}
            >
              <InputNumber />
            </Form.Item>
          );
        }
        return text;
      }
    },
    {
      title: 'Action',
      key: 'operation',
      width: '190',
      render: (_, record) => {
        if (newRow && newRow.key === record.key) {
          return (
            <Space size="middle">
              <Button onClick={saveNewRow} type="link">Save</Button>
              <Button onClick={() => setNewRow(null)} type="link">Cancel</Button>
            </Space>
          );
        }
        if (editingRowKey && editingRowKey === record.key) {
          return (
            <Space size="middle">
              <Button onClick={() => saveEditRow(record.key)} type="link">Save</Button>
              <Button onClick={() => setEditingRowKey(null)} type="link">Cancel</Button>
            </Space>
          );
        }
        return (
          <Space size="middle">
            <Tooltip placement="top" title="Edit">
              <a onClick={() => setEditingRowKey(record.key)}><FormOutlined /></a>
            </Tooltip>
            {/* <Popconfirm title="Sure to delete?" onConfirm={() => handleDeleteOwnerData(record.key)}>
              <Tooltip placement="top" title="Delete">
                <a><DeleteOutlined /></a>
              </Tooltip>
            </Popconfirm> */}
          </Space>
        );
      }
    }
  ];

  const handleDeleteOwnerData = async (key) => {
    try {
      await API.delete(`delete-owner-record/${key}`, headersOb)
        .then(() => {
          message.success("Successfully Deleted Ledger Entry");
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
          CREATE DAILY CASH

        </Button>
      </div>
      <Form form={form} component={false}>
        <Table
          rowKey={(record) => record.key}
          bordered
          dataSource={newRow ? [newRow, ...dataSource] : dataSource}
          columns={columns}
          pagination={false}
          loading={loading}
          // scroll={{ y: 310 }}
        // summary={() => (
        //   <Table.Summary.Row style={{ backgroundColor: "#eee" }}>
        //     <Table.Summary.Cell index={0} colSpan={2} style={{ textAlign: 'right', fontWeight: 'bold', backgroundColor: "#fff" }}>
        //     </Table.Summary.Cell>
        //     <Table.Summary.Cell index={1} style={{ fontWeight: 'bold' }}>
        //       Current Month balance
        //     </Table.Summary.Cell>
        //     <Table.Summary.Cell index={1} style={{ fontWeight: 'bold' }}>
        //       {amountData.monthlyTotalDebit}
        //     </Table.Summary.Cell>
        //     <Table.Summary.Cell index={1} style={{ fontWeight: 'bold' }}>
        //       {amountData.monthlyTotalCredit}
        //     </Table.Summary.Cell>
        //     <Table.Summary.Cell index={1} style={{ fontWeight: 'bold' }}>
        //       {amountData.monthlyOutstanding > 0 ? <p style={{ color: "green" }}>{amountData.monthlyOutstanding}</p> : <p style={{ color: "red" }}>{amountData.monthlyOutstanding}</p>}
        //     </Table.Summary.Cell>
        //   </Table.Summary.Row>
        // )}
        />
        <div className="flex my-4 text-md" style={{ backgroundColor: "#eee", padding: "1rem" }}>

          <div style={{ textAlign: 'right', width: '160px' }}>
          </div>
          <div style={{ textAlign: 'right', width: '260px', fontWeight: 'bold' }}>
            Current Month balance
          </div>
          <div style={{ textAlign: 'right', width: '160px', fontWeight: 'bold' }}>
            {amountData.monthlyTotalDebit}
          </div>
          <div style={{ fontWeight: 'bold', width: '160px' }}>
            {/* {amountData.monthlyTotalCredit} */}
          </div>
          <div style={{ fontWeight: 'bold', width: '260px' }}>
            {amountData.monthlyTotalCredit}
          </div>
          <div style={{ fontWeight: 'bold', width: '160px' }}>
            {amountData.monthlyOutstanding > 0 ? <p style={{ color: "green" }}>{amountData.monthlyOutstanding}</p> : <p style={{ color: "red" }}>{amountData.monthlyOutstanding}</p>}
          </div>

        </div>
      </Form>
    </div>
  );
};

export default DailyCashBook;
