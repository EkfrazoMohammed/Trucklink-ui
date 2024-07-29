import { useState, useEffect } from 'react';
import 'jspdf-autotable';
import { Table, Input, Select, Space, Button, Upload, Tabs, Tooltip, Breadcrumb, Col, notification, Row, Pagination, message } from 'antd';
import type { TabsProps } from 'antd';
import backbutton_logo from "../../assets/backbutton.png"
import { API } from "../../API/apirequest"
import UserMaster from './UserMaster';


const SettingsContainer = ({ onData }) => {
  const [activeTabKey, setActiveTabKey] = useState('1');

  useEffect(() => {
    const savedTabKey = localStorage.getItem('activeTabKey');
    if (savedTabKey) {
      setActiveTabKey(savedTabKey);
    }
  }, []);
  const handleTabChange = (key) => {
    setActiveTabKey(key);
    localStorage.setItem('activeTabKey', key);
  };

  const selectedHubId = localStorage.getItem("selectedHubID");
  const selectedHubName = localStorage.getItem("selectedHubName");
  const authToken = localStorage.getItem("token");

  const [showOwnerTable, setShowOwnerTable] = useState(true);
  const [showTabs, setShowTabs] = useState(true);


  const Profile = ({ showTabs, setShowTabs }) => {
    const handleAddOwnerClick = () => {
      setShowOwnerTable(false);
      setShowTabs(false); // Set showTabs to false when adding owner
      onData("none");
    };

    return (
      <>

        <div className="mytab-content">
          {showOwnerTable ? (
            <>
              <Owner onAddOwnerClick={handleAddOwnerClick} />
            </>
          ) :
            (
              <AddTruckOwnerForm />
            )
          }
        </div>
      </>
    );
  };

  const Owner = ({ onAddOwnerClick }: { onAddOwnerClick: () => void }) => {
    // Get the JSON string from localStorage
    const currentUserDetails = localStorage.getItem("userDetails");

    // Parse the JSON string into an object
    const user = currentUserDetails ? JSON.parse(currentUserDetails) : null;

    // Use user data in the state
    const [userData, setUserData] = useState(user);
    return (
      <div className='flex justify-between  py-3'>
        <div className='flex items-center gap-2'>
          <div className='settings-card-container'>
            <div className="cards-container">
              <Row gutter={24} className='flex items-center'>
                <Col className="gutter-row " span={24}>
                  <div className='flex flex-col gap-2'>
                    <p className='font-semibold text-[#1572B6]'>{userData.roleName}</p>
                    <h1 className='font-semibold text-xl'>{userData.name.charAt(0).toUpperCase() + userData.name.slice(1)}</h1>
   
                    <p className='font-semibold'>{userData.email}</p>
                    <p className='font-semibold'>{userData.phoneNumber}</p>
                    <Button onClick={onAddOwnerClick} className='bg-[#1572B6] text-white'> Reset Password</Button>
                  </div>
                </Col>
              </Row>
            </div>
          </div>
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

        message.warning('Please fill IFSC code');
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
          message.error('Invalid IFSC code');
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

    const handleResetButtonClick = () => {

      setFormData({
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
    }

    const goBack = () => {
      setShowOwnerTable(true)
      setShowTabs(true);
      onData('flex')
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
                  <div ><Input placeholder="Owner Name*" size="large" name="name" onChange={handleOwnerFormChange} value={formData.name} /></div>
                </Col>
                <Col className="gutter-row mt-6" span={12}>
                  <div ><Input type='number' placeholder="Mobile Number*" size="large" name="phoneNumber" value={formData.phoneNumber} onChange={handleOwnerFormChange} /></div>
                </Col>
                <Col className="gutter-row mt-6" span={12}>
                  <div ><Input type='email' placeholder="Email ID" size="large" name="email" value={formData.email} onChange={handleOwnerFormChange} /></div>
                </Col>
                <Col className="gutter-row mt-6" span={12}>
                  <div ><Input placeholder="PAN Card No" size="large" name="panNumber" value={formData.panNumber} onChange={handleOwnerFormChange} /></div>
                </Col>


              </Row>
            </div>

          </div>


          <div className="flex gap-4 items-center justify-center reset-button-container">
            <Button onClick={handleResetButtonClick}>Reset</Button>
            <Button type="primary" className='bg-primary'>Save</Button>
          </div>

        </div>
      </>
    );
  };
  const items: TabsProps['items'] = [
    {
      key: '1',
      label: `Profile`,
      children: <Profile showTabs={showTabs} setShowTabs={setShowTabs} />,
    },
    {
      key: '2',
      label: 'Users',
      children: <UserMaster onData={onData} showTabs={showTabs} setShowTabs={setShowTabs} />,
    }
  ];
  return (
    <>
  <h1> Settings Container</h1>
      {/* <div className={showTabs ? '' : 'onboarding-tabs-hidden'}>
        <Tabs activeKey={activeTabKey} items={items} onChange={handleTabChange} />
      </div> */}
    </>
  );
};

export default SettingsContainer;
