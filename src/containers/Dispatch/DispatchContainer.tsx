import { useState, useEffect } from 'react';
import { API } from "../../API/apirequest"
import { DatePicker, Table, Input, Select, Space, Button, Upload, Tooltip, Breadcrumb, Col, Row, Switch, Image } from 'antd';
import axios from "axios"
import moment from 'moment';
import { UploadOutlined, DownloadOutlined, EyeOutlined, FormOutlined, DeleteOutlined, PrinterOutlined, SwapOutlined } from '@ant-design/icons';

const { Search } = Input;
import backbutton_logo from "../../assets/backbutton.png"
import type { DatePickerProps } from 'antd';

const onChange: DatePickerProps['onChange'] = (date, dateString) => {
  console.log(date, dateString);
};
const filterOption = (input, option) =>
  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;

const DispatchContainer = ({onData}) =>{
  const authToken = localStorage.getItem("token");
  
  const selectedHubId = localStorage.getItem("selectedHubID");
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredOwnerData, setFilteredOwnerData] = useState([]);

  const [challanData, setchallanData] = useState([]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };
  // Debounce the handleSearch function
  // const debouncedSearch = debounce(handleSearch, 800); // Adjust the debounce delay as needed

  const [showDispatchTable, setShowDispatchTable] = useState(true);
  const [rowDataForDispatchEdit, setRowDataForDispatchEdit] = useState(null);
  const [editingChallan, setEditingChallan] = useState(false);


  // Initialize state variables for current page and page size
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageSize, setCurrentPageSize] = useState(50);
  const [totalDispatchData, setTotalDispatchData] = useState(100)

  const getTableData = async () => {
    const headersOb = {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authToken}`
      }
    }
    const data = {};
    try {
      const searchData = searchQuery ? searchQuery : null;
      const response = searchData ? await API.post(`get-challan-data?page=1&limit=150&hubId=${selectedHubId}`,data, headersOb)
        : await API.post(`get-challan-data?page=1&limit=150&hubId=${selectedHubId}`,data, headersOb);

      let allChallans;
      if (response.data.disptachData == 0) {
        allChallans = response.data.disptachData
        setchallanData(allChallans);
      } else {

        allChallans = response.data.disptachData[0].data || "";
        setchallanData(allChallans);
        setTotalDispatchData(allChallans.length);


      }
    } catch (err) {
      console.log(err)

    }
  };
  useEffect(() => {
    getTableData();
  }, [searchQuery, currentPage, currentPageSize, selectedHubId]);

  // Truck master
  const Truck = ({ onAddTruckClick }: { onAddTruckClick: () => void }) => {
    return (
      <div className='flex gap-2 flex-col justify-between p-2'>

     {/* <div className='flex gap-2 items-center'>
          <Search
            placeholder="Search by Vehicle Number"
            size='large'
            onSearch={handleSearch}
            style={{ width: 320 }}
          />
          <DatePicker  size='large' onChange={onChange} placeholder='From date' /> -
          <DatePicker  size='large' onChange={onChange} placeholder='To date' />
          <Select
            name="materialType"
            placeholder="Material Type*"
            size="large"
            style={{ width: "20%" }}
            options={[
              { value: 'cement', label: 'cement' },
              { value: 'flyash', label: 'flyash' },
            ]}
            onChange={(value) => handleChange('materialType', value)}
          />
          <Select
            name="truckType"
            placeholder="Truck Type*"
            size="large"
            style={{ width: "20%" }}
            options={[
              { value: 'open', label: 'Open' },
              { value: 'bulk', label: 'Bulk' },
            ]}
            onChange={(value) => handleChange('vehicleType', value)}
          />
        </div>   */}
        <div className='flex gap-2 justify-end'>
         {/* <Upload>
            <Button icon={<UploadOutlined />}></Button>
          </Upload>
          <Upload>
            <Button icon={<DownloadOutlined />}></Button>
          </Upload>
          <Upload>
            <Button icon={<PrinterOutlined />}></Button>
          </Upload> */}
          <Button onClick={onAddTruckClick} className='bg-[#1572B6] text-white'> CREATE CHALLAN</Button>
        </div>
      </div>

    );
  };

  const CreateChallanForm = () => {
    const selectedHubId = localStorage.getItem("selectedHubID");
    const [formData, setFormData] = useState(
      {
        "balance": 0,
        "bankTransfer": null,
        "cash": null,
        "commisionRate": '',
        "commisionTotal": '',
        "deliveryLocation": null,
        "deliveryNumber": null,
        "diesel": null,
        "grDate": null,
        "grNumber": null,
        "invoiceProof": null,
        "loadLocation": null,
        "materialType": null,
        "ownerId": null,
        "ownerName": '',
        "ownerPhone": '',
        "quantityInMetricTons": null,
        "rate": null,
        "totalExpense": '',
        "vehicleBank": '',
        "vehicleId": null,
        "vehicleNumber": null,
        "vehicleType": null,
        "isMarketRate": false,
        "marketRate": 0,
        "shortage": 0,
        "hubId": ''
      }


    );


    const onResetClick = () => {
      console.log('reset clicked')
      setFormData(
        {
          "balance": 0,
          "bankTransfer": null,
          "cash": null,
          "commisionRate": '',
          "commisionTotal": '',
          "deliveryLocation": null,
          "deliveryNumber": null,
          "diesel": null,
          "grDate": null,
          "grNumber": null,
          "invoiceProof": null,
          "loadLocation": null,
          "materialType": null,
          "ownerId": null,
          "ownerName": '',
          "ownerPhone": '',
          "quantityInMetricTons": null,
          "rate": null,
          "totalExpense": '',
          "vehicleBank": '',
          "vehicleId": null,
          "vehicleNumber": null,
          "vehicleType": null,
          "isMarketRate": false,
          "marketRate": 0,
          "shortage":0,
          "hubId": ''
        }
  
  
      );
    }
    const handleChange = (name, value) => {
      if (name === "isMarketRate") {
        if (!value) {
          setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: value,
            isMarketRate: false,
            commission: 0,
          }));
        } else {
          setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: value,
            isMarketRate: true,
            commission: 0,
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
    const formatDate = (dateString) => {
      // Split the date string by '-'
      const parts = dateString.split('-');
      // Rearrange the parts in the required format
      // const formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
      const formattedDate = `${parts[0]}/${parts[1]}/${parts[2]}`;
      return formattedDate;
    };
    // Function to handle date change
    const handleDateChange = (date, dateString) => {
      console.log(dateString);
      const formattedGrDate = formatDate(dateString);

      // const formattedGrDate = dateString;
      console.log(formattedGrDate); // Output: "01/05/2024"
      // dateString will be in the format 'YYYY-MM-DD'
      handleChange('grDate', formattedGrDate);
    };
    const [materials, setMaterials] = useState([]);
    const [loadLocation, setloadLocations] = useState([]);

    const [deliveryLocation, setDeliveryLocations] = useState([]);
    const fetchMaterials = async () => {
      try {
        const headersOb = {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${authToken}`
          }
        }
        const response = await API.get(`get-material/${selectedHubId}`, headersOb);
        if (response.status === 201) {
          setMaterials(response.data.materials);
        }
      } catch (error) {
        console.error('Error fetching materials:', error);
      }
    };
    // Function to fetch LoadLocations from the API
    const fetchLoadLocations = async () => {
      try {
        const headersOb = {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${authToken}`
          }
        }
        const response = await API.get(`get-load-location/${selectedHubId}`, headersOb);
        if (response.status == 201) {
          setloadLocations(response.data.materials);
        } else {
          console.log("error in fetchLoadLocations")
        }

      } catch (error) {
        console.error('Error fetching materials:', error);
      }
    };
    // Function to fetch DeliveryLocations from the API
    const fetchDeliveryLocations = async () => {
      try {
        const headersOb = {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${authToken}`
          }
        }
        const response = await API.get(`get-delivery-location/${selectedHubId}`, headersOb);
        setDeliveryLocations(response.data.materials);
      } catch (error) {
        console.error('Error fetching materials:', error);
      }
    };
    const [vehicleDetails, setVehicleDetails] = useState([]); // State to store vehicle details
    const fetchVehicleDetails = async () => {
      try {
        const headersOb = {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${authToken}`
          }
        }
        const response = await API.get(`get-vehicle-details?page=${1}&limit=${120}&hubId=${selectedHubId}`, headersOb);
        let truckDetails;
        if (response.data.truck == 0) {
          truckDetails = response.data.truck
          setVehicleDetails(truckDetails);
        } else {

          truckDetails = response.data.truck[0].data || "";
          setVehicleDetails(response.data.truck[0].count);

          if (truckDetails && truckDetails.length > 0) {
            const arrRes = truckDetails.sort(function (a, b) {
              a = a.
                registrationNumber.toLowerCase();
              b = b.
                registrationNumber.toLowerCase();

              return a < b ? -1 : a > b ? 1 : 0;
            });

            setVehicleDetails(arrRes);

            return arrRes;
          }
        }
      } catch (error) {
        console.error('Error fetching vehicle details:', error);
        // Handle error
      }
    };
    const [selectedvehicleId, setselectedVehicleId] = useState(null); // State to store vehicle details

    const [selectedvehicleCommission, setselectedCommission] = useState(0); // State to store vehicle details

    const fetchSelectedVehicleDetails = async (vehicleId) => {
      try {
        const headersOb = {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${authToken}`
          }
        }
        const response = await API.get(`get-vehicle-details/${vehicleId}?page=${1}&limit=${120}&hubId=${selectedHubId}`, headersOb);
        const truckDetails = response.data.truck;
        if (truckDetails && truckDetails.length > 0) {
          const selectedVehicle = truckDetails[0];
          // const { ownerId, ownerName, ownerPhone, vehicleBank, vehicleId, vehicleNumber, vehicleType } = selectedVehicle;
          const ownerId = selectedVehicle.ownerId._id;
          const ownerName = selectedVehicle.ownerId.name;
          const ownerPhone = selectedVehicle.ownerId.phoneNumber;
          const vehicleBank = selectedVehicle.accountId._id;
          const vehicleId = selectedVehicle._id;
          const vehicleNumber = selectedVehicle.registrationNumber;
          const vehicleType = selectedVehicle.truckType;
          setselectedCommission(selectedVehicle.commission)
          let commissionRate;
          if (formData.isMarketRate) {
            console.log('first')
            commissionRate = 0
          } else {
            console.log('second')
            commissionRate = selectedVehicle.commission

          }
          console.log(commissionRate)
          setFormData((prevFormData) => ({
            ...prevFormData,
            ownerId,
            ownerName,
            ownerPhone,
            vehicleBank,
            vehicleId,
            vehicleNumber,
            vehicleType,
            commissionRate
          }));
        }
      } catch (error) {
        console.error('Error fetching vehicle details:', error);
        // Handle error
      }
    };
    useEffect(() => {
      fetchSelectedVehicleDetails(selectedvehicleId)
    }, [formData.vehicleNumber, selectedvehicleId])
    // Fetch materials on component mount
    useEffect(() => {
      fetchMaterials();
      fetchLoadLocations();
      fetchDeliveryLocations();
      fetchVehicleDetails();
    }, [selectedHubId]);

    const [data, setData] = useState([]);
    const handleSubmit = (e) => {
      e.preventDefault();
      //       total= quantity * c.rate
      // toggle off = %/total
      // toggal on = total -market rate*quantity
      // Calculate commissionTotal based on isMarketRate
      let commissionTotal = 0;
      let commisionRate = 0
      if (formData.isMarketRate) {
        // If isMarketRate is true, calculate commissionTotal as quantityInMetrics * marketRate
        // const t=(parseFloat(formData.quantityInMetricTons)) * parseFloat(formData.rate)
        // const m=(parseFloat(formData.quantityInMetricTons)) * parseFloat(formData.marketRate)
        // commissionTotal = t-m; 
        // commisionRate = 0;
        // commissionTotal =(parseFloat(formData.quantityInMetricTons)) * parseFloat(formData.marketRate); 
        commissionTotal = ((parseFloat(formData.quantityInMetricTons)) * parseFloat(formData.rate))-((parseFloat(formData.quantityInMetricTons)) * parseFloat(formData.marketRate)) ; 
        commisionRate = parseFloat(selectedvehicleCommission);
       
      } else {
        // If isMarketRate is false, calculate commissionTotal as commisionRate * rate
        const commissionTotalInPercentage = (parseFloat(formData.quantityInMetricTons) * parseFloat(formData.rate)) * parseFloat(selectedvehicleCommission);
        commissionTotal = commissionTotalInPercentage / 100;
        commisionRate = parseFloat(selectedvehicleCommission);
      }

      const payload = {
        "balance": (parseFloat(formData.quantityInMetricTons) * parseFloat(formData.rate)) -(commissionTotal)- (parseFloat(formData.diesel) + parseFloat(formData.cash) + parseFloat(formData.bankTransfer) + parseFloat(formData.shortage)),
        // "balance": (parseFloat(formData.quantityInMetricTons) * parseFloat(formData.rate)) - (parseFloat(formData.diesel) + parseFloat(formData.cash) + parseFloat(formData.bankTransfer)),
        "bankTransfer": formData.bankTransfer,
        "cash": formData.cash,
        "deliveryLocation": formData.deliveryLocation,
        "deliveryNumber": formData.deliveryNumber,
        "diesel": formData.diesel,
        "grDate": formData.grDate,
        "grNumber": formData.grNumber,
        "invoiceProof": null,
        "loadLocation": formData.loadLocation,
        "materialType": formData.materialType,
        "ownerId": formData.ownerId,
        "ownerName": formData.ownerName,
        "ownerPhone": formData.ownerPhone,
        "quantityInMetricTons": formData.quantityInMetricTons,
        "rate": formData.rate,
        "totalExpense": parseFloat(formData.diesel) + parseFloat(formData.cash) + parseFloat(formData.bankTransfer) + parseFloat(formData.shortage),
        "vehicleBank": formData.vehicleBank,
        "vehicleId": formData.vehicleId,
        "vehicleNumber": formData.vehicleNumber,
        "vehicleType": formData.vehicleType,
        "commisionRate": commisionRate,
        "commisionTotal": commissionTotal,
        "isMarketRate": formData.isMarketRate,
        "marketRate": formData.marketRate,
        "hubId": selectedHubId,
        "shortage":formData.shortage
      }
      const headersOb = {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        }
      }
      setData(payload)
      localStorage.setItem("challan", JSON.stringify(payload))
      
      if (formData.grDate !== null || formData.grDate !== "") {
        API.post('create-dispatch-challan', payload, headersOb)
          .then((response) => {
            console.log('Challan added successfully:', response.data);
            alert("Challan added successfully")
            window.location.reload(); // Reload the page or perform any necessary action
          })
          .catch((error) => {
            if(error.response.data.message =='This Delivery Number already exists'){
              alert("This Delivery Number already exists")
            }else if(error.response.data.message =="Please select right owner for the selected period"){
              alert("Please select right owner for the selected period")
            }else{
              alert("error occurred")        
            }
            console.error('Error adding truck data:', error.response);
          });
      } else {
        alert("GR Date is required")
      }
    };
    const goBack = () => {
      setShowDispatchTable(true)
      onData('flex')
  }

    return (
      <>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-4">
            <div className="flex"> <img src={backbutton_logo} alt="backbutton_logo" className='w-5 h-5 object-cover cursor-pointer' onClick={goBack} /></div>
            <div className="flex flex-col">
              <h1 className='font-bold' style={{ fontSize: "16px" }}>Create Challan</h1>
              <Breadcrumb
                items={[
                  {
                    title: 'Dispatch',
                  },
                  {
                    title: 'Create Challan',
                  },

                ]}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex gap-1 justify-between">
              <div>
                <div className="text-md font-semibold">Challan Details</div>
                <div className="text-md font-normal">Enter Challan Details</div>
              </div>
              <div className='flex gap-2'>
                Market Rate
                <Switch
                  defaultChecked={formData.isMarketRate}
                  name="isMarketRate"
                  onChange={(checked) => handleChange('isMarketRate', checked)}
                />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
                <Col className="gutter-row mt-6" span={6}>

                  <Select
                    name="materialType"
                    onChange={(value) => handleChange('materialType', value)}
                    placeholder="Material Type*"
                    size="large"
                    style={{ width: '100%' }}
                    showSearch
                    optionFilterProp="children"
                    value={formData.materialType}
                    
                    filterOption={filterOption}
                  >
                    {materials.map((v, index) => (
                      <Option key={index} value={v.materialType}>
                        {`${v.materialType}`}
                      </Option>
                    ))}
                  </Select>
                </Col>
                <Col className="gutter-row mt-6" span={6}>
                  <Input
                    type="number"
                    name="grNumber"
                    placeholder="GR Number"
                    size="large"
                    style={{ width: '100%' }}
                    value={formData.grNumber}

                    onChange={(e) => handleChange('grNumber', e.target.value)}
                  />
                </Col>
                <Col className="gutter-row mt-6" span={6}>
                  <DatePicker
                    required
                    format="DD-MM-YYYY" // Display format
                    placeholder="GR Date *"
                    size="large"
                    style={{ width: "100%" }}
                    onChange={handleDateChange} // Call handleDateChange function on date change
                  />
                </Col>
                <Col className="gutter-row mt-6" span={6}>
                  <Select
                    name="loadLocation"
                    onChange={(value) => handleChange('loadLocation', value)}
                    placeholder="Loaded From*"
                    size="large"
                    style={{ width: '100%' }}
                    showSearch
                    value={formData.loadLocation}
                    optionFilterProp="children"
                    filterOption={filterOption}
                  >
                    {loadLocation.map((v, index) => (
                      <Option key={index} value={v.location}>
                        {`${v.location}`}
                      </Option>
                    ))}
                  </Select>

                </Col>
              </Row>
              <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
                <Col className="gutter-row mt-6" span={6}>
                  <Select
                    name="deliveryLocation"
                    onChange={(value) => handleChange('deliveryLocation', value)}
                    placeholder="Deliver To*"
                    size="large"
                    showSearch
                    value={formData.deliveryLocation}
                    optionFilterProp="children"
                    filterOption={filterOption}
                    style={{ width: '100%' }}
                  >
                    {deliveryLocation.map((v, index) => (
                      <Option key={index} value={v.location}>
                        {`${v.location}`}
                      </Option>
                    ))}
                  </Select>
                </Col>
                <Col className="gutter-row mt-6" span={6}>
                  <Select
                    name="vehicleNumber"
                    placeholder="Vehicle Number*"
                    size="large"
                    style={{ width: '100%' }}
                    showSearch
                    optionFilterProp="children"
                    filterOption={filterOption}
                    onChange={(value) => {
                      const selectedVehicle = vehicleDetails.find((v) => v.registrationNumber === value);
                      if (selectedVehicle) {
                        console.log(selectedVehicle._id)
                        setselectedVehicleId(selectedVehicle._id);
                      }
                      handleChange('vehicleNumber', value);
                    }}
                  >
                    {vehicleDetails.map((v, index) => (
                      <Option key={index} value={v.registrationNumber}>
                        {`${v.registrationNumber} -${v.ownerId[0].name} `}
                      </Option>
                    ))}
                  </Select>
                </Col>
                <Col className="gutter-row mt-6" span={6}>

                  <Select
                    name="vehicleType"
                    placeholder="Vehicle Type*"
                    size="large"
                 
                    style={{ width: '100%' }}
                    value={formData.vehicleType ? formData.vehicleType.charAt(0).toUpperCase() + formData.vehicleType.slice(1) : ''}
                    disabled
                  />


                </Col>
                <Col className="gutter-row mt-6" span={6}>

                  <Input
                    type='number'
                    placeholder="Delivery Number*"
                    size="large"
                    value={formData.deliveryNumber}
                    name="deliveryNumber"
                    onChange={(e) => handleChange('deliveryNumber', e.target.value)}
                  />
                </Col>
              </Row>
              <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
                <Col className="gutter-row mt-6" span={6}>
                  <Input
                    type='number'
                    placeholder="Quantity (M/T)*"
                    size="large"
                    value={formData.quantityInMetricTons}
                    name="quantityInMetricTons"
                    onChange={(e) => handleChange('quantityInMetricTons', e.target.value)}
                  />
                </Col>
                <Col className="gutter-row mt-6" span={6}>
                  <Input
                    placeholder="Company Rate*"
                    type='number'
                    size="large"
                    value={formData.rate}
                    name="rate"
                    onChange={(e) => handleChange('rate', e.target.value)}
                  />
                </Col>

                <Col className="gutter-row mt-6" span={6}>
                  {formData.isMarketRate ? <>
                    <Input
                      type='number'
                      placeholder="Market Rate Rs*"
                      size="large"
                      name="diesel"
                      onChange={(e) => handleChange('marketRate', e.target.value)}
                    />
                  </> : <></>}

                </Col>
              </Row>


            </div>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex gap-1 justify-between">
              <div>

                <div className="text-md font-semibold">Load Trip Expense Details</div>
                <div className="text-md font-normal">Enter Trip Details</div>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
                <Col className="gutter-row mt-2" span={6}>
                  <Input
                    type='number'
                    placeholder="Diesel*"
                    size="large"
                    value={formData.diesel}
                    name="diesel"
                    onChange={(e) => handleChange('diesel', e.target.value)}
                  />
                </Col>
                <Col className="gutter-row mt-2" span={6}>
                  <Input
                    type='number'
                    placeholder="Cash*"
                    size="large"
                    value={formData.cash}
                    name="cash"
                    onChange={(e) => handleChange('cash', e.target.value)}
                  />
                </Col>
                <Col className="gutter-row mt-2" span={6}>
                  <Input
                    type='number'
                    placeholder="Bank Transfer*"
                    size="large"
                    value={formData.bankTransfer}
                    name="bankTransfer"
                    onChange={(e) => handleChange('bankTransfer', e.target.value)}
                  />

                </Col>
              </Row>


            </div>
          </div>

          <div className="flex gap-4 items-center justify-center reset-button-container">
            <Button onClick={onResetClick}>Reset</Button>
            <Button type="primary" className="bg-primary" onClick={handleSubmit}>
              Save
            </Button>
          </div>
        </div>
      </>
    );
  };
  const handleEditTruckClick = (rowData) => {
    setRowDataForDispatchEdit(rowData);
    setShowDispatchTable(false);
    setEditingChallan(true);
    onData('none')

  };
  const handleAddTruckClick = () => {
    setRowDataForDispatchEdit(null);
    setShowDispatchTable(false);
    setEditingChallan(false);
    onData('none')
  };

  const handleDeleteTruckClick = async (rowData) => {
    console.log("deleting", rowData._id)
    const challanId = rowData._id
    const headersOb = {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authToken}`
      }
    }
    const response = await API.delete(`delete-dispatch-challan/${challanId}`, headersOb);
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


  const EditableChallan = ({ editingRow }) => {

    const selectedHubId = localStorage.getItem("selectedHubID");

    const [formData, setFormData] = useState(
      {
        "balance": editingRow.balance,
        "bankTransfer": editingRow.bankTransfer,
        "cash": editingRow.cash,
        "commisionRate": editingRow.commisionRate,
        "commisionTotal": editingRow.commisionTotal,
        "deliveryLocation": editingRow.deliveryLocation,
        "deliveryNumber": editingRow.deliveryNumber,
        "diesel": editingRow.diesel,
        "grDate": editingRow.grDate,
        "grNumber": editingRow.grNumber,
        "invoiceProof": editingRow.invoiceProof,
        "loadLocation": editingRow.loadLocation,
        "materialType": editingRow.materialType,
        "ownerId": editingRow.ownerId,
        "ownerName": editingRow.ownerName,
        "ownerPhone": editingRow.ownerPhone,
        "quantityInMetricTons": editingRow.quantityInMetricTons,
        "rate": editingRow.rate,
        "totalExpense": editingRow.totalExpense,
        "vehicleBank": editingRow.vehicleBank,
        "vehicleId": editingRow.vehicleId,
        "vehicleNumber": editingRow.vehicleNumber,
        "vehicleType": editingRow.vehicleType,
        "isMarketRate": editingRow.isMarketRate,
        "marketRate": editingRow.marketRate,
        "hubId": selectedHubId,
        "shortage": editingRow.shortage,
      }

    );
    const [a,setA]=useState(null)


    const handleResetClick=()=>{
      console.log('reset clicked')
     setFormData(
        {
          "balance": editingRow.balance,
          "bankTransfer": editingRow.bankTransfer,
          "cash": editingRow.cash,
          "commisionRate": editingRow.commisionRate,
          "commisionTotal": editingRow.commisionTotal,
          "deliveryLocation": editingRow.deliveryLocation,
          "deliveryNumber": editingRow.deliveryNumber,
          "diesel": editingRow.diesel,
          "grDate": editingRow.grDate,
          "grNumber": editingRow.grNumber,
          "invoiceProof": editingRow.invoiceProof,
          "loadLocation": editingRow.loadLocation,
          "materialType": editingRow.materialType,
          "ownerId": editingRow.ownerId,
          "ownerName": editingRow.ownerName,
          "ownerPhone": editingRow.ownerPhone,
          "quantityInMetricTons": editingRow.quantityInMetricTons,
          "rate": editingRow.rate,
          "totalExpense": editingRow.totalExpense,
          "vehicleBank": editingRow.vehicleBank,
          "vehicleId": editingRow.vehicleId,
          "vehicleNumber": editingRow.vehicleNumber,
          "vehicleType": editingRow.vehicleType,
          "isMarketRate": editingRow.isMarketRate,
          "marketRate": editingRow.marketRate,
          "hubId": selectedHubId,
          "shortage": editingRow.shortage,
        }
  
      );
    }
    const handleChange = (name, value) => {
      if (name === "isMarketRate") {
        if (!value) {
          setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: value,
            isMarketRate: false,
            commission: editingRow.commisionRate,
          }));
        } else {
          setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: value,
            isMarketRate: true,
            commission: 0,
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
    const formatDate = (dateString) => {
      // Split the date string by '-'
      const parts = dateString.split('-');
      // Rearrange the parts in the required format
      const formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
      return formattedDate;
    };
    // Function to handle date change
    const handleDateChange = (date, dateString) => {
      const formattedGrDate = formatDate(dateString);
      handleChange('grDate', formattedGrDate);
    };
    const [materials, setMaterials] = useState([]);
    const [loadLocation, setloadLocations] = useState([]);

    const [deliveryLocation, setDeliveryLocations] = useState([]);
    const fetchMaterials = async () => {
      try {
        const headersOb = {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${authToken}`
          }
        }
        const response = await API.get(`get-material/${selectedHubId}`, headersOb);
        if (response.status === 201) {
          setMaterials(response.data.materials);
        }
      } catch (error) {
        console.error('Error fetching materials:', error);
      }
    };
    // Function to fetch LoadLocations from the API
    const fetchLoadLocations = async () => {
      try {
        const headersOb = {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${authToken}`
          }
        }
        const response = await API.get(`get-load-location/${selectedHubId}`, headersOb);
        if (response.status == 201) {
          setloadLocations(response.data.materials);
        } else {
          console.log("error in fetchLoadLocations")
        }

      } catch (error) {
        console.error('Error fetching materials:', error);
      }
    };
    // Function to fetch DeliveryLocations from the API
    const fetchDeliveryLocations = async () => {
      try {
        const headersOb = {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${authToken}`
          }
        }
        const response = await API.get(`get-delivery-location/${selectedHubId}`, headersOb);
        setDeliveryLocations(response.data.materials);
      } catch (error) {
        console.error('Error fetching materials:', error);
      }
    };
    const [vehicleDetails, setVehicleDetails] = useState([]); // State to store vehicle details
    const fetchVehicleDetails = async () => {
      try {
        const headersOb = {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${authToken}`
          }
        }
        const response = await API.get(`get-vehicle-details?page=${1}&limit=${120}&hubId=${selectedHubId}`, headersOb);
        let truckDetails;
        if (response.data.truck == 0) {
          truckDetails = response.data.truck
          setVehicleDetails(truckDetails);
        } else {

          truckDetails = response.data.truck[0].data || "";
          setVehicleDetails(response.data.truck[0].count);

          if (truckDetails && truckDetails.length > 0) {
            const arrRes = truckDetails.sort(function (a, b) {
              a = a.
                registrationNumber.toLowerCase();
              b = b.
                registrationNumber.toLowerCase();

              return a < b ? -1 : a > b ? 1 : 0;
            });

            setVehicleDetails(arrRes);

            return arrRes;
          }
        }
      } catch (error) {
        console.error('Error fetching vehicle details:', error);
        // Handle error
      }
    };
    const [selectedvehicleId, setselectedVehicleId] = useState(null); // State to store vehicle details

    const [selectedvehicleCommission, setselectedCommission] = useState(0); // State to store vehicle details

    const fetchSelectedVehicleDetails = async (vehicleId) => {
      try {
        const headersOb = {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${authToken}`
          }
        }
        const response = await API.get(`get-vehicle-details/${vehicleId}?page=${1}&limit=${120}&hubId=${selectedHubId}`, headersOb);
        const truckDetails = response.data.truck;
        if (truckDetails && truckDetails.length > 0) {
          const selectedVehicle = truckDetails[0];
          // const { ownerId, ownerName, ownerPhone, vehicleBank, vehicleId, vehicleNumber, vehicleType } = selectedVehicle;
          const ownerId = selectedVehicle.ownerId._id;
          const ownerName = selectedVehicle.ownerId.name;
          const ownerPhone = selectedVehicle.ownerId.phoneNumber;
          const vehicleBank = selectedVehicle.accountId._id;
          const vehicleId = selectedVehicle._id;
          const vehicleNumber = selectedVehicle.registrationNumber;
          const vehicleType = selectedVehicle.truckType;

          let commissionRate;
          if (formData.isMarketRate) {
            commissionRate = 0
          } else {
            commissionRate = selectedVehicle.commission

          }

          console.log(commissionRate)

          setselectedCommission(commissionRate)
          setFormData((prevFormData) => ({
            ...prevFormData,
            ownerId,
            ownerName,
            ownerPhone,
            vehicleBank,
            vehicleId,
            vehicleNumber,
            vehicleType,
            commissionRate
          }));
        }
      } catch (error) {
        console.error('Error fetching vehicle details:', error);
        // Handle error
      }
    };
    useEffect(() => {
      fetchSelectedVehicleDetails(selectedvehicleId)
    }, [formData.vehicleNumber, selectedvehicleId])
    useEffect(() => {
      fetchSelectedVehicleDetails(editingRow.vehicleId)
    }, [formData.isMarketRate])
    // Fetch materials on component mount
    useEffect(() => {
      fetchMaterials();
      fetchLoadLocations();
      fetchDeliveryLocations();
      fetchVehicleDetails();
    }, [selectedHubId]);

    const handleSubmit = (e) => {
      e.preventDefault();
      // Calculate commissionTotal based on isMarketRate
      let commissionTotal = 0;
      let commisionRate = 0
      if (formData.isMarketRate) {
        console.log("isMarketRate", formData.isMarketRate)
        // const t=(parseFloat(formData.quantityInMetricTons)) * parseFloat(formData.rate)
        // const m=(parseFloat(formData.quantityInMetricTons)) * parseFloat(formData.marketRate)
        // commissionTotal = (t-m); 
        commissionTotal = ((parseFloat(formData.quantityInMetricTons)) * parseFloat(formData.rate))-((parseFloat(formData.quantityInMetricTons)) * parseFloat(formData.marketRate)) ; 
       
        commisionRate = 0;
      } else {
        console.log("isMarketRate", formData.isMarketRate)
        // If isMarketRate is false, calculate commissionTotal as commisionRate * rate
        const commissionTotalInPercentage = (parseFloat(formData.quantityInMetricTons) * parseFloat(formData.rate)) * parseFloat(selectedvehicleCommission);
        commissionTotal = commissionTotalInPercentage / 100;
        commisionRate = parseFloat(selectedvehicleCommission);

      }

      const payload = {
        "balance": (((parseFloat(formData.quantityInMetricTons) * parseFloat(formData.rate)) -(commissionTotal))- (parseFloat(formData.diesel) + parseFloat(formData.cash) + parseFloat(formData.bankTransfer) + parseFloat(formData.shortage))),
        "bankTransfer": formData.bankTransfer,
        "cash": formData.cash,
        "deliveryLocation": formData.deliveryLocation,
        "deliveryNumber": formData.deliveryNumber,
        "diesel": formData.diesel,
        "grDate": formData.grDate,
        "grNumber": formData.grNumber,
        "invoiceProof": null,
        "loadLocation": formData.loadLocation,
        "materialType": formData.materialType,
        "ownerId": formData.ownerId,
        "ownerName": formData.ownerName,
        "ownerPhone": formData.ownerPhone,
        "quantityInMetricTons": formData.quantityInMetricTons,
        "rate": formData.rate,
        "totalExpense": parseFloat(formData.diesel) + parseFloat(formData.cash) + parseFloat(formData.bankTransfer) + parseFloat(formData.shortage),
        "vehicleBank": formData.vehicleBank,
        "vehicleId": formData.vehicleId,
        "vehicleNumber": formData.vehicleNumber,
        "vehicleType": formData.vehicleType,
        "commisionRate": commisionRate,
        "commisionTotal": commissionTotal,
        "isMarketRate": formData.isMarketRate,
        "marketRate": formData.marketRate,
        "hubId": selectedHubId,
        "shortage": formData.shortage,
      }

      setA(payload)
      const headersOb = {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        }
      }
      
      API.put(`update-dispatch-challan-invoice/${editingRow._id}`, payload, headersOb)
        .then((response) => {
          console.log('Challan updated successfully:', response.data);
          alert("Challan updated successfully")
          window.location.reload(); // Reload the page or perform any necessary action
        })
        .catch((error) => {
          alert("error occurred")
          console.error('Error adding truck data:', error);
        });

    };

    const goBack = () => {
      onData('flex')
      setShowDispatchTable(true)
    }
    return (
      <>
        <div className="flex flex-col gap-2">

          <div className="flex items-center gap-4">
            <div className="flex"><img src={backbutton_logo} alt="backbutton_logo" className='w-5 h-5 object-cover cursor-pointer' onClick={goBack} /></div>
            <div className="flex flex-col">
              <h1 className='font-bold' style={{ fontSize: "16px" }}>Edit Challan</h1>
              <Breadcrumb
                items={[
                  {
                    title: 'Dispatch',
                  },
                  {
                    title: 'Edit Challan',
                  },
                ]}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex gap-1 justify-between">
              <div>

                <div className="text-md font-semibold">Challan Details</div>
                <div className="text-md font-normal">Enter Challan Details</div>
              </div>
              <div className='flex gap-2'>
                Market Rate
                <Switch
                  defaultChecked={formData.isMarketRate}
                  name="isMarketRate"
                  onChange={(checked) => handleChange('isMarketRate', checked)}
                />
              </div>
            </div>
            <div className="flex flex-col gap-1">
        
              <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
                <Col className="gutter-row mt-6" span={6}>
                  <Select
                    name="materialType"
                    onChange={(value) => handleChange('materialType', value)}
                    placeholder="Material Type*"
                    size="large"
                    value={formData.materialType}
                    style={{ width: '100%' }}
                  >
                    {materials.map((v, index) => (
                      <Option key={index} value={v.materialType}>
                        {`${v.materialType}`}
                      </Option>
                    ))}
                  </Select>
                </Col>
                <Col className="gutter-row mt-6" span={6}>
                  <Input
                    type="text"
                    name="grNumber"
                    placeholder="grNumber*"
                    size="large"
                    value={formData.grNumber}
                    style={{ width: '100%' }}

                    onChange={(e) => handleChange('grNumber', e.target.value)}
                  />
                </Col>
                <Col className="gutter-row mt-6" span={6}>

                  <DatePicker
                    required
                    placeholder="GR Date"
                    size="large"
                    format="DD-MM-YYYY" // Display format
                    value={moment()} // Set initial value if needed
                    style={{ width: "100%" }}
                    onChange={handleDateChange} // Call handleDateChange function on date change
                  />
                </Col>
                <Col className="gutter-row mt-6" span={6}>

                  <Select
                    name="loadLocation"
                    onChange={(value) => handleChange('loadLocation', value)}
                    placeholder="Loaded From*"
                    size="large"
                    value={formData.loadLocation}
                    style={{ width: '100%' }}
                  >
                    {loadLocation.map((v, index) => (
                      <Option key={index} value={v.location}>
                        {`${v.location}`}
                      </Option>
                    ))}
                  </Select>

                </Col>
              </Row>
              <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
                <Col className="gutter-row mt-6" span={6}>
                  <Select
                    name="deliveryLocation"
                    onChange={(value) => handleChange('deliveryLocation', value)}
                    placeholder="Deliver To*"
                    size="large"
                    value={formData.deliveryLocation}
                    style={{ width: '100%' }}
                  >
                    {deliveryLocation.map((v, index) => (
                      <Option key={index} value={v.location}>
                        {`${v.location}`}
                      </Option>
                    ))}
                  </Select>
                </Col>
                <Col className="gutter-row mt-6" span={6}>
                  <Select
                    name="vehicleNumber"
                    placeholder="Vehicle Number*"
                    size="large"
                    value={formData.vehicleNumber}
                    style={{ width: '100%' }}
                    onChange={(value) => {
                      const selectedVehicle = vehicleDetails.find((v) => v.registrationNumber === value);
                      if (selectedVehicle) {
                        console.log(selectedVehicle._id)
                        setselectedVehicleId(selectedVehicle._id);
                      }
                      handleChange('vehicleNumber', value);
                    }}
                  >
                    {vehicleDetails.map((v, index) => (
                      <Option key={index} value={v.registrationNumber}>
                        {`${v.registrationNumber}`}
                      </Option>
                    ))}
                  </Select>
                </Col>
                <Col className="gutter-row mt-6" span={6}>

                  <Select
                    name="vehicleType"
                    placeholder="Vehicle Type*"
                    size="large"
                    style={{ width: '100%' }}
                    value={formData.vehicleType}
                    disabled
                  />


                </Col>
                <Col className="gutter-row mt-6" span={6}>

                  <Input
                    placeholder="DeliveryNumber*"
                    size="large"
                    type='number'
                    name="deliveryNumber"
                    value={formData.deliveryNumber}
                    onChange={(e) => handleChange('deliveryNumber', e.target.value)}
                  />
                </Col>
              </Row>
              <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
                <Col className="gutter-row mt-6" span={6}>
                  <Input
                    placeholder="Quantity (M/T)*"
                    size="large"
                    name="quantityInMetricTons"
                    value={formData.quantityInMetricTons}
                    onChange={(e) => handleChange('quantityInMetricTons', e.target.value)}
                  />
                </Col>
                <Col className="gutter-row mt-6" span={6}>
                  <Input
                    placeholder="Company Rate*"
                    type='number'
                    size="large"
                    value={formData.rate}
                    name="rate"
                    onChange={(e) => handleChange('rate', e.target.value)}
                  />
                </Col>

                <Col className="gutter-row mt-6" span={6}>
                  {formData.isMarketRate ? <>
                    <Input
                      type='number'
                      placeholder="Market Rate Rs*"
                      size="large"
                      name="diesel"
                      value={formData.marketRate}
                      onChange={(e) => handleChange('marketRate', e.target.value)}
                    />
                  </> : <></>}

                </Col>
              </Row>


            </div>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex gap-1 justify-between">
              <div>

                <div className="text-md font-semibold">Load Trip Expense Details</div>
                <div className="text-md font-normal">Enter Trip Details</div>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
                <Col className="gutter-row mt-2" span={6}>
                  <Input
                    type='number'
                    placeholder="Diesel*"
                    size="large"
                    name="diesel"
                    value={formData.diesel}
                    onChange={(e) => handleChange('diesel', e.target.value)}
                  />
                </Col>
                <Col className="gutter-row mt-2" span={6}>
                  <Input
                    type='number'
                    placeholder="Cash*"
                    size="large"
                    name="cash"
                    value={formData.cash}
                    onChange={(e) => handleChange('cash', e.target.value)}
                  />
                </Col>
                <Col className="gutter-row mt-2" span={6}>
                  <Input
                    type='number'
                    placeholder="Bank Transfer*"
                    size="large"
                    name="bankTransfer"
                    value={formData.bankTransfer}
                    onChange={(e) => handleChange('bankTransfer', e.target.value)}
                  />

                </Col>
                <Col className="gutter-row mt-2" span={6}>
                  <Input
                    type='number'
                    placeholder="Shortage*"
                    size="large"
                    name="shortage"
                    value={formData.shortage}
                    onChange={(e) => handleChange('shortage', e.target.value)}
                  />

                </Col>
              </Row>


            </div>
          </div>
          <div className="flex gap-4 items-center justify-center reset-button-container">
            <Button onClick={handleResetClick}>Reset</Button>
            <Button type="primary" className="bg-primary" onClick={handleSubmit}>
              Save
            </Button>
          </div>
        </div>
      </>
    );
  };

  const DispatchTable = ({ onEditTruckClick, onDeleteTruckClick }) => {
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

        fixed: 'left',
      },
      {
        title: 'Material Type',
        dataIndex: 'materialType',
        key: 'materialType',
        width: 120,
      },
      {
        title: 'GR No',
        dataIndex: 'grNumber',
        key: 'grNumber',
        width: 100,
      },
      {
        title: 'GR Date',
        dataIndex: 'grDate',
        key: 'grDate',
        width: 120,
      },
      {
        title: 'Load Location',
        dataIndex: 'loadLocation',
        key: 'loadLocation',
        width: 150,
      },
      {
        title: 'Delivery Location',
        dataIndex: 'deliveryLocation',
        key: 'deliveryLocation',
        width: 150,
      },
      {
        title: 'Vehicle Number',
        dataIndex: 'vehicleNumber',
        key: 'vehicleNumber',
        width: 160,
      },
      {
        title: 'Owner Name',
    
        width: 160,
        render: (_, record)=>{
            return <p>{record.ownerName}</p>
        }

    },
     
      {
        title: 'Vehicle Type',
        dataIndex: 'vehicleType',
        key: 'vehicleType',
        width: 120,
      },
      {
        title: 'Delivery Number',
        dataIndex: 'deliveryNumber',
        key: 'deliveryNumber',
        width: 120,
      },
      // {
      //   title: 'Invoice Proof',
      //   dataIndex: 'invoiceProof',
      //   key: 'invoiceProof',
      //   width: 120,
      //   render: invoiceProof => <Image src={invoiceProof} alt="Invoice Proof" width={50} />
      // },
      {
        title: 'Quantity',
        dataIndex: 'quantityInMetricTons',
        key: 'quantityInMetricTons',
        width: 100,
      },
      // {
      //   title: 'Rate',
      //   dataIndex: 'rate',
      //   key: 'rate',
      //   width: 100,
      // },
      {
        title: 'Company Rate',
        dataIndex: 'rate',
        key: 'rate',
        width: 150,
      },
      // {
      //   title: 'Market Rate',
      //   dataIndex: 'isMarketRate',
      //   key: 'isMarketRate',
      //   width: 120,
      //   render: isMarketRate => (isMarketRate ? 'Yes' : 'No')
      // },
      {
        title: 'Market Rate',
        dataIndex: 'marketRate',
        key: 'marketRate',
        width: 150,
      },

      {
        title: 'Diesel',
        dataIndex: 'diesel',
        key: 'diesel',
        width: 100,
      },
      {
        title: 'Cash',
        dataIndex: 'cash',
        key: 'cash',
        width: 100,
      },
      {
        title: 'Bank Transfer',
        dataIndex: 'bankTransfer',
        key: 'bankTransfer',
        width: 120,
      },
      {
        title: 'Action',
        key: 'action',
        width: 80,
        fixed: 'right',
        render: (record: unknown) => (
          <Space size="middle">
            <Tooltip placement="top" title="Edit"><a onClick={() => onEditTruckClick(record)}><FormOutlined /></a></Tooltip>
            <Tooltip placement="top" title="Delete"><a onClick={() => onDeleteTruckClick(record)}><DeleteOutlined /></a></Tooltip>
          </Space>
        ),
      },
      // {
      //   title: 'Recovery',
      //   dataIndex: 'recovery',
      //   key: 'recovery',
      //   width: 100,
      // },
      // {
      //   title: 'Outstanding',
      //   dataIndex: 'outstanding',
      //   key: 'outstanding',
      //   width: 120,
      // },
      // {
      //   title: 'Acknowledged',
      //   dataIndex: 'isAcknowledged',
      //   key: 'isAcknowledged',
      //   width: 120,
      //   render: isAcknowledged => (isAcknowledged ? 'Yes' : 'No')
      // },
      // {
      //   title: 'Received',
      //   dataIndex: 'isReceived',
      //   key: 'isReceived',
      //   width: 100,
      //   render: isReceived => (isReceived ? 'Yes' : 'No')
      // },

      // {
      //   title: 'Material Type',
      //   dataIndex: 'materialType',
      //   key: 'materialType',
      //   width: 120,
      // },


      // {
      //   title: 'Vehicle ID',
      //   dataIndex: 'vehicleId',
      //   key: 'vehicleId',
      //   width: 120,
      // },
      // {
      //   title: 'Vehicle Bank',
      //   dataIndex: 'vehicleBank',
      //   key: 'vehicleBank',
      //   width: 120,
      // },

      // {
      //   title: 'Created At',
      //   dataIndex: 'createdAt',
      //   key: 'createdAt',
      //   width: 150,
      // },
      // {
      //   title: 'Modified At',
      //   dataIndex: 'modifiedAt',
      //   key: 'modifiedAt',
      //   width: 150,
      // },
    ];
    const changePagination = async (pageNumber, pageSize) => {
      try {
        setCurrentPage(pageNumber);
        setCurrentPageSize(pageSize);
        const newData = await getTableData(searchQuery, pageNumber, pageSize, selectedHubId);
        setchallanData(newData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    const changePaginationAll = async (pageNumber, pageSize) => {
      try {
        setCurrentPage(pageNumber);
        setCurrentPageSize(pageSize);
        const newData = await getTableData(searchQuery, pageNumber, pageSize, selectedHubId);
        setchallanData(newData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    return (
      <>
        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={challanData}
          scroll={{ x: 800, y: 320 }}
          rowKey="_id"
          pagination={{
            position: ['bottomCenter'],
            showSizeChanger: true,
            current: currentPage,
            total: totalDispatchData,
            defaultPageSize: currentPageSize, // Set the default page size
            onChange: changePagination,
            onShowSizeChange: changePaginationAll,
          }}
        />
      </>
    );
  };

  return (
    <>
      {showDispatchTable ? (
        <>
          <Truck onAddTruckClick={handleAddTruckClick} />
          <DispatchTable onEditTruckClick={handleEditTruckClick} onDeleteTruckClick={handleDeleteTruckClick} />
        </>
      ) : (
        editingChallan ? (

          <EditableChallan editingRow={rowDataForDispatchEdit} />
        ) : (
          <CreateChallanForm />
        )
      )}
    </>
  );

}

export default DispatchContainer