import { useState, useEffect } from 'react';
import type { DatePickerProps } from 'antd';
import { DatePicker, Table, Input, Select, Space, Button, Upload, Tabs, Tooltip, Breadcrumb, Col, Row, Switch, Image } from 'antd';
import { UploadOutlined, DownloadOutlined, EyeOutlined, FormOutlined, DeleteOutlined, SwapOutlined, RedoOutlined, SearchOutlined } from '@ant-design/icons';
const { Search } = Input;
import backbutton_logo from "../../assets/backbutton.png"
import { API } from "../../API/apirequest"

const UserMaster = ({ onData, showTabs, setShowTabs }) => {
  const authToken = localStorage.getItem("token");
  const selectedHubId = localStorage.getItem("selectedHubID");
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTruckData, setFilteredTruckData] = useState([]);
  const [showTruckTable, setShowTruckTable] = useState(true);
  const [showTruckView, setShowTruckView] = useState(false);
  const [showTransferForm, setShowTransferForm] = useState(false);
  const [rowDataForTruckEdit, setRowDataForTruckEdit] = useState(null);
  const goBack = () => {
    setShowTruckTable(true)
    onData('flex')
    setShowTabs(true); // Set showTabs to false when adding owner
  }
  const handleEditTruckClick = (rowData) => {
    onData('none')
    setShowTabs(false); // Set showTabs to false when adding owner
    setRowDataForTruckEdit(rowData);
    setShowTruckTable(false);
    setShowTransferForm(false);
    setShowTruckView(false)
  };

  const handleAddTruckClick = () => {
    onData('none')
    setShowTabs(false); // Set showTabs to false when adding owner
    setRowDataForTruckEdit(null);
    setShowTruckTable(false);
  };

  const handleDeleteTruckClick = async (rowData) => {
    const headersOb = {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authToken}`
      }
    }
    const response = await API.delete(`delete-user/${rowData._id}`, headersOb);
    if (response.status === 200 || response.status === 201) {
      alert("deleted data")
      getTableData("", selectedHubId);
      goBack()

    } else {
      alert(`unable to delete data`)
      console.log(response.data)
    }
  }

  // const getTableData = async (searchQuery, selectedHubID) => {
  //   const headersOb = {
  //     headers: {
  //       "Content-Type": "application/json",
  //       "Authorization": `Bearer ${authToken}`
  //     }
  //   }
  //   setLoading(true);
  //   try {
  //     const response = await API.get(`users`, headersOb);
  //     let allUserDetails;
  //     if (response.data.user == 0) {
  //       allUserDetails = response.data.user
  //       setFilteredTruckData(allUserDetails);
  //     } else {
  //       allUserDetails = response.data.user || "";
  //       setFilteredTruckData(allUserDetails)
  //     }
  //     setLoading(false);
  //   } catch (err) {
  //     console.log(err)
  //     setLoading(false);
  //   }
  //   setLoading(false);

  // };

  const getTableData = async (searchQuery, selectedHubID) => {
    const headersOb = {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authToken}`
      }
    };
    setLoading(true);
    
    try {
      const response = await API.get(`users`, headersOb);
      let allUserDetails = response.data.user || [];
  
      if (searchQuery) {
        allUserDetails = allUserDetails.filter(user => 
          user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.phoneNumber.includes(searchQuery)
        );
      }
  
      setFilteredTruckData(allUserDetails);
      setLoading(false);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };
  
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageSize, setCurrentPageSize] = useState(10);
  const [activePageSize, setActivePageSize] = useState(10);
  // Update the useEffect hook to include currentPage and currentPageSize as dependencies
  useEffect(() => {
    getTableData(searchQuery, selectedHubId);
  }, [selectedHubId]);

  // Truck master
  const Truck = ({ onAddTruckClick }: { onAddTruckClick: () => void }) => {
    const initialSearchQuery = localStorage.getItem('searchQuery9') || '';
    const [searchQuery9, setSearchQuery9] = useState<string>(initialSearchQuery);

    // Update localStorage whenever searchQuery9 changes
    useEffect(() => {
      if (searchQuery9 !== initialSearchQuery) {
        localStorage.setItem('searchQuery9', searchQuery9);
      }
    }, [searchQuery9, initialSearchQuery]);

    const handleSearch = () => {
      getTableData(searchQuery9, selectedHubId);
    };

    const onChangeSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchQuery9(value);
      console.log(value);
      if (value === "") {
        onReset();
      }
    };

    const onReset = () => {
      setSearchQuery9("");
      setLoading(false)
      localStorage.removeItem('searchQuery9');
      getTableData("", selectedHubId);
    };
    return (
      <div className='flex gap-2 justify-between  py-3'>
        {loading}
        <div className='flex items-center gap-2'>
          <Search
            placeholder="Search"
            size='large'
            value={searchQuery9}
            onChange={onChangeSearch}
            onSearch={handleSearch}
            style={{ width: 320 }}
          />
          {searchQuery9 !== null && searchQuery9 !== "" ? <><Button size='large' onClick={onReset} style={{ rotate: "180deg" }} icon={<RedoOutlined />}></Button></> : <></>}
        </div>
        <div className='flex gap-2'>
          <Button onClick={onAddTruckClick} className='bg-[#1572B6] text-white'> CREATE USER</Button>
        </div>
      </div>

    );
  };

  const UserMasterForm = () => {
    const [hubs, setHubs] = useState([]);

    const [select3HubId, setSelect3HubId] = useState([]);
    const headersOb = {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authToken}`
      }
    };
    const handleChangeHub = (value) => {
      if (value.length <= 1) {
        setSelect3HubId(value);
      }
    };
    const fetchHubs = async () => {
      try {
        const response = await API.get('get-hubs', headersOb);
        setHubs(response.data.hubs);
      } catch (error) {
        console.error('Error fetching hub data:', error);
      }
    };

    useEffect(() => {
      fetchHubs();
    }, []);

    const [formData, setFormData] = useState(
      {
        name: "",
        countryCode: "+91",
        firstName: "",
        email: "",
        phoneNumber: null,
        roleName: "",
        password: "",
        hubId: selectedHubId,
      }
    );

    const onResetClick = () => {
      console.log('reset clicked')
      setFormData(
        {
          name: '',

          countryCode: "+91",
          firstName: "",
          email: "",
          phoneNumber: null,
          roleName: "",
          password: "",
          hubId: selectedHubId,
        }
      );
    }

    // const handleChange = (name, value) => {
    //   if(formData.userRole == "Admin"){
    //     setFormData((prevFormData) => ({
    //       ...prevFormData,
    //       [name]: "",
    //     }));  
    //     setSelect3HubId([]) 
    //   }
    //   setFormData((prevFormData) => ({
    //     ...prevFormData,
    //     [name]: value,
    //   }));
    // };

    const handleChange = (name, value) => {
      if (name === 'userRole' && value === 'Admin') {
        setSelect3HubId([]);
      }
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: value,
      }));
    };

    const handleSubmit = async (e) => {
      e.preventDefault();

      // Prepare the payload
      const payload = {
        countryCode: formData.countryCode,
        // firstName: formData.firstName,
        firstName: formData.name.charAt(0).toUpperCase() + formData.name.slice(1),
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        name: formData.name,
        roleName: formData.userRole,
        role: formData.userRole,
        password: formData.password,
        hubId: select3HubId
      };

      console.log('Payload:', payload);

      // // Prepare the API request
      try {
        const response = await API.post('create-user', payload, headersOb);
        console.log('Response:', response);
        if (response.status === 201) {
          alert("User created successfully");
          getTableData("", selectedHubId);
          goBack()
          // Redirect or perform additional actions if needed
        } else {
          alert('Error occurred');
        }
      } catch (error) {
        console.error('Error creating user:', error);
        alert("An error occurred while creating the user");
      }
    };




    return (
      <>
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-bold">Create User</h1>
            <img src={backbutton_logo} alt="backbutton_logo" className='w-5 h-5 object-cover cursor-pointer' onClick={goBack} />

          </div>
          <div className="flex flex-col gap-1">
            <div className="flex flex-col gap-1">

              <div className="text-md font-normal">Enter User Details</div>
            </div>
            <div className="flex flex-col gap-1">
              <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
                <Col className="gutter-row mt-6" span={6}>
                  <Input
                    placeholder="Name*"
                    size="large"
                    value={formData.name}
                    name="name"
                    onChange={(e) => handleChange('name', e.target.value)}
                  />
                </Col>
                <Col className="gutter-row mt-6" span={6}>
                  <Input
                    placeholder="Email*"
                    size="large"
                    value={formData.email}
                    name="email"
                    onChange={(e) => handleChange('email', e.target.value)}
                  />
                </Col>
                <Col className="gutter-row mt-6" span={6}>
                  <Input
                    type='number'
                    placeholder="Phone Number*"
                    size="large"
                    value={formData.phoneNumber}
                    name="phoneNumber"
                    onChange={(e) => handleChange('phoneNumber', e.target.value)}
                  />
                </Col>
                <Col className="gutter-row mt-6" span={6}>
                  <Select
                    name="userRole"
                    placeholder="User Role*"
                    size="large"
                    style={{ width: '100%' }}
                    options={[
                      { value: 'Admin', label: 'Admin' },
                      { value: 'Accountant', label: 'Accountant' },
                    ]}
                    onChange={(value) => handleChange('userRole', value)}
                  />

                </Col>

              </Row>
              <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>

                {formData.userRole == "Admin" ? <>
                  <Col className="gutter-row mt-6" span={6}>
                    <Select
                      mode="multiple"
                      placeholder="Select hubs"
                      value={select3HubId}
                      maxCount={1}
                      onChange={handleChangeHub}
                      size="large"
                      style={{ width: '100%' }}
                      disabled
                    >
                      {hubs.map(hub => (
                        <Option key={hub._id} value={hub._id}>
                          {hub.location}
                        </Option>
                      ))}
                    </Select>
                  </Col>
                </> : <>

                  <Col className="gutter-row mt-6" span={6}>
                    <Select
                      mode="multiple"
                      placeholder="Select hubs"
                      value={select3HubId}
                      maxCount={1}
                      onChange={handleChangeHub}
                      size="large"
                      style={{ width: '100%' }}
                    >
                      {hubs.map(hub => (
                        <Option key={hub._id} value={hub._id}>
                          {hub.location}
                        </Option>
                      ))}
                    </Select>
                  </Col>
                </>}

                <Col className="gutter-row mt-6" span={6}>
                  <Input
                    placeholder="Password*"
                    size="large"
                    value={formData.password}
                    name="password"
                    onChange={(e) => handleChange('password', e.target.value)}
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
    );
  };



  const TruckTable = ({ onEditTruckClick, onDeleteTruckClick }) => {
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys);
    };


    const rowSelection = {
      selectedRowKeys,
      onChange: onSelectChange,
    };
    const handlePageSizeChange = (newPageSize) => {
      setCurrentPageSize(newPageSize);
      setCurrentPage(1); // Reset to the first page
      setActivePageSize(newPageSize); // Update the active page size
    };
    const handleToggleActive = async (userId, status) => {

      const payload = {
        userId,
        status
      };

      const headersOb = {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        }
      };

      try {
        const response = await API.put(`user-status`, payload, headersOb);
        console.log('Response:', response);
        if (response.status === 200 || response.status === 201) {
          // alert("User status updated successfully");
          getTableData("", selectedHubId)
          // Optionally, refresh the table data here if needed
        } else {
          alert('Error occurred while updating status');
        }
      } catch (error) {
        console.error('Error updating status:', error);
        alert("An error occurred while updating the user status");
      }
    };
    const columns = [
      {
        title: 'Sl No',
        dataIndex: 'serialNumber',
        key: 'serialNumber',
        render: (text, record, index) => (currentPage - 1) * currentPageSize + index + 1,
        width: 30,
      },

      {
        title: 'Owner Name',
        dataIndex: 'name',
        key: 'name',
        width: 110,
        // render: (_, record) => {
        //   return  record?.firstName 
        //   ? record.firstName.charAt(0).toUpperCase() + record.firstName.slice(1) 
        //   : 'N/A'
        // }
        render: (_, record) => {
          return record?.name
            ? record.name.charAt(0).toUpperCase() + record.name.slice(1)
            : 'N/A'
        }
      },

      {
        title: 'Email',
        dataIndex: 'email',
        key: 'email',
        width: 110,
        render: (_, record) => {
          return record?.email
            ? record.email
            : 'N/A'
        }
      },
      {
        title: 'Phone Number',
        dataIndex: 'phoneNumber',
        key: 'phoneNumber',
        width: 60,
        render: (_, record) => {
          return record?.phoneNumber
            ? record.phoneNumber
            : 'N/A'
        }
      },

      {
        title: 'Role',
        dataIndex: 'roleName',
        key: 'roleName',
        width: 60,
        render: (_, record) => {
          return record?.roleName
            ? record.roleName.charAt(0).toUpperCase() + record.roleName.slice(1)
            : 'N/A'
        }
      },

      {
        title: 'Action',
        key: 'action',
        width: 80,
        render: (record: unknown) => (
          <Space size="middle">

            <Switch
              checked={record.isActive}
              onChange={(checked) => handleToggleActive(record._id, checked)}
            />
            <Tooltip placement="top" title="Edit"><a onClick={() => onEditTruckClick(record)}><FormOutlined /></a></Tooltip>
            <Tooltip placement="top" title="Delete"><a onClick={() => onDeleteTruckClick(record)}><DeleteOutlined /></a></Tooltip>
          </Space>
        ),
      },
    ];

    return (
      <>
        <div className='flex items-items justify-end mb-2 my-paginations '>
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

        <Table
          columns={columns}
          dataSource={filteredTruckData}
          rowKey="_id"
          pagination={{
            current: currentPage,
            pageSize: activePageSize,
            onChange: (page, pageSize) => {
              setCurrentPage(page);
              setCurrentPageSize(pageSize);
            },
          }}
          // antd site header height
          sticky={{
            offsetHeader: 20,
          }}
        />
      </>
    );
  };


  const EditTruckDataRow = ({ filterTruckTableData }) => {

    const [formData, setFormData] = useState({
      countryCode: "+91",
      firstName: filterTruckTableData.name || '',
      email: filterTruckTableData.email || '',
      phoneNumber: filterTruckTableData.phoneNumber || '',
      name: filterTruckTableData.name || '',
      userRole: filterTruckTableData.roleName || '',
      hubId: filterTruckTableData.hubId || [],
    });

    const [hubs, setHubs] = useState([]);
    const [hubNames, setHubNames] = useState([]);
    const headersOb = {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authToken}`
      }
    }
    const fetchHubs = async () => {
      try {
        const response = await API.get('get-hubs', headersOb); // Replace with your actual API call
        setHubs(response.data.hubs);
      } catch (error) {
        console.error('Error fetching hub data:', error);
      }
    };

    useEffect(() => {
      fetchHubs();
    }, []);

    useEffect(() => {
      const selectedHubNames = formData.hubId.map(id => {
        const hub = hubs.find(hub => hub._id === id);
        return hub ? hub.location : id;
      });
      setHubNames(selectedHubNames);
    }, [formData.hubId, hubs]);

    const [select3HubId, setSelect3HubId] = useState(filterTruckTableData.hubId || []);

    const handleChangeHub = (value) => {
      if (value.length <= 1) {
        setSelect3HubId(value);
      }
    };



    const onResetClick = () => {
      console.log('reset clicked')
      setFormData(
        {
          countryCode: "+91",
          firstName: filterTruckTableData.name || '',
          email: filterTruckTableData.email || '',
          phoneNumber: filterTruckTableData.phoneNumber || '',
          name: filterTruckTableData.name || '',
          userRole: filterTruckTableData.roleName || '',
          hubId: filterTruckTableData.hubId || [],
        }
      );
    }

    const handleChange = (name, value) => {
      if (formData.userRole == "Admin") {
        setFormData((prevFormData) => ({
          ...prevFormData,
          [name]: "",
        }));
        setSelect3HubId([])
      }
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: value,
      }));
    };

    const handleSubmit = async (e) => {
      e.preventDefault();

      const payload = {
        countryCode: formData.countryCode,
        firstName: formData.name.charAt(0).toUpperCase() + formData.name.slice(1),
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        name: formData.name,
        roleName: formData.userRole,
        role: formData.userRole,
        hubId: select3HubId,
        _id: filterTruckTableData._id,
      };

      try {
        const response = await API.put(`update-user/${filterTruckTableData._id}`, payload, headersOb);
        console.log('Response:', response);
        if (response.status === 200 || response.status === 201) {
          alert("User updated successfully");
          getTableData("", selectedHubId);
          goBack();
        } else {
          alert('Error occurred');
        }
      } catch (error) {
        console.error('Error updating user:', error);
        alert("An error occurred while updating the user");
      }
    };


    const goBack = () => {
      setShowTruckTable(true)
      onData('flex')
      setShowTabs(true);
    };

    return (
      <>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-4">
            <div className="flex">
              <img
                src={backbutton_logo}
                alt="backbutton_logo"
                className='w-5 h-5 object-cover cursor-pointer'
                onClick={goBack}
              />
            </div>
            <div className="flex flex-col">
              <h1 className='font-bold' style={{ fontSize: "16px" }}>Edit User Details</h1>
              <Breadcrumb
                items={[
                  {
                    title: 'Settings',
                  },
                  {
                    title: 'User',
                  },
                  {
                    title: 'Edit',
                  },
                ]}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex flex-col gap-1">
              <div className="text-md font-normal">Enter User Details</div>
            </div>
            <div className="flex flex-col gap-1">
              <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
                <Col className="gutter-row mt-6" span={6}>
                  <Input
                    placeholder="Name*"
                    size="large"
                    name="name"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                  />
                </Col>
                <Col className="gutter-row mt-6" span={6}>
                  <Input
                    placeholder="Email*"
                    size="large"
                    name="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                  />
                </Col>
                <Col className="gutter-row mt-6" span={6}>
                  <Input
                    placeholder="Phone Number*"
                    size="large"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={(e) => handleChange('phoneNumber', e.target.value)}
                  />
                </Col>
                <Col className="gutter-row mt-6" span={6}>
                  <Select
                    name="userRole"
                    placeholder="User Role*"
                    size="large"
                    style={{ width: '100%' }}
                    value={formData.userRole}
                    onChange={(value) => handleChange('userRole', value)}
                  >
                    <Option value="Admin">Admin</Option>
                    <Option value="Accountant">Accountant</Option>
                  </Select>
                </Col>
              </Row>
              <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>

                <Col className="gutter-row mt-6" span={6}>
                  <Select
                    mode="multiple"
                    placeholder="Select hubs"
                    size="large"
                    style={{ width: '100%' }}
                    value={select3HubId}
                    onChange={handleChangeHub}
                  >
                    {hubs.map(hub => (
                      <Option key={hub._id} value={hub._id}>
                        {hub.location}
                      </Option>
                    ))}
                  </Select>
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
    );
  };
  return (
    <>
      {showTruckTable ? (
        <>
          <Truck onAddTruckClick={handleAddTruckClick} />
          <TruckTable onEditTruckClick={handleEditTruckClick} onDeleteTruckClick={handleDeleteTruckClick} />
        </>
      ) : (
        rowDataForTruckEdit ? (
          <>
            {showTransferForm ? <></> : (
              showTruckView ? (
                <></>
              ) : (
                <EditTruckDataRow filterTruckTableData={rowDataForTruckEdit} />
              )
            )}
          </>
        ) : (
          <UserMasterForm />
        )
      )}
    </>
  );

}



export default UserMaster