/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch } from '../redux/store'; // Import RootState and AppDispatch from your Redux store
import axios from "axios"
import { setSelectedHub, fetchHubData } from '../redux/reducers/hubReducer';
import { EditOutlined, DownOutlined } from '@ant-design/icons';
import { Modal, Button, List, Avatar, Badge, Dropdown, Input, Space } from "antd";
import Profile_image from "../assets/Profile.png";
import { API } from "../API/apirequest"
interface Hub {
  _id: string;
  location: string;

}

interface RootState {
  hub: {
    hubData: Hub[];
  };
}

const HeaderContainer: React.FC<{ title: string, dataFromChild: string }> = ({ title, dataFromChild }) => {
  const authToken = localStorage.getItem("token");
  const [modalVisible, setModalVisible] = useState(false);
  const [secondModalVisible, setSecondModalVisible] = useState(false);
  const [thirdModalVisible, setThirdModalVisible] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [confirmEditModalVisible, setConfirmEditModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [editFormData, setEditFormData] = useState({
    location: "",
    hubId: ""
  });
  const [hubFormData, setHubFormData] = useState({
    location: ""
  });
  // background: rgba(255, 182, 40, 1);

  const borderColors = ['255, 40, 40', '201,205,11', '40,126,255', '255, 182, 40', '255,79,40', '11,205,181', '40,255,178', '70,255,40', '201,205,11', '40,126,255', '255, 182, 40', '255,79,40', '11,205,181', '40,255,178', '70,255,40', '201,205,11', '40,126,255', '255, 182, 40', '255,79,40', '11,205,181', '40,255,178', '70,255,40'];

  const getHubColor = localStorage.getItem("selectedHubColor") || '0,0,0'

  // const hubData = useSelector((state: RootState) => state.hub.hubData);
  const [hubData, setHubData] = useState([])

  // Define a custom typed useDispatch hook
  const useAppDispatch = () => useDispatch<AppDispatch>();

  // Use the custom typed useDispatch hook
  const dispatch = useAppDispatch();

  const userData = localStorage.getItem("userDetails");
  const [userHub, setUserHub] = useState([])

  useEffect(() => {
    const fetchHubData = async () => {
      const headersOb = {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        }
      }
      const response = await API.get("get-hubs", headersOb);
      if (response.status === 201) {
        setHubData(response.data.hubs)
        if (userData) {
          const parsedUserData = JSON.parse(userData);
          const userHubId = parsedUserData.hubId[0]; // Assuming `hubId` is an array and you want the first one
          // console.log(response.data.hubs.find(h=> h._id == userHubId))
          setUserHub(response.data.hubs.find(h => h._id == userHubId))
          const filterHub = response.data.hubs.find(h => h._id == userHubId)
          console.log(filterHub.location)
          localStorage.setItem("selectedHubName", filterHub.location);
        }

      } else {
        console.log("error fetching hubs")
      }
      // console.log()
      return response.data;
    };
    fetchHubData();
  }, []);

  const showModal = () => {
    setModalVisible(true);
  };

  const handleCancel = () => {
    setModalVisible(false);
  };

  const showSecondModal = () => {
    setSecondModalVisible(true);
  };

  const handleSecondCancel = () => {
    setSecondModalVisible(false);
  };

  const showThirdModal = () => {
    setThirdModalVisible(true);
  };

  const handleThirdCancel = () => {
    setThirdModalVisible(false);
  };

  const showConfirmModal = () => {
    setConfirmModalVisible(true);
  };

  const handleCloseAll = () => {
    setConfirmModalVisible(false);
    setModalVisible(false);
    setSecondModalVisible(false);
  }
  const showEditConfirmModal = () => {
    setConfirmEditModalVisible(true);
  };
  const handleEditCloseAll = () => {
    setConfirmEditModalVisible(false);
    setModalVisible(false);
    setSecondModalVisible(false);
  }
  const selectHubHandler = (value: string, id: string, color: string) => {
    dispatch(setSelectedHub(value));
    localStorage.setItem("selectedHubID", id);
    localStorage.setItem("selectedHubName", value);
    localStorage.setItem("selectedHubColor", color);
    setModalVisible(false);

    window.location.reload();
  };


  const handleEdit = (hubData) => {
    setEditFormData({
      location: hubData.location,
      hubId: hubData._id
    })
    setThirdModalVisible(true);

  };
  const handleUpdateHub = async () => {
    try {
      const payload = {
        location: editFormData.location
      }
      const headersOb = {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        }
      }
      const response = await API.put(`update-hub/${editFormData.hubId}`, payload, headersOb)
      if (response.status == 201) {
        setSecondModalVisible(false);
        showEditConfirmModal();
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        setErrorMessage("Enter all fields");
      }
    } catch (error) {
      console.error('Error while posting hub data:', error);
      setErrorMessage("An error occurred while creating the hub.");
    }
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setHubFormData(prevState => ({ ...prevState, [name]: value }));
  };

  const handleCreateHub = async () => {
    try {
      const headersOb = {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        }
      }
      const response = await API.post("create-hub", hubFormData, headersOb)
      if (response.status == 201) {
        setSecondModalVisible(false);
        showConfirmModal();
        console.log(response.data)
        const newHubName = response.data.Hub.location;
        const newHubID = response.data.Hub._id;
        // localStorage.setItem("selectedHubName", hubFormData.location);
        setTimeout(() => {
          selectHubHandler(newHubName, newHubID, "40,126,255")
        }, 2000);
      } else {
        setErrorMessage("Enter all fields");
      }
    } catch (error) {
      console.error('Error while posting hub data:', error);
      setErrorMessage("An error occurred while creating the hub.");
    }
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditFormData(prevState => ({ ...prevState, [name]: value }));
  };
  const [user, setUser] = useState({});

  useEffect(() => {
    const userData = localStorage.getItem("userDetails");
    if (userData) {
      try {
        const parsedUserData = JSON.parse(userData);
        setUser(parsedUserData);
      } catch (error) {
        console.error("Failed to parse user data:", error);
      }
    }
  }, []);

  const { name } = user;


  const notificationData = [
    {
      title: "Pending Acknowledgement",
      description: "Truck No KA03 B2567 has aged 23 days and still pending for acknowledgement"
    }
  ]


  const selectedHubId = localStorage.getItem("selectedHubID");

  const [acknowledgement, setAcknowledgement] = useState([]);

  // const getTableData = async () => {
  //   const headersOb = {
  //     headers: {
  //       "Content-Type": "application/json",
  //       "Authorization": `Bearer ${authToken}`
  //     }
  //   }

  //   try {
  //     // const response = searchData ? await API.get(`get-acknowledgement-register?page=1&limit=50&hubId=${selectedHubId}`, data, headersOb)
  //     // const response = searchData ? await API.get(`get-acknowledgement-register?page=1&limit=50&hubId=${selectedHubId}`, data, headersOb)
  //     //     : await API.get(`get-acknowledgement-register?page=1&limit=50&hubId=${selectedHubId}`, headersOb);

  //     const response = await API.get(`get-acknowledgement-register?page=1&limit=100000&hubId=${selectedHubId}`, headersOb);

  //     let allAcknowledgement;
  //     if (response.data.dispatchData.length == 0) {
  //       allAcknowledgement = response.data.disptachData
  //       console.log(allAcknowledgement)
  //       setAcknowledgement(allAcknowledgement);
  //     } else {
  //       allAcknowledgement = response.data.dispatchData[0].data || "";

  //       if (allAcknowledgement && allAcknowledgement.length > 0) {
  //         const arrRes = allAcknowledgement.sort(function (a, b) {
  //           a = a.vehicleNumber.toLowerCase();
  //           b = b.vehicleNumber.toLowerCase();
  //           return a < b ? -1 : a > b ? 1 : 0;
  //         });

  //         // Create ageing objects for records aged more than 20 days
  //         const ageingData = arrRes.map(record => {

  //           const givenDate = new Date(record.grISODate);
  //           // const givenDate = new Date(record.grDate);
  //           const today = new Date();
  //           const differenceInMs = today.getTime() - givenDate.getTime();
  //           const differenceInDays = Math.floor(differenceInMs / (1000 * 60 * 60 * 24));
  //           return {
  //             title: "Pending Acknowledgement",
  //             description: `Truck No ${record.vehicleNumber} has aged ${differenceInDays} days and still pending for acknowledgement`,
  //             differenceInDays
  //           };
  //         }).filter(record => record.differenceInDays > 20);
  //         setAcknowledgement(ageingData);
  //         return ageingData;
  //       }

  //     }
  //   } catch (err) {
  //     console.log(err)
  //   }
  // };

  const [selectedMenuItem, setSelectedMenuItem] = useState(localStorage.getItem('selectedMenuItem'));
  const goToReceive = () => {
    console.log('Navigating to full data view');
    // localStorage.setItem('selectedMenuItem', 4);
    setSelectedMenuItem('4')
    localStorage.setItem("selectedMenuItemTitle", "Receive");
    localStorage.setItem("activeTabKey", "1");

    // setDataFromChild("flex")
  }
  useEffect(() => {
    localStorage.setItem('selectedMenuItem', '4');
  }, [selectedMenuItem]);

  const getTableData = async () => {
    const headersOb = {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authToken}`
      }
    }

    try {
      const response = await API.get(`get-acknowledgement-register?page=1&limit=100000&hubId=${selectedHubId}`, headersOb);

      let allAcknowledgement;
      if (response.data.dispatchData.length === 0) {
        allAcknowledgement = response.data.disptachData || response.data.dispatchData;
        console.log(allAcknowledgement);
        setAcknowledgement(allAcknowledgement);
      } else {
        allAcknowledgement = response.data.dispatchData[0].data || "";

        if (allAcknowledgement && allAcknowledgement.length > 0) {
          const arrRes = allAcknowledgement.sort((a, b) => {
            a = a.vehicleNumber.toLowerCase();
            b = b.vehicleNumber.toLowerCase();
            return a < b ? -1 : a > b ? 1 : 0;
          });

          // Create ageing objects for records aged more than 20 days
          const ageingData = arrRes.map(record => {
            const givenDate = new Date(record.grISODate);
            const today = new Date();
            const differenceInMs = today.getTime() - givenDate.getTime();
            const differenceInDays = Math.floor(differenceInMs / (1000 * 60 * 60 * 24));
            return {
              title: "Pending Acknowledgement",
              description: `Truck No ${record.vehicleNumber} has aged ${differenceInDays} days and still pending for acknowledgement`,
              differenceInDays
            };
          }).filter(record => record.differenceInDays > 20);

          // Split the data into two parts
          const firstFourRecords = ageingData.slice(0, 4);
          const remainingRecords = ageingData.slice(4);

          setAcknowledgement(firstFourRecords);

          // // If there are remaining records, add the link
          // if (remainingRecords.length > 0) {
          //   setAcknowledgement(prev => [
          //     ...prev,
          //     {
          //       title: "Show All",
          //       // description: `There are ${remainingRecords.length} more records. Click here to view all.`,
          //       description: `Show All`,
          //       link: "/path-to-full-data"
          //     }
          //   ]);
          // }
          // If there are remaining records, add the "Show All" item with an onClick handler
          if (remainingRecords.length > 0) {
            setAcknowledgement(prev => [
              ...prev,
              {
                title: "Show All",
                description: `Show All`,
                onClick: () => { 
                  setSelectedMenuItem('4')
                  localStorage.setItem("selectedMenuItemTitle", "Receive");
                  localStorage.setItem("activeTabKey", "1");
                  window.location.reload();
                }
              }
            ]);
          }
          return ageingData;
        }
      }
    } catch (err) {
      console.log(err);
    }
  };
 
  // Update the useEffect hook to include currentPage and currentPageSize as dependencies
  useEffect(() => {
    getTableData();
  }, []);
  useEffect(() => {
    getTableData();
  }, [selectedHubId]);
  const [visible, setVisible] = useState(false);
  const dropdownRef = useRef(null);

  // Toggle dropdown visibility
  const handleToggle = (e) => {
    e.preventDefault(); // Prevent default link behavior
    setVisible(!visible);
  };

  // Handle click outside to close the dropdown
  const handleClickOutside = (e) => {
    setVisible(false);
    // if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
    // }
  };

  // Use effect to add and remove the event listener
  React.useEffect(() => {
    // document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <>
      <div className="flex h-12 pb-4 justify-between items-center " style={{ display: `${dataFromChild}` }}>
        <div className='flex gap-2 justify-center items-center font-extrabold text-lg'>{title}</div>
        <div className='flex gap-4 justify-center items-center'>
          {userHub && userHub.location ? <>
            <div className="flex justify-between w-['100%'] gap-6 mb-2" style={{ border: `2px solid rgb(201,205,11)`, backgroundColor: `rgba(201,205,11, 0.2)`, padding: "5px 10px", borderRadius: "4px", cursor: "pointer" }}>
              <div className="flex flex-col">
                <span className="flex justify-between" style={{ color: "grey", fontSize: ".6rem", fontWeight: "600" }}>&nbsp;</span>
                <span style={{ fontWeight: "700" }}> {userHub && userHub.location}</span>
              </div>
              <div className="flex">
                <DownOutlined />
              </div>
            </div>
          </> : <>
            <div onClick={showModal} className="flex justify-between w-['100%'] gap-6 mb-2" style={{ border: `2px solid rgb(${getHubColor})`, backgroundColor: `rgba(${getHubColor}, 0.2)`, padding: "5px 10px", borderRadius: "4px", cursor: "pointer" }}>
              <div className="flex flex-col">
                <span className="flex justify-between" style={{ color: "grey", fontSize: ".6rem", fontWeight: "600" }}> Select Hub</span>
                <span style={{ fontWeight: "700" }}>{localStorage.getItem("selectedHubName") || "All Locations"}</span>
              </div>
              <div className="flex">
                <DownOutlined />
              </div>
              {userHub && userHub.location}
            </div>
          </>}
          {/* Select Hub Modal */}
          <Modal title="Hub Location" visible={modalVisible} onCancel={handleCancel} footer={null} centered>
            <div className="flex flex-col">

              <div className="flex flex-wrap">
                {hubData && hubData.map((option, index: number) => (
                  <Space direction="vertical" key={index}>
                    <div className={`card-hub `} >
                      <div style={{ cursor: "pointer", margin: "0 auto", textAlign: "center", borderColor: `rgb(${borderColors[index]})`, borderLeft: "3px solid #fff" }} className="progress-hub" >
                        <div className="text-hub">
                          {/* <p>{option.cityCode}</p> */}
                          <p onClick={() => selectHubHandler(option.location, option._id, borderColors[index])}>{option.location}</p>
                          <div onClick={() => { showThirdModal(); handleEdit(option); }} style={{ cursor: "pointer" }}><EditOutlined /></div>
                          {/* <div style={{ cursor: "pointer" }}><EditOutlined /></div> */}
                        </div>
                      </div>
                    </div>
                  </Space>
                ))}
              </div>
              <Button type="primary mt-4" onClick={showSecondModal}>Create New Hub</Button>
            </div>
          </Modal>
          {/* Create New Hub Modal */}
          <Modal title="Create a Hub" visible={secondModalVisible} onCancel={handleSecondCancel} footer={null}>
            {errorMessage && <span style={{ color: "red" }}>{errorMessage}</span>}
            <div>
              <Input size="large" placeholder="Enter Hub Location Name" className='mb-2 p-2' name="location" value={hubFormData.location} onChange={handleInputChange} />
              <Space style={{ display: "flex", justifyContent: "flex-end" }}>
                <Button htmlType="button" onClick={handleSecondCancel}>Cancel</Button>
                <Button type="primary" htmlType="submit" onClick={handleCreateHub}>Create</Button>
              </Space>
            </div>
          </Modal>
          <Modal title="Hub created successfully" visible={confirmModalVisible} onOk={handleCloseAll} onCancel={handleCloseAll} />
          {/* Edit Hub Modal */}
          <Modal title="Edit Hub" visible={thirdModalVisible} onCancel={handleThirdCancel} footer={null}>
            {errorMessage && <span style={{ color: "red" }}>{errorMessage}</span>}
            <div>
              <Input size="large" placeholder="Edit Hub Location Name" className='mb-2 p-2' name="location" value={editFormData.location} onChange={handleEditInputChange} />
              <Space style={{ display: "flex", justifyContent: "flex-end" }}>
                <Button htmlType="button" onClick={handleThirdCancel}>Cancel</Button>
                <Button type="primary" htmlType="submit" onClick={handleUpdateHub}>Update</Button>
              </Space>
            </div>
          </Modal>
          <Modal title="Hub Updated successfully" visible={confirmEditModalVisible} onOk={handleEditCloseAll} onCancel={handleEditCloseAll} />

          {/* Hiding on PRODUCTION */}

          {localStorage.getItem("selectedHubName") ? (
       <div ref={dropdownRef}>
       <Badge size="small" count={acknowledgement.length}>
         <Dropdown
           overlay={
             <List
               minWidth="100%"
               className="header-notifications-dropdown"
               itemLayout="horizontal"
               dataSource={acknowledgement}
               renderItem={(item) => (
                 <List.Item>
                   <List.Item.Meta description={item.description} />
                 </List.Item>
               )}
             />
           }
           trigger={[]}
           visible={visible}
           onClick={handleToggle}
         >
           <a href="#pablo" className="ant-dropdown-link" onClick={handleToggle}>
             <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
               <path d="M10 2C6.68632 2 4.00003 4.68629 4.00003 8V11.5858L3.29292 12.2929C3.00692 12.5789 2.92137 13.009 3.07615 13.3827C3.23093 13.7564 3.59557 14 4.00003 14H16C16.4045 14 16.7691 13.7564 16.9239 13.3827C17.0787 13.009 16.9931 12.5789 16.7071 12.2929L16 11.5858V8C16 4.68629 13.3137 2 10 2Z" fill="#111827"></path>
               <path d="M10 18C8.34315 18 7 16.6569 7 15H13C13 16.6569 11.6569 18 10 18Z" fill="#111827"></path>
             </svg>
           </a>
         </Dropdown>
       </Badge>
     </div>
      ) : <></>}
          <div className="flex gap-2 items-center">
            <Avatar size={32} src={Profile_image} />

            {name ? <>{name}</> : <p>-</p>}
          </div>
        </div>
      </div>
    </>
  );
}

export default HeaderContainer;
