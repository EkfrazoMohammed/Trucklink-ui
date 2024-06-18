import { useState, useEffect } from 'react';
import { Button, Table, Space, Form, Tooltip, Popconfirm, Input, DatePicker, message, InputNumber, Select, Row, Col, Breadcrumb, Transfer, Spin, List } from 'antd';
import type { TransferProps } from 'antd';
import { FormOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import moment from "moment";
import dayjs, { locale } from 'dayjs';
import { API } from "../../API/apirequest"
import backbutton_logo from "../../assets/backbutton.png"
import axios from "axios"

interface RecordType {
  key: string;
  title: string;
  description: string;
  chosen: boolean;
}

const RecoveryRegister = ({ onData, showTabs, setShowTabs }) => {
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

  const getTableData = async (searchQuery, page, limit, selectedHubID) => {
    try {
      setLoading(true);

      const pages = page;
      const limitData = limit ? limit : null;

      const searchData = searchQuery ? searchQuery : null;


      const response = searchData ? await API.get(`get-all-recovery-details?searchDN=${searchData}&page=${pages}&limit=${limitData}&hubId=${selectedHubId}`, headersOb)
        : await API.get(`get-all-recovery-details?page=${pages}&limit=${limitData}&hubId=${selectedHubID}`, headersOb);
      const { recovery, totalOutstanding } = response.data || [];
      setTotalOutstanding(totalOutstanding)
      if (recovery && recovery[0].data.length > 0) {
        const dataSource = recovery[0].data.map((data) => {
          const { recovered, outstanding, recoveryCode, value } = data;
          const intDate = dayjs(data.createdAt, "DD/MM/YYYY");
          return {
            key: data._id,
            recovered, // Adjusted for array structure
            outstanding,
            intDate,
            recoveryCode,
            value,
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
          // const response = await API.get(`get-ledger-data/${record.key}?hubId=${selectedHubId}&page=1&limit=600`, headersOb);
          const response = await API.get(`get-recovery-challan-data/${record.key}`, headersOb);
          const ledgerEntries = response.data.deliveryDetails.challan;

          const dataSource = ledgerEntries.map((data) => {

            return {
              ...data,
              shortage: data.shortage,
              recovery: data.recovery,
              outstanding: data.outstanding,
              vehicleNumber: data.vehicleNumber,
              deliveryNumber: data.deliveryNumber,
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

  const [showEditRecoveryForm, setShowEditRecoveryForm] = useState(false);

  const [editRowData, setEditRowData] = useState(null);

  const handleAdd = () => {
    setShowTabs(false);
    setShowAddRecoveryForm(true)
    setShowEditRecoveryForm(false);
  };
  const handleEditRow = (data) => {
    setShowTabs(false);
    setShowAddRecoveryForm(true)
    setShowEditRecoveryForm(true);
    setEditRowData(data);

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
        setNewRow(null);
      });
    } catch (errInfo) {
      console.log("Validate Failed:", errInfo);
    }
  };

  const columns = [

    {
      title: 'Code',
      dataIndex: 'recoveryCode',
      key: 'recoveryCode',
      width: 180,

    },
    {
      title: 'Value',
      dataIndex: 'value',
      key: 'value',
      width: 180
    },
    {
      title: 'Recovered',
      dataIndex: 'recovered',
      key: 'recovered',
      width: 180
    },
    {
      title: 'Outstanding Amount',
      dataIndex: 'outstanding',
      key: 'outstanding',

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
        recovery: record.recovery,
        ...record,
      });
      setEditingKeyIn(record.key);
    };

    const cancel = () => {
      setEditingKeyIn("");
    };

    const save = async (key) => {
      console.log(key)
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

          const { recovery } = row;
          console.log(row)


          const payload = {
            recovery: recovery
          };

          await API.put(`update-recovered-value/${record.key}/${key}`, payload, headersOb)
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
        title: 'Truck Number',
        dataIndex: 'vehicleNumber',
        key: 'vehicleNumber',
        render: (text, record) => {
          const editable = isEditing(record);
          return editable ? (
            text
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
            text
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
            text
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
            text
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

    const locale = {
      emptyText: (
        <span>
          <p>
            <ExclamationCircleOutlined style={{ color: "red" }} />
            <span style={{ padding: "5px", textTransform: "initial" }}>
              Please, attach DO number to Recovery.
            </span>
          </p>
        </span>
      ),
    };
    return (
      <div className='bg-[#BBE2FF] p-4'>

        <Form form={form} component={false}>
          <Table
            className='nestedtable-account'
            rowKey={(record) => record.key}
            bordered
            dataSource={entries}
            columns={columnsInsideRow}
            pagination={false}
            locale={locale}
          />
        </Form>
      </div>
    );
  };
  const handleDeleteOwnerData = async (key) => {
    try {
      await API.delete(`delete-recovered-data/${key}`, headersOb)
        .then(() => {
          message.success("Successfully Deleted Recovered Entry");
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
    const [DONumberData, setDONumberData] = useState([]);
    const [selectedDONumberData, setSelectedDONumberData] = useState([]);
    const [formData, setFormData] = useState({
      recoveryCode: '',
      value: '',
      challan: [],
    });
    const [loading, setLoading] = useState(false);
    const [loadingoutside, setLoadingOutside] = useState(false);
    const [originalSearchText, setOriginalSearchText] = useState('');
    const [derivedSearchText, setDerivedSearchText] = useState('');

    const headersOb = {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authToken}`
      }
    };

    const getDONumber = async () => {
      try {
        setLoading(true);
        const response = await API.get(`get-all-recovery-delivery?hubId=${selectedHubId}&page=1&limit=600`, headersOb);
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
        console.log(err);
        setLoading(false);
      }
    };

    useEffect(() => {
      getDONumber();
    }, []);

    const addDerivedDoList = (item) => {
      setSelectedDONumberData((prevKeys) => [...prevKeys, item]);
      const deliveryNumbersList = this.state.deliveryNumbersList.filter(
        (item) => item._id !== data._id
      );
      console.log(deliveryNumbersList)
      setFormData((prevFormData) => ({
        ...prevFormData,
        challan: [...prevFormData.challan, item.key],
      }));
    };

    // const removeDerivedDoList = (item) => {
    //   setSelectedDONumberData((prevKeys) => prevKeys.filter(key => key.key !== item.key));
    //   setFormData((prevFormData) => ({
    //     ...prevFormData,
    //     challan: prevFormData.challan.filter(key => key !== item.key),
    //   }));
    // };
    // Remove item from selected list (RHS)
    const removeDerivedDoList = (item) => {
      setSelectedDONumberData((prevKeys) => prevKeys.filter(key => key.key !== item.key));
      setFormData((prevFormData) => ({
        ...prevFormData,
        challan: prevFormData.challan.filter(key => key !== item.key),
      }));
      // Add removed item back to DONumberData
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
        recoveryCode: formData.recoveryCode,
        value: formData.value,
        challan: selectedDONumberData.map(item => item.key),
        hubId: selectedHubId,
      };
      console.log(payload)
      try {
        const response = await API.post('create-recovery-register', payload, headersOb);
        console.log('Recovery code created successfully:', response.data);
        message.success("Recovery code created successfully");
        setTimeout(() => {
          window.location.reload();
        }, 1000)
      } catch (error) {
        console.error('Error creating recovery code:', error);
        message.error("Error occurred");
      }
    };

    const goBack = () => {
      setShowTabs(true);
      setShowAddRecoveryForm(false);
    };

    const onResetClick = () => {
      setFormData({
        recoveryCode: '',
        value: '',
        challan: [],
      });
      setSelectedDONumberData([]);
    };

    return (
      <Spin spinning={loadingoutside} delay={100}>
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-4">
              <div className="flex">
                <img src={backbutton_logo} alt="backbutton_logo" className='w-5 h-5 object-cover cursor-pointer' onClick={goBack} />
              </div>
              <div className="flex flex-col">
                <h1 className='font-bold' style={{ fontSize: "16px" }}>Create Recovery Code</h1>
                <Breadcrumb
                  items={[
                    { title: 'Recovery Register' },
                    { title: 'Create' },
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
                    value={formData.recoveryCode}
                    onChange={(e) => handleChange('recoveryCode', e.target.value)}
                  />
                </Col>

                <Col className="gutter-row mt-6" span={8}>
                  <Input
                    placeholder="Value*"
                    size="large"
                    name="value"
                    value={formData.value}
                    onChange={(e) => handleChange('value', e.target.value)}
                  />
                </Col>
              </Row>

              <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
                <Col className="gutter-row mt-6" span={8}>
                  <h3 className="title">Add DO number to Recovery Code</h3>
                  <div className="master-data-maindiv delivery-number-drag-area">
                    <div className="searchdiv">
                      <Input.Search
                        className="searchdata"
                        onChange={(e) => setOriginalSearchText(e.target.value)}
                        placeholder="Search"
                        size='large'
                        value={originalSearchText}
                      />
                    </div>
                    {/* <div className="materialTable"> */}
                    <List
                      style={{ height: "180px", overflowY: "scroll" }}
                      dataSource={DONumberData.filter(item =>
                        item.deliveryNumber.includes(originalSearchText) &&
                        !selectedDONumberData.some(selectedItem => selectedItem.key === item.key)
                      )}
                      renderItem={item => (
                        <List.Item
                          // style={{padding:0,margin:0}}
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
                    {/* </div> */}
                  </div>
                </Col>

                <Col className="gutter-row mt-6" span={8}>
                  <h3 className="title">DO List</h3>
                  <div className="master-data-maindiv delivery-number-drag-area">
                    <div className="searchdiv">
                      <Input.Search
                        className="searchdata"
                        onChange={(e) => setDerivedSearchText(e.target.value)}
                        placeholder="Search"
                        size='large'
                        value={derivedSearchText}
                      />
                    </div>
                    <div className="materialTable" style={{ height: "10px", width: "100%" }}>
                      <List
                        style={{ height: "180px", overflowY: "scroll" }}
                        dataSource={selectedDONumberData.filter(item =>
                          item.deliveryNumber.includes(derivedSearchText)
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
                  </div>
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
      </Spin>
    );
  };
  const EditRecoveryCodeFormComponent = () => {
    const [DONumberData, setDONumberData] = useState([]);
    const [selectedDONumberData, setSelectedDONumberData] = useState([]);
    const [formData, setFormData] = useState({
      recoveryCode: editRowData.recoveryCode || '',
      value: editRowData.value || '',
      challan: [],
    });
    const [loading, setLoading] = useState(false);
    const [loadingoutside, setLoadingOutside] = useState(false);
    const [originalSearchText, setOriginalSearchText] = useState('');
    const [derivedSearchText, setDerivedSearchText] = useState('');
  
    const headersOb = {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authToken}`
      }
    };
  
    // Fetch all available DO numbers
    const getDONumber = async () => {
      try {
        setLoading(true);
        const response = await API.get(`get-all-recovery-delivery?hubId=${selectedHubId}&page=1&limit=600`, headersOb);
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
        console.log(err);
        setLoading(false);
      }
    };
  
    // Fetch existing data related to the recovery code
    const getExistingData = async () => {
      try {
        const response = await API.get(`get-recovery-challan-data/${editRowData.key}`, headersOb);
        if (response.status === 201) {
          const deliveryData = response.data.deliveryDetails.challan.map((item) => ({
            key: item._id,
            deliveryNumber: item.deliveryNumber,
          }));
          setSelectedDONumberData(deliveryData);
          setFormData((prevFormData) => ({
            ...prevFormData,
            challan: deliveryData.map(item => item.key),
          }));
        }
      } catch (error) {
        console.error('Error fetching existing data:', error);
      }
    };
  
    useEffect(() => {
      getExistingData(); // Fetch existing data first
      getDONumber(); // Fetch all DO numbers
    }, []);
  
    // Add item to selected list (RHS)
    const addDerivedDoList = (item) => {
      setSelectedDONumberData((prevKeys) => [...prevKeys, item]);
      setFormData((prevFormData) => ({
        ...prevFormData,
        challan: [...prevFormData.challan, item.key],
      }));
    };
  
    // Remove item from selected list (RHS)
    const removeDerivedDoList = (item) => {
      setSelectedDONumberData((prevKeys) => prevKeys.filter(key => key.key !== item.key));
      setFormData((prevFormData) => ({
        ...prevFormData,
        challan: prevFormData.challan.filter(key => key !== item.key),
      }));
    };
  
    // Handle input change
    const handleChange = (name, value) => {
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: value,
      }));
    };
  
    // Handle form submission
    const handleSubmit = async (e) => {
      e.preventDefault();
      const payload = {
        recoveryCode: formData.recoveryCode,
        value: formData.value,
        challan: selectedDONumberData.map(item => item.key),
        hubId: selectedHubId,
      };
      try {
        const response = await API.put(`update-recovered-data/${editRowData.key}`, payload, headersOb);
        console.log('Recovery code updated successfully:', response.data);
        message.success("Recovery code updated successfully");
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } catch (error) {
        console.error('Error creating recovery code:', error);
        message.error("Error occurred");
      }
    };
  
    // Go back to the previous view
    const goBack = () => {
      setShowTabs(true);
      setShowAddRecoveryForm(false);
    };
  
    // Reset the form
    const onResetClick = () => {
      setFormData({
        recoveryCode: '',
        value: '',
        challan: [],
      });
      setSelectedDONumberData([]);
    };
  
    return (
      <Spin spinning={loadingoutside} delay={100}>
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-4">
              <div className="flex">
                <img src={backbutton_logo} alt="backbutton_logo" className='w-5 h-5 object-cover cursor-pointer' onClick={goBack} />
              </div>
              <div className="flex flex-col">
                <h1 className='font-bold' style={{ fontSize: "16px" }}>Edit Recovery Code</h1>
                <Breadcrumb
                  items={[
                    { title: 'Recovery Register' },
                    { title: 'Edit' },
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
                    value={formData.recoveryCode}
                    onChange={(e) => handleChange('recoveryCode', e.target.value)}
                  />
                </Col>
  
                <Col className="gutter-row mt-6" span={8}>
                  <Input
                    placeholder="Value*"
                    size="large"
                    name="value"
                    value={formData.value}
                    onChange={(e) => handleChange('value', e.target.value)}
                  />
                </Col>
              </Row>
  
              <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
                <Col className="gutter-row mt-6" span={8}>
                  <h3 className="title">Add DO number to Recovery Code</h3>
                  <div className="master-data-maindiv delivery-number-drag-area">
                    <div className="searchdiv">
                      <Input.Search
                        className="searchdata"
                        onChange={(e) => setOriginalSearchText(e.target.value)}
                        placeholder="Search"
                        size='large'
                        value={originalSearchText}
                      />
                    </div>
                    <List
                      style={{ height: "180px", overflowY: "scroll" }}
                      dataSource={DONumberData.filter(item =>
                        item.deliveryNumber.includes(originalSearchText) &&
                        !selectedDONumberData.some(selectedItem => selectedItem.key === item.key)
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
                  <h3 className="title">DO List</h3>
                  <div className="master-data-maindiv delivery-number-drag-area">
                    <div className="searchdiv">
                      <Input.Search
                        className="searchdata"
                        onChange={(e) => setDerivedSearchText(e.target.value)}
                        placeholder="Search"
                        size='large'
                        value={derivedSearchText}
                      />
                    </div>
                    <div className="materialTable" style={{ height: "10px", width: "100%" }}>
                      <List
                        style={{ height: "180px", overflowY: "scroll" }}
                        dataSource={selectedDONumberData.filter(item =>
                          item.deliveryNumber.includes(derivedSearchText)
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
                  </div>
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
      </Spin>
    );
  };


  return (
    <>
      {showAddRecoveryForm ?
        <>
          {showEditRecoveryForm ? <EditRecoveryCodeFormComponent />
            :
            <RecoveryCodeFormComponent />
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
                Add Recovery Code
              </Button>
            </div>
            <Form form={form} component={false}>
              <Table
                scroll={{ x: "auto", y: 300 }}
                rowKey={(record) => record.key}
                bordered
                dataSource={newRow ? [newRow, ...dataSource] : dataSource}
                columns={columns}
                expandable={{
                  expandedRowRender: (record) => expandedRowRender(record),
                  onExpand: handleTableRowExpand,
                }}
                pagination={false}
                loading={loading}

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

export default RecoveryRegister;
