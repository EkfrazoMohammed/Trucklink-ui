import { useState, useEffect } from 'react';
// Assuming states.json is located in the same directory as your component
import states from './states.json';
import { Table, Input, Select, Space, Button, Upload, Tabs, Tooltip, Breadcrumb, Col, Row, Pagination } from 'antd';
import type { TabsProps } from 'antd';
import { UploadOutlined, DownloadOutlined, EyeOutlined, FormOutlined, DeleteOutlined } from '@ant-design/icons';
const { Search } = Input;
import backbutton_logo from "../../assets/backbutton.png"
import { API } from "../../API/apirequest"
import debounce from 'lodash/debounce';
import TruckMaster from './TruckMaster';
import MasterData from './MasterData';
import OwnerTransferLog from './OwnerTransferLog';
import OwnerActivityLog from './OwnerActivityLog';
const onChange = (key: string) => {
  console.log(key);
};
const onSearch = (value: string) => {
  console.log('search:', value);
};

// Filter `option.value` match the user type `input`
const filterOption = (input: string, option?: { label: string; value: string }) =>
  (option?.value ?? '').toLowerCase().includes(input.toLowerCase());

const OnboardingContainer = () => {
  const selectedHubId = localStorage.getItem("selectedHubID");
  const selectedHubName = localStorage.getItem("selectedHubName");
  const [showOwnerTable, setShowOwnerTable] = useState(true);
  const [rowDataForEdit, setRowDataForEdit] = useState(null);
  const [rowDataForView, setRowDataForView] = useState(null);

  const handleAddOwnerClick = () => {
    setRowDataForEdit(null);
    setShowOwnerTable(false);
    localStorage.setItem("displayHeader", "none");
  };
  const handleEditClick = (rowData) => {
    setRowDataForEdit(rowData);
    setShowOwnerTable(false);
    setShowEditForm(true)
  };
  const handleViewClick = (rowData) => {
    setRowDataForEdit(rowData);
    setRowDataForView(rowData);
    setShowOwnerTable(false);
    setShowEditForm(false)
  };
  const handleDeleteClick = async (rowData) => {
    console.log("deleting", rowData._id)
    const response = await API.delete(`delete-owner-details/${rowData._id}`);
    console.log(response)
    if (response.status === 201) {
      alert("deleted data")
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } else {
      alert(`unable to delete data`)
      console.log(response.data)

    }
  }

  const [searchQuery, setSearchQuery] = useState('');
  const [filteredOwnerData, setFilteredOwnerData] = useState([]);

  const handleSearch = (e) => {
    setSearchQuery(e);
  };

  // const onChangeSearch = (e) => {
  //   console.log(e.target.value)
  // }
  const onChangeSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    // handleSearch(e.target.value);
    console.log(e.target.value)
  };
  const debouncedSearch = debounce(handleSearch, 800);

  const [totalOwnerData, setTotalOwnerData] = useState(100)

  const getTableData = async (searchQuery, page, limit, selectedHubID) => {
    try {
      const pages = page;
      const limitData = 600;
      const searchData = searchQuery ? searchQuery : null;
      const response = searchData ? await API.get(`get-owner-bank-details?searchOwnerName=${searchData}&page=${pages}&limit=${limitData}&hubId=${selectedHubId}`)
        : await API.get(`get-owner-bank-details?page=${pages}&limit=${limitData}&hubId=${selectedHubId}`)
      let ownerDetails;
      if (response.data.ownerDetails.length == 0) {
        ownerDetails = response.data.ownerDetails
        setFilteredOwnerData(ownerDetails);
      } else {
        ownerDetails = response.data.ownerDetails[0].data || "";
        setTotalOwnerData(response.data.ownerDetails[0].count)
        if (ownerDetails && ownerDetails.length > 0) {
          const arrRes = ownerDetails.sort(function (a, b) {
            a = a.name.toLowerCase();
            b = b.name.toLowerCase();
            return a < b ? -1 : a > b ? 1 : 0;
          });
          setFilteredOwnerData(arrRes);
        }
      }
    } catch (err) {
      console.log(err)
    }
  };
  const [showEditForm, setShowEditForm] = useState(false)
  const OwnerMaster = () => {
    return (
      <>
        <div className="mytab-content">


          {showOwnerTable ? (
            <>
              <Owner onAddOwnerClick={handleAddOwnerClick} />
              <OwnerTable filteredOwnerData={filteredOwnerData} onEditClick={handleEditClick} onViewClick={handleViewClick} onDeleteClick={handleDeleteClick} />
            </>
          ) :
            (
              rowDataForEdit ? <>
                {showEditForm ? <EditTruckOwnerForm rowDataForEdit={rowDataForEdit} /> :
                  <ViewOwnerDataRow rowData={rowDataForView} />
                }
              </> : (
                <AddTruckOwnerForm />
              )
            )
          }
        </div>
      </>
    );
  };

  const Owner = ({ onAddOwnerClick }: { onAddOwnerClick: () => void }) => {
    return (
      <div className='flex gap-2 justify-between p-2'>
        <Search placeholder="Search by Owner Name / Truck no" size='large' onSearch={handleSearch} onChange={onChangeSearch} style={{ width: 320 }} />
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


  const ViewOwnerDataRow = ({ rowData }) => {
    return (
      <div className="owner-details">
        <img src={backbutton_logo} alt="backbutton_logo" className='w-5 h-5 object-cover cursor-pointer' onClick={() => { setShowOwnerTable(true) }} />
        <div className="section mx-2 my-4">
          <h2 className='font-semibold text-md'>Vehicle Owner Information</h2>
          <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
            <Col className="gutter-row m-1" span={5}><p className='flex flex-col font-normal m-2'><span className="label text-sm">Owner Name</span> {rowData.name}</p></Col>
            <Col className="gutter-row m-1" span={5}><p className='flex flex-col font-normal m-2'><span className="label text-sm">Mobile Number</span> {rowData.phoneNumber}</p></Col>
            <Col className="gutter-row m-1" span={5}><p className='flex flex-col font-normal m-2'><span className="label text-sm">Email ID</span> {rowData.email}</p></Col>
            <Col className="gutter-row m-1" span={5}><p className='flex flex-col font-normal m-2'><span className="label text-sm">PAN CARD No</span> {rowData.panNumber}</p></Col>
            <Col className="gutter-row m-1" span={5}> <p className='flex flex-col font-normal m-2'><span className="label text-sm">District</span>  {rowData.district}</p></Col>
            <Col className="gutter-row m-1" span={5}> <p className='flex flex-col font-normal m-2'><span className="label text-sm">State</span> {rowData.state}</p> </Col>
            <Col className="gutter-row m-1" span={5}><p className='flex flex-col font-normal m-2'><span className="label text-sm">Address</span> {rowData.address}</p></Col>
          </Row>
        </div>
        <div className="section mx-2 my-4">
          <h2 className='font-semibold text-md'>Owner Bank Details</h2>
          {rowData.accountIds.map((account, index) => (
            <div key={index}>
              <h3>Bank Account {index + 1}</h3>
              <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
                <Col className="gutter-row m-1" span={5}>  <p className='flex flex-col font-normal m-2'><span className="label text-sm">IFSC Code:</span> {account.ifscCode}</p> </Col>
                <Col className="gutter-row m-1" span={5}> <p className='flex flex-col font-normal m-2'><span className="label text-sm">Bank Name:</span> {account.bankName}</p></Col>
                <Col className="gutter-row m-1" span={5}> <p className='flex flex-col font-normal m-2'><span className="label text-sm">Branch Name:</span> {account.branchName}</p></Col>
                <Col className="gutter-row m-1" span={5}> <p className='flex flex-col font-normal m-2'><span className="label text-sm">Bank Account Number:</span> {account.accountNumber}</p> </Col>
                <Col className="gutter-row m-1" span={8}> <p className='flex flex-col font-normal m-2'><span className="label text-sm">Bank Account Holder Name:</span> {account.accountHolderName}</p> </Col>
              </Row>
            </div>
          ))}
        </div>
        <div className="section mx-2 my-4">
          <h2 className='font-semibold text-md'>Vehicle Details</h2>
          {rowData.vehicleIds.map((vehicle, index) => (
            <div key={index}>
              <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
                <Col className="gutter-row m-1" span={5}> <p className='flex flex-col font-normal m-2'><span className="label text-sm">Vehicle No:</span> {vehicle.registrationNumber}</p> </Col>
              </Row>
            </div>
          ))}
        </div>
      </div>
    );
  };
  const AddTruckOwnerForm = () => {
    const [formData, setFormData] = useState({
      name: '',
      email: '',
      phoneNumber: '',
      countryCode: '',
      panNumber: '',
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
      if (formData.bankAccounts.length < 2) {
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

      const oldPayload = {

        "owner_details": {
          "hubId": "6634de2e2588845228b2dbe4",
          "name": "raghav456",
          "email": "raghav456@gmail.com",
          "phoneNumber": "8950889910",
          "panNumber": "raghav456",
          "address": "raghav456",
          "district": "raghav456",
          "state": "Assam"

        },
        "bank_details": [
          {
            "accountNumber": "raghav4561234",
            "accountHolderName": "raghav4561234",
            "ifscCode": "raghav456",
            "bankName": "raghav456",
            "branchName": "raghav456"
          },
          {
            "accountNumber": "raghav4562",
            "accountHolderName": "raghav4562",
            "ifscCode": "raghav4562",
            "bankName": "raghav4562",
            "branchName": "raghav4562"
          }
        ]
      }

      const payload = {
        "owner_details": {
          hubId: selectedHubId,
          name: formData.name,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          panNumber: formData.panNumber,
          address: selectedHubName,
          district: districts[0],
          state: selectedState,
        },
        "bank_details": formData.bankAccounts.slice(0, 2).map((bankAccount) => ({
          accountNumber: bankAccount.accountNumber,
          accountHolderName: bankAccount.accountHolderName,
          ifscCode: bankAccount.ifscCode,
          bankName: bankAccount.bankName,
          branchName: bankAccount.branchName,
        })),
      };
      const headersOb = {
        headers: {

          "Content-Type": "application/json"
        }
      }
      const postData = async () => {

        await API.post("create-owner", payload, headersOb)
          .then((response) => {
            console.log(response)
            if (response.status == 201) {
              console.log(response)
              alert('Owner data added successfully!');
              setTimeout(() => {
                window.location.reload();
              }, 1000)

            }
          })
          .catch((error) => {
            // Log any errors that occur during the dispatch process
            console.error('Error adding owner data:', error);
            alert("error occurred")
            setTimeout(() => {
              window.location.reload();
            }, 3000)
          });
      }
      if (formData.phoneNumber.length == 10) {
        postData()
      } else {
        alert("mobile number must be atleast 10 digit")
      }

    };

    const goBack = () => {
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
                      style={{ width: "100%" }}
                      size='large'
                      showSearch
                      optionFilterProp="children"
                      onSearch={onSearch}
                      filterOption={filterOption}
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
                      style={{ width: "100%" }}
                      showSearch
                      optionFilterProp="children"
                      onSearch={onSearch}
                      filterOption={filterOption}
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
          <div className="flex gap-4 items-center justify-center reset-button-container">

            <Button onClick={() => { setShowOwnerTable(true) }}>Reset</Button>

            <Button type="primary" className='bg-primary' onClick={handleSubmit}>Save</Button>
          </div>

        </div>
      </>
    );
  };

  const EditTruckOwnerForm = ({ rowDataForEdit }) => {
    const [formData, setFormData] = useState({
      name: rowDataForEdit.name,
      email: rowDataForEdit.email,
      phoneNumber: rowDataForEdit.phoneNumber,
      countryCode: rowDataForEdit.countryCode,
      panNumber: rowDataForEdit.panNumber,
      district: rowDataForEdit.district,
      state: rowDataForEdit.state,
      address: rowDataForEdit.address,

      vehicleIds: [],
      hubId: selectedHubId,
      bankAccounts: rowDataForEdit.accountIds.map(account => ({
        accountNumber: account.accountNumber,
        accountHolderName: account.accountHolderName,
        ifscCode: account.ifscCode,
        bankName: account.bankName,
        branchName: account.branchName
      }))
    });
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

    const handleChangeBank = (index, e) => {
      const { value } = e.target;
      const updatedBankAccounts = [...formData.bankAccounts];
      updatedBankAccounts[index].ifscCode = value;
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
          setFormData(prevFormData => ({
            ...prevFormData,
            bankAccounts: prevFormData.bankAccounts.map((account, i) => {
              if (i === index) {
                return {
                  ...account,
                  bankName: data.BANK,
                  branchName: data.BRANCH
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
      setFormData((prevFormData) => ({
        ...prevFormData,
        state: value,
      }));
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
        name: formData.name,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        panNumber: formData.panNumber,
        address: selectedHubName,
        district: formData.district,
        state: formData.state,
      };
      const headersOb = {
        headers: {
          "Content-Type": "application/json"
        }
      }
      const postData = async () => {
        await API.put(`update-owner-details/${rowDataForEdit._id}`, payload, headersOb)
          .then((response) => {
            console.log(response)
            if (response.status == 201) {
              console.log(response)
              alert('Owner data updated successfully!');
              setTimeout(() => {
                window.location.reload();
              }, 1000)
            }
          })
          .catch((error) => {
            console.error('Error updating owner data:', error);
            alert('error occured')
            console.log(error.response.data)
            if (error.response.data.keyPattern.phoneNumber == 1) {
              alert(`mobile number ${formData.phoneNumber} already exist`)
            }
            setTimeout(() => {
              window.location.reload();
            }, 1000)
          });
      }
      if (formData.phoneNumber.length == 10) {

        postData()
      } else {
        alert("mobile number must be atleast 10 digit")
      }
    };

    const goBack = () => {
      setShowOwnerTable(true)
      localStorage.setItem("displayHeader", "flex");
    }
    return (
      <>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <div className="flex"><img src={backbutton_logo} alt="backbutton_logo" className='w-5 h-5 object-cover cursor-pointer' onClick={goBack} /> </div>
            <div className="flex flex-col">
              <h1 className='font-bold' style={{ fontSize: "16px" }}>Edit Truck Owner</h1>
              <Breadcrumb
                items={[
                  {
                    title: 'OnBoarding',
                  },
                  {
                    title: 'Owner Master',
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
              <div className='text-md font-semibold'>Vehicle Owner Information</div>
              <div className='text-md font-normal'>Edit Truck Registration and Owner Details</div>
            </div>

            <div className="flex flex-col gap-1">
              <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
                <Col className="gutter-row mt-6" span={12}><div ><Input placeholder="Owner Name*" size="large" name="name" onChange={handleOwnerFormChange} value={formData.name} /></div></Col>
                <Col className="gutter-row mt-6" span={12}><div ><Input type='number' placeholder="Mobile Number*" size="large" name="phoneNumber" onChange={handleOwnerFormChange} value={formData.phoneNumber} /></div></Col>
                <Col className="gutter-row mt-6" span={12}><div ><Input type='email' placeholder="Email ID" size="large" name="email" onChange={handleOwnerFormChange} value={formData.email} /></div></Col>
                <Col className="gutter-row mt-6" span={12}><div ><Input placeholder="PAN Card No" size="large" name="panNumber" onChange={handleOwnerFormChange} value={formData.panNumber} /></div></Col>
                <Col className="gutter-row mt-6" span={12}>
                  <div>
                    Select State : {" "}
                    <Select placeholder="Select a state"
                      value={formData.state}
                      onChange={handleStateChange}
                      style={{ width: "100%" }}
                      size='large'
                      showSearch
                      optionFilterProp="children"
                      onSearch={onSearch}
                      filterOption={filterOption}>
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
                      value={formData.district}
                      // onChange={(value) => setDistricts([value])}
                      onChange={(value) => setFormData((prevFormData) => ({
                        ...prevFormData,
                        district: value,
                      }))}
                      showSearch
                      optionFilterProp="children"
                      onSearch={onSearch}
                      filterOption={filterOption}
                      style={{ width: "100%" }}>
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
                      size="large"
                      value={bankAccount.ifscCode}
                      onChange={(e) => handleChangeBank(index, e)}
                      onSearch={() => fetchBankDetails(index)}
                    />
                  </Col>
                  <Col className="gutter-row mt-2" span={8}><Input placeholder="Bank Name*" size="large" name="bankName" value={bankAccount.bankName} onChange={(e) => handleBankAccountChange(index, e)} /></Col>
                  <Col className="gutter-row mt-2" span={8}><Input placeholder="Bank Branch*" size="large" name="branchName" value={bankAccount.branchName} onChange={(e) => handleBankAccountChange(index, e)} /></Col>
                  <Col className="gutter-row mt-2" span={8}><Input placeholder="Bank Account Number*" size="large" name="accountNumber" value={bankAccount.accountNumber} onChange={(e) => handleBankAccountChange(index, e)} /></Col>
                  <Col className="gutter-row mt-2" span={8}><Input placeholder="Bank Account Holder Name*" size="large" name="accountHolderName" value={bankAccount.accountHolderName} onChange={(e) => handleBankAccountChange(index, e)} /></Col>
                </Row>
                {formData.bankAccounts.length > 1 && (
                  <Button onClick={() => handleRemoveBankAccount(index)} style={{ width: 200 }}>Remove Bank Account</Button>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-4 items-center justify-center reset-button-container">
            <Button onClick={() => { setShowOwnerTable(true) }}>Reset</Button>
            <Button type="primary" className='bg-primary' onClick={handleSubmit}>Save</Button>
          </div>
        </div>
      </>
    );
  };

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
      label: 'Owner Transfer Log',
      children: <OwnerTransferLog />,
    },
    {
      key: '5',
      label: 'Activity Log',
      children: <OwnerActivityLog />,
    }
  ];
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageSize, setCurrentPageSize] = useState(50);
  useEffect(() => {
    getTableData(searchQuery, currentPage, currentPageSize, selectedHubId);
  }, [searchQuery, currentPage, currentPageSize, selectedHubId]);
  const OwnerTable = ({ filteredOwnerData, onEditClick, onViewClick, onDeleteClick }) => {
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
        width: "auto",
      },
      {
        title: 'Owner Name',
        dataIndex: 'name',
        key: 'name',
        width: "auto",
      },
      {
        title: 'District',
        dataIndex: 'district',
        key: 'district',
        width: "auto",
      },
      {
        title: 'State',
        dataIndex: 'state',
        key: 'state',
        width: "auto",
      },
      {
        title: 'Email ID',
        dataIndex: 'email',
        key: 'email',
        width: "auto",
      },
      {
        title: 'Action',
        key: 'action',
        width: "auto",
        render: (record) => (

          <Space size="middle">
            <Tooltip placement="top" title="Preview"><a onClick={() => onViewClick(record)}><EyeOutlined /></a></Tooltip>
            <Tooltip placement="top" title="Edit"><a onClick={() => onEditClick(record)}><FormOutlined /></a></Tooltip>
            <Tooltip placement="top" title="Delete"><a onClick={() => onDeleteClick(record)}><DeleteOutlined /></a></Tooltip>
          </Space>
        ),
      },
    ];
    const changePagination = async (pageNumber, pageSize) => {
      try {
        setCurrentPage(pageNumber);
        setCurrentPageSize(pageSize);
        const newData = await getTableData(searchQuery, pageNumber, pageSize, selectedHubId);
        setFilteredOwnerData(newData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    const changePaginationAll = async (pageNumber, pageSize) => {
      try {
        setCurrentPage(pageNumber);
        setCurrentPageSize(pageSize);
        const newData = await getTableData(searchQuery, pageNumber, pageSize, selectedHubId);
        setFilteredOwnerData(newData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    return (
      <>
        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={filteredOwnerData}
          scroll={{ x: 800, y: 320 }}
          rowKey="_id"
          pagination={{
            position: ['bottomCenter'],
            current: currentPage,
            total: totalOwnerData,
            defaultPageSize: currentPageSize,
            showSizeChanger: true,
            onChange: changePagination,
            onShowSizeChange: changePaginationAll,
          }}
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
