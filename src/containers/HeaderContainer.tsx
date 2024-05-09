/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect,useRef } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch } from '../redux/store'; // Import RootState and AppDispatch from your Redux store
import axios from "axios"
import { setSelectedHub, fetchHubData } from '../redux/reducers/hubReducer';
import { EditOutlined, DownOutlined } from '@ant-design/icons';
import { Modal, Button, List, Avatar, Badge, Dropdown, Input, Space } from "antd";
import Profile_image from "../assets/Profile.png";
import {API} from "../API/apirequest"
interface Hub {
  _id: string;
  location: string;
  
}

interface RootState {
  hub: {
    hubData: Hub[];
  };
}

const HeaderContainer: React.FC<{ title: string }> = ({ title }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [secondModalVisible, setSecondModalVisible] = useState(false);
  // const [thirdModalVisible, setThirdModalVisible] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  // const [editFormData, setEditFormData] = useState({
  //   name: '',
  //   cityCode: '',
  //   district: '',
  //   state: ''
  // });
  const [hubFormData, setHubFormData] = useState({
    location:""
  });
  // background: rgba(255, 182, 40, 1);

  const borderColors = ['255, 40, 40', '201,205,11', '40,126,255','255, 182, 40','255,79,40','11,205,181','40,255,178','70,255,40']; 

  const getHubColor=localStorage.getItem("selectedHubColor")


  // const hubData = useSelector((state: RootState) => state.hub.hubData);
  const [hubData,setHubData]=useState([])

  // Define a custom typed useDispatch hook
  const useAppDispatch = () => useDispatch<AppDispatch>();

  // Use the custom typed useDispatch hook
  const dispatch = useAppDispatch();

  useEffect(() => {
    const fetchHubData = async () => {
      const response = await API.get("get-hubs");
      if(response.status === 201) {
        setHubData(response.data.hubs)
      }else{
        console.log("error fetching hubs")
      }
      // console.log()
      return response.data;
    };
    fetchHubData();
    // dispatch(fetchHubData());
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

  // const showThirdModal = () => {
  //   setThirdModalVisible(true);
  // };

  // const handleThirdCancel = () => {
  //   setThirdModalVisible(false);
  // };

  const showConfirmModal = () => {
    setConfirmModalVisible(true);
  };

  const handleCloseAll = () => {
    setConfirmModalVisible(false);
    setModalVisible(false);
    setSecondModalVisible(false);
  }
  
  const selectHubHandler = (value: string, id: string,color:string) => {
    dispatch(setSelectedHub(value));
    localStorage.setItem("selectedHubID", id);
    localStorage.setItem("selectedHubName", value);
    localStorage.setItem("selectedHubColor", color);
    setModalVisible(false);
  };
  
  
  // const handleEdit = (hubId: string) => {
    //   const selectedHub = hubData.find((hub: any) => hub._id === hubId);
    //   if (selectedHub) {
      //     setEditFormData({
        //       name: selectedHub.name,
        //       cityCode: selectedHub.cityCode,
        //       district: selectedHub.district,
        //       state: selectedHub.state
        //     });
  //     setThirdModalVisible(true);
  //   }
  // };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setHubFormData(prevState => ({ ...prevState, [name]: value }));
  };

  const handleCreateHub = async () => {
    try {
      // const action = await dispatch(postHubData(hubFormData));
      // console.log(action)
      // const response: any = action.payload; // Using 'any' type
      // console.log(response)

      const response = await axios.post("http://localhost:3000/prod/v1/create-hub", hubFormData)
      if (response.status==201) {
        setSecondModalVisible(false);
        showConfirmModal();
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      } else {
        setErrorMessage("Enter all fields");
      }
    } catch (error) {
      console.error('Error while posting hub data:', error);
      setErrorMessage("An error occurred while creating the hub.");
    }
  };

  // const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const { name, value } = e.target;
  //   setEditFormData(prevState => ({ ...prevState, [name]: value }));
  // };

  const localDisplay = localStorage.getItem("displayHeader");

  return (
    <>
      <div className="flex h-10 justify-between items-center border-b-2" style={{display:`flex`}}>
        <div className='flex gap-2 justify-center items-center font-semibold text-lg'>{title}</div>
        <div className='flex gap-4 justify-center items-center'>
          <div onClick={showModal} className="flex flex-col w-48 mb-2" style={{ border: `2px solid rgb(${getHubColor})`,backgroundColor:`rgba(${getHubColor}, 0.2)`, padding: "0 5px" }}> <span className="flex justify-between"> Select Hub <DownOutlined /></span>{localStorage.getItem("selectedHubName") || "All Locations"}</div>
          {/* Select Hub Modal */}
          <Modal title="Hub Location" visible={modalVisible} onCancel={handleCancel} footer={null} centered>
            <div className="flex flex-col">
         
               <div className="flex flex-wrap">
    {hubData && hubData.map((option, index: number) => (
        <Space direction="vertical" key={index}>
          <div className={`card-hub `} >
            <div onClick={() => selectHubHandler(option.location, option._id,borderColors[index])} style={{ cursor: "pointer", margin: "0 auto", textAlign: "center",borderColor: `rgb(${borderColors[index]})`,borderLeft:"3px solid #fff" }} className="progress-hub" >
              <div className="text-hub">
                {/* <p>{option.cityCode}</p> */}
                <p>{option.location}</p>
                 {/* <div onClick={() => { showThirdModal(); handleEdit(option._id) }} style={{ cursor: "pointer" }}><EditOutlined /></div>  */}
                <div style={{ cursor: "pointer" }}><EditOutlined /></div> 
              </div>
            </div>
          </div>
        </Space> 
      ))}
    </div>
              <Button type="primary" onClick={showSecondModal}>Create New Hub</Button>
            </div>
          </Modal>
          {/* Create New Hub Modal */}
          <Modal title="Create a Hub" visible={secondModalVisible} onCancel={handleSecondCancel} footer={null}>
            {errorMessage && <span style={{ color: "red" }}>{errorMessage}</span>}
            <div>
              <Input size="large" placeholder="Enter Hub Location Name" className='mb-2 p-2' name="location" value={hubFormData.location} onChange={handleInputChange} />
              {/* <Input size="large" placeholder="Enter City Code" className='mb-2 p-2' name="cityCode" value={hubFormData.cityCode} onChange={handleInputChange} />
              <Input size="large" placeholder="Enter District" className='mb-2 p-2' name="district" value={hubFormData.district} onChange={handleInputChange} />
              <Input size="large" placeholder="Enter State" className='mb-2 p-2' name="state" value={hubFormData.state} onChange={handleInputChange} /> */}
              <Space style={{ display: "flex", justifyContent: "flex-end" }}>
                <Button htmlType="button" onClick={handleSecondCancel}>Cancel</Button>
                <Button type="primary" htmlType="submit" onClick={handleCreateHub}>Create</Button>
              </Space>
            </div>
          </Modal>
          <Modal title="Hub created successfully" visible={confirmModalVisible} onOk={handleCloseAll} onCancel={handleCloseAll} />
          {/* Edit Hub Modal */}
          {/* <Modal title="Edit Hub" visible={thirdModalVisible} onCancel={handleThirdCancel} footer={null}>
            {errorMessage && <span style={{ color: "red" }}>{errorMessage}</span>}
            <div>
              <Input size="large" placeholder="Enter Hub Location Name" className='mb-2 p-2' name="name" value={editFormData.name} onChange={handleEditInputChange} />
              <Input size="large" placeholder="Enter City Code" className='mb-2 p-2' name="cityCode" value={editFormData.cityCode} onChange={handleEditInputChange} />
              <Input size="large" placeholder="Enter District" className='mb-2 p-2' name="district" value={editFormData.district} onChange={handleEditInputChange} />
              <Input size="large" placeholder="Enter State" className='mb-2 p-2' name="state" value={editFormData.state} onChange={handleEditInputChange} />
              <Space style={{ display: "flex", justifyContent: "flex-end" }}>
                <Button htmlType="button" onClick={handleThirdCancel}>Cancel</Button>
                {/* <Button type="primary" htmlType="submit" onClick={handleUpdateHub}>Update</Button> 
              </Space>
            </div>
          </Modal> */}
          <Badge size="small" count={1}>
            <Dropdown overlay={
              <List min-width="100%" className="header-notifications-dropdown " itemLayout="horizontal" dataSource={[{ title: "Pending Acknowledgement", description: "Truck No KA03 B2567 has aged 23 days and still pending for acknowledgement" }]} renderItem={(item) => (
                <List.Item>
                  Notifications
                  <List.Item.Meta title={item.title} description={item.description} />
                </List.Item>
              )} />
            } trigger={["click"]}>
              <a href="#pablo" className="ant-dropdown-link" onClick={(e) => e.preventDefault()}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 2C6.68632 2 4.00003 4.68629 4.00003 8V11.5858L3.29292 12.2929C3.00692 12.5789 2.92137 13.009 3.07615 13.3827C3.23093 13.7564 3.59557 14 4.00003 14H16C16.4045 14 16.7691 13.7564 16.9239 13.3827C17.0787 13.009 16.9931 12.5789 16.7071 12.2929L16 11.5858V8C16 4.68629 13.3137 2 10 2Z" fill="#111827"></path>
                  <path d="M10 18C8.34315 18 7 16.6569 7 15H13C13 16.6569 11.6569 18 10 18Z" fill="#111827"></path>
                </svg>
              </a>
            </Dropdown>
          </Badge>
          <div className="flex gap-2 items-center">
            <Avatar size={32} src={Profile_image} />
            Dhruva
          </div>
        </div>
      </div>
    </>
  );
}

export default HeaderContainer;
