import { useState, useEffect } from 'react';
import { Button, Table, Space, Form, Tooltip, Popconfirm, Input, DatePicker, message, InputNumber, Select, Row, Col, Breadcrumb, Transfer } from 'antd';
import type { TransferProps } from 'antd';
import { FormOutlined, DeleteOutlined } from '@ant-design/icons';
import moment from "moment";
import dayjs from 'dayjs';
import { API } from "../../API/apirequest"
import backbutton_logo from "../../assets/backbutton.png"
const dateFormat = "DD/MM/YYYY";

interface RecordType {
  key: string;
  title: string;
  description: string;
  chosen: boolean;
}

const BillRegister = () => {
  const [dataSource, setDataSource] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalOutstanding, setTotalOutstanding] = useState(0);
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

  const getTableData = async (searchQuery, page, limit, selectedHubID) => {
    try {
      setLoading(true);

      const pages = page;
      const limitData = limit ? limit : null;

      const searchData = searchQuery ? searchQuery : null;


      const response = searchData ? await API.get(`get-all-bill-register?searchBNT=${searchData}&page=${pages}&limit=${limitData}&hubId=${selectedHubId}`, headersOb)
        : await API.get(`get-all-bill-register?page=${pages}&limit=${limitData}`, headersOb);
      const { bill, totalValueRaised } = response.data || [];
      setTotalOutstanding(totalValueRaised)
      if (bill && bill[0].data.length > 0) {
        const dataSource = bill[0].data.map((data) => {
          const { valueRaised, valueReceived, tax, difference, billNumber, billType, remarks } = data;
          return {
            key: data._id,
            valueRaised, valueReceived, tax, difference, billNumber, billType, remarks,
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



  const handleTableRowExpand = async (expanded, record) => {
    if (expanded) {
      try {
        if (record && record.key !== "") {
          // const response = await API.get(`get-ledger-data/${record.key}&hubId=${selectedHubId}`, headersOb);
          const response = await API.get(`get-delivery-data/${record.key}`, headersOb);
          const ledgerEntries = response.data.deliveryDetails.challan;

          const dataSource = ledgerEntries.map((data) => {

            return {
              ...data,
              "quantityInMetricTons": data.quantityInMetricTons,
              "rate": data.rate,
              "totalExpense": data.totalExpense,
              "deliveryLocation": data.deliveryLocation,
              "vehicleNumber": data.vehicleNumber,
              "deliveryNumber": data.deliveryNumber,
              "invoiceDate": data.invoiceDate,
              key: data._id
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
        hubId: selectedHubId
      }, headersOb)
        .then(() => {
          message.success("Successfully Added Owner Advance Outstanding");
          getTableData("", "1", "500", selectedHubId);

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

  const [showAddRecoveryForm, setShowAddRecoveryForm] = useState(false);

  const handleAdd = () => {
    setShowAddRecoveryForm(true)
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
      title: 'billNumber',
      dataIndex: 'billNumber',
      key: 'billNumber',
    },
    {
      title: 'billType',
      dataIndex: 'billType',
      key: 'billType',
    },
    {
      title: 'valueRaised',
      dataIndex: 'valueRaised',
      key: 'valueRaised',
    },
    {
      title: 'valueReceived',
      dataIndex: 'valueReceived',
      key: 'valueReceived',
    },
    {
      title: 'tax',
      dataIndex: 'tax',
      key: 'tax',
    },
    {
      title: 'difference',
      dataIndex: 'difference',
      key: 'difference',
    },
    {
      title: 'remarks',
      dataIndex: 'remarks',
      key: 'remarks',
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


  const expandedRowRender = (record) => {
    const entries = ledgerEntries[record.key] || [];
    return (
      <div className='w-100 h-auto p-2 flex flex-col gap-2 bg-gray-50'>
        <LedgerTable record={record} entries={entries} />
      </div>
    );
  };

  const LedgerTable = ({ record, entries }) => {
    const [form] = Form.useForm();
    const [editingKeyIn, setEditingKeyIn] = useState("");

    const isEditing = (record) => record.key === editingKeyIn;

    const edit = (record) => {
      form.setFieldsValue({
        entDate: dayjs(record.entDate),
        credit: record.credit,
        debit: record.debit,
        narration: record.narration,
        ...record,
      });
      setEditingKeyIn(record.key);
    };

    const cancel = () => {
      setEditingKeyIn("");
    };

    const save = async (key) => {
      try {
        const row = await form.validateFields();
        const newData = [...entries];
        const index = newData.findIndex((item) => key === item.key);

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
            hubId: selectedHubId
          };

          await API.put(`create-owner-ledger-entry/${record.key}`, payload, headersOb)
            .then(() => {
              message.success("Successfully Updated Ledger Entry");
              getTableData("", "1", "500", selectedHubId);

            })
            .catch((error) => {
              const { response } = error;
              const { data } = response;
              const { message: msg } = data;
              message.error(msg);
            });
        }
      } catch (errInfo) {
        console.log("Validate Failed:", errInfo);
      }
    };

    const handleDeleteLedgerData = async (key) => {
      try {
        await API.delete(`delete-ledger-data/${key}`, headersOb)
          .then(() => {
            message.success("Successfully Deleted Ledger Entry");
            getTableData("", "1", "500", selectedHubId);

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





    const columnsInsideRow = [
      // {
      //   title: 'Invoice Date',
      //   dataIndex: 'entryDate',
      //   key: 'entryDate',
      //   render: (text, record) => {
      //     const editable = isEditing(record);
      //     return editable ? (
      //       <Form.Item
      //         name="entDate"
      //         style={{ margin: 0 }}
      //         rules={[{ required: true, message: 'Please input date!' }]}
      //       >
      //         <DatePicker format={dateFormat} />
      //       </Form.Item>
      //     ) : (
      //       dayjs(text).format('DD/MM/YYYY')
      //     );
      //   },
      // },
      {
        title: 'Truck Number',
        dataIndex: 'vehicleNumber',
        key: 'vehicleNumber',
        render: (text, record) => {
          const editable = isEditing(record);
          return editable ? (
            <Form.Item
              name="vehicleNumber"
              style={{ margin: 0 }}
              rules={[{ required: true, message: 'Please input vehicleNumber!' }]}
            >
              <Input />
            </Form.Item>
          ) : (
            text
          );
        },
      },
      {
        title: 'Delivery Number',
        dataIndex: 'deliveryNumber',
        key: 'deliveryNumber',
        render: (text, record) => {
          const editable = isEditing(record);
          return editable ? (
            <Form.Item
              name="deliveryNumber"
              style={{ margin: 0 }}
              rules={[{ required: true, message: 'Please input Delivery Number!' }]}
            >
              <Input />
            </Form.Item>
          ) : (
            text
          );
        },
      },

      {
        title: 'Destination',
        dataIndex: 'deliveryLocation',
        key: 'deliveryLocation',
      },
      {
        title: 'Shortage',
        dataIndex: 'shortage',
        key: 'shortage',
        render: (text, record) => {
          const editable = isEditing(record);
          return editable ? (
            <Form.Item
              name="shortage"
              style={{ margin: 0 }}
              rules={[{ required: true, message: 'Please input shortage!' }]}
            >
              <InputNumber />
            </Form.Item>
          ) : (
            text
          );
        },
      },
      {
        title: 'Recovery',
        dataIndex: 'recovery',
        key: 'recovery',
        render: (text, record) => {
          const editable = isEditing(record);
          return editable ? (
            <Form.Item
              name="recovery"
              style={{ margin: 0 }}
              rules={[{ required: true, message: 'Please input recovery!' }]}
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
        dataIndex: 'outstanding',
        key: 'outstanding',
        render: (text, record) => {
          const editable = isEditing(record);
          return editable ? (
            <Form.Item
              name="outstanding"
              style={{ margin: 0 }}
              rules={[{ required: true, message: 'Please input outstanding!' }]}
            >
              <InputNumber />
            </Form.Item>
          ) : (
            text
          );
        },
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

        <Form form={form} component={false}>
          <Table
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
          getTableData("", "1", "500", selectedHubId);
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
    getTableData("", "1", "500", selectedHubId);

  }, []);

  const RecoveryCodeFormComponent = () => {
    const [mockData, setMockData] = useState<RecordType[]>([]);
    const [targetKeys, setTargetKeys] = useState<TransferProps['targetKeys']>([]);

    const getMock = () => {
      const tempMockData = [];
      for (let i = 0; i < 10; i++) {
        const data = {
          key: i.toString(),
          title: `content ${i + 1}`,
          chosen: i % 2 === 0,
        };
        tempMockData.push(data);
      }
      setMockData(tempMockData);
      setTargetKeys([]);
    };

    useEffect(() => {
      getMock();
    }, []);

    const handleChangeTransfer: TransferProps['onChange'] = (newTargetKeys) => {
      setTargetKeys(newTargetKeys);
    };

    const renderFooter: TransferProps['footer'] = (_, info) => {
      if (info?.direction === 'left') {
        return (
          <Button size="small" style={{ float: 'left', margin: 5 }} onClick={getMock}>
            reload
          </Button>
        );
      }
      return (
        <Button size="small" style={{ float: 'right', margin: 5 }} onClick={getMock}>
          reload
        </Button>
      );
    };


    const [formData, setFormData] = useState({
      registrationNumber: '',
      commission: 0,
      ownerId: '',
      accountId: null,
      vehicleType: '',
      rcBookProof: null,
      isCommission: true,
      marketRate: '',
      isMarketRate: false,
      hubId: selectedHubId,
    });

    const onResetClick = () => {
      console.log('reset clicked')
      setFormData({
        registrationNumber: '',
        commission: 0,
        ownerId: '',
        accountId: null,
        vehicleType: '',
        rcBookProof: null,
        isCommission: true,
        marketRate: '',
        isMarketRate: false,
      });
    }
    const [fileName, setFileName] = useState("");
    const [bankData, setBankdata] = useState([])
    const axiosFileUploadRequest = async (file) => {
      console.log(file)

      try {
        const formData = new FormData();
        formData.append("file", file);

        const config = {
          headers: {
            "content-type": "multipart/form-data",
            "Authorization": `Bearer ${authToken}`
          },
        };
        const response = await API.post(
          `rc-upload`,
          formData,
          config
        );
        setFileName(file.name)
        const { rcBookProof } = response.data;
        setFormData((prevFormData) => ({
          ...prevFormData,
          rcBookProof: rcBookProof,
        }));
        alert("File uploaded successfully");
      } catch (err) {
        console.log(err);
        alert("Failed to upload, retry again!");
      }
    };
    const handleFileChange = (file) => {
      console.log(file)
      axiosFileUploadRequest(file.file);

    };
    const handleChange = (name, value) => {
      const headersOb = {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        }
      }
      if (name === 'isCommission' && value === true) {
        setFormData(prevFormData => ({
          ...prevFormData,
          isCommission: true,
          isMarketRate: false,
          marketRate: "",
        }));
      }
      else if (name === 'isCommission' && value === false) {
        setFormData(prevFormData => ({
          ...prevFormData,
          isCommission: false,
          isMarketRate: true,
          commission: 0
        }));
      }

      else if (name === "ownerId") {
        const request = API.get(`get-owner-bank-details/${value}?page=1&limit=10&hubId=${selectedHubId}`, headersOb)
          .then((res) => {
            console.log(res)

            setBankdata(res.data.ownerDetails[0]['accountIds'])
          })
          .catch((err) => {
            console.log(err)
          })
        setFormData((prevFormData) => ({
          ...prevFormData,
          [name]: value,
          accountId: null,
        }));
      }

      else if (name === "registrationNumber") {
        const updatedValue = value.toUpperCase();
        setFormData((prevFormData) => ({
          ...prevFormData,
          [name]: updatedValue,
        }));
      }
      else {
        setFormData((prevFormData) => ({
          ...prevFormData,
          [name]: value,
        }));
      }
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      const payload = {
        hubId: selectedHubId,
        accountId: formData.accountId,
        commission: formData.commission,
        ownerId: formData.ownerId,
        rcBookProof: formData.rcBookProof,
        registrationNumber: formData.registrationNumber,
        truckType: formData.vehicleType,
        marketRate: formData.marketRate,
        isMarketRate: formData.isMarketRate,
      };
      const headersOb = {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        }
      }
      API.post('create-vehicle', payload, headersOb)
        .then((response) => {
          console.log('Truck data added successfully:', response.data);
          alert("Truck data added successfully")
          window.location.reload();
        })
        .catch((error) => {
          console.error('Error adding truck data:', error);
          let errorResponse = error.response.data

          let errorMessages = [];

          if (errorResponse.error && errorResponse.error.err && errorResponse.error.err.errors) {
            Object.keys(errorResponse.error.err.errors).forEach((key) => {
              const errorMessage = errorResponse.error.err.errors[key].message;
              errorMessages.push(errorMessage);
            });
          }


          if (errorMessages.length > 0) {
            console.log("Error:", errorMessages.join(", "));
            alert("error occurred")
          } else {
            alert("error occurred")
            console.log("Something went wrong");
          }
        });
    };

    const goBack = () => {
      setShowAddRecoveryForm(false)
    }

    return (
      <>
        <div className="flex flex-col gap-2">


          <div className="flex flex-col gap-1">

            <div className="flex items-center gap-4">
              <div className="flex"><img src={backbutton_logo} alt="backbutton_logo" className='w-5 h-5 object-cover cursor-pointer' onClick={goBack} /> </div>
              <div className="flex flex-col">
                <h1 className='font-bold' style={{ fontSize: "16px" }}>Create Recovery Code</h1>
                <Breadcrumb
                  items={[
                    {
                      title: 'Recovery Register',
                    },
                    {
                      title: 'Create',
                    },
                  ]}
                />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
                <Col className="gutter-row mt-6" span={8}>
                  <Input
                    placeholder="Recovery Code*"
                    size="large"
                    name="recoveryCode"
                    onChange={(e) => handleChange('recoveryCode', e.target.value)}
                  />
                </Col>

                <Col className="gutter-row mt-6" span={8}>
                  <Input
                    placeholder="Value*"
                    size="large"
                    name="value"
                    onChange={(e) => handleChange('value', e.target.value)}
                  />
                </Col>

              </Row>

              <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
                <Col className="gutter-row mt-6" span={16}>

                  <Transfer
                    dataSource={mockData}
                    showSearch
                    listStyle={{
                      width: 650,
                      height: 300,
                    }}
                    operations={['', '']}
                    targetKeys={targetKeys}
                    onChange={handleChangeTransfer}
                    render={(item) => `${item.title}`}
                    footer={renderFooter}
                  />
                </Col>
              </Row>
            </div>
          </div>


          <div className="flex gap-4 items-center justify-center reset-button-container">

            <Button onClick={onResetClick}>Reset</Button>
            <Button type="primary" className="bg-primary" onClick={handleSubmit}>
              Save
            </Button>
          </div>
        </div>
      </>

    )
  }

  return (
    <>
      {showAddRecoveryForm ? (<RecoveryCodeFormComponent />) :
        (

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
                Create Bill
              </Button>
            </div>
            <Form form={form} component={false}>
              <Table
                rowKey={(record) => record.key}
                scroll={{ x: "auto", y: 400 }}
                bordered
                dataSource={newRow ? [newRow, ...dataSource] : dataSource}
                columns={columns}
                expandable={{
                  expandedRowRender: (record) => expandedRowRender(record),
                  onExpand: handleTableRowExpand,
                }}
                pagination={false}
                loading={loading}
                summary={() => (
                  <Table.Summary.Row >

                    <Table.Summary.Cell index={0} colSpan={2} style={{ textAlign: 'right', fontWeight: 'bold', backgroundColor: "#fff" }}>

                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={0} colSpan={2} style={{ textAlign: 'right', fontWeight: 'bold', backgroundColor: "#eee" }}>
                      Total Outstanding
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={0} style={{ textAlign: 'right', fontWeight: 'bold', backgroundColor: "#eee" }}>
                      {totalOutstanding > 0 ? <p style={{ color: "green", fontWeight: "600" }}>{totalOutstanding}</p> : <p style={{ color: "red" }}>{totalOutstanding}</p>}
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={0} colSpan={2} style={{ textAlign: 'right', fontWeight: 'bold', backgroundColor: "#fff" }}>

                    </Table.Summary.Cell>

                  </Table.Summary.Row>
                )}
              />
            </Form>
          </div>
        )
      }
    </>
  );
};

export default BillRegister;
