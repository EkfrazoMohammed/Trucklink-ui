import { useState, useEffect } from 'react';
import { Table, Input,Select,Space, Button, Upload, Tabs,Tooltip,Breadcrumb,Col, Divider, Row } from 'antd';
import type { TabsProps } from 'antd';
import { UploadOutlined, DownloadOutlined, EyeOutlined, FormOutlined, DeleteOutlined } from '@ant-design/icons';

import type { SearchProps } from 'antd/es/input/Search';
const { Search } = Input;
import { } from 'antd';
const onSearch: SearchProps['onSearch'] = (value, _e, info) => console.log(info?.source, value);

const onChange = (key: string) => {
  console.log(key);
};

import { useSelector, useDispatch } from 'react-redux';
import { fetchOwnerData,addOwnerDataAccount } from "./../../redux/reducers/onboardingReducer";

const OnboardingContainer = () => {
  const dispatch = useDispatch();
  const ownerData = useSelector(state => state.onboarding.ownerData);

  useEffect(() => {
    dispatch(fetchOwnerData());
  }, []);


  const selectedHubId=localStorage.getItem("selectedHubID");
  const selectedHubName=localStorage.getItem("selectedHubName");
  const filterOwnerTableData = ownerData.filter((value) => value.hubId === selectedHubId);

console.log("Filtered owner data:", filterOwnerTableData);

  const [showOwnerTable, setShowOwnerTable] = useState(true);

  
  const handleAddOwnerClick = () => {
    setRowDataForEdit(null);
    setShowOwnerTable(false);
  };
  
  
  const [rowDataForEdit, setRowDataForEdit] = useState(null);
  const handleEditClick = (rowData) => {
    setRowDataForEdit(rowData);
    setShowOwnerTable(false);
  };
  const [showTruckTable, setShowTruckTable] = useState(true);
 
  
  const [rowDataForTruckEdit, setRowDataForTruckEdit] = useState(null);
  const handleEditTruckClick = (rowData) => {
    setRowDataForTruckEdit(rowData);
    setShowTruckTable(false);
  };
  const handleAddTruckClick = () => {
    setRowDataForTruckEdit(null);
    setShowTruckTable(false);
  };
  const OwnerMaster = () => {
    return (
      <>
        {showOwnerTable ? (
          <>
            <Owner onAddOwnerClick={handleAddOwnerClick} />
            <OwnerTable ownerData={filterOwnerTableData} onEditClick={handleEditClick} />
          </>
        ) : (
          rowDataForEdit ? (
            <ViewOwnerDataRow rowData={rowDataForEdit}/>
          ) : (
            <TruckOwnerForm />
          )
        )}
      </>
    );
  };
  const Owner = ({ onAddOwnerClick }: { onAddOwnerClick: () => void }) => {
    return (
      <div className='flex gap-2 justify-between p-2'>

        <Search placeholder="Search by Owner Name / Truck no" size='large' allowClear onSearch={onSearch} style={{ width: 320 }} />
        <div className='flex gap-2'>
{/* 
          <Upload>
            <Button icon={<UploadOutlined />}></Button>
          </Upload>
          <Upload>
            <Button icon={<DownloadOutlined />}></Button>
          </Upload> */}

          <Button onClick={onAddOwnerClick} className='bg-[#1572B6] text-white'> ADD TRUCK OWNER</Button>
        </div>
      </div>

    );
  };
  const TruckOwnerForm = () => {
 

  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    countryCode: '',
    panNumber: '',
    address: '',
    district: '',
    state: '',
    address:selectedHubName,

    vehicleIds: [],
    hubId:selectedHubId,
    bankAccounts: [
      {
        accountNumber: '',
        accountHolderName: '',
        ifscCode: '',
        bankName: '',
        branchName: ''
      }
    ]
  });
  console.log(formData)

  // const handleOwnerFormChange = (e) => {
  //   const { name, value } = e.target;
  //   setFormData((prevFormData) => ({
  //     ...prevFormData,
  //     [name]: value,
  //   }));
  const handleOwnerFormChange = (e) => {
    const { name, value } = e.target;
    const updatedValue = name === 'panNumber' ? value.toUpperCase() : value; // Convert to uppercase only if name is 'panNumber'
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: updatedValue,
    }));
  };

  const handleBankAccountChange = (index, e) => {
    const { name, value } = e.target;
    const updatedBankAccounts = [...formData.bankAccounts];
    updatedBankAccounts[index][name] = value;
    setFormData((prevFormData) => ({
      ...prevFormData,
      bankAccounts: updatedBankAccounts
    }));
  };

  const handleAddBankAccount = () => {
    if (formData.bankAccounts.length < 2) { // Check if the current number of bank accounts is less than 2
      setFormData((prevFormData) => ({
        ...prevFormData,
        bankAccounts: [
          ...prevFormData.bankAccounts,
          {
            accountNumber: '',
            accountHolderName: '',
            ifscCode: '',
            bankName: '',
            branchName: ''
          }
        ]
      }));
    } else {
      // You can show a message or take any other action here to inform the user that only two bank accounts are allowed
      console.log("Only two bank accounts are allowed");
      alert("Only two bank accounts are allowed")
    }
  };
  

  const handleRemoveBankAccount = (index) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      bankAccounts: prevFormData.bankAccounts.filter((_, i) => i !== index)
    }));
  };

    // const payload = {
      
    //     "owner": {
    //       "name":"Hello Account",
    //       "email":"HelloAccount@gmail.com",
    //       "phoneNumber": "1234567890",
    //       "countryCode": "+1",
    //       "panNumber": "ABCD1234",
    //       "address": "123 Main St",
    //       "district": "ABC",
    //       "state": "XYZ",
    //       "vehicleIds": [] 
    //     },
    //     "bankAccount": {
         
    //       "accountNumber": "123",
    //       "accountHolderName": "Jane Smith",
    //       "ifscCode": "9876543210",
    //       "bankName": "SBI",
    //       "branchName": "Puri"
    //     }
      
    // }
  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      owner: {
        name: formData.name,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        countryCode: formData.countryCode,
        panNumber: formData.panNumber,
        address: formData.address,
        district: formData.district,
        state: formData.state,
        address:selectedHubName,
        hubId:selectedHubId,
        vehicleIds: [],
      },
      bankAccounts: formData.bankAccounts.slice(0, 2).map((bankAccount) => ({
        accountNumber: bankAccount.accountNumber,
        accountHolderName: bankAccount.accountHolderName,
        ifscCode: bankAccount.ifscCode,
        bankName: bankAccount.bankName,
        branchName: bankAccount.branchName,
      })),
    };
    console.log(payload)
    dispatch(addOwnerDataAccount(payload))
  .then((response) => {
    alert('Owner data added successfully!');
    window.location.reload();
    // Log the response from the API
    console.log('Response from API:', response);

    if(response.status === 200 ||response.status === 201 || response.message ==="Owner and Account created successfully") {
      alert('Owner data added successfully!');
      window.location.reload();
    }
  })
  .catch((error) => {
    // Log any errors that occur during the dispatch process
    console.error('Error adding owner data:', error);
    window.location.reload();
  });

  };
  const redStarStyle = {
    color: 'red', // Set the color of the asterisk to red
  };
  return (
    <>
    {/* <Button onClick={() => { setShowOwnerTable(true) }}>back</Button>
    <Button onClick={handleSubmit}>Submit dummy data</Button> */}

    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-1">
        <h1 className='text-xl font-bold'>Create Truck Owner</h1>
        <Breadcrumb
    items={[
      {
        title: 'OnBoarding',
      },
      {
        title: 'Owner Master',
      },
      {
        title: 'Create',
      },
    ]}
  />
  <Button onClick={() => { setShowOwnerTable(true) }} style={{width:100}}>back</Button>
      </div>
      <div className="flex flex-col gap-1">
      <div className="flex flex-col gap-1">
        <div className='text-md font-semibold'>Vehicle Owner Information</div>
        <div className='text-md font-normal'>Enter Truck Registration and Owner Details</div>
      
      </div>

      <div className="flex flex-col gap-1">
    <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
      <Col className="gutter-row mt-6" span={12}>
        <div ><Input placeholder="Owner Name*" size="large" name="name" onChange={handleOwnerFormChange} /></div>
      </Col>
      <Col className="gutter-row mt-6" span={12}>
      <div ><Input type='number' placeholder="Mobile Number*" size="large"  name="phoneNumber" onChange={handleOwnerFormChange}/></div>
      </Col>
      <Col className="gutter-row mt-6" span={12}>
        <div ><Input type='email' placeholder="Email ID" size="large"  name="email" onChange={handleOwnerFormChange}/></div>
      </Col>
      <Col className="gutter-row mt-6" span={12}>
      <div ><Input placeholder="PAN Card No" size="large" name="panNumber" onChange={handleOwnerFormChange}/></div>
      </Col>

      <Col className="gutter-row mt-6" span={12}>
      <div ><Input placeholder="state" size="large" name="state" onChange={handleOwnerFormChange}/></div>
      </Col>
      <Col className="gutter-row mt-6" span={12}>
      <div ><Input placeholder="district" size="large" name="district" onChange={handleOwnerFormChange}/></div>
      </Col>
      {/* <Col className="gutter-row mt-6" span={12}>
      <div ><Select
      onChange={handleSelectChange}
      name="state"
      placeholder="State"
      size="large"
      style={{ width: "100%" }}
      options={[
        { value: 'open', label: 'Open' },
        { value: 'bulk', label: 'Bulk' },
      ]}
    /></div>
      </Col>
      <Col className="gutter-row mt-6" span={12}>
      <div ><Select
      onChange={handleOwnerFormChange}
      name="district"
      placeholder="district"
      size="large"
      style={{ width: "100%" }}
      options={[
        { value: 'open', label: 'Open' },
        { value: 'bulk', label: 'Bulk' },
      ]}
    /></div>
      </Col> */}
           
      </Row>
      </div>
      
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex justify-between">

        <div>

        <div className='text-md font-semibold'>Owner Bank Details</div>
        <div className='text-md font-normal'>Enter bank details</div>
        </div>
        <Button type="link" onClick={handleAddBankAccount} style={{color:"#000"}}>+ Add Bank</Button>
        </div>
            

      {formData.bankAccounts.map((bankAccount, index) => (
            <div className="flex flex-col gap-1 bg-[#f6f6f6] p-4" key={index}>
              <h1>Bank {index + 1}</h1>
              <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
                <Col className="gutter-row mt-2" span={8}>
                  <Input placeholder="IFSC  Code*" size="large" name="ifscCode" value={bankAccount.ifscCode} onChange={(e) => handleBankAccountChange(index, e)} />
                </Col>
                <Col className="gutter-row mt-2" span={8}>
                  <Input placeholder="Bank Name*" size="large" name="bankName" value={bankAccount.bankName} onChange={(e) => handleBankAccountChange(index, e)} />
                </Col>
                <Col className="gutter-row mt-2" span={8}>
                  <Input placeholder="Bank Branch*" size="large" name="branchName" value={bankAccount.branchName} onChange={(e) => handleBankAccountChange(index, e)} />
                </Col>
                <Col className="gutter-row mt-2" span={8}>
                  <Input placeholder="Bank Account Number*" size="large" name="accountNumber" value={bankAccount.accountNumber} onChange={(e) => handleBankAccountChange(index, e)} />
                </Col>
                <Col className="gutter-row mt-2" span={8}>
                  <Input placeholder="Bank Account Holder Name*" size="large" name="accountHolderName" value={bankAccount.accountHolderName} onChange={(e) => handleBankAccountChange(index, e)} />
                </Col>
              </Row>
              {formData.bankAccounts.length > 1 && (
                <Button onClick={() => handleRemoveBankAccount(index)} style={{width:150}}>Remove Bank Account</Button>
              )}
            </div>
          ))}
      </div>
      <div className="flex gap-4">
     
      <Button onClick={() => { setShowOwnerTable(true) }}>Reset</Button>
  
      <Button type="primary" className='bg-primary' onClick={handleSubmit}>Save</Button>
  </div>
      
    </div>
    </>
  );
};


  const ViewOwnerDataRow = ({ rowData }) => {
    return (
      <div className="owner-details">
        <Button onClick={() => { setShowOwnerTable(true) }}>back</Button>

        <div className="section mx-2 my-4">
          <h2 className='font-semibold text-md'>Vehicle Owner Information</h2>
          <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
                <Col className="gutter-row m-1" span={8}>
                <p className='flex flex-col font-normal'><span className="label">Owner Name</span> {rowData.name}</p>
                </Col>
                <Col className="gutter-row m-1" span={8}>
                <p className='flex flex-col font-normal'><span className="label">Mobile Number</span> {rowData.phoneNumber}</p>
                </Col>
                <Col className="gutter-row m-1" span={8}>
                <p className='flex flex-col font-normal'><span className="label">Email ID</span> {rowData.email}</p>
                </Col>
                <Col className="gutter-row m-1" span={8}>
                <p className='flex flex-col font-normal'><span className="label">PAN CARD No</span> {rowData.name}</p>
                </Col>
                <Col className="gutter-row m-1" span={8}>
                <p className='flex flex-col font-normal'><span className="label">District</span>  {rowData.district}</p>
                </Col>
                <Col className="gutter-row m-1" span={8}>
                <p className='flex flex-col font-normal'><span className="label">State</span> {rowData.state}</p>
                </Col>
                <Col className="gutter-row m-1" span={8}>
                <p className='flex flex-col font-normal'><span className="label">Address</span> {rowData.address}</p>
                </Col>
              
              </Row>
        </div>
        <div className="section mx-2 my-4">
          <h2 className='font-semibold text-md'>Owner Bank Details</h2>
          {rowData.accountIds.map((account, index) => (
            <div key={index}>
              <h3>Bank Account {index + 1}</h3>
              <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
         
              <Col className="gutter-row m-1" span={8}>
                <p className='flex flex-col font-normal'><span className="label">Account Number:</span> {account.accountNumber}</p>
                </Col>
                <Col className="gutter-row m-1" span={8}>
                <p className='flex flex-col font-normal'><span className="label">Account Holder Name:</span> {account.accountHolderName}</p>
                </Col>
                <Col className="gutter-row m-1" span={8}>
                <p className='flex flex-col font-normal'><span className="label">Branch Name:</span> {account.branchName}</p>
                </Col>
                <Col className="gutter-row m-1" span={8}>
                <p className='flex flex-col font-normal'><span className="label">IFSC Code:</span> {account.ifscCode}</p>
                </Col>
                <Col className="gutter-row m-1" span={8}>
                <p className='flex flex-col font-normal'><span className="label">Bank Name:</span> {account.bankName}</p>
                </Col>
                </Row>
           </div>
          ))}
        </div>
        <div className="section mx-2 my-4">
          <h2 className='font-semibold text-md'>Vehicle Owner Information</h2>
          {rowData.vehicleIds.map((vehicle, index) => (
            <div key={index}>
              <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
                <Col className="gutter-row m-1" span={8}>
                <p className='flex flex-col font-normal'><span className="label">Vehicle No:</span> {vehicle.registrationNumber}</p>
                </Col>
                </Row>
           </div>
          ))}
        </div>
      </div>
    );
  };
 
  const Truck = ({ onAddTruckClick }: { onAddTruckClick: () => void }) => {
    return (
      <div className='flex gap-2 justify-between p-2'>

        <Search placeholder="Search by Vehicle no" size='large' allowClear onSearch={onSearch} style={{ width: 320 }} />
        <div className='flex gap-2'>
{/* 
          <Upload>
            <Button icon={<UploadOutlined />}></Button>
          </Upload>
          <Upload>
            <Button icon={<DownloadOutlined />}></Button>
          </Upload> */}

          <Button onClick={onAddTruckClick} className='bg-[#1572B6] text-white'> ADD TRUCK</Button>
        </div>
      </div>

    );
  };
  // Truck master
  const TruckMaster = () => {
    return (
      <>
   <>
        {showTruckTable ? (
          <>
            <Truck onAddTruckClick={handleAddTruckClick} />
            <TruckTable ownerData={ownerData} onEditClick={handleEditTruckClick} />
          </>
        ) : (
          rowDataForTruckEdit ? (
            <ViewTruckDataRow rowData={rowDataForTruckEdit}/>
          ) : (
            <TruckMasterForm  />
          )
        )}
      </>
      </>
    )
  }


  
  const TruckMasterForm = () => {
 

  const dispatch = useDispatch();
  const [formData, setFormData] = useState(
    {
    name: '',
    email: '',
    phoneNumber: '',
    countryCode: '',
    panNumber: '',
    address: '',
    district: '',
    state: '',
    accountNumber: '',
    accountHolderName: '',
    ifscCode: '',
    bankName: '',
    branchName: '',
  });

  const handleChangeTruck = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleSubmitTruck = (e) => {
    e.preventDefault();
    const payload = {
      
        "owner": {
          "name":"Hello Account",
          "email":"HelloAccount@gmail.com",
          "phoneNumber": "1234567890",
          "countryCode": "+1",
          "panNumber": "ABCD1234",
          "address": "123 Main St",
          "district": "ABC",
          "state": "XYZ",
          "vehicleIds": [] 
        },
        "bankAccount": {
         
          "accountNumber": "123",
          "accountHolderName": "Jane Smith",
          "ifscCode": "9876543210",
          "bankName": "SBI",
          "branchName": "Puri"
        }
      
    }
    console.log(payload)
    // dispatch(addOwnerDataAccount(formData))
    dispatch(addOwnerDataAccount(payload))
      .then(() => {
        console.log('Owner data added successfully!');
        window.location.reload();
      })
      .catch((error) => {
        console.error('Error adding owner data:', error);
      });
  };
  const redStarStyle = {
    color: 'red', // Set the color of the asterisk to red
  };
  return (
    <>
    {/* <Button onClick={() => { setShowOwnerTable(true) }}>back</Button>
    <Button onClick={handleSubmit}>Submit dummy data</Button> */}

    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-1">
        <h1 className='text-xl font-bold'>Create Truck</h1>
        <Breadcrumb
    items={[
      {
        title: 'OnBoarding',
      },
      {
        title: 'Truck Master',
      },
      {
        title: 'Create',
      },
    ]}
  />
  <Button onClick={() => { setShowTruckTable(true) }}>back</Button>
      </div>
      <div className="flex flex-col gap-1">
      <div className="flex flex-col gap-1">
        <div className='text-md font-semibold'>Vehicle Information</div>
        <div className='text-md font-normal'>Enter Truck Details</div>
      
      </div>

      <div className="flex flex-col gap-1">
    <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
      <Col className="gutter-row mt-6" span={12}>
        <div ><Input placeholder="Vehicle Number*" size="large" /></div>
      </Col>
      <Col className="gutter-row mt-6" span={12}>
      <div ><Select
      placeholder="Vehicle Type*"
      size="large"
      style={{ width: "100%" }}
      options={[
        { value: 'open', label: 'Open' },
        { value: 'bulk', label: 'Bulk' },
      ]}
    /></div>
      </Col>
      <Col className="gutter-row mt-6" span={12}>
        <div ><Input placeholder="Owner Mobile Number*" size="large" /></div>
      </Col>
      <Col className="gutter-row mt-6" span={12}>
      <div ></div>
      </Col>
      <Col className="gutter-row mt-6" span={8}>
        <div ><Input placeholder="Owner Name*" size="large" /></div>
      </Col>
      <Col className="gutter-row mt-6" span={8}>
      <div ><Input placeholder="Mobile Number*" size="large" /></div>
      </Col>
      <Col className="gutter-row mt-6" span={8}>
      <div ><Input placeholder="Mobile Number*" size="large" /></div>
      </Col>
           
      </Row>
      </div>
      
      </div>

      <div className="flex gap-4">
     
      <Button onClick={() => { setShowOwnerTable(true) }}>Reset</Button>
  
      <Button type="primary" className='bg-primary'>Save</Button>
  </div>
      
    </div>
    </>
  );
};
  const ViewTruckDataRow = ({rowData}) => {
    return (
      <>
        <div onClick={() => { setShowOwnerTable(true) }}>{JSON.stringify(rowData)}</div>
      </>
    )
  }


  const MasterData = () => {
    return (
      <>
        <div>MasterData Content</div>
      </>
    )
  }


  const items: TabsProps['items'] = [
    {
      key: '1',
      label: 'Owner Master',
      children: <OwnerMaster />,
    },
    {
      key: '2',
      label: 'Truck Master',
      children: <TruckMaster />,
    },
    {
      key: '3',
      label: 'Master Data',
      children: <MasterData />,
    },
   
  ];

  const OwnerTable = ({ ownerData, onEditClick }) => {
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

    const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
      console.log('selectedRowKeys changed: ', newSelectedRowKeys);
      setSelectedRowKeys(newSelectedRowKeys);
    };


    const rowSelection = {
      selectedRowKeys,
      onChange: onSelectChange,
    };

    const columns = [
      {
        title: 'Owner Name',
        dataIndex: 'name',
        key: 'name',
        width: 80,
      },
      {
        title: 'District',
        dataIndex: 'district',
        key: 'district',
        width: 80,
      },
      {
        title: 'State',
        dataIndex: 'state',
        key: 'state',
        width: 80,
      },
      {
        title: 'Email ID',
        dataIndex: 'email',
        key: 'email',
        width: 80,
      },
      {
        title: 'Action',
        key: 'action',
        width: 80,
        render: (record) => (
          <Space size="middle">
            <Tooltip placement="top" title="Preview"><a onClick={() => onEditClick(record)}><EyeOutlined /></a></Tooltip>
            <Tooltip placement="top" title="Edit"><a onClick={() => onEditClick(record)}><FormOutlined /></a></Tooltip>
            <Tooltip placement="top" title="Delete"><a><DeleteOutlined /></a></Tooltip>
          </Space>
        ),
      },
    ];


    return (
      <>

        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={filterOwnerTableData}
          scroll={{ x: 800, y: 320 }}
          rowKey="_id"
        />
      </>
    );
  };

  const TruckTable = ({ ownerData, onEditClick }) => {
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

    const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
      console.log('selectedRowKeys changed: ', newSelectedRowKeys);
      setSelectedRowKeys(newSelectedRowKeys);
    };


    const rowSelection = {
      selectedRowKeys,
      onChange: onSelectChange,
    };

    const columns = [
      {
        title: 'Owner Name',
        dataIndex: 'name',
        key: 'name',
        width: 80,
      },
      {
        title: 'District',
        dataIndex: 'district',
        key: 'district',
        width: 80,
      },
      {
        title: 'State',
        dataIndex: 'state',
        key: 'state',
        width: 80,
      },
      {
        title: 'Email ID',
        dataIndex: 'email',
        key: 'email',
        width: 80,
      },
      {
        title: 'Action',
        key: 'action',
        width: 80,
        render: (record) => (
          <Space size="middle">
            <Tooltip placement="top" title="Preview"><a onClick={() => onEditClick(record)}><EyeOutlined /></a></Tooltip>
            <Tooltip placement="top" title="Edit"><a onClick={() => onEditClick(record)}><FormOutlined /></a></Tooltip>
            <Tooltip placement="top" title="Delete"><a><DeleteOutlined /></a></Tooltip>
          </Space>
        ),
      },
    ];


    return (
      <>

        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={ownerData}
          scroll={{ x: 800, y: 320 }}
          rowKey="_id"
        />
      </>
    );
  };



  return (
    <>
      <Tabs defaultActiveKey="1" items={items} onChange={onChange} />
    </>
  );
};

export default OnboardingContainer;
