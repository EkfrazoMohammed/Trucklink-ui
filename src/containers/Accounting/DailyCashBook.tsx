import React, { useState, useEffect } from 'react';
import { Button, Table, Space, Form, Tooltip, Popconfirm, Input, DatePicker, message, InputNumber, Select } from 'antd';
import { FormOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';
import moment from "moment";
import dayjs from 'dayjs';
import { API } from "../../API/apirequest"

const dateFormat = "DD/MM/YYYY";

const DailyCashBook = () => {
  const [dataSource, setDataSource] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalOutstanding, setTotalOutstanding] = useState('0.00');
  const [count, setCount] = useState(0);
  const [ledgerEntries, setLedgerEntries] = useState({});
  const [form] = Form.useForm();
  const [newRow, setNewRow] = useState(null);
  const [owners, setOwners] = useState([]);  // State to manage the list of owners

  const authToken = localStorage.getItem("token");
  const headersOb = {
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${authToken}`
    }
  };

  const getTableData = async () => {
    try {
      setLoading(true);
      const response = await API.get(`get-advance-data`, headersOb);
      const { ownersAdavance } = response.data || [];
      if (ownersAdavance && ownersAdavance.length > 0) {
        const dataSource = ownersAdavance.map((data) => {
          const { ownerDetails, outStandingAmount } = data;
          const { initialDate, ownerName } = ownerDetails[0];
          const intDate = dayjs(initialDate, "DD/MM/YYYY");
          return {
            key: data._id,
            ownerName: ownerName[0], // Adjusted for array structure
            initialDate,
            intDate,
            IntAmount: outStandingAmount,
            entries: [] // Initialize empty, will fetch on expand
          };
        });
        setDataSource(dataSource);
        setCount(dataSource.length);
      } else {
        setDataSource([]);
      }
      setLoading(false);
    } catch (err) {
      setLoading(false);
      message.error("Error fetching data. Please try again later", 2);
    }
  };

  const getOutstandingData = async () => {
    try {
      const response = await API.get(`get-owner-advance-outstanding-details`, headersOb);
      const outstandingEntries = response.data.amountData || "";
      if (outstandingEntries && outstandingEntries.length > 0) {
        setTotalOutstanding(outstandingEntries[0].outStandingAmount.toFixed(2));
      } else {
        setTotalOutstanding("0.00");
      }
    } catch (err) {
      console.log(err);
    }
  };

  // Fetch the list of owners
  const getOwners = async () => {
    try {
      const response = await API.get(`get-owner-name`, headersOb);
      setOwners(response.data.ownerDetails || []);
    } catch (err) {
      console.log(err);
      message.error("Error fetching owners. Please try again later", 2);
    }
  };

  const handleTableRowExpand = async (expanded, record) => {
    if (expanded) {
      try {
        if (record && record.key !== "") {
          const response = await API.get(`get-ledger-data/${record.key}`, headersOb);
          const ledgerEntries = response.data.ownersAdavance[0].ledgerEntries;

          const dataSource = ledgerEntries.map((data) => {
            const date = data.entryDate;
            const eDate = moment(date, "DD/MM/YYYY");
            return {
              ...data,
              entDate: eDate,
              IdofOwner: record.key,
              key: data._id // Ensure unique key for each ledger entry
            };
          });

          setLedgerEntries((prevEntries) => ({
            ...prevEntries,
            [record.key]: dataSource
          }));
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const createOwnerAdvance = async (row) => {
    const { intDate, IntAmount, ownerName, ownerId } = row;
    const DateString = dayjs(intDate).format("DD/MM/YYYY");
    const startDate = dayjs(DateString, "DD/MM/YYYY");
    const vDate = startDate.format("DD/MM/YYYY");
    console.log(newRow)
    try {
      await API.post(`create-owner-advance`, {
        ownerId: ownerId,
        ownerName: ownerName,
        entryDate: vDate,
        credit: Number(IntAmount),
        narration: "Vehicle Advance",
      }, headersOb)
        .then(() => {
          message.success("Successfully Added Owner Advance Outstanding");
          getTableData();
          getOutstandingData();
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

  useEffect(() => {
    getTableData();
    getOutstandingData();
    getOwners();
  }, []);

  const handleAdd = () => {
    const newData = {
      key: count.toString(),
      date: null,
      ownerName: '',
      ownerId: '',
      IntAmount: 0,
    };
    setNewRow(newData);
    setCount(count + 1);
  };

  const saveNewRow = async () => {
    console.log(newRow)
    try {
      await form.validateFields().then(values => {
        const newRowData = {
          ...newRow,
          ...values,
          // date: values.intDate.format(dateFormat),
          credit: Number(values.IntAmount)
        };
        console.log(newRowData);
        createOwnerAdvance(newRowData);
        setNewRow(null);
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
      render: (date, record) => {
        if (newRow && newRow.key === record.key) {
          return (
            <Form.Item
              name="date"
              style={{ margin: 0 }}
              rules={[{ required: true, message: 'Please input date!' }]}
            >
              <DatePicker format={dateFormat} />
            </Form.Item>
          );
        }
        return dayjs(date).format('DD/MM/YYYY');
      }
    },
    {
      title: 'Owner Name',
      dataIndex: 'ownerName',
      key: 'ownerName',
      render: (text, record) => {
        if (newRow && newRow.key === record.key) {
          return (
            <Form.Item
              name="ownerName"
              style={{ margin: 0 }}
            >
              <Select
                onChange={(value) => {
                  const selectedOwner = owners.find(owner => owner.name === value);
                  setNewRow({
                    ...newRow,
                    ownerName: value,
                    ownerId: selectedOwner ? selectedOwner._id : '',
                  });
                }}
              >
                {owners.map((owner, index) => (
                  <Select.Option key={index} value={owner.name}>
                    {owner.name}
                  </Select.Option>
                ))}
              </Select>
              {/* <Select
                onChange={(value) => {
                  const selectedOwner = owners.find(owner => owner.id === value.id);
                  setNewRow({
                    ...newRow,
                    ownerName: selectedOwner ? selectedOwner.name : '', // Check if selectedOwner exists
                    ownerId: selectedOwner ? selectedOwner._id : '', // Use the selected owner's ID directly
                  });
                }}
              >
                {owners.map((owner, index) => (
                  <Select.Option key={index} value={owner.name}>
                    {owner.name}
                  </Select.Option>
                ))}
              </Select> */}
            </Form.Item>
          );
        }
        return text;
      }
    },

    {
      title: 'Amount',
      dataIndex: 'IntAmount',
      key: 'IntAmount',
      render: (text, record) => {
        if (newRow && newRow.key === record.key) {
          return (
            <Form.Item
              name="IntAmount"
              style={{ margin: 0 }}
              rules={[{ required: true, message: 'Please input amount!' }]}
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
      render: (_, record) => {
        if (newRow && newRow.key === record.key) {
          return (
            <Space size="middle">
              <Button onClick={saveNewRow} type="link">Save</Button>
              <Button onClick={() => setNewRow(null)} type="link">Cancel</Button>
            </Space>
          );
        }
        return (
          <Space size="middle">
            <Tooltip placement="top" title="Edit">
              <a><FormOutlined /></a>
            </Tooltip>
            <Popconfirm title="Sure to delete?" onConfirm={() => handleDeleteOwnerData(record.key)}>
              <Tooltip placement="top" title="Delete">
                <a><DeleteOutlined /></a>
              </Tooltip>
            </Popconfirm>
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
          getTableData();
          getOutstandingData();
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
          <Input.Search
            placeholder="Search by Owner Name"
            size='large'
            style={{ width: 320 }}
          />
          <DatePicker
            size='large'
            placeholder='From date'
          /> -
          <DatePicker
            size='large'
            placeholder='To date'
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
          dataSource={newRow ? [newRow, ...dataSource] : dataSource}
          columns={columns}
          pagination={false}
          loading={loading}
        />
      </Form>
      <h1 style={{ fontSize: "1rem", padding: "1rem" }}> Total Outstanding : {totalOutstanding}</h1>
    </div>
  );
};

export default DailyCashBook;
