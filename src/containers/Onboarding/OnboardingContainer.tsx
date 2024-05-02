import { useState, useEffect } from 'react';
// Assuming states.json is located in the same directory as your component
import states from './states.json';
import { Table, Input, Select, Space, Button, Upload, Tabs, Tooltip, Breadcrumb, Col, List, Row, Switch } from 'antd';
import type { TabsProps } from 'antd';
import { UploadOutlined, DownloadOutlined, EyeOutlined, FormOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';
const { Search } = Input;
import backbutton_logo from "../../assets/backbutton.png"

// const { Option } = Select;
const onChange = (key: string) => {
  console.log(key);
};
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch } from '../../redux/store'; // Import RootState and AppDispatch from your Redux store

import { fetchOwnerData, addOwnerDataAccount } from "./../../redux/reducers/onboardingReducer";
interface RootState {
  onboarding: {
    ownerData: [];
  };
}
const OnboardingContainer = () => {

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
    localStorage.setItem("displayHeader","none");
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
    return (
      <div className='flex gap-2 justify-between p-2'>

        <Search placeholder="Search by Owner Name / Truck no" size='large' onSearch={handleSearch} style={{ width: 320 }} />
        <div className='flex gap-2'>

          <Upload>
            <Button icon={<UploadOutlined />}></Button>
          </Upload>
          <Upload>
            <Button icon={<DownloadOutlined />}></Button>
          </Upload>

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

    const goBack=()=>{
      setShowOwnerTable(true)
      localStorage.setItem("displayHeader", "flex");
    }
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
            <img src={backbutton_logo} alt="backbutton_logo" className='w-5 h-5 object-cover cursor-pointer' onClick={goBack} />
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

            {/* {formData.bankAccounts.map((bankAccount, index) => (
              <div className="flex flex-col gap-1 bg-[#f6f6f6] p-4" key={index}>
                <h1>Bank {index + 1}</h1>
                <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
                  <Col className="gutter-row mt-2" span={5}>
                    <Search
                      name="ifscCode"
                      placeholder="Enter IFSC Code"
                      allowClear
                      enterButton="Search"
                      size="large"
                      value={ifscCodevalue}
                      onChange={handleChangeBank}
                      onSearch={() => fetchBankDetails(index)}
                    />
                    {/* <Input placeholder="IFSC  Code*" size="large" name="ifscCode" value={bankAccount.ifscCode} onChange={(e) => handleBankAccountChange(index, e)} /> 
                  </Col>
                  <Col className="gutter-row mt-2" span={5}>
                    <Input placeholder="Bank Name*" size="large" name="bankName" value={bankDetail.BANK} onChange={(e) => handleBankAccountChange(index, e)} />
                  </Col>
                  <Col className="gutter-row mt-2" span={5}>
                    <Input placeholder="Bank Branch*" size="large" name="branchName" value={bankDetail.BRANCH} onChange={(e) => handleBankAccountChange(index, e)} />
                  </Col>
                  <Col className="gutter-row mt-2" span={5}>
                    <Input placeholder="Bank Account Number*" size="large" name="accountNumber" value={bankAccount.accountNumber} onChange={(e) => handleBankAccountChange(index, e)} />
                  </Col>
                  <Col className="gutter-row mt-2" span={5}>
                    <Input placeholder="Bank Account Holder Name*" size="large" name="accountHolderName" value={bankAccount.accountHolderName} onChange={(e) => handleBankAccountChange(index, e)} />
                  </Col>
                </Row>
                {formData.bankAccounts.length > 1 && (
                  <Button onClick={() => handleRemoveBankAccount(index)} style={{ width: 200 }}>Remove Bank Account</Button>
                )}
              </div>
            ))} */}

            {formData.bankAccounts.map((bankAccount, index) => (
              <div className="flex flex-col gap-1 bg-[#f6f6f6] p-4" key={index}>
                <h1>Bank {index + 1}</h1>
                <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
                  <Col className="gutter-row mt-2" span={5}>

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
                  <Col className="gutter-row mt-2" span={5}>
                    <Input placeholder="Bank Name*" size="large" name="bankName" value={bankAccount.bankName} onChange={(e) => handleBankAccountChange(index, e)} />
                  </Col>
                  <Col className="gutter-row mt-2" span={5}>
                    <Input placeholder="Bank Branch*" size="large" name="branchName" value={bankAccount.branchName} onChange={(e) => handleBankAccountChange(index, e)} />
                  </Col>
                  <Col className="gutter-row mt-2" span={5}>
                    <Input placeholder="Bank Account Number*" size="large" name="accountNumber" value={bankAccount.accountNumber} onChange={(e) => handleBankAccountChange(index, e)} />
                  </Col>
                  <Col className="gutter-row mt-2" span={5}>
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
            <Col className="gutter-row m-1" span={5}>
              <p className='flex flex-col font-normal m-2'><span className="label text-sm">Owner Name</span> {rowData.name}</p>
            </Col>
            <Col className="gutter-row m-1" span={5}>
              <p className='flex flex-col font-normal m-2'><span className="label text-sm">Mobile Number</span> {rowData.phoneNumber}</p>
            </Col>
            <Col className="gutter-row m-1" span={5}>
              <p className='flex flex-col font-normal m-2'><span className="label text-sm">Email ID</span> {rowData.email}</p>
            </Col>
            <Col className="gutter-row m-1" span={5}>
              <p className='flex flex-col font-normal m-2'><span className="label text-sm">PAN CARD No</span> {rowData.name}</p>
            </Col>
            <Col className="gutter-row m-1" span={5}>
              <p className='flex flex-col font-normal m-2'><span className="label text-sm">District</span>  {rowData.district}</p>
            </Col>
            <Col className="gutter-row m-1" span={5}>
              <p className='flex flex-col font-normal m-2'><span className="label text-sm">State</span> {rowData.state}</p>
            </Col>
            <Col className="gutter-row m-1" span={5}>
              <p className='flex flex-col font-normal m-2'><span className="label text-sm">Address</span> {rowData.address}</p>
            </Col>

          </Row>
        </div>
        <div className="section mx-2 my-4">
          <h2 className='font-semibold text-md'>Owner Bank Details</h2>
          {rowData.accountIds.map((account, index) => (
            <div key={index}>
              <h3>Bank Account {index + 1}</h3>
              <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
              <Col className="gutter-row m-1" span={5}>
                  <p className='flex flex-col font-normal m-2'><span className="label text-sm">IFSC Code:</span> {account.ifscCode}</p>
                </Col>
                <Col className="gutter-row m-1" span={5}>
                  <p className='flex flex-col font-normal m-2'><span className="label text-sm">Bank Name:</span> {account.bankName}</p>
                </Col>
                <Col className="gutter-row m-1" span={5}>
                  <p className='flex flex-col font-normal m-2'><span className="label text-sm">Branch Name:</span> {account.branchName}</p>
                </Col>
                <Col className="gutter-row m-1" span={5}>
                  <p className='flex flex-col font-normal m-2'><span className="label text-sm">Bank Account Number:</span> {account.accountNumber}</p>
                </Col>
                <Col className="gutter-row m-1" span={8}>
                  <p className='flex flex-col font-normal m-2'><span className="label text-sm">Bank Account Holder Name:</span> {account.accountHolderName}</p>
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
                <Col className="gutter-row m-1" span={5}>
                  <p className='flex flex-col font-normal m-2'><span className="label text-sm">Vehicle No:</span> {vehicle.registrationNumber}</p>
                </Col>
              </Row>
            </div>
          ))}
        </div>
      </div>
    );
  };
  // Truck master
  const Truck = ({ onAddTruckClick }: { onAddTruckClick: () => void }) => {
    return (
      <div className='flex gap-2 justify-between p-2'>

        <Search
          placeholder="Search by Vehicle Number"
          size='large'
          onSearch={handleSearch}
          style={{ width: 320 }}
        />
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

  const TruckMaster = () => {
    return (
      <>
        <>
          {showTruckTable ? (
            <>
              <Truck onAddTruckClick={handleAddTruckClick} />
              <TruckTable ownerData={filterTruckTableData} onEditTruckClick={handleEditTruckClick} />
            </>
          ) : (
            rowDataForTruckEdit ? (
              <ViewTruckDataRow filterTruckTableData={rowDataForTruckEdit} />
            ) : (
              <TruckMasterForm />
            )
          )}
        </>
      </>
    )
  }
  const TruckMasterForm = () => {

    const ownerIdSelect = filterOwnerTableData
    const [formData, setFormData] = useState({
      registrationNumber: '',
      isActive: true,
      commission: '',
      ownerId: '',
      vehicleType: '',
      rcBook: '',
      isCommission: true,
      truckLinkCommission: '',
      marketRateCommission: '',
    });

    const handleChange = (name, value) => {
      if (name === "isCommission") {
        if (!value) {
          // If isCommission is false, set truckLinkCommission to an empty string
          setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: value,
            truckLinkCommission: "",
          }));
        } else {
          // If isCommission is true, set marketRateCommission to an empty string
          setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: value,
            marketRateCommission: "",
          }));
        }
      } else {
        // For other fields, update state normally
        setFormData((prevFormData) => ({
          ...prevFormData,
          [name]: value,
        }));
      }
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      const payload = {
        registrationNumber: formData.registrationNumber,
        isActive: formData.isActive,
        commission: formData.commission,
        ownerId: formData.ownerId,
        vehicleType: formData.vehicleType,
        rcBook: formData.rcBook,
        isCommission: formData.isCommission,
        truckLinkCommission: formData.truckLinkCommission,
        marketRateCommission: "0",
      };

      axios
        .post('https://trucklinkuatnew.thestorywallcafe.com/api/owner/owner-vehicle', payload)
        .then((response) => {
          console.log('Truck data added successfully:', response.data);
          window.location.reload(); // Reload the page or perform any necessary action
        })
        .catch((error) => {
          console.error('Error adding truck data:', error);
        });
    };

    return (
      <>
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-bold">Create Truck</h1>
            {/* Breadcrumb component */}
            <img src={backbutton_logo} alt="backbutton_logo" className='w-5 h-5 object-cover cursor-pointer' onClick={() => setShowTruckTable(true)} />

          </div>
          <div className="flex flex-col gap-1">
            <div className="flex flex-col gap-1">
              <div className="text-md font-semibold">Vehicle Information</div>
              <div className="text-md font-normal">Enter Truck Details</div>
            </div>

            <div className="flex flex-col gap-1">
              <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
                <Col className="gutter-row mt-6" span={12}>
                  <Input
                    placeholder="Vehicle Number*"
                    size="large"
                    name="registrationNumber"
                    onChange={(e) => handleChange('registrationNumber', e.target.value)}
                  />
                </Col>
                <Col className="gutter-row mt-6" span={12}>
                  <Select
                    name="vehicleType"
                    placeholder="Vehicle Type*"
                    size="large"
                    style={{ width: '100%' }}
                    options={[
                      { value: 'open', label: 'Open' },
                      { value: 'bulk', label: 'Bulk' },
                    ]}
                    onChange={(value) => handleChange('vehicleType', value)}
                  />
                </Col>
                <Col className="gutter-row mt-6" span={12}>

                  <Select
                    size='large'
                    placeholder="Owner Mobile Number"
                    style={{ width: '100%' }}
                    name="ownerId"
                    onChange={(value) => handleChange('ownerId', value)}
                  >
                    {ownerIdSelect.map((owner, index) => (
                      <Option key={index} value={owner._id}>
                        {`${owner.name} - ${owner.phoneNumber}`}
                      </Option>
                    ))}
                  </Select>

                </Col>
                <Col className="gutter-row mt-6" span={12}>
                  {/* Empty Col */}
                </Col>

                <Col className="gutter-row mt-6" span={4}>
                  <div>
                    Commission %{' '}
                    <Switch
                      defaultChecked={formData.isCommission}
                      name="isCommission"
                      onChange={(checked) => handleChange('isCommission', checked)}
                    />
                  </div>
                </Col>
                {formData.isCommission ? (
                  <>
                    <Col className="gutter-row mt-6" span={5}>
                      <Input
                        placeholder="Enter Commission %*"
                        size="large"
                        name="truckLinkCommission"
                        onChange={(e) => handleChange('truckLinkCommission', e.target.value)}
                      />
                    </Col>
                  </>
                ) : (
                  <></>
                  // <>
                  //   <Col className="gutter-row mt-6" span={5}>
                  //     <Input
                  //       placeholder="Enter Market rate Commission %*"
                  //       size="large"
                  //       name="marketRateCommission"
                  //       onChange={(e) => handleChange('marketRateCommission', e.target.value)}
                  //     />
                  //   </Col>
                  // </>
                )}

                <Col className="gutter-row mt-6" span={5}>
                  <div>
                    RC Book*: {' '}
                    <Upload name="truckLinkCommission">
                      <Button icon={<UploadOutlined />}>Upload</Button>
                    </Upload>
                  </div>
                </Col>
              </Row>
            </div>
          </div>

          <div className="flex gap-4">
            <Button onClick={() => setShowOwnerTable(true)}>Reset</Button>
            <Button type="primary" className="bg-primary" onClick={handleSubmit}>
              Save
            </Button>
          </div>
        </div>
      </>
    );
  };

  const ViewTruckDataRow = ({ filterTruckTableData }) => {
    return (
      <div className="owner-details">

        <img src={backbutton_logo} alt="backbutton_logo" className='w-5 h-5 object-cover cursor-pointer' onClick={() => { setShowTruckTable(true) }} />
        <div className="section mx-2 my-4">
          <h2 className='font-semibold text-md'>Vehicle Information</h2>
          <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
            <Col className="gutter-row m-1" span={5}>
              <p className='flex flex-col font-normal m-2'><span className="label text-sm">Enter Truck details </span> </p>
            </Col>

          </Row>
        </div>

      </div>
    );
  };

  // Master data

  const MasterData = () => {
    // State to store the list of materials
    const [materials, setMaterials] = useState([]);
    // State to store the input value for adding material type
    const [materialType, setMaterialType] = useState('');
    const [loadLocationName, setLoadLocationName] = useState('');
    const [loadLocation, setloadLocations] = useState([]);

    const [deliveryLocationName, setDeliveryLocationName] = useState('');
    const [deliveryLocation, setDeliveryLocations] = useState([]);
    // Function to fetch materials from the API
    const fetchMaterials = async () => {
      try {
        const response = await axios.get('https://trucklinkuatnew.thestorywallcafe.com/api/material-type');
        console.log(response.data)
        const filteredMaterials = response.data.filter(value => value.hubId === selectedHubId);

        setMaterials(filteredMaterials);
      } catch (error) {
        console.error('Error fetching materials:', error);
      }
    };
    // Function to handle adding a new material type
    const handleAddMaterial = async () => {
      try {
        // Post the new material type to the API
        const payload = {
          "materialType": materialType,
          "hubId": selectedHubId
        }
        await axios.post('https://trucklinkuatnew.thestorywallcafe.com/api/material-type', payload);
        // Fetch updated materials
        fetchMaterials();
        // Clear the input field
        setMaterialType('');
      } catch (error) {
        console.error('Error adding material:', error);
      }
    };

    // Function to fetch materials from the API
    const fetchLoadLocations = async () => {
      try {
        const response = await axios.get('https://trucklinkuatnew.thestorywallcafe.com/api/load-location');
        const filterLocations = response.data.filter((value) => value.type === "LOAD" && value.hubId === selectedHubId);
        setloadLocations(filterLocations);

      } catch (error) {
        console.error('Error fetching materials:', error);
      }
    };


    // Function to handle adding a new material type
    const handleAddLoadLocation = async () => {
      try {
        const payload =
        {
          "location": loadLocationName,
          "type": "LOAD",
          "hubId": selectedHubId

        }
        // Post the new material type to the API
        await axios.post('https://trucklinkuatnew.thestorywallcafe.com/api/load-location', payload);
        fetchLoadLocations()
        // Clear the input field
        setLoadLocationName('');
      } catch (error) {
        console.error('Error adding material:', error);
      }
    };

    // Function to fetch materials from the API
    const fetchDeliveryLocations = async () => {
      try {
        const response = await axios.get('https://trucklinkuatnew.thestorywallcafe.com/api/load-location');
        const filterDelivery = response.data.filter((value) => value.type === "DELIVERY" && value.hubId === selectedHubId);
        setDeliveryLocations(filterDelivery);
      } catch (error) {
        console.error('Error fetching materials:', error);
      }
    };


    // Function to handle adding a new material type
    const handleAddDeliveryLocation = async () => {
      try {
        const payload =
        {
          "location": deliveryLocationName,
          "type": "DELIVERY",
          "hubId": selectedHubId

        }
        // Post the new material type to the API
        await axios.post('https://trucklinkuatnew.thestorywallcafe.com/api/load-location', payload);
        fetchDeliveryLocations()
        // Clear the input field
        setDeliveryLocationName('');
      } catch (error) {
        console.error('Error adding material:', error);
      }
    };

    // Fetch materials on component mount
    useEffect(() => {
      fetchMaterials();
      fetchLoadLocations()
      fetchDeliveryLocations()
    }, []);

    return (
      <>
        <div className="flex flex-col">
          <div className="flex gap-12">


            <div className='flex flex-col gap-2 p-2' style={{ width: "600px", border: "2px solid #eee" }} >
              <div className="flex gap-2">

                <Input
                  placeholder="Enter material type"
                  value={materialType}
                  size="large"
                  onChange={(e) => setMaterialType(e.target.value)}
                />
                <Button size='large' type="primary" onClick={handleAddMaterial}>
                  Add Material
                </Button>
              </div>

              <div>
                <List
                  style={{ overflowY: "scroll", height: "220px" }}
                  header={<div>Material List</div>}

                  dataSource={materials}
                  renderItem={(item) => (
                    <List.Item style={{ width: "300px" }}>
                      {item.materialType}
                    </List.Item>
                  )}
                />
              </div>
            </div>
            <div className='flex flex-col gap-2 p-2' style={{ width: "600px", border: "2px solid #eee" }} >
              <div className="flex gap-2">

                <Input
                  placeholder="Enter Load Location"
                  value={loadLocationName}
                  size="large"
                  onChange={(e) => setLoadLocationName(e.target.value)}
                />
                <Button size='large' type="primary" onClick={handleAddLoadLocation}>
                  Add Load Location
                </Button>
              </div>

              <div>
                <List
                  style={{ overflowY: "scroll", height: "220px" }}
                  header={<div>Load Location</div>}

                  dataSource={loadLocation}
                  renderItem={(item) => (
                    <List.Item style={{ width: "300px" }}>
                      {item.location}
                    </List.Item>
                  )}
                />
              </div>
            </div>

          </div>
          <div className="flex mt-12 gap-12">


            <div className='flex flex-col gap-2 p-2' style={{ width: "600px", border: "2px solid #eee" }} >
              <div className="flex gap-2">

                <Input
                  placeholder="Enter Delivery Location"
                  value={deliveryLocationName}
                  size="large"
                  onChange={(e) => setDeliveryLocationName(e.target.value)}
                />
                <Button size='large' type="primary" onClick={handleAddDeliveryLocation}>
                  Add Delivery Location
                </Button>
              </div>

              <div>
                <List
                  style={{ overflowY: "scroll", height: "220px" }}
                  header={<div>Delivery Location</div>}

                  dataSource={deliveryLocation}
                  renderItem={(item) => (
                    <List.Item style={{ width: "300px" }}>
                      {item.location}
                    </List.Item>
                  )}
                />
              </div>
            </div>

            <div className='flex flex-col gap-2 p-2' style={{ width: "600px", }} >
            </div>

          </div>
        </div>
      </>
    );
  };
  const [showTransferLogTable, setShowTransferLogTable] = useState(true);
  const [rowDataForTransferLogEdit, setRowDataForTransferLogEdit] = useState(null);
  const TransferLogHeader = () => {
    return (
      <div className='flex gap-2 justify-between p-2'>

        <Search
          placeholder="Search by Vehicle Number"
          size='large'
          onSearch={handleSearch}
          style={{ width: 320 }}
        />
      </div>

    );
  };

  const ViewTransferLogDataRow = ({ filterTruckTableData }) => {
    return (
      <div className="owner-details">

        <img src={backbutton_logo} alt="backbutton_logo" className='w-5 h-5 object-cover cursor-pointer' onClick={() => { setShowTruckTable(true) }} />
        <div className="section mx-2 my-4">
          <h2 className='font-semibold text-md'>Vehicle Information</h2>
          <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
            <Col className="gutter-row m-1" span={5}>
              <p className='flex flex-col font-normal m-2'><span className="label text-sm">Enter Truck details </span> </p>
            </Col>

          </Row>
        </div>

      </div>
    );
  };
  const OwnerTransferLog = () => {
    const [transferData, setTransferData] = useState([])
    const getTransferDetails = async () => {
      let response = await axios.get("https://trucklinkuatnew.thestorywallcafe.com/api/vehicle")
        .then((res) => {
          const filter = res.data.filter((value) => value.ownerTransferId);
          setTransferData(filter);
        }).catch((err) => {
          console.log(err)
        })


    }
    useEffect(() => {
      getTransferDetails()
    }, [])
    return (
      <>

        <TransferLogHeader />
        <TransferLogTable transferData={transferData} />

      </>
    )
  }

  const ActivityContainer = () => {
    return (
      <div>ActivityContainer</div>
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
    {
      key: '4',
      label: 'Owner Transfer log',
      children: <OwnerTransferLog />,
    },
    {
      key: '5',
      label: 'Activity log',
      children: <ActivityContainer />,
    },
  ];

  
 
  
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

  const TruckTable = ({ ownerData, onEditTruckClick }) => {
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
        render: (text, record, index: any) => index + 1,
        width: 80,
      },
      {
        title: 'Vehicle Number',
        dataIndex: 'registrationNumber',
        key: 'registrationNumber',
        width: 80,
      },
      {
        title: 'Vehicle Type',
        dataIndex: 'vehicleType',
        key: 'vehicleType',
        width: 80,
      },
      {
        title: 'Owner Number',
        dataIndex: 'phoneNumber',
        key: 'phoneNumber',
        width: 80,
      },
      {
        title: 'Commission %',
        dataIndex: 'truckLinkCommission',
        key: 'truckLinkCommission',
        width: 80,
      },
      {
        title: 'Action',
        key: 'action',
        width: 80,
        render: (record: unknown) => (
          <Space size="middle">
            {/* <Tooltip placement="top" title="Preview"><a onClick={() => onEditTruckClick(record)}><EyeOutlined /></a></Tooltip> */}
            <Tooltip placement="top" title="Preview"><EyeOutlined /></Tooltip>
            <Tooltip placement="top" title="Edit"><a onClick={() => onEditTruckClick(record)}><FormOutlined /></a></Tooltip>
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
          dataSource={ownerData.reduce((acc, owner) => {
            return acc.concat(owner.vehicleIds.map((vehicle: any) => ({
              ...vehicle,
              phoneNumber: owner.phoneNumber // Add phoneNumber from the owner object
            })));
          }, [])}
          scroll={{ x: 800, y: 320 }}
          rowKey="_id"
        />
      </>
    );
  };

  const TransferLogTable = ({ transferData }) => {
    console.log(transferData)
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

    const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys);
    };


    const rowSelection = {
      selectedRowKeys,
      onChange: onSelectChange,
    };

    // Extracting transferOwnerId values from transferData
    // const transferOwnerIds = transferData.map(data => data.transferOwnerId);
    // Extracting ownerTransferId values from transferData
    const ownerTransferIds = transferData.map(data => data.ownerTransferId);

    const columns = [
      {
        title: 'Sl No',
        dataIndex: 'serialNumber',
        key: 'serialNumber',
        render: (text, record, index: any) => index + 1,
        width: 50,
      },
      {
        title: 'Vehicle Number',
        dataIndex: 'vehicleNumber',
        key: 'vehicleNumber',
        width: 80,
      },
      {
        title: 'Transfer From (owner)',
        dataIndex: 'ownerTransferId',
        key: 'ownerTransferId',
        render: (text, record) => record.ownerTransferId?.oldOwnerId?.name || 'N/A',
        width: 100,
      },

      {
        title: 'Transfer To (owner)',
        dataIndex: 'ownerTransferId',
        key: 'ownerTransferId',
        render: (text, record) => record.ownerTransferId?.newOwnerId?.name,
        width: 100,
      },

      {
        title: 'Transfer From Date',
        dataIndex: 'ownerTransferFromDate',
        key: 'ownerTransferFromDate',
        render: (text, record) => {
          const date = new Date(record.ownerTransferFromDate);
          const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            hour12: true
          };
          return date.toLocaleDateString('en-US', options);
        },
        width: 100,
      },
      {
        title: 'Transfer To Date',
        dataIndex: 'ownerTransferToDate',
        key: 'ownerTransferToDate',
        render: (text, record) => {
          const date = new Date(record.ownerTransferToDate);
          const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            hour12: true
          };
          return date.toLocaleDateString('en-US', options);
        },
        width: 100,
      },
    ];
    return (
      <>

        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={ownerTransferIds}
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
