import { useState, useEffect } from 'react';
import { Input, Select, Space, Button, Upload, Tabs, Tooltip, Breadcrumb, Col, List, Row, Switch, Modal } from 'antd';
import { API } from "../../API/apirequest"
import { UploadOutlined, DownloadOutlined, EyeOutlined, FormOutlined, DeleteOutlined } from '@ant-design/icons';
const onSearch = (value: string) => {
    console.log('search:', value);
};

// Filter `option.value` match the user type `input`
const filterOption = (input: string, option?: { label: string; value: string }) =>
    (option?.value ?? '').toLowerCase().includes(input.toLowerCase());

const MasterData = () => {

    const selectedHubId = localStorage.getItem("selectedHubID");
    const authToken=localStorage.getItem("token");
    // State to store the list of materials
    const [materials, setMaterials] = useState([]);
    // State to store the input value for adding material type
    const [materialType, setMaterialType] = useState('');
    const [loadLocationName, setLoadLocationName] = useState('');
    const [loadLocation, setloadLocations] = useState([]);

    const [deliveryLocation, setDeliveryLocations] = useState([]);
    const [deliveryLocationName, setDeliveryLocationName] = useState('');
    // Function to fetch materials from the API
    const fetchMaterials = async () => {
        const headersOb = {
            headers: {
              "Content-Type": "application/json",
              "Authorization":`Bearer ${authToken}`
            }
          }
        try {
            const response = await API.get(`get-material/${selectedHubId}`,headersOb);
            if (response.status === 201) {
                setMaterials(response.data.materials);
            }
        } catch (error) {
            console.error('Error fetching materials:', error);
        }
    };
    // Function to handle adding a new material type
    const handleAddMaterial = async () => {
        const headersOb = {
            headers: {
              "Content-Type": "application/json",
              "Authorization":`Bearer ${authToken}`
            }
          }
        try {
            // Post the new material type to the API
            const payload = {
                "materialType": materialType,
                "hubId": selectedHubId
            }
            const response = await API.post('create-material', payload,headersOb);
            if (response.status === 201) {
                console.log("material added")
            }
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
        const headersOb = {
            headers: {
              "Content-Type": "application/json",
              "Authorization":`Bearer ${authToken}`
            }
          }
        try {
            const response = await API.get(`get-load-location/${selectedHubId}`,headersOb);
            if (response.status == 201) {
                console.log(response.data.materials)
                setloadLocations(response.data.materials);
            } else {
                console.log("error in fetchLoadLocations")
            }

        } catch (error) {
            console.error('Error fetching materials:', error);
        }
    };


    // Function to handle adding a new material type
    const handleAddLoadLocation = async () => {
        try {
            const headersOb = {
                headers: {
                  "Content-Type": "application/json",
                  "Authorization":`Bearer ${authToken}`
                }
              }
            const payload =
            {
                "location": loadLocationName,
                "hubId": selectedHubId

            }
            // Post the new material type to the API
            const repsonseLoad = await API.post('create-load-location', payload,headersOb);
            console.log(repsonseLoad)
            fetchLoadLocations()
            // Clear the input field
            setLoadLocationName('');
        } catch (error) {
            console.error('Error adding material:', error);
        }
    };

    // Function to fetch materials from the API
    const fetchDeliveryLocations = async () => {
        const headersOb = {
            headers: {
              "Content-Type": "application/json",
              "Authorization":`Bearer ${authToken}`
            }
          }
        try {
            const response = await API.get(`get-delivery-location/${selectedHubId}`,headersOb);
            setDeliveryLocations(response.data.materials);
        } catch (error) {
            console.error('Error fetching materials:', error);
        }
    };


    // Function to handle adding a new material type
    const handleAddDeliveryLocation = async () => {
        try {
            const headersOb = {
                headers: {
                  "Content-Type": "application/json",
                  "Authorization":`Bearer ${authToken}`
                }
              }
            const payload =
            {
                "location": deliveryLocationName,
                "hubId": selectedHubId

            }
            // Post the new material type to the API
            let repsonse = await API.post('create-delivery-location', payload, headersOb);
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
        fetchLoadLocations();
        fetchDeliveryLocations();
    }, [selectedHubId]);

    const [materialModalVisible, setmaterialModalVisible] = useState(false);
    const [updatedMaterials, setUpdatedMaterials] = useState({
        hubId: "",
        materialType: "",
        _id: ""
    })

    const handleUpdateMaterialCancel = () => {
        setmaterialModalVisible(false);
    };
    const handleOpenMaterialModal = (material) => {
        setmaterialModalVisible(true)
        setUpdatedMaterials(
            {
                hubId: material.hubId,
                materialType: material.materialType,
                _id: material._id
            }
        )
    }
    const handleMaterialOnChange = (e) => {
        const { name, value } = e.target;
        setUpdatedMaterials((prevMaterials) => ({
            ...prevMaterials,
            [name]: value
        }));
    };

    const handleUpdateMaterials = async () => {

        const payload= {
             hubId:updatedMaterials.hubId,
              materialType:updatedMaterials.materialType,
        }
        console.log(payload)
        const headersOb = {
            headers: {
              "Content-Type": "application/json",
              "Authorization":`Bearer ${authToken}`
            }
          }
        try {
            const response = await API.put(`update-material/${updatedMaterials._id}`,payload,headersOb);
console.log(response)
setmaterialModalVisible(false);
fetchMaterials();
        } catch (error) {
            fetchMaterials();
            alert('Error updating material');
            console.error('Error updating material:', error);
        }
    };

// load location
const [loadLocationModalVisible, setloadLocationModalVisible] = useState(false);
const [updatedloadLocation, setUpdatedloadLocation] = useState({
    hubId: "",
    location: "",
    _id: ""
})

const handleUpdateloadLocationCancel = () => {
    setloadLocationModalVisible(false);
};
const handleOpenloadLocationModal = (material) => {
    setloadLocationModalVisible(true)
    setUpdatedloadLocation(
        {
            hubId: material.hubId,
            location: material.location,
            _id: material._id
        }
    )
}
const handleloadLocationOnChange = (e) => {
    const { name, value } = e.target;
    setUpdatedloadLocation((prevMaterials) => ({
        ...prevMaterials,
        [name]: value
    }));
};

const handleUpdateloadLocation = async () => {

    const payload= {
         hubId:updatedloadLocation.hubId,
          location:updatedloadLocation.location,
    }
    const headersOb = {
        headers: {
          "Content-Type": "application/json",
          "Authorization":`Bearer ${authToken}`
        }
      }
    try {
        const response = await API.put(`update-load-location/${updatedloadLocation._id}`,payload,headersOb);
console.log(response)
setloadLocationModalVisible(false);
fetchLoadLocations();
    } catch (error) {
        fetchMaterials();
        alert('Error updating load location');
        console.error('Error updating load location:', error);
    }
};


// delivery location
const [deliveryLocationModalVisible, setdeliveryLocationModalVisible] = useState(false);
const [updateddeliveryLocation, setUpdateddeliveryLocation] = useState({
    hubId: "",
    location: "",
    _id: ""
})

const handleUpdatedeliveryLocationCancel = () => {
    setdeliveryLocationModalVisible(false);
};
const handleOpendeliveryLocationModal = (material) => {
    setdeliveryLocationModalVisible(true)
    setUpdateddeliveryLocation(
        {
            hubId: material.hubId,
            location: material.location,
            _id: material._id
        }
    )
}
const handledeliveryLocationOnChange = (e) => {
    const { name, value } = e.target;
    setUpdateddeliveryLocation((prevMaterials) => ({
        ...prevMaterials,
        [name]: value
    }));
};

const handleUpdatedeliveryLocation = async () => {

    const payload= {
         hubId:updateddeliveryLocation.hubId,
          location:updateddeliveryLocation.location,
    }
    const headersOb = {
        headers: {
          "Content-Type": "application/json",
          "Authorization":`Bearer ${authToken}`
        }
      }
    try {
        const response = await API.put(`update-delivery-location/${updateddeliveryLocation._id}`,payload,headersOb);
console.log(response)
setdeliveryLocationModalVisible(false);
fetchDeliveryLocations();
    } catch (error) {
      fetchDeliveryLocations();
        alert('Error updating load location');
        console.error('Error updating load location:', error);
    }
};



    return (
        <>
            <Modal title="Update Material" visible={materialModalVisible} onCancel={handleUpdateMaterialCancel} footer={null}>
                <div>
                <Input
                        size="large"
                        placeholder="Enter Material Type"
                        className='mb-2 p-2'
                        name="materialType"
                        value={updatedMaterials.materialType}
                        onChange={handleMaterialOnChange}
                    />
                    <Space style={{ display: "flex", justifyContent: "flex-end" }}>
                        <Button htmlType="button" onClick={handleUpdateMaterialCancel}>Cancel</Button>
                        <Button type="primary" htmlType="submit" onClick={handleUpdateMaterials}>Update Material</Button>
                    </Space>
                </div>
            </Modal>

            <Modal title="Update Load Location" visible={loadLocationModalVisible} onCancel={handleUpdateloadLocationCancel} footer={null}>
                <div>
                <Input
                        size="large"
                        placeholder="Enter Load Location"
                        className='mb-2 p-2'
                        name="location"
                        value={updatedloadLocation.location}
                        onChange={handleloadLocationOnChange}
                    />
                    <Space style={{ display: "flex", justifyContent: "flex-end" }}>
                        <Button htmlType="button" onClick={handleUpdateloadLocationCancel}>Cancel</Button>
                        <Button type="primary" htmlType="submit" onClick={handleUpdateloadLocation}>Update Load Location </Button>
                    </Space>
                </div>
            </Modal>

            <Modal title="Update Delivery Location" visible={deliveryLocationModalVisible} onCancel={handleUpdatedeliveryLocationCancel} footer={null}>
                <div>
                <Input
                        size="large"
                        placeholder="Enter Delivery Location"
                        className='mb-2 p-2'
                        name="location"
                        value={updateddeliveryLocation.location}
                        onChange={handledeliveryLocationOnChange}
                    />
                    <Space style={{ display: "flex", justifyContent: "flex-end" }}>
                        <Button htmlType="button" onClick={handleUpdatedeliveryLocationCancel}>Cancel</Button>
                        <Button type="primary" htmlType="submit" onClick={handleUpdatedeliveryLocation}>Update Delivery Location </Button>
                    </Space>
                </div>
            </Modal>
            <div className="flex flex-col" className="mytab-content">
                <div className="flex gap-12">


                    <div className='flex flex-col gap-2 p-2' style={{ width: "600px", border: "2px solid #eee" }} >
                        <div className="flex gap-2">

                            <Input
                                placeholder="Enter Material Type"
                                value={materialType}
                                size="large"
                                onChange={(e) => setMaterialType(e.target.value)}
                            />
                            <Button size='large' type="primary" onClick={handleAddMaterial}>
                                Add Material
                            </Button>
                        </div>

                        <div>

                            <div>
                                <Select
                                    placeholder="Materials"
                                    style={{ width: "100%", marginBottom: "10px" }}
                                    size='large'
                                    showSearch
                                    optionFilterProp="children"
                                    onSearch={onSearch}
                                    filterOption={filterOption}
                                >
                                    {materials.map((value, index) => (
                                        <Option key={index} value={value.materialType}>
                                            {value.materialType}
                                        </Option>
                                    ))}

                                </Select>
                            </div>
                            <List
                                style={{ overflowY: "scroll", height: "220px" }}
                               
                                dataSource={materials}
                                renderItem={(item) => (
                                    <List.Item style={{ width: "100%",padding:"8px 16px" }}>
                                        <p style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}> {item.materialType} <a onClick={() => handleOpenMaterialModal(item)}><FormOutlined /></a></p>
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
                            <div>
                                <Select
                                    placeholder="Load Location"
                                    style={{ width: "100%", marginBottom: "10px" }}
                                    size='large'
                                    showSearch
                                    optionFilterProp="children"
                                    onSearch={onSearch}
                                    filterOption={filterOption}
                                >
                                    {loadLocation.map((value, index) => (
                                        <Option key={index} value={value.location}>
                                            {value.location}
                                        </Option>
                                    ))}

                                </Select>
                            </div>
                            <List
                                style={{ overflowY: "scroll", height: "220px" }}
                                dataSource={loadLocation}
                                renderItem={(item) => (
                                    <List.Item style={{ width: "100%",padding:"8px 16px" }}>
                                        <p style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}> {item.location} <a onClick={() => handleOpenloadLocationModal(item)}><FormOutlined /></a></p>
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
                            <div>
                                <Select
                                    placeholder="Delivery Location"
                                    style={{ width: "100%", marginBottom: "10px" }}
                                    size='large'
                                    showSearch
                                    optionFilterProp="children"
                                    onSearch={onSearch}
                                    filterOption={filterOption}
                                >
                                    {deliveryLocation.map((value, index) => (
                                        <Option key={index} value={value.location}>
                                            {value.location}
                                        </Option>
                                    ))}

                                </Select>
                            </div>
                            <List
                                style={{ overflowY: "scroll", height: "220px" }}
                           

                                dataSource={deliveryLocation}
                                renderItem={(item) => (
                                    <List.Item style={{ width: "100%",padding:"8px 16px" }}>
                                                                        <p style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}> {item.location} <a onClick={() => handleOpendeliveryLocationModal(item)}><FormOutlined /></a></p>
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

export default MasterData