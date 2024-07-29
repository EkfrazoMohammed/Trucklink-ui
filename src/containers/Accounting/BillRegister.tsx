import { useState, useEffect } from 'react';
import { Button, Table, Space, Form, Tooltip, Popconfirm, Input, DatePicker, message, InputNumber, Select, Row, Col, Breadcrumb, Transfer, Spin, List } from 'antd';
import type { TransferProps } from 'antd';
import {  UploadOutlined, DownloadOutlined, PrinterOutlined,FormOutlined, DeleteOutlined, RedoOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { API } from "../../API/apirequest"
import backbutton_logo from "../../assets/backbutton.png"
const dateFormat = "DD/MM/YYYY";

const BillRegister = ({ onData, showTabs, setShowTabs }) => {
  const [dataSource, setDataSource] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalValueRaised, setTotalValueRaised] = useState(0)
  const [totalValueReceived, setTotalValueReceived] = useState(0)
  const [totalValueDifference, setTotalValueDifference] = useState(0)
  const [totalValueTax, setTotalValueTax] = useState(0)

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

  const [editRowData, setEditRowData] = useState(null);
  const handleEditRow = (data) => {
    setShowTabs(false);
    setShowAddRecoveryForm(true)
    setShowEditRecoveryForm(true);
    setEditRowData(data);

  };
  const goBack = () => {
    setShowTabs(true);
    setShowAddRecoveryForm(false);
  };

  const getTableData = async (searchQuery, page, limit, selectedHubID) => {
    try {
      setLoading(true);
      const pages = page;
      const limitData = limit ? limit : null;
      const searchData = searchQuery ? searchQuery : null;
      const response = searchData ? await API.get(`get-all-bill-register?searchBNT=${searchData}&page=${pages}&limit=${limitData}&hubId=${selectedHubId}`, headersOb)
        : await API.get(`get-all-bill-register?page=${pages}&limit=${limitData}&hubId=${selectedHubId}`, headersOb);
      const { bill, totalValueRaised, totalValueReceived, totalDifference, totalTax } = response.data || [];
      setTotalValueRaised(totalValueRaised)
      setTotalValueReceived(totalValueReceived)
      setTotalValueDifference(totalDifference)
      setTotalValueTax(totalTax)


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
      // message.error("Error fetching data. Please try again later", 2);
    }
  };

  const [editingKey, setEditingKey] = useState('');
  const [showSaveButton, setShowSaveButton] = useState(false)
  const isEditing = (record) => record.key === editingKey;

  const editValueReceived = (record) => {
    form.setFieldsValue({ ...record });
    setEditingKey(record.key);
    setShowSaveButton(true)
  };


  const saveValueReceived = async (rowData) => {
    console.log(rowData)
    try {
      const row = await form.validateFields();
      const newData = [...dataSource];
      const index = newData.findIndex((item) => rowData.key === item.key);

      if (index > -1) {
        const item = newData[index];
        const updatedItem = { ...item, ...row };

        console.log(updatedItem)

        const payload = { valueRaised: updatedItem.valueRaised, valueReceived: updatedItem.valueReceived }

        // // Update backend API with the updatedItem values
        let res = await API.put(`update-difference-data/${rowData.key}`, payload, headersOb);  // Replace with your API endpoint
        console.log(res)
        if (res.status === 201) {
          message.success("Updated Value Received")
          newData.splice(index, 1, updatedItem);
          setEditingKey('');
          setShowSaveButton(false)
          setTimeout(() => {
            getTableData("", 1, 100000, selectedHubId);
            goBack()
            
          }, 1000)
        } else {
          setShowSaveButton(false)
          console.log('error')
        }

      }
    } catch (errInfo) {
      setShowSaveButton(false)
      console.log('Validate Failed:', errInfo);
    }
  };
  
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageSize, setCurrentPageSize] = useState(10);
  const [activePageSize, setActivePageSize] = useState(10);
      const columns = [
        {
          title: 'Sl No',
          dataIndex: 'serialNumber',
          key: 'serialNumber',
          render: (text, record, index) => (currentPage - 1) * currentPageSize + index + 1,
          width: 80,
          fixed: 'left',
        },
    {
      title: 'Bill Number',
      dataIndex: 'billNumber',
      key: 'billNumber',
      width: 160,
    },
    {
      title: 'Bill Type',
      dataIndex: 'billType',
      key: 'billType',
      width: 160,
    },
    {
      title: 'Value Raised',
      dataIndex: 'valueRaised',
      key: 'valueRaised',
      width: 160,
    },
    {
      title: 'Value Received',
      dataIndex: 'valueReceived',
      key: 'valueReceived',
      width: 200,
      editable: true,  // Enable editing for this column
      render: (_, record) => {
        const editable = isEditing(record);
        return editable ? (
          <>
            <div className='flex gap-2 items-center justify-center'>
              <Form.Item
                name="valueReceived"
                style={{ margin: 0 }}
                rules={[{ required: true, message: 'Please input value received!' }]}
              >
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>

              {showSaveButton ? <>
                <Tooltip placement="top" title="Save Value received">
                  {/* <a><FormOutlined /></a> */}
                  <Button onClick={() => saveValueReceived(record)}>save</Button>
                </Tooltip>
              </> : null}

            </div>

          </>

        ) : (
          <>
            <div className='flex gap-2 items-center justify-center'>

              {record.valueReceived}
              <Tooltip placement="top" title="Edit Value received">
                {/* <a><FormOutlined /></a> */}
                <a onClick={() => editValueReceived(record)} className='p-0 m-0'><FormOutlined /></a>
              </Tooltip>
            </div>
          </>
        );
      },
    },
    {
      title: 'tax',
      dataIndex: 'tax',
      key: 'tax',
      width: 160,
    },
    {
      title: 'Difference',
      dataIndex: 'difference',
      key: 'difference',
      width: 160,
      render: (_,record) => {
        return (
          <p>{parseFloat(record.difference).toFixed(2)}</p>
        )
      }
    },
    {
      title: 'Remarks',
      dataIndex: 'remarks',
      key: 'remarks',
      width: 160,
    },

    {
      title: 'Action',
      key: 'operation',
      fixed: 'right',
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
              <a onClick={() => handleEditRow(record)}><FormOutlined /></a>
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
  const handleTableRowExpand = async (expanded, record) => {
    if (expanded) {
      try {
        if (record && record.key !== "") {
          // const response = await API.get(`get-ledger-data/${record.key}&hubId=${selectedHubId}`, headersOb);
          const response = await API.get(`get-delivery-data/${record.key}`, headersOb);
          const ledgerEntries = response.data.deliveryDetails.challan;

          const dataSource = ledgerEntries.map((data) => {
            console.log(data)

            return {
              ...data,
              "quantityInMetricTons": data.quantityInMetricTons,
              "rate": data.rate,
              "totalExpense": data.totalExpense,
              "deliveryLocation": data.deliveryLocation,
              "vehicleNumber": data.vehicleNumber,
              "deliveryNumber": data.deliveryNumber,
              "invoiceDate": data.grDate,

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
        setNewRow(null);
      });
    } catch (errInfo) {
      console.log("Validate Failed:", errInfo);
    }
  };

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
              getTableData("", "1", "100000", selectedHubId);
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
      console.log("row", record)
      console.log("challan", key)
      try {
        // Retrieve the existing data to prepare the payload
        const response = await API.get(`get-delivery-data/${record.key}`, headersOb);
        const existingData = response.data.deliveryDetails;
        console.log(existingData)
        // Remove the item from the challan list
        const updatedChallan = existingData.challan.filter(challanItem => challanItem._id !== key);
        console.log(updatedChallan)
        // Prepare the payload
        const payload = {
          _id: existingData._id,
          valueRaised: existingData.valueRaised.toFixed(2),
          valueReceived: existingData.valueReceived.toFixed(2),
          tax: existingData.tax.toFixed(2),
          difference: existingData.difference.toFixed(2),
          challan: updatedChallan.map(item => item._id),
          billNumber: existingData.billNumber,
          billType: existingData.billType,
          remarks: existingData.remarks,
          hubId: existingData.hubId,
          createdAt: existingData.createdAt,
          modifiedAt: new Date().toISOString(), // update the modifiedAt field
          __v: existingData.__v,
          // slno: existingData.slno
        };

        // // Send the PUT request to update the bill register data
        await API.put(`update-bill-register-data/${existingData._id}`, payload, headersOb)
          .then(() => {
            message.success("Successfully Deleted Ledger Entry");
            setTimeout(() => {
              getTableData("", 1, 100000, selectedHubId);
              goBack()
            }, 1000)

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
        title: 'Sl No',
        dataIndex: 'serialNumber',
        key: 'serialNumber',
        render: (text, record, index) => index + 1,
        width: 80,
        fixed: 'left',
      },
      {
        title: 'Invoice Date',
        dataIndex: 'grDate',
        key: 'grDate',
        render: (text, record) => {
          const editable = isEditing(record);
          return editable ? (
            <Form.Item
              name="grDate"
              style={{ margin: 0 }}
              rules={[{ required: true, message: 'Please input date!' }]}
            >
              <DatePicker format={dateFormat} />
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
        title: 'Rate',
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
            (record.rate) * (record.quantityInMetricTons)
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
    // const calculateTotalExpense = () => {
    //   return entries.reduce((total, entry) => total + parseFloat(entry.totalExpense || 0), 0).toFixed(2);
    // };
    //  const calculateTotalExpense = () => {
    //   return entries.reduce((total, entry) => total + parseFloat(entry.totalExpense || 0), 0).toFixed(2);
    // };
    const calculateTotal = () => {
      const total = entries.reduce((total, entry) => {
        const rate = parseFloat(entry.rate);
        const qty = parseFloat(entry.quantityInMetricTons);
    
        console.log('Rate:', rate, 'Type:', typeof rate);
        console.log('Quantity:', qty, 'Type:', typeof qty);
    
        // Check if rate and qty are valid numbers, if not set them to 0
        const validRate = isNaN(rate) ? 0 : rate;
        const validQty = isNaN(qty) ? 0 : qty;
    
        return parseFloat(total) + parseFloat(validRate * validQty);
      }, 0);
    
      const roundedTotal = Math.round(total * 100) / 100;
      console.log('Total Expense:', roundedTotal, 'Type:', typeof roundedTotal);
    
      return roundedTotal;
    };
    
   
    



    return (
      <div className='bg-[#BBE2FF] p-4'>

        <Form form={form} component={false}>
          <Table
            rowKey={(record) => record.key}
            bordered
            dataSource={entries}
            columns={columnsInsideRow}
            pagination={false}
            summary={() => (
              <Table.Summary.Row>
                <Table.Summary.Cell colSpan={columnsInsideRow.length - 2} align="right">
                  Total
                </Table.Summary.Cell>
                <Table.Summary.Cell>
                  {calculateTotal()}
                </Table.Summary.Cell>
              </Table.Summary.Row>
            )}
          />
        </Form>
      </div>
    );
  };
  const handleDeleteOwnerData = async (key) => {
    try {
      await API.delete(`delete-bill-register-data/${key}`, headersOb)
        .then(() => {
          message.success("Successfully Deleted Bill Entry");
          setTimeout(() => {
            getTableData("", 1, 100000, selectedHubId);
            goBack()
          }, 1000)
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
    getTableData("", "1", "100000", selectedHubId);

  }, []);
  const BillRegisterFormComponent = () => {
    const [DONumberData, setDONumberData] = useState([]);
    const [selectedDONumberData, setSelectedDONumberData] = useState([]);
    const [formData, setFormData] = useState({
      billNumber: '',
      billType: '',
      challan: [],
      remarks: '',
      tax: '',
      valueRaised: '',
      hubId: selectedHubId,
    });
    const [loading, setLoading] = useState(false);
    const [availableSearchText, setAvailableSearchText] = useState('');
    const [selectedSearchText, setSelectedSearchText] = useState('');

    const headersOb = {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authToken}`
      }
    };

    const getDONumber = async () => {
      try {
        setLoading(true);
        const response = await API.get(`get-all-bill-delivery?hubId=${selectedHubId}&page=1&limit=600`, headersOb);
        if (response.status === 201 && response.data.message === "Successfully retrived all delivery numbers informations") {
          const deliveryData = response.data.deliveryData.map((item) => ({
            key: item._id,
            deliveryNumber: item.deliveryNumber,
          }));
          setDONumberData(deliveryData);
        } else {
          setDONumberData([]);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching delivery numbers:', err);
        setLoading(false);
        message.error("Failed to fetch delivery numbers");
      }
    };

    useEffect(() => {
      getDONumber();
    }, []);

    const addDerivedDoList = (item) => {
      setSelectedDONumberData((prevData) => [...prevData, item]);
      setFormData((prevFormData) => ({
        ...prevFormData,
        challan: [...prevFormData.challan, item.key],
      }));
      setDONumberData((prevData) => prevData.filter(dataItem => dataItem.key !== item.key));
    };

    const removeDerivedDoList = (item) => {
      setSelectedDONumberData((prevData) => prevData.filter(dataItem => dataItem.key !== item.key));
      setFormData((prevFormData) => ({
        ...prevFormData,
        challan: prevFormData.challan.filter(key => key !== item.key),
      }));
      setDONumberData((prevData) => [...prevData, item]);
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
        challan: formData.challan,
        remarks: formData.remarks,
        tax: formData.tax,
        valueRaised: formData.valueRaised,
        hubId: formData.hubId,
      };

      try {
        const response = await API.post('create-bill-register', payload, headersOb);
        console.log('Bill registered successfully:', response.data);
        message.success("Bill registered successfully");
        setTimeout(()=>{
          getTableData("", 1, 100000, selectedHubId);
          goBack()
        },1000)
      } catch (error) {
        console.error('Error registering bill:', error);
        if (error.response.data.message == "This billNumber already exists") {
          message.error("This Bill Number already exists");
        } else {

          message.error("Error occurred while registering bill");
        }
      }
    };



    const onResetClick = () => {
      setFormData({
        billNumber: '',
        billType: '',
        challan: [],
        remarks: '',
        tax: '',
        valueRaised: '',
        hubId: selectedHubId,
      });
      setSelectedDONumberData([]);
      setDONumberData([]);
      getDONumber();
    };

    return (
      <Spin spinning={loading} delay={100}>
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
                    value={formData.billNumber}
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
                  >
                    <Select.Option key={1} value="Physical">Physical</Select.Option>
                    <Select.Option key={2} value="Epod">Epod</Select.Option>
                    <Select.Option key={3} value="Incentive">Incentive</Select.Option>
                  </Select>
                </Col>
                <Col className="gutter-row mt-6" span={8}>
                  <Input
                    placeholder="Value Raised*"
                    size="large"
                    name="valueRaised"
                    value={formData.valueRaised}
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
                    value={formData.tax}
                    onChange={(e) => handleChange('tax', e.target.value)}
                  />
                </Col>
                <Col className="gutter-row mt-6" span={14}>
                  <Input
                    placeholder="Remarks"
                    size="large"
                    name="remarks"
                    value={formData.remarks}
                    onChange={(e) => handleChange('remarks', e.target.value)}
                  />
                </Col>
              </Row>
              <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
                <Col className="gutter-row mt-6" span={8}>
                  <h3 className="title">Available Delivery Numbers</h3>
                  <div className="master-data-maindiv delivery-number-drag-area">
                    <div className="searchdiv">
                      <Input.Search
                        className="searchdata"
                        onChange={(e) => setAvailableSearchText(e.target.value)}
                        placeholder="Search"
                        size='large'
                        value={availableSearchText}
                      />
                    </div>
                    <List
                      style={{ height: "180px", overflowY: "scroll" }}
                      dataSource={DONumberData.filter(item =>
                        item.deliveryNumber.includes(availableSearchText)
                      )}
                      renderItem={item => (
                        <List.Item
                          actions={[
                            <Button type="primary" onClick={() => addDerivedDoList(item)}>
                              ADD
                            </Button>
                          ]}
                        >
                          <List.Item.Meta title={item.deliveryNumber} />
                        </List.Item>
                      )}
                    />
                  </div>
                </Col>
                <Col className="gutter-row mt-6" span={8}>
                  <h3 className="title">Selected Delivery Numbers</h3>
                  <div className="master-data-maindiv delivery-number-drag-area">
                    <div className="searchdiv">
                      <Input.Search
                        className="searchdata"
                        onChange={(e) => setSelectedSearchText(e.target.value)}
                        placeholder="Search"
                        size='large'
                        value={selectedSearchText}
                      />
                    </div>
                    <List
                      style={{ height: "180px", overflowY: "scroll" }}
                      dataSource={selectedDONumberData.filter(item =>
                        item.deliveryNumber.includes(selectedSearchText)
                      )}
                      renderItem={item => (
                        <List.Item
                          actions={[
                            <Button type="primary" onClick={() => removeDerivedDoList(item)}>
                              REMOVE
                            </Button>
                          ]}
                        >
                          <List.Item.Meta title={item.deliveryNumber} />
                        </List.Item>
                      )}
                    />
                  </div>
                </Col>
              </Row>
            </div>
          </div>
          <div className="flex gap-4 items-center justify-center reset-button-container">
            <Button onClick={onResetClick}>Reset</Button>
            <Button type="primary" className="bg-primary" onClick={handleSubmit}>Save</Button>
          </div>
        </div>
      </Spin>
    );
  };
  const EditBillRegisterFormComponent = () => {
    const [DONumberData, setDONumberData] = useState([]);
    const [selectedDONumberData, setSelectedDONumberData] = useState([]);
    const [formData, setFormData] = useState({
      billNumber: editRowData.billNumber,
      billType: editRowData.billType,
      challan: [],
      remarks: editRowData.remarks,
      tax: editRowData.tax,
      valueRaised: editRowData.valueRaised,
      hubId: selectedHubId,
    });
    const [loading, setLoading] = useState(false);
    const [availableSearchText, setAvailableSearchText] = useState('');
    const [selectedSearchText, setSelectedSearchText] = useState('');

    const headersOb = {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authToken}`
      }
    };

    const getDONumber = async () => {

      try {

        const res = await API.get(`get-all-bill-delivery?hubId=${selectedHubId}&page=1&limit=600`, headersOb)
          .then((response) => {
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


    const getExistingData = async () => {
      try {
        const response = await API.get(`get-delivery-data/${editRowData.key}`, headersOb);
        if (response.status === 201) {
          const deliveryData = response.data.deliveryDetails.challan.map((item) => ({
            key: item._id,
            deliveryNumber: item.deliveryNumber,
          }));
          setSelectedDONumberData(deliveryData);
          setFormData((prevFormData) => ({
            ...prevFormData,
            challan: deliveryData.map(item => ({ id: item.key, deliveryNumber: item.deliveryNumber })),
          }));
        }
      } catch (error) {
        console.error('Error fetching existing data:', error);
      }
    };

    useEffect(() => {
      getExistingData();
      getDONumber();
    }, []);

    const addDerivedDoList = (item) => {
      setSelectedDONumberData((prevData) => [...prevData, item]);
      setFormData((prevFormData) => ({
        ...prevFormData,
        challan: [...prevFormData.challan, { id: item.key, deliveryNumber: item.deliveryNumber }],
      }));
      setDONumberData((prevData) => prevData.filter(dataItem => dataItem.key !== item.key));
    };

    const removeDerivedDoList = (item) => {
      setSelectedDONumberData((prevData) => prevData.filter(dataItem => dataItem.key !== item.key));
      setFormData((prevFormData) => ({
        ...prevFormData,
        challan: prevFormData.challan.filter(key => key !== item.key),
      }));
      setDONumberData((prevData) => [...prevData, item]);
    };

    const handleChange = (name, value) => {
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: value,
      }));
    };
    const [pay, setPay] = useState(null)
    const handleSubmit = async (e) => {
      e.preventDefault();
      const payload = {
        billNumber: formData.billNumber,
        billType: formData.billType,
        // challan: formData.challan,
        challan: formData.challan.map(challanItem => challanItem.id),
        remarks: formData.remarks,
        tax: formData.tax,
        valueRaised: formData.valueRaised,
        hubId: formData.hubId,
      };

      setPay(payload)

      try {
        const response = await API.put(`update-bill-register-data/${editRowData.key}`, payload, headersOb);
        console.log('Bill updated successfully:', response.data);
        message.success("Bill updated successfully");
        setTimeout(()=>{
          getTableData("", 1, 100000, selectedHubId);
          goBack()
        },1000)
      } catch (error) {
        console.error('Error registering bill:', error);
        if (error.response.data.message == "This billNumber already exists") {
          message.error("This Bill Number already exists");
        } else {
          message.error("Error occurred while registering bill");
        }
      }
    };

    const goBack = () => {
      setShowTabs(true);
      setShowAddRecoveryForm(false);
    };

    const onResetClick = () => {
      setFormData({
        billNumber: '',
        billType: '',
        challan: [],
        remarks: '',
        tax: '',
        valueRaised: '',
        hubId: selectedHubId,
      });
      setSelectedDONumberData([]);
      setDONumberData([]);
      getDONumber();
    };

    return (
      <Spin spinning={loading} delay={100}>
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-4">
              <div className="flex">
                <img src={backbutton_logo} alt="backbutton_logo" className='w-5 h-5 object-cover cursor-pointer' onClick={goBack} />
              </div>
              <div className="flex flex-col">
                <h1 className='font-bold' style={{ fontSize: "16px" }}>Edit Bill</h1>
                <Breadcrumb
                  items={[
                    { title: 'Bill Register' },
                    { title: 'Edit' },
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
                    value={formData.billNumber}
                    onChange={(e) => handleChange('billNumber', e.target.value)}
                  />
                </Col>
                <Col className="gutter-row mt-6" span={6}>
                  <Select
                    style={{ width: "100%" }}
                    placeholder="Bill Type*"
                    size="large"
                    name="billType"
                    value={editRowData.billType}
                    onChange={(value) => handleChange('billType', value)}
                  >
                    <Select.Option key={1} value="Physical">Physical</Select.Option>
                    <Select.Option key={2} value="Epod">Epod</Select.Option>
                    <Select.Option key={3} value="Incentive">Incentive</Select.Option>
                  </Select>
                </Col>
                <Col className="gutter-row mt-6" span={8}>
                  <Input
                    placeholder="Value Raised*"
                    size="large"
                    name="valueRaised"
                    value={formData.valueRaised}
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
                    value={formData.tax}
                    onChange={(e) => handleChange('tax', e.target.value)}
                  />
                </Col>
                <Col className="gutter-row mt-6" span={14}>
                  <Input
                    placeholder="Remarks"
                    size="large"
                    name="remarks"
                    value={formData.remarks}
                    onChange={(e) => handleChange('remarks', e.target.value)}
                  />
                </Col>
              </Row>
              <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
                <Col className="gutter-row mt-6" span={8}>
                  <h3 className="title">Available Delivery Numbers</h3>
                  <div className="master-data-maindiv delivery-number-drag-area">
                    <div className="searchdiv">
                      <Input.Search
                        className="searchdata"
                        onChange={(e) => setAvailableSearchText(e.target.value)}
                        placeholder="Search"
                        size='large'
                        value={availableSearchText}
                      />
                    </div>
                    <List
                      style={{ height: "180px", overflowY: "scroll" }}
                      dataSource={DONumberData.filter(item =>
                        item.deliveryNumber.includes(availableSearchText)
                      )}
                      renderItem={item => (
                        <List.Item
                          actions={[
                            <Button type="primary" onClick={() => addDerivedDoList(item)}>
                              ADD
                            </Button>
                          ]}
                        >
                          <List.Item.Meta title={item.deliveryNumber} />
                        </List.Item>
                      )}
                    />
                  </div>
                </Col>
                <Col className="gutter-row mt-6" span={8}>
                  <h3 className="title">Selected Delivery Numbers</h3>
                  <div className="master-data-maindiv delivery-number-drag-area">
                    <div className="searchdiv">
                      <Input.Search
                        className="searchdata"
                        onChange={(e) => setSelectedSearchText(e.target.value)}
                        placeholder="Search"
                        size='large'
                        value={selectedSearchText}
                      />
                    </div>
                    <List
                      style={{ height: "180px", overflowY: "scroll" }}
                      dataSource={selectedDONumberData.filter(item =>
                        item.deliveryNumber.includes(selectedSearchText)
                      )}
                      renderItem={item => (
                        <List.Item
                          actions={[
                            <Button type="primary" onClick={() => removeDerivedDoList(item)}>
                              REMOVE
                            </Button>
                          ]}
                        >
                          <List.Item.Meta title={item.deliveryNumber} />
                        </List.Item>
                      )}
                    />
                  </div>
                </Col>
              </Row>
            </div>
          </div>

          <div className="flex gap-4 items-center justify-center reset-button-container">
            <Button onClick={onResetClick}>Reset</Button>
            <Button type="primary" className="bg-primary" onClick={handleSubmit}>Save</Button>
          </div>
        </div>
      </Spin>
    );
  };

  const initialSearchQuery = localStorage.getItem('searchQuery8') || '';
  const [searchQuery8, setSearchQuery8] = useState<string>(initialSearchQuery);

  // Update localStorage whenever searchQuery8 changes
  useEffect(() => {
    if (searchQuery8 !== initialSearchQuery) {
      localStorage.setItem('searchQuery8', searchQuery8);
    }
  }, [searchQuery8, initialSearchQuery]);

  const handleSearch = () => {
    getTableData(searchQuery8, 1, 100000, selectedHubId);
  };

  const onChangeSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery8(value);
    console.log(value);
    if (value === "") {
      onReset();
    }
  };

  const onReset = () => {
    setSearchQuery8("");
    setLoading(false)
    localStorage.removeItem('searchQuery8');
    getTableData("", 1, 100000, selectedHubId);
  };
  const handlePageSizeChange = (newPageSize) => {
    setCurrentPageSize(newPageSize);
    setCurrentPage(1); // Reset to the first page
    setActivePageSize(newPageSize); // Update the active page size
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
                <Input.Search
                  placeholder="Search by Bill No or Bill Type"
                  size='large'
                  value={searchQuery8}
                  onChange={onChangeSearch}
                  onSearch={handleSearch}
                  style={{ width: 320 }}
                />

                {/* <DatePicker
                  size='large'
                  placeholder='From date'
                /> -
                <DatePicker
                  size='large'
                  placeholder='To date'
                /> */}
                {searchQuery8 !== null && searchQuery8 !== "" ? <><Button size='large' onClick={onReset} style={{ rotate: "180deg" }} icon={<RedoOutlined />}></Button></> : <></>}

              </div>

              <Button
                onClick={handleAdd}
                type="primary"
              >
                CREATE BILL
              </Button>
            </div>

        
  
      <div className='flex gap-2 mb-2 items-center justify-end'>
          {/* <Button icon={<DownloadOutlined />}></Button>
          <Button icon={<PrinterOutlined />}></Button> */}

          <div className='flex   my-paginations '>
            <span className='bg-[#F8F9FD] p-1'>
              <Button
                onClick={() => handlePageSizeChange(10)}
                style={{
                  backgroundColor: activePageSize === 10 ? 'grey' : 'white',
                  color: activePageSize === 10 ? 'white' : 'black',
                  borderRadius: activePageSize === 10 ? '6px' : '0',
                  boxShadow: activePageSize === 10 ? '0px 0px 4px 0px #00000040' : 'none',
                }}
              >
                10
              </Button>
              <Button
                onClick={() => handlePageSizeChange(25)}
                style={{
                  backgroundColor: activePageSize === 25 ? 'grey' : 'white',
                  color: activePageSize === 25 ? 'white' : 'black',
                  borderRadius: activePageSize === 25 ? '6px' : '0',
                  boxShadow: activePageSize === 25 ? '0px 0px 4px 0px #00000040' : 'none',
                }}
              >
                25
              </Button>
              <Button
                onClick={() => handlePageSizeChange(50)}
                style={{
                  backgroundColor: activePageSize === 50 ? 'grey' : 'white',
                  color: activePageSize === 50 ? 'white' : 'black',
                  borderRadius: activePageSize === 50 ? '6px' : '0',
                  boxShadow: activePageSize === 50 ? '0px 0px 4px 0px #00000040' : 'none',
                }}
              >
                50
              </Button>
              <Button
                onClick={() => handlePageSizeChange(100)}
                style={{
                  backgroundColor: activePageSize === 100 ? 'grey' : 'white',
                  color: activePageSize === 100 ? 'white' : 'black',
                  borderRadius: activePageSize === 100 ? '6px' : '0',
                  boxShadow: activePageSize === 100 ? '0px 0px 4px 0px #00000040' : 'none',
                }}
              >
                100
              </Button>
            </span>
          </div>
        </div>
            <Form form={form} component={false}>
              <Table
                rowKey={(record) => record.key}
                scroll={{ x: "auto" }}
                bordered
                dataSource={newRow ? [newRow, ...dataSource] : dataSource}
                // columns={columns}
                columns={columns.map((col) => ({
                  ...col,
                  onCell: (record) => ({
                    record,
                    editable: col.editable,
                    dataIndex: col.dataIndex,
                    title: col.title,
                    editing: isEditing(record),
                  }),
                }))}
                expandable={{
                  expandedRowRender: (record) => expandedRowRender(record),
                  onExpand: handleTableRowExpand,
                }}
                pagination={{
                  showSizeChanger: false,
                  position: ['bottomCenter'],
                  current: currentPage,
                  pageSize: currentPageSize,
                  onChange: (page) => {
                    setCurrentPage(page);
                  },
                }}
                // antd site header height
                sticky={{
                  offsetHeader: 5,
                }}
                loading={loading}

              />
              <div className="flex my-4 text-md" style={{ backgroundColor: "#eee", padding: "1rem" }}>

                <div style={{ textAlign: 'right', width: '280px' }}>
                </div>
                <div style={{ fontWeight: 'bold', width: '140px' }}>
                  Total
                </div>
                <div style={{ fontWeight: 'bold', width: '160px' }}>
                  {totalValueRaised > 0 ? <p style={{ color: "green", fontWeight: "600" }}>{parseFloat(totalValueRaised).toFixed(2)}</p> : <p style={{ color: "red" }}>{parseFloat(totalValueRaised).toFixed(2)}</p>}
                </div>
                <div style={{ fontWeight: 'bold', width: '160px' }}>
                  {totalValueReceived > 0 ? <p style={{ color: "green", fontWeight: "600" }}>{parseFloat(totalValueReceived).toFixed(2)}</p> : <p style={{ color: "red" }}>{parseFloat(totalValueReceived).toFixed(2)}</p>}
                </div>
                <div style={{ fontWeight: 'bold', width: '160px' }}>
                  {totalValueTax > 0 ? <p style={{ color: "green", fontWeight: "600" }}>{parseFloat(totalValueTax).toFixed(2)}</p> : <p style={{ color: "red" }}>{parseFloat(totalValueTax).toFixed(2)}</p>}
                </div>
                <div style={{ fontWeight: 'bold', width: '120px' }}>
                  {totalValueDifference > 0 ? <p style={{ color: "green", fontWeight: "600" }}>{parseFloat(totalValueDifference).toFixed(2)}</p> : <p style={{ color: "red" }}>{parseFloat(totalValueDifference).toFixed(2)}</p>}
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
