import { useState, useEffect } from 'react';
import { Button, Table, Space, Form, Tooltip, Popconfirm, Input, DatePicker, message, InputNumber, Select } from 'antd';
import { FormOutlined, DeleteOutlined } from '@ant-design/icons';
import moment from "moment";
import dayjs from 'dayjs';
import { API } from "../../API/apirequest"

const dateFormat = "DD/MM/YYYY";

const OwnerAdvance = () => {
  const [dataSource, setDataSource] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalOutstanding, setTotalOutstanding] = useState('0.00');
  const [count, setCount] = useState(0);
  const [ledgerEntries, setLedgerEntries] = useState({});
  const [form] = Form.useForm();
  const [newRow, setNewRow] = useState(null);
  const [owners, setOwners] = useState([]);  // State to manage the list of owners
  const authToken = localStorage.getItem("token");
  const selectedHubId = localStorage.getItem("selectedHubID");
  const headersOb = {
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${authToken}`
    }
  };

  const getTableData = async () => {
    try {
      setLoading(true);
      // const response = await API.get(`get-advance-data&hubId=${selectedHubId}`, headersOb);
      const response = await API.get(`get-advance-data/${selectedHubId}`, headersOb);
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
      // const response = await API.get(`get-owner-advance-outstanding-details&hubId=${selectedHubId}`, headersOb);
      const response = await API.get(`get-owner-advance-outstanding-details/${selectedHubId}`, headersOb);
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
      // const response = await API.get(`get-owner-name&hubId=${selectedHubId}`, headersOb);
      const response = await API.get(`get-owner-name/${selectedHubId}`, headersOb);
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
          // const response = await API.get(`get-ledger-data/${record.key}&hubId=${selectedHubId}`, headersOb);
          const response = await API.get(`get-ledger-data/${record.key}/${selectedHubId}`, headersOb);
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
    const { date, IntAmount, ownerName, ownerId } = row;
    const vDate = dayjs(date).format("DD/MM/YYYY");
    try {
      const payload = {
        ownerId: ownerId,
        ownerName: ownerName,
        entryDate: vDate,
        credit: Number(IntAmount),
        narration: "Vehicle Advance",
        hubId: selectedHubId
      }
      console.log(payload)
      await API.post(`create-owner-advance`, payload, headersOb)
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
    try {
      await form.validateFields().then(values => {
        const newRowData = {
          ...newRow,
          ...values,
          // date: values.intDate.format(dateFormat),
          credit: Number(values.IntAmount)
        };

        createOwnerAdvance(newRowData);
        setNewRow(null);
      });
    } catch (errInfo) {
      console.log("Validate Failed:", errInfo);
    }
  };
  const cancel = () => {
    getTableData()
  };
  const columns = [

    {
      title: 'Date',
      dataIndex: 'intDate',
      key: 'intDate',
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
            </Form.Item>
          );
        }
        return text;
      }
    },
    {
      title: 'Outstanding Amount',
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
              <Button onClick={cancel} type="link">Cancel</Button>
            </Space>
          );
        }
        return (
          <Space size="middle">
            {/* <Tooltip placement="top" title="Edit">
              <a><FormOutlined /></a>
            </Tooltip> */}
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


  const expandedRowRender = (record) => {
    const entries = ledgerEntries[record.key] || [];
    return (
      <div className='w-100 h-auto flex flex-col gap-2 bg-gray-50'>
        <LedgerTable record={record} entries={entries} />
      </div>
    );
  };

  const LedgerTable = ({ record, entries }) => {
    const [form] = Form.useForm();
    const [editingKeyIn, setEditingKeyIn] = useState("");
    const [isAddingNew, setIsAddingNew] = useState(false);

    const isEditing = (record) => record.key === editingKeyIn;

    const edit = (record) => {
      console.log(record.key)
      form.setFieldsValue({
        entDate: dayjs(record.entryDate, "DD/MM/YYYY"),
        credit: record.credit,
        debit: record.debit,
        narration: record.narration,
        ...record,
      });
      setEditingKeyIn(record.key);
      if (record.key == 'new') {
        setIsAddingNew(true);
      } else {
        setIsAddingNew(false);
      }
    };


    const cancel = () => {
      setEditingKeyIn("");
      setIsAddingNew(false);
      getTableData()
    };

    const save = async (key) => {
      console.log(key)
      try {
        const row = await form.validateFields();
        const newData = [...entries];
        const index = newData.findIndex((item) => key === item.key);

        if (isAddingNew) {
          // Logic for adding new entry
          const newEntry = {
            key: Date.now().toString(), // Generate a unique key
            ...row,
            entryDate: dayjs(row.entDate).format("DD/MM/YYYY"),
            // dayjs(date).format("DD/MM/YYYY")
          };
          // newData.push(newEntry);
          setLedgerEntries((prevEntries) => ({
            ...prevEntries,
            [record.key]: newData,
          }));
          setEditingKeyIn("");
          console.log(newEntry.entryDate)
          const payload = {
            entryDate: newEntry.entryDate,
            debit: Number(newEntry.debit),
            credit: Number(newEntry.credit),
            narration: newEntry.narration,
            hubId: selectedHubId

          };
          await API.put(`create-owner-ledger-entry/${record.key}`, payload, headersOb)
            .then(() => {
              message.success("Successfully added Ledger Entry");
              window.location.reload();
              getTableData();
              getOutstandingData();
            })
            .catch((error) => {
              const { response } = error;
              const { data } = response;
              const { message: msg } = data;
              message.error(msg);
            });

        } else {
          // Logic for updating existing entry
          if (index > -1) {
            const item = newData[index];
            newData.splice(index, 1, { ...item, ...row });
            setLedgerEntries((prevEntries) => ({
              ...prevEntries,
              [record.key]: newData,
            }));
            setEditingKeyIn("");

            const { entDate, credit, debit, narration } = row;
            const formattedDate = dayjs(entDate).format("DD/MM/YYYY");

            const payload = {
              entryDate: formattedDate,
              debit: Number(debit),
              credit: Number(credit),
              narration,
              hubId: selectedHubId,
            };

            await API.put(`update-owner-ledger-entry/${record.key}/${key}`, payload, headersOb)
              .then(() => {
                message.success("Successfully updated Ledger Entry");
                getTableData();
                getOutstandingData();
                setTimeout(() => {
                  window.location.reload();
                }, 1000)
              })
              .catch((error) => {
                const { response } = error;
                const { data } = response;
                const { message: msg } = data;
                if (msg == "Invalid ledger entry") {
                  message.error("Enter only Debit or Credit");
                } else {
                  message.error(msg);
                }
              });
          }
        }
      } catch (errInfo) {
        console.log("Validate Failed:", errInfo);
      }
    };

    const handleDeleteLedgerData = async (key) => {
      try {
        await API.delete(`delete-owner-ledger/${key}`, headersOb)
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

    const handleAddInsideRow = (record) => {
      const newEntryKey = `new`;
      const newEntry = {
        key: newEntryKey,
        entryDate: null,
        narration: '',
        debit: '',
        credit: '',
        ownerOutstanding: '',
      };

      setLedgerEntries((prevEntries) => {
        const updatedEntries = {
          ...prevEntries,
          [record.key]: [...(prevEntries[record.key] || []), newEntry],
        };

        setEditingKeyIn(newEntryKey);
        form.setFieldsValue({
          entDate: null,
          credit: '',
          debit: '',
          narration: '',
          ...newEntry,
        });

        return updatedEntries;
      });

      setEditingKeyIn(newEntryKey);
    };

    const columnsInsideRow = [
      {
        title: 'Date',
        dataIndex: 'entryDate',
        key: 'entryDate',
        render: (text, record) => {
          const editable = isEditing(record);
          return editable ? (
            <Form.Item
              name="entDate"
              style={{ margin: 0 }}
              rules={[{ required: true, message: 'Please input date!' }]}
            >
              <DatePicker format={dateFormat} />
            </Form.Item>
          ) : (
            dayjs(text).format('DD/MM/YYYY')
            // dayjs(text).format(dateFormat)
            // dayjs(text).format(dateFormat)
          );
        },
      },
      {
        title: 'Narration',
        dataIndex: 'narration',
        key: 'narration',
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
        },
      },
      {
        title: 'Debit',
        dataIndex: 'debit',
        key: 'debit',
        render: (text, record) => {
          const editable = isEditing(record);
          return editable ? (
            <Form.Item
              name="debit"
              style={{ margin: 0 }}
              rules={[{ required: true, message: 'Please input debit!' }]}
            >
              <InputNumber />
            </Form.Item>
          ) : (
            text
          );
        },
      },
      {
        title: 'Credit',
        dataIndex: 'credit',
        key: 'credit',
        render: (text, record) => {
          const editable = isEditing(record);
          return editable ? (
            <Form.Item
              name="credit"
              style={{ margin: 0 }}
              rules={[{ required: true, message: 'Please input credit!' }]}
            >
              <InputNumber />
            </Form.Item>
          ) : (
            text
          );
        },
      },
      {
        title: 'Outstanding',
        dataIndex: 'ownerOutstanding',
        key: 'ownerOutstanding',

      },
      {
        title: 'Action',
        key: 'operation',
        render: (_, record) => {
          const editable = isEditing(record);
          return editable ? (
            <span>
              <Button
                type="link"
                onClick={() => save(record.key, record)}
                style={{ marginRight: 8 }}
              >
                Save
              </Button>
              <Button type="link" onClick={cancel}>
                Cancel
              </Button>
            </span>
          ) : (
            <Space size="middle">
              <Tooltip placement="top" title="Edit">
                <a onClick={() => edit(record)}><FormOutlined /></a>
              </Tooltip>
              <Popconfirm title="Sure to delete?" onConfirm={() => handleDeleteLedgerData(record.key)}>
                <Tooltip placement="top" title="Delete">
                  <a><DeleteOutlined /></a>
                </Tooltip>
              </Popconfirm>
            </Space>
          );
        },
      },
    ];


    return (
      <div className='bg-[#BBE2FF] p-4'>
        <Button
          onClick={() => handleAddInsideRow(record)}
          type="primary"
          style={{
            marginBottom: 16,
          }}
        >
          Add new entry
        </Button>
        <Form form={form} component={false}>
          <Table
            className='nestedtable-account'
            rowKey={(record) => record.key}
            bordered
            dataSource={entries}
            columns={columnsInsideRow}
            pagination={false}

          />
        </Form>
      </div>
    );
  };
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
  useEffect(() => {
    getTableData();
    getOutstandingData();
    getOwners();
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className='flex gap-2 items-center'>
          {/* <Input.Search
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
          /> */}
        </div>

        <Button
          onClick={handleAdd}
          type="primary"
        >
          Add Owner Balance
        </Button>
      </div>
      <div className="myowneradvancetab-content">  
      <Form form={form} component={false}>
        <Table
          rowKey={(record) => record.key}
          bordered
          dataSource={newRow ? [newRow, ...dataSource] : dataSource}
          columns={columns}
          expandable={{
            expandedRowRender: (record) => expandedRowRender(record),
            onExpand: handleTableRowExpand,
          }}
          pagination={{
            position: ['bottomCenter'],
            showSizeChanger: false,
            total: dataSource.length,
            // defaultPageSize: currentPageSize, // Set the default page size

          }}
          // pagination={false}
          loading={loading}
        // summary={() => (
        //   <Table.Summary.Row >

        //     <Table.Summary.Cell index={0} colSpan={2} style={{ textAlign: 'right', fontWeight: 'bold', backgroundColor: "#fff" }}>

        //     </Table.Summary.Cell>
        //     <Table.Summary.Cell index={0} style={{ textAlign: 'right', fontWeight: 'bold', backgroundColor: "#eee" }}>
        //       Total Outstanding
        //     </Table.Summary.Cell>
        //     <Table.Summary.Cell index={0} style={{ textAlign: 'right', fontWeight: 'bold', backgroundColor: "#eee" }}>
        //       {totalOutstanding > 0 ? <p style={{ color: "green", fontWeight: "600" }}>{totalOutstanding}</p> : <p style={{ color: "red" }}>{totalOutstanding}</p>}
        //     </Table.Summary.Cell>
        //     <Table.Summary.Cell index={0} colSpan={2} style={{ textAlign: 'right', fontWeight: 'bold', backgroundColor: "#fff" }}>

        //     </Table.Summary.Cell>

        //   </Table.Summary.Row>
        // )}
        />      
      </Form>
      </div>
      <div className="flex my-4 text-md" style={{ backgroundColor: "#eee", padding: "1rem" }}>

<div style={{ textAlign: 'right', width: '200px' }}>
</div>
<div style={{ textAlign: 'right', width: '200px' }}>
</div>
<div style={{ fontWeight: 'bold', width: '260px' }}>
  Total Outstanding Amount
</div>
<div style={{ fontWeight: 'bold', width: '160px' }}>
  {totalOutstanding > 0 ? <p style={{ color: "green", fontWeight: "600" }}>{totalOutstanding}</p> : <p style={{ color: "red" }}>{totalOutstanding}</p>}
</div>

</div>
    </div>
  );
};

export default OwnerAdvance;
