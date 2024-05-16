import { useState, useEffect } from 'react';
import { Table, Input, Select, Space, Button, Upload, Tabs, Tooltip, Breadcrumb, Col, List, Row, Switch } from 'antd';
import axios from 'axios';
import { API } from "../../API/apirequest"
const MasterData = () => {

    const selectedHubId = localStorage.getItem("selectedHubID");
    const selectedHubName = localStorage.getItem("selectedHubName");
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
        try {
            const response = await API.get(`get-material/${selectedHubId}`);
            if (response.status === 201) {
                setMaterials(response.data.materials);
            }
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
            const response = await API.post('create-material', payload);
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
        try {
            const response = await API.get(`get-load-location/${selectedHubId}`);
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
            const payload =
            {
                "location": loadLocationName,
                "hubId": selectedHubId

            }
            // Post the new material type to the API
            const repsonseLoad = await API.post('create-load-location', payload);
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
        try {
            const response = await API.get(`get-delivery-location/${selectedHubId}`);
            setDeliveryLocations(response.data.materials);
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
                "hubId": selectedHubId

            }
            // Post the new material type to the API
            let repsonse = await API.post('create-delivery-location', payload);
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

    return (
        <>
            <div className="flex flex-col" className="mytab-content">
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

export default MasterData