import { useState, useEffect } from "react";
import axios from "axios";
import { useSelector, useDispatch } from 'react-redux';
import { setSelectedHub, fetchHubData, postHubData, updateHubData } from '../redux/reducers/hubReducer';

import {
  EditOutlined
} from '@ant-design/icons';

import {
  Modal, Button, List, Avatar, Badge, Dropdown, Card,Input, Space
} from "antd";

import Profile_image from "../assets/Profile.png";

interface Props {
  title: string;
}
interface RootState {
  hub: {
    selectedHub: string; 
    hubData: any[]; // Assuming the structure of hub data
    loading: boolean;
    error: string | null;
  };
}


const HeaderContainer: React.FC<Props> = ({ title }) => {
  const [selectedHubId, setSelectedHubId] = useState<string | null>(null);
const [editFormData, setEditFormData] = useState({
  name: '',
  cityCode: '',
  district: '',
  state: ''
});

// Function to handle edit button click
const handleEdit = (hubId: string) => {
  setSelectedHubId(hubId);
  const selectedHub = hubData.find(hub => hub.id === hubId);
  if (selectedHub) {
    setEditFormData(selectedHub);
    setThirdModalVisible(true); // Show the edit modal
  }
};

// Function to handle edit form input change
const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value } = e.target;
  setEditFormData(prevState => ({
    ...prevState,
    [name]: value
  }));
};

// Function to handle updating the hub
const handleUpdateHub = async () => {
  try {
    const response = await dispatch(updateHubData(editFormData));
    console.log('Response from updateHubData:', response);
    if (response.status === 200) {
      setThirdModalVisible(false);
      showConfirmModal();
    } else {
      setErrorMessage("Enter all fields");
    }
  } catch (error) {
    console.error('Error while updating hub data:', error);
    // Handle error here
  }
};
  const [hubformData, setHubFormData] = useState({
    name: '',
    cityCode: '',
    district: '',
    state: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setHubFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };
  const [errorMessage,setErrorMessage] = useState("");
  const handleCreateHub = async() => {
    try {
      const response = await dispatch(postHubData(hubformData));
      console.log('Response from postHubData:', response);
      if(response.status === 200 || response.payload.message ==="Hub has been created successfully") {
        setSecondModalVisible(false);
        showConfirmModal();
        setTimeout(() => {
          window.location.reload();
        },3000)
      }else{
        setErrorMessage("Enter all fileds")
      }
    } catch (error) {
      console.error('Error while posting hub data:', error);
      // Handle error here
    }
  };

  const selectedHub = useSelector((state: RootState) => state.hub.selectedHub);
  const hubData = useSelector((state: RootState) => state.hub.hubData);
  
  const loading = useSelector((state: RootState) => state.hub.loading);
  const error = useSelector((state: RootState) => state.hub.error);
  const dispatch = useDispatch();

  const bell = (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      key={0}
    >
      <path
        d="M10 2C6.68632 2 4.00003 4.68629 4.00003 8V11.5858L3.29292 12.2929C3.00692 12.5789 2.92137 13.009 3.07615 13.3827C3.23093 13.7564 3.59557 14 4.00003 14H16C16.4045 14 16.7691 13.7564 16.9239 13.3827C17.0787 13.009 16.9931 12.5789 16.7071 12.2929L16 11.5858V8C16 4.68629 13.3137 2 10 2Z"
        fill="#111827"
      ></path>
      <path
        d="M10 18C8.34315 18 7 16.6569 7 15H13C13 16.6569 11.6569 18 10 18Z"
        fill="#111827"
      ></path>
    </svg>
  );

  const data = [
    {
      title: "Pending Acknowledgement",
      description: <>Truck No KA03 B2567 has aged 23 days and still pending for acknowledgement</>,
    },
  ];

  const menu = (
    <List
      min-width="100%"
      className="header-notifications-dropdown "
      itemLayout="horizontal"
      dataSource={data}
      renderItem={(item) => (
        <List.Item>
          Notifications
          <List.Item.Meta
            title={item.title}
            description={item.description}
          />
        </List.Item>
      )}
    />
  );
 
   const [modalVisible, setModalVisible] = useState(false);
  const [secondModalVisible, setSecondModalVisible] = useState(false); // State for second modal
  const [thirdModalVisible, setThirdModalVisible] = useState(false); // State for second modal

  const [confirmModalVisible, setConfirmModalVisible] = useState(false); // State for second modal

  useEffect(() => {
    dispatch(fetchHubData());
  }, [dispatch]);

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

  const selectHubHandler = (value: string,id:string) => {
    dispatch(setSelectedHub(value));
    localStorage.setItem("selectedHubID", id);
    localStorage.setItem("selectedHubName", value);
    setModalVisible(false);
  };

  const myLocationHub=localStorage.getItem("selectedHubName")

  return (
    <>
      <div className="flex h-10 justify-between items-center">

        <div className='flex gap-2 justify-center items-center font-semibold text-lg'>{title}</div>

        <div className='flex gap-4 justify-center items-center'>

          <div onClick={showModal} className="flex flex-col border-black"> <span> Select Hub </span>{myLocationHub}</div>
          <Modal
            title="Hub Location"
            open={modalVisible}
            onCancel={handleCancel}
            footer={null}
          >
            {/* Content of the Modal */}
            <div className="flex flex-col">
              <div className="flex flex-wrap">
                {hubData.map((option, index) => (
                  <Space direction="vertical" key={index}>
                    <div style={{ width:"100px",height:"100px", margin: "5px",border:"1px solid #eee",display:"flex",justifyContent:"center",alignItems:"center",flexDirection:"column",borderRadius:"50%" }}>
                      <p>{option.cityCode}</p>
                      <p onClick={() => selectHubHandler(option.name,option._id)} style={{cursor:"pointer"}}>{option.name}</p>
                     
                      <div onClick={() => {showThirdModal(); handleEdit(option.id)}}  style={{cursor:"pointer"}}><EditOutlined /></div>
                    </div>
                  </Space>
                ))}
              </div>
              <Button type="primary" onClick={showSecondModal}>Create New Hub</Button>
            </div>
          </Modal>
          <Modal 
            title="Create a Hub"
            open={secondModalVisible}
            onCancel={handleSecondCancel}
            footer={null}
          >
            {/* Content of the Second Modal */}
            {errorMessage && (<><span style={{color:"red"}}>{errorMessage}</span></>)}
            <div>
          <Input 
            size="large" 
            placeholder="Enter Hub Location Name" 
            className='mb-2 p-2' 
            name="name" 
            value={hubformData.name}
            onChange={handleInputChange}
          />
          <Input 
            size="large" 
            placeholder="Enter City Code" 
            className='mb-2 p-2' 
            name="cityCode" 
            value={hubformData.cityCode}
            onChange={handleInputChange}
          />
          <Input 
            size="large" 
            placeholder="Enter District" 
            className='mb-2 p-2' 
            name="district" 
            value={hubformData.district}
            onChange={handleInputChange}
          />
          <Input 
            size="large" 
            placeholder="Enter State" 
            className='mb-2 p-2' 
            name="state" 
            value={hubformData.state}
            onChange={handleInputChange}
          />
          <Space style={{display: "flex",justifyContent:"flex-end"}}>
            <Button htmlType="button" onClick={handleSecondCancel}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" onClick={handleCreateHub}>
              Create
            </Button>
          </Space>
        </div>
          </Modal>
          <Modal title="Hub created successfully" open={confirmModalVisible} onOk={handleCloseAll} onCancel={handleCloseAll}>
      </Modal>
      <Modal 
  title="Edit Hub"
  open={thirdModalVisible}
  onCancel={handleThirdCancel}
  footer={null}
>
  {/* Edit form */}
  {errorMessage && (<><span style={{color:"red"}}>{errorMessage}</span></>)}
  <div>
    <Input 
      size="large" 
      placeholder="Enter Hub Location Name" 
      className='mb-2 p-2' 
      name="name" 
      value={editFormData.name}
      onChange={handleEditInputChange}
    />
    <Input 
      size="large" 
      placeholder="Enter City Code" 
      className='mb-2 p-2' 
      name="cityCode" 
      value={editFormData.cityCode}
      onChange={handleEditInputChange}
    />
    <Input 
      size="large" 
      placeholder="Enter District" 
      className='mb-2 p-2' 
      name="district" 
      value={editFormData.district}
      onChange={handleEditInputChange}
    />
    <Input 
      size="large" 
      placeholder="Enter State" 
      className='mb-2 p-2' 
      name="state" 
      value={editFormData.state}
      onChange={handleEditInputChange}
    />
    <Space style={{display: "flex",justifyContent:"flex-end"}}>
      <Button htmlType="button" onClick={handleThirdCancel}>
        Cancel
      </Button>
      <Button type="primary" htmlType="submit" onClick={handleUpdateHub}>
        Update
      </Button>
    </Space>
  </div>
</Modal>
          <Badge size="small" count={1}>
            <Dropdown overlay={menu} trigger={["click"]}>
              <a
                href="#pablo"
                className="ant-dropdown-link"
                onClick={(e) => e.preventDefault()}
              >
                {bell}
              </a>
            </Dropdown>
          </Badge>
          <div className="flex gap-2 items-center">
            <Avatar
              size={32}
              src={Profile_image}
            />Dhruva
          </div>
        </div>
      </div>
      <hr />
    </>
  )
}

export default HeaderContainer;
