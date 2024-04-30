import { useState, useEffect } from 'react';
// Assuming states.json is located in the same directory as your component
import states from '../Onboarding/states.json';
import {  DatePicker, Table, Input, Select, Space, Button, Upload,  Tooltip, Breadcrumb, Col,  Row } from 'antd';

import { UploadOutlined, DownloadOutlined, EyeOutlined, FormOutlined, DeleteOutlined,PrinterOutlined  } from '@ant-design/icons';

const { Search } = Input;
import backbutton_logo from "../../assets/backbutton.png"

import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch } from '../../redux/store'; // Import RootState and AppDispatch from your Redux store
import type { DatePickerProps } from 'antd';

const onChange: DatePickerProps['onChange'] = (date, dateString) => {
  console.log(date, dateString);
};
import { fetchOwnerData, addOwnerDataAccount } from "./../../redux/reducers/onboardingReducer";
interface RootState {
  onboarding: {
    ownerData: [];
  };
}

const DispatchContainer = () => {
  // Define a custom typed useDispatch hook
  const useAppDispatch = () => useDispatch<AppDispatch>();

  // Use the custom typed useDispatch hook
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchOwnerData());
  }, [dispatch]);
  // Usage in useSelector
  const ownerData = useSelector((state: RootState) => state.onboarding.ownerData);


  const selectedHubId = localStorage.getItem("selectedHubID");
  const selectedHubName = localStorage.getItem("selectedHubName");

  const filterTruckTableData = ownerData.filter((value) => value.vehicleIds && value.vehicleIds.length > 0 && value.hubId === selectedHubId);

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
  const filterOwnerTableData = ownerData.filter(value => value.hubId === selectedHubId);

  const [searchQuery, setSearchQuery] = useState('');
  const [filteredOwnerData, setFilteredOwnerData] = useState(filterOwnerTableData);
  // Update filteredOwnerData when selectedHubId changes
  useEffect(() => {
    // Filter ownerData based on selectedHubId
    const newFilteredOwnerData = ownerData.filter(value => value.hubId === selectedHubId);
    setFilteredOwnerData(newFilteredOwnerData);
  }, [selectedHubId, ownerData]);
  // Update filtered data when searchQuery or ownerData changes
  useEffect(() => {
    const filteredData = filterOwnerTableData.filter(value => {
      if (searchQuery.length > 0) {
        return (
          value.name.includes(searchQuery) || (value.vehicleIds.length > 0 && value.vehicleIds[0].registrationNumber.toLowerCase().includes(searchQuery.toLowerCase()))
        );
      } else {
        return true;
      }
    });
    setFilteredOwnerData(filteredData);
  }, [searchQuery, ownerData]);


  const handleSearch = (value) => {
    setSearchQuery(value);
  };
  const OwnerMaster = () => {
    return (
      <>
        {showOwnerTable ? (
          <>
            <Owner onAddOwnerClick={handleAddOwnerClick} />
            <OwnerTable filteredOwnerData={filteredOwnerData} onEditClick={handleEditClick} />
          </>
        ) : (
          rowDataForEdit ? (
            <ViewOwnerDataRow rowData={rowDataForEdit} />
          ) : (
            <TruckOwnerForm />
          )
        )}
      </>
    );
  };


  const Owner = ({ onAddOwnerClick }: { onAddOwnerClick: () => void }) => {
    const handleChange = (value: string) => {
      console.log(`selected ${value}`);
    };
    return (

      <div className='flex flex-col gap-2 justify-between p-2'>
        <div className='flex gap-2'>
        <Search placeholder="Search Delivery No / Truck No"  onSearch={handleSearch} style={{ width: 320 }} />
        <Space>
    <DatePicker onChange={onChange} placeholder="From Date" />
    <DatePicker onChange={onChange} placeholder="To Date" />
    <Select
      defaultValue="lucy"
      style={{ width: 200 }}
      onChange={handleChange}
   
      options={[
        { value: 'jack', label: 'Jack' },
        { value: 'lucy', label: 'Lucy' },
        { value: 'Yiminghe', label: 'yiminghe' },
        { value: 'disabled', label: 'Disabled', disabled: true },
      ]}
    />
     <Select
      defaultValue="CEMENT"
      style={{ width: 200 }}
      onChange={handleChange}
      options={[
        { value: 'cement', label: 'CEMENT' },
        { value: 'gypsum', label: 'GYPSUM' },
      ]}
    />
  </Space>
  </div>
 
        <div className='flex gap-2 justify-end my-4'>
          <Upload>
            <Button icon={<UploadOutlined />}></Button>
          </Upload>
          <Upload>
            <Button icon={<DownloadOutlined />}></Button>
          </Upload>
          <Upload>
            <Button icon={<PrinterOutlined />}></Button>
          </Upload>

          <Button onClick={onAddOwnerClick} className='bg-[#1572B6] text-white'> CREATE CHALLAN</Button>
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
      address: selectedHubName,

      vehicleIds: [],
      hubId: selectedHubId,
      bankAccounts: Array.from({ length: 1 }, () => ({
        accountNumber: '',
        accountHolderName: '',
        ifscCode: '',
        bankName: '',
        branchName: ''
      }))
    });
    console.log(formData)
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
    const [message, setMessage] = useState('');

    // const handleChangeBank = (e) => {
    //   setIfscCodeValue(e.target.value);
    //   setBankDetail({});
    //   setMessage('');
    // };

    const handleChangeBank = (index, e) => {
      const { value } = e.target;
      const updatedBankAccounts = [...formData.bankAccounts];
      updatedBankAccounts[index].ifscCode = value; // Update the IFSC code value for the specific bank form
      setFormData((prevFormData) => ({
        ...prevFormData,
        bankAccounts: updatedBankAccounts
      }));
    };

    const fetchBankDetails = (index) => {
      const bankAccount = formData.bankAccounts[index];
      const { ifscCode } = bankAccount;
      if (!ifscCode) {
        setMessage('Please fill IFSC code');
        return;
      }

      fetch(`https://ifsc.razorpay.com/${ifscCode}`)
        .then(response => response.json())
        .then(data => {
          // Update formData state with bank details for the specified bank account
          setFormData(prevFormData => ({
            ...prevFormData,
            bankAccounts: prevFormData.bankAccounts.map((account, i) => {
              if (i === index) {
                return {
                  ...account,
                  bankName: data.BANK,
                  branchName: data.BRANCH
                  // You can add more fields as needed
                };
              }
              return account;
            })
          }));
        })
        .catch(error => {
          setMessage('Invalid IFSC code');
        });
    };


    const [selectedState, setSelectedState] = useState('');
    const [districts, setDistricts] = useState([]);

    const handleStateChange = (value) => {
      setSelectedState(value);
      const selectedStateData = states.find((state) => state.state === value);
      if (selectedStateData) {
        setDistricts(selectedStateData.districts);
      } else {
        setDistricts([]);
      }
    };

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
          district: districts[0],
          state: selectedState,
          address: selectedHubName,
          hubId: selectedHubId,
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

      dispatch(addOwnerDataAccount(payload))
        .then((response) => {
          alert('Owner data added successfully!');
          window.location.reload();
          if (response.status === 200 || response.status === 201 || response.message === "Owner and Account created successfully") {
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
    return (
      <>
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
            <img src={backbutton_logo} alt="backbutton_logo" className='w-5 h-5 object-cover cursor-pointer' onClick={() => { setShowOwnerTable(true) }} />
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
                  <div ><Input type='number' placeholder="Mobile Number*" size="large" name="phoneNumber" onChange={handleOwnerFormChange} /></div>
                </Col>
                <Col className="gutter-row mt-6" span={12}>
                  <div ><Input type='email' placeholder="Email ID" size="large" name="email" onChange={handleOwnerFormChange} /></div>
                </Col>
                <Col className="gutter-row mt-6" span={12}>
                  <div ><Input placeholder="PAN Card No" size="large" name="panNumber" onChange={handleOwnerFormChange} /></div>
                </Col>

                <Col className="gutter-row mt-6" span={12}>
                  <div>
                    Select State : {" "}
                    <Select
                      placeholder="Select a state"
                      value={selectedState}
                      onChange={handleStateChange}
                      style={{ width: 360 }}
                      size='large'
                    >
                      {states.map((state) => (
                        <Option key={state.state} value={state.state}>
                          {state.state}
                        </Option>
                      ))}
                    </Select>
                  </div>
                </Col>
                <Col className="gutter-row mt-6" span={12}>
                  <div>
                    Select District : {" "}
                    <Select
                      size='large'
                      placeholder="Districts"
                      value={districts.length > 0 ? districts[0] : ''} // Ensure that districts represents a single selected district
                      onChange={(value) => setDistricts([value])} // Wrap the value in an array to represent a single selected district
                      style={{ width: 360 }}
                    >
                      {districts.map((district) => (
                        <Option key={district} value={district}>
                          {district}
                        </Option>
                      ))}
                    </Select>
                  </div>
                </Col>
              </Row>
            </div>

          </div>

          <div className="flex flex-col gap-1">
            <div className="flex justify-between">

              <div>

                <div className='text-md font-semibold'>Owner Bank Details</div>
                <div className='text-md font-normal'>Enter bank details</div>
              </div>
              <Button type="link" onClick={handleAddBankAccount} style={{ color: "#000" }}>+ Add Bank</Button>
            </div>

          

            {formData.bankAccounts.map((bankAccount, index) => (
              <div className="flex flex-col gap-1 bg-[#f6f6f6] p-4" key={index}>
                <h1>Bank {index + 1}</h1>
                <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
                  <Col className="gutter-row mt-2" span={8}>

                    <Search
                      name="ifscCode"
                      placeholder="Enter IFSC Code"
                      allowClear
                      enterButton="Search"
                      size="large"
                      value={bankAccount.ifscCode}
                      onChange={(e) => handleChangeBank(index, e)} // Pass index to handleChangeBank
                      onSearch={() => fetchBankDetails(index)} // Pass index to fetchBankDetails
                    />
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
                  <Button onClick={() => handleRemoveBankAccount(index)} style={{ width: 200 }}>Remove Bank Account</Button>
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
        <img src={backbutton_logo} alt="backbutton_logo" className='w-5 h-5 object-cover cursor-pointer' onClick={() => { setShowOwnerTable(true) }} />

        <div className="section mx-2 my-4">
          <h2 className='font-semibold text-md'>Vehicle Owner Information</h2>
          <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
            <Col className="gutter-row m-1" span={8}>
              <p className='flex flex-col font-normal'><span className="label text-sm">Owner Name</span> {rowData.name}</p>
            </Col>
            <Col className="gutter-row m-1" span={8}>
              <p className='flex flex-col font-normal'><span className="label text-sm">Mobile Number</span> {rowData.phoneNumber}</p>
            </Col>
            <Col className="gutter-row m-1" span={8}>
              <p className='flex flex-col font-normal'><span className="label text-sm">Email ID</span> {rowData.email}</p>
            </Col>
            <Col className="gutter-row m-1" span={8}>
              <p className='flex flex-col font-normal'><span className="label text-sm">PAN CARD No</span> {rowData.name}</p>
            </Col>
            <Col className="gutter-row m-1" span={8}>
              <p className='flex flex-col font-normal'><span className="label text-sm">District</span>  {rowData.district}</p>
            </Col>
            <Col className="gutter-row m-1" span={8}>
              <p className='flex flex-col font-normal'><span className="label text-sm">State</span> {rowData.state}</p>
            </Col>
            <Col className="gutter-row m-1" span={8}>
              <p className='flex flex-col font-normal'><span className="label text-sm">Address</span> {rowData.address}</p>
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
                  <p className='flex flex-col font-normal'><span className="label text-sm">Account Number:</span> {account.accountNumber}</p>
                </Col>
                <Col className="gutter-row m-1" span={8}>
                  <p className='flex flex-col font-normal'><span className="label text-sm">Account Holder Name:</span> {account.accountHolderName}</p>
                </Col>
                <Col className="gutter-row m-1" span={8}>
                  <p className='flex flex-col font-normal'><span className="label text-sm">Branch Name:</span> {account.branchName}</p>
                </Col>
                <Col className="gutter-row m-1" span={8}>
                  <p className='flex flex-col font-normal'><span className="label text-sm">IFSC Code:</span> {account.ifscCode}</p>
                </Col>
                <Col className="gutter-row m-1" span={8}>
                  <p className='flex flex-col font-normal'><span className="label text-sm">Bank Name:</span> {account.bankName}</p>
                </Col>
              </Row>
            </div>
          ))}
        </div>
        <div className="section mx-2 my-4">
          <h2 className='font-semibold text-md'>Vehicle Details</h2>
          {rowData.vehicleIds.map((vehicle, index) => (
            <div key={index}>
              <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
                <Col className="gutter-row m-1" span={8}>
                  <p className='flex flex-col font-normal'><span className="label text-sm">Vehicle No:</span> {vehicle.registrationNumber}</p>
                </Col>
              </Row>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const OwnerTable = ({ filteredOwnerData, onEditClick }) => {
    useEffect(() => {
    }, [filteredOwnerData]);

    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

    const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys);
    };


    const rowSelection = {
      selectedRowKeys,
      onChange: onSelectChange,
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
        title: 'Owner Name',
        dataIndex: 'name',
        key: 'name',
        width: 80,
      },
      {
        title: 'District',
        dataIndex: 'district',
        key: 'district',
        width: 60,
      },
      {
        title: 'State',
        dataIndex: 'state',
        key: 'state',
        width: 60,
      },
      {
        title: 'Email ID',
        dataIndex: 'email',
        key: 'email',
        width: 120,
      },
      {
        title: 'Action',
        key: 'action',
        width: 60,
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
          dataSource={filteredOwnerData}
          scroll={{ x: 800, y: 320 }}
          rowKey="_id"
        />
      </>
    );
  };
  return (
    <div>
      <OwnerMaster />
    </div>
  )
}

export default DispatchContainer