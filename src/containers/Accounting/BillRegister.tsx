import { useState, useEffect } from 'react';
import { Button, Table, Space, Form, Tooltip, Popconfirm, Input, DatePicker, message, InputNumber, Select, Row, Col, Breadcrumb, Transfer } from 'antd';
import type { TransferProps } from 'antd';
import { FormOutlined, DeleteOutlined } from '@ant-design/icons';
import moment from "moment";
import dayjs from 'dayjs';
import { API } from "../../API/apirequest"
import backbutton_logo from "../../assets/backbutton.png"
const dateFormat = "DD/MM/YYYY";
const filterOption = (input, option) =>
  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;

interface RecordType {
  key: string;
  title: string;
  description: string;
  chosen: boolean;
}

const BillRegister = ({ onData, showTabs, setShowTabs }) => {
  const [dataSource, setDataSource] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalOutstanding, setTotalOutstanding] = useState(0);
  const [count, setCount] = useState(0);
  const [ledgerEntries, setLedgerEntries] = useState({});
  const [form] = Form.useForm();
  const [newRow, setNewRow] = useState(null);

  const authToken = localStorage.getItem("token");
  const selectedHubId = localStorage.getItem("selectedHubID");
  const headersOb = {
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${authToken}`
    }
  };
  const handleAdd = () => {
    setShowTabs(false);
    setShowAddRecoveryForm(true)
    setShowEditRecoveryForm(false);
  };
  const [showEditRecoveryForm, setShowEditRecoveryForm] = useState(false);

  const [editRowData,setEditRowData]=useState(null);
  const handleEditRow = (data) => {
    setShowTabs(false);
    setShowAddRecoveryForm(true)
    setShowEditRecoveryForm(true);
    setEditRowData(data);

  };

  const getTableData = async (searchQuery, page, limit, selectedHubID) => {
    try {
      setLoading(true);

      const pages = page;
      const limitData = limit ? limit : null;

      const searchData = searchQuery ? searchQuery : null;


      const response = searchData ? await API.get(`get-all-bill-register?searchBNT=${searchData}&page=${pages}&limit=${limitData}&hubId=${selectedHubId}`, headersOb)
        : await API.get(`get-all-bill-register?page=${pages}&limit=${limitData}&hubId=${selectedHubId}`, headersOb);
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


  const saveNewRow = async () => {
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
      title: 'Bill Number',
      dataIndex: 'billNumber',
      key: 'billNumber',
      width:160,
    },
    {
      title: 'Bill Type',
      dataIndex: 'billType',
      key: 'billType',
      width:160,
    },
    {
      title: 'Value Raised',
      dataIndex: 'valueRaised',
      key: 'valueRaised',
      width:160,
    },
    {
      title: 'Value Received',
      dataIndex: 'valueReceived',
      key: 'valueReceived',
      width:160,
    },
    {
      title: 'tax',
      dataIndex: 'tax',
      key: 'tax',
      width:160,
    },
    {
      title: 'Difference',
      dataIndex: 'difference',
      key: 'difference',
      width:160,
    },
    {
      title: 'Remarks',
      dataIndex: 'remarks',
      key: 'remarks',
      width:160,
    },

    {
      title: 'Action',
      key: 'operation',
      fixed:'right',
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
              {/* <a><FormOutlined /></a> */}
              <a onClick={()=>handleEditRow(record)}><FormOutlined /></a>
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
      <div className='w-100 h-auto flex flex-col gap-2 bg-gray-50'>
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
      {
        title: 'Invoice Date',
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
          );
        },
      },
      {
        title: 'QTY',
        dataIndex: 'quantityInMetricTons',
        key: 'quantityInMetricTons',
        render: (text, record) => {
          const editable = isEditing(record);
          return editable ? (
            <Form.Item
              name="quantityInMetricTons"
              style={{ margin: 0 }}
              rules={[{ required: true, message: 'Please input Qty!' }]}
            >
              <Input />
            </Form.Item>
          ) : (
            text
          );
        },
      },
      {
        title: 'rate',
        dataIndex: 'rate',
        key: 'rate',
        render: (text, record) => {
          const editable = isEditing(record);
          return editable ? (
            <Form.Item
              name="rate"
              style={{ margin: 0 }}
              rules={[{ required: true, message: 'Please input Rate!' }]}
            >
              <Input />
            </Form.Item>
          ) : (
            text
          );
        },
      },

      {
        title: 'Total',
        dataIndex: 'totalExpense',
        key: 'totalExpense',
        render: (text, record) => {
          const editable = isEditing(record);
          return editable ? (
            <Form.Item
              name="totalExpense"
              style={{ margin: 0 }}
              rules={[{ required: true, message: 'Please input totalExpense!' }]}
            >
              <Input />
            </Form.Item>
          ) : (
            text
          );
        },
      },


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
              {/* <Tooltip placement="top" title="Edit">
                <a onClick={() => edit(record)}><FormOutlined /></a>
              </Tooltip> */}
              {/* <Popconfirm title="Sure to delete?" onConfirm={() => handleDeleteLedgerData(record.key)}>
                <Tooltip placement="top" title="Delete">
                  <a><DeleteOutlined /></a>
                </Tooltip>
              </Popconfirm> */}
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
      await API.delete(`delete-bill-register-data/${key}`, headersOb)
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

  const BillRegisterFormComponent = () => {
    const [DONumberData, setDONumberData] = useState([]);
    const [targetKeys, setTargetKeys] = useState([]);
  
    const getDONumber = async () => {

      try {

        const res = await API.get(`get-all-recovery-delivery?hubId=${selectedHubId}&page=1&limit=600`, headersOb)
          .then((response) => {
            console.log(response.data)
            if (response.status == 201 && response.data.message == "Successfully retrived all delivery numbers informations") {
              const deliveryData = response.data.deliveryData.map((item, index) => ({
                key: item._id,
                deliveryNumber: item.deliveryNumber,
              }));
              setDONumberData(deliveryData);
            } else {
              setDONumberData([]);
            }

          }).catch((error) => {
            console.log(error)
          })
      } catch (err) {
        console.log(err);
      }

    };

    useEffect(() => {
      getDONumber();
    }, []);
  
    const handleChangeTransfer = (newTargetKeys) => {
      setTargetKeys(newTargetKeys);
    };
  
    const renderFooter = (_, info) => {
      if (info?.direction === 'left') {
        return (
          <Button size="small" style={{ float: 'left', margin: 5 }} onClick={getDONumber}>
            reload
          </Button>
        );
      }
      return (
        <Button size="small" style={{ float: 'right', margin: 5 }} onClick={getDONumber}>
          reload
        </Button>
      );
    };
  
    const [formData, setFormData] = useState({
    
      billNumber: '',
      billType: '',
      challan: [],
      remarks: '',
      tax: '',
      valueRaised: '',
      hubId: selectedHubId,
    });
  
    const onResetClick = () => {
      console.log('reset clicked')
      setFormData({
       
        billNumber: '',
        billType: '',
        challan: [],
        remarks: '',
        tax: '',
        valueRaised: '',
        hubId: selectedHubId,
      });
      setTargetKeys([]);
    };
  
    const handleChange = (name, value) => {
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: value,
      }));
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      const payload = {
        billNumber: formData.billNumber,
        billType: formData.billType,
        challan: targetKeys,
        remarks: formData.remarks,
        tax: formData.tax,
        valueRaised: formData.valueRaised,
        hubId:selectedHubId
      };
  
      const headersOb = {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        }
      };
  
      try {
        const response = await API.post('create-bill-register', payload, headersOb);
        console.log('Bill registered successfully:', response.data);
        alert("Bill registered successfully");
        window.location.reload();
      } catch (error) {
        console.error('Error registering bill:', error);
        alert("Error occurred while registering bill");
      }
    };
  
    const goBack = () => {
      setShowTabs(true);
      setShowAddRecoveryForm(false);
    };
  
    return (
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-4">
            <div className="flex">
              <img src={backbutton_logo} alt="backbutton_logo" className='w-5 h-5 object-cover cursor-pointer' onClick={goBack} />
            </div>
            <div className="flex flex-col">
              <h1 className='font-bold' style={{ fontSize: "16px" }}>Create Bill</h1>
              <Breadcrumb
                items={[
                  { title: 'Bill Register' },
                  { title: 'Create' },
                ]}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
              
              <Col className="gutter-row mt-6" span={8}>
                <Input
                  placeholder="Bill Number*"
                  size="large"
                  name="billNumber"
                  onChange={(e) => handleChange('billNumber', e.target.value)}
                />
              </Col>
              <Col className="gutter-row mt-6" span={6}>
                <Select
                  style={{ width: "100%" }}
                  placeholder="Bill Type*"
                  size="large"
                  name="billType"
                  onChange={(value) => handleChange('billType', value)}
                  filterOption={filterOption}
                >
                  <Option key={1} value="Physical">Physical</Option>
                  <Option key={2} value="Epod">Epod</Option>
                  <Option key={3} value="Incentive">Incentive</Option>
                </Select>
              </Col>
              <Col className="gutter-row mt-6" span={8}>
                <Input
                  placeholder="Value Raised*"
                  size="large"
                  name="valueRaised"
                  onChange={(e) => handleChange('valueRaised', e.target.value)}
                />
              </Col>
            </Row>
            <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
             
              <Col className="gutter-row mt-6" span={8}>
                <Input
                  placeholder="Tax*"
                  size="large"
                  name="tax"
                  onChange={(e) => handleChange('tax', e.target.value)}
                />
              </Col>
              <Col className="gutter-row mt-6" span={14}>
                <Input
                  placeholder="Remarks"
                  size="large"
                  name="remarks"
                  onChange={(e) => handleChange('remarks', e.target.value)}
                />
              </Col>
              
            </Row>
            <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
              <Col className="gutter-row mt-6" span={16}>
              <Transfer
                    dataSource={DONumberData}
                    showSearch
                    listStyle={{
                      width: 650,
                      height: 300,
                    }}
                    operations={['', '']}
                    targetKeys={targetKeys}
                    onChange={handleChangeTransfer}
                    render={(item) => `${item.deliveryNumber}`}
                    footer={renderFooter}
                  />
              </Col>
            </Row>
          </div>
        </div>
        <div className="flex gap-4 items-center justify-center reset-button-container">
          <Button onClick={onResetClick}>Reset</Button>
          <Button type="primary" className="bg-primary" onClick={handleSubmit}>Save</Button>
        </div>
      </div>
    );
  };

  
  const EditBillRegisterFormComponent = () => {
    console.log(editRowData)
    const [DONumberData, setDONumberData] = useState([]);
    const [targetKeys, setTargetKeys] = useState([]);
  
    const getDONumber = async () => {

      try {

        const res = await API.get(`get-all-recovery-delivery?hubId=${selectedHubId}&page=1&limit=600`, headersOb)
          .then((response) => {
            console.log(response.data)
            if (response.status == 201 && response.data.message == "Successfully retrived all delivery numbers informations") {
              const deliveryData = response.data.deliveryData.map((item, index) => ({
                key: item._id,
                deliveryNumber: item.deliveryNumber,
              }));
              setDONumberData(deliveryData);
            } else {
              setDONumberData([]);
            }

          }).catch((error) => {
            console.log(error)
          })
      } catch (err) {
        console.log(err);
      }

    };

    useEffect(() => {
      getDONumber();
    }, []);
  
    const handleChangeTransfer = (newTargetKeys) => {
      setTargetKeys(newTargetKeys);
    };
  
    const renderFooter = (_, info) => {
      if (info?.direction === 'left') {
        return (
          <Button size="small" style={{ float: 'left', margin: 5 }} onClick={getDONumber}>
            reload
          </Button>
        );
      }
      return (
        <Button size="small" style={{ float: 'right', margin: 5 }} onClick={getDONumber}>
          reload
        </Button>
      );
    };
  
    const [formData, setFormData] = useState({
    
      billNumber: '',
      billType: '',
      challan: [],
      remarks: '',
      tax: '',
      valueRaised: '',
      hubId: selectedHubId,
    });
  
    const onResetClick = () => {
      console.log('reset clicked')
      setFormData({
       
        billNumber: '',
        billType: '',
        challan: [],
        remarks: '',
        tax: '',
        valueRaised: '',
        hubId: selectedHubId,
      });
      setTargetKeys([]);
    };
  
    const handleChange = (name, value) => {
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: value,
      }));
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      const payload = {
        billNumber: formData.billNumber,
        billType: formData.billType,
        challan: targetKeys,
        remarks: formData.remarks,
        tax: formData.tax,
        valueRaised: formData.valueRaised,
        hubId:selectedHubId
      };
  
      const headersOb = {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        }
      };
  
      try {
        const response = await API.post('create-bill-register', payload, headersOb);
        console.log('Bill registered successfully:', response.data);
        alert("Bill registered successfully");
        window.location.reload();
      } catch (error) {
        console.error('Error registering bill:', error);
        alert("Error occurred while registering bill");
      }
    };
  
    const goBack = () => {
      setShowTabs(true);
      setShowAddRecoveryForm(false);
    };
  
    return (
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-4">
            <div className="flex">
              <img src={backbutton_logo} alt="backbutton_logo" className='w-5 h-5 object-cover cursor-pointer' onClick={goBack} />
            </div>
            <div className="flex flex-col">
              <h1 className='font-bold' style={{ fontSize: "16px" }}>Create Bill</h1>
              <Breadcrumb
                items={[
                  { title: 'Bill Register' },
                  { title: 'Create' },
                ]}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
              
              <Col className="gutter-row mt-6" span={8}>
                <Input
                  placeholder="Bill Number*"
                  size="large"
                  name="billNumber"
                  onChange={(e) => handleChange('billNumber', e.target.value)}
                />
              </Col>
              <Col className="gutter-row mt-6" span={6}>
                <Select
                  style={{ width: "100%" }}
                  placeholder="Bill Type*"
                  size="large"
                  name="billType"
                  onChange={(value) => handleChange('billType', value)}
                  filterOption={filterOption}
                >
                  <Option key={1} value="Physical">Physical</Option>
                  <Option key={2} value="Epod">Epod</Option>
                  <Option key={3} value="Incentive">Incentive</Option>
                </Select>
              </Col>
              <Col className="gutter-row mt-6" span={8}>
                <Input
                  placeholder="Value Raised*"
                  size="large"
                  name="valueRaised"
                  onChange={(e) => handleChange('valueRaised', e.target.value)}
                />
              </Col>
            </Row>
            <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
             
              <Col className="gutter-row mt-6" span={8}>
                <Input
                  placeholder="Tax*"
                  size="large"
                  name="tax"
                  onChange={(e) => handleChange('tax', e.target.value)}
                />
              </Col>
              <Col className="gutter-row mt-6" span={14}>
                <Input
                  placeholder="Remarks"
                  size="large"
                  name="remarks"
                  onChange={(e) => handleChange('remarks', e.target.value)}
                />
              </Col>
              
            </Row>
            <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
              <Col className="gutter-row mt-6" span={16}>
              <Transfer
                    dataSource={DONumberData}
                    showSearch
                    listStyle={{
                      width: 650,
                      height: 300,
                    }}
                    operations={['', '']}
                    targetKeys={targetKeys}
                    onChange={handleChangeTransfer}
                    render={(item) => `${item.deliveryNumber}`}
                    footer={renderFooter}
                  />
              </Col>
            </Row>
          </div>
        </div>
        <div className="flex gap-4 items-center justify-center reset-button-container">
          <Button onClick={onResetClick}>Reset</Button>
          <Button type="primary" className="bg-primary" onClick={handleSubmit}>Save</Button>
        </div>
      </div>
    );
  };
  return (
    <>
    {showAddRecoveryForm ?
      <>
        {showEditRecoveryForm ? <EditBillRegisterFormComponent />
          :
          <BillRegisterFormComponent />
        }
      </>
      :
        (

          <div>
            <div className="flex items-center justify-between mb-4">
              <div className='flex gap-2 items-center'>
                {/* <Input.Search
                 placeholder="Search by Delivery  No or Truck No"
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
                Create Bill
              </Button>
            </div>
            <Form form={form} component={false}>
              <Table
                rowKey={(record) => record.key}
                scroll={{ x: "auto", y: 290 }}
                bordered
                dataSource={newRow ? [newRow, ...dataSource] : dataSource}
                columns={columns}
                expandable={{
                  expandedRowRender: (record) => expandedRowRender(record),
                  onExpand: handleTableRowExpand,
                }}
                pagination={false}
                loading={loading}
                // summary={() => (
                //   <Table.Summary.Row >

                //     <Table.Summary.Cell index={0} colSpan={2} style={{ textAlign: 'right', fontWeight: 'bold', backgroundColor: "#fff" }}>

                //     </Table.Summary.Cell>
                //     <Table.Summary.Cell index={0} colSpan={2} style={{ textAlign: 'right', fontWeight: 'bold', backgroundColor: "#eee" }}>
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
               <div className="flex my-4 text-md" style={{ backgroundColor: "#eee", padding: "1rem" }}>

<div style={{ textAlign: 'right', width: '260px' }}>
</div>
<div style={{ fontWeight: 'bold', width: '330px' }}>
Total Outstanding Amount
</div>
<div style={{ fontWeight: 'bold', width: '160px' }}>
  {totalOutstanding > 0 ? <p style={{ color: "green", fontWeight: "600" }}>{totalOutstanding}</p> : <p style={{ color: "red" }}>{totalOutstanding}</p>}
</div>

</div>
            </Form>
          </div>
        )
      }
    </>
  );
};

export default BillRegister;
