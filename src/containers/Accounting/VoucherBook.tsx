import React, { useState, useCallback, useEffect } from 'react';
import { DatePicker, Table, Input, Select, Space, Button, Tooltip, Row, Col } from 'antd';
import { FormOutlined, DownloadOutlined, DeleteOutlined, PrinterOutlined, RedoOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import backbutton_logo from "../../assets/backbutton.png";
import { API } from "../../API/apirequest";
import moment from "moment"
const { Search } = Input;
const { Option } = Select;
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

const filterOption = (input, option) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;

const VoucherBook = ({ onData, showTabs, setShowTabs }) => {
  const authToken = localStorage.getItem("token");
  const selectedHubId = localStorage.getItem("selectedHubID");
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredVoucherData, setFilteredVoucherData] = useState([]);
  const [totalMonthlyAmount, setTotalMonthlyAmount] = useState('');

  // Set current month and year as default values
  const currentMonth = dayjs().month() + 1;
  const currentYear = dayjs().year();
  const [selectedDate, setSelectedDate] = useState({ month: currentMonth, year: currentYear });

  const [showVoucherTable, setshowVoucherTable] = useState(true);
  const [showVoucherView, setshowVoucherView] = useState(false);
  const [showTransferForm, setShowTransferForm] = useState(false);
  const [rowDataForTruckEdit, setRowDataForTruckEdit] = useState(null);
  const goBack = () => {
    setshowVoucherTable(true);
    setShowTabs(true);
  };

  const handleEditVoucherClick = (rowData) => {
    setShowTabs(false);
    setRowDataForTruckEdit(rowData);
    setshowVoucherTable(false);
    setShowTransferForm(false);
    setshowVoucherView(false);
  };

  const handleViewVoucherClick = (rowData) => {
    setShowTabs(false);
    setRowDataForTruckEdit(rowData);
    setshowVoucherTable(false);
    setShowTransferForm(false);
    setshowVoucherView(true);
  };

  const handleAddVoucherClick = () => {
    setShowTabs(false);
    setRowDataForTruckEdit(null);
    setshowVoucherTable(false);
  };
  const getTableData = useCallback(async (searchData, month, year) => {
    const headersOb = {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authToken}`,
      },
    };
    try {
      const text = searchData || "";
      const filterPayload = {
        searchTN: text,
      };

      const response = text
        ? await API.post(`get-vouchers-filter-by-name-date/${month}/${year}/${selectedHubId}`, filterPayload, headersOb)
        : await API.get(`get-vouchers-by-month/${month}/${year}/${selectedHubId}`, headersOb);

      let truckDetails;
      let amount;

      if (response.data.vaucharEntries.length === 0) {
        truckDetails = response.data.vaucharEntries;
        setFilteredVoucherData(truckDetails);
        amount = '0';
        setTotalMonthlyAmount(amount);
      } else {
        truckDetails = response.data.vaucharEntries || "";

        setFilteredVoucherData(truckDetails);
        amount = response.data.amounts.monthlyTotalAmount;
        setTotalMonthlyAmount(amount);
      }
    } catch (err) {
      console.log(err);
    }
  }, [authToken, selectedHubId]);

  useEffect(() => {
    const month = selectedDate.month;
    const year = selectedDate.year;
    getTableData(searchQuery, month, year);
  }, [selectedDate, searchQuery, getTableData]);


  const handleDeleteVoucherClick = async (rowData) => {
    const voucherId = rowData._id;
    const headersOb = {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authToken}`,
      },
    };
    const response = await API.delete(`delete-voucher/${voucherId}`, headersOb);
    if (response.status === 201) {
      alert("Deleted data");
      setTimeout(() => {
        goBack()
        const month = selectedDate.month;
        const year = selectedDate.year;
        getTableData("", month, year);
      }, 2000)
    } else {
      alert("Unable to delete data");
    }
  };


  const Truck = ({ onAddVoucherClick }) => {
    const initialSearchQuery = localStorage.getItem('searchQuery6') || '';
    const [searchQuery6, setSearchQuery6] = useState(initialSearchQuery);

    useEffect(() => {
      localStorage.setItem('searchQuery6', searchQuery6);
    }, [searchQuery6]);

    const handleSearch = (value) => {
      setSearchQuery6(value);
    };

    const handleMonthChange = (date) => {
      if (date) {
        const month = date.month() + 1;
        const year = date.year();
        setSelectedDate({ month, year });
      }
    };

    const onChangeSearch = (e) => {
      setSearchQuery6(e.target.value);
      if (e.target.value === "") {
        onReset();
      }
    };

    const onReset = () => {
      setSearchQuery6("");
      // const month = selectedDate.month;
      // const year = selectedDate.year;
      // Set current month and year as default values
      // const currentMonth = dayjs().month() + 1;
      // const currentYear = dayjs().year();
      // getTableData("", currentMonth, currentYear);
      const month = selectedDate.month;
      const year = selectedDate.year;
      getTableData("", month, year);
      // handleFilterClick()
    };

    const handleFilterClick = () => {
      const month = selectedDate.month;
      const year = selectedDate.year;
      getTableData(searchQuery6, month, year);
    };
    const handleDownload = () => {
      const challans = filteredVoucherData;
      const voucherDetails = challans.map((challan) => ({

        "voucherNumber": challan.voucherNumber,
        "voucherDate": challan.voucherDate,
        "vehicleNumber": challan.vehicleNumber,
        "ownerName": challan.ownerName,
        "ownerPhone": challan.ownerPhone,
        "amount": challan.amount,
        "narration": challan.narration,
        "modeOfPayment": challan.modeOfPayment,
      }));
      // Create a new workbook
      const wb = XLSX.utils.book_new();
      // Add the owner details sheet to the workbook
      const ownerWS = XLSX.utils.json_to_sheet(voucherDetails);
      XLSX.utils.book_append_sheet(wb, ownerWS, 'Voucher book');
      // Export the workbook to an Excel file
      XLSX.writeFile(wb, 'Voucher Book.xlsx');
    };

    const handlePrint = () => {
      const totalPagesExp = "{total_pages_count_string}";
      try {
        const doc = new jsPDF("l", "mm", "a4");

        // Ensure dataSource is an array and has items
        if (!Array.isArray(filteredVoucherData) || filteredVoucherData.length === 0) {
          message.error("No data available to download");
          return;
        }

        // Transform dataSource to the format required by autoTable
        const items = filteredVoucherData.map((challan, index) => [
          index + 1,
          challan.voucherNumber,
          challan.voucherDate,
          challan.vehicleNumber,
          challan.ownerName,
          challan.ownerPhone,
          challan.amount,
          challan.narration,
           challan.modeOfPayment,
        ]);

        doc.setFontSize(10);
        const d = new Date();
        const m = d.getMonth() + 1;
        const day = d.getDate();
        const year = d.getFullYear();

        // Generate table
        doc.autoTable({
          head: [
            ["Sl No",
              "voucherNumber",
              "voucherDate",
              "vehicleNumber",
              "ownerName",
              "ownerPhone",
              "amount",
              "narration",
              "modeOfPayment"
            ],
          ],
          body: items,
          startY: 20, // Adjust starting Y position if needed
          headStyles: { fontSize: 8, fontStyle: "normal", fillColor: "#44495b" },
          bodyStyles: { fontSize: 8, textAlign: "center" },
          columnStyles: {
            0: { cellWidth: 30 },  // Adjust column widths if needed
            1: { cellWidth: 30 },
            2: { cellWidth: 30 },
            3: { cellWidth: 30 },
            4: { cellWidth: 30 },

            5: { cellWidth: 30 },
            6: { cellWidth: 30 },
            7: { cellWidth: 30 },
            8: { cellWidth: 30 },
          },
          didDrawPage: (data) => {
            // Header
            doc.setFontSize(10);
            doc.text("Voucher Book", data.settings.margin.left + 10, 10);
            doc.text(`Date: ${day}/${m}/${year}`, data.settings.margin.left + 170, 10);

            // Footer
            const str = `Page ${doc.internal.getNumberOfPages()}` +
              (typeof doc.putTotalPages === "function" ? ` of ${totalPagesExp}` : '');
            doc.setFontSize(10);
            const pageSize = doc.internal.pageSize;
            const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
            doc.text(str, data.settings.margin.left, pageHeight - 10);
          },
          margin: { top: 20 },
        });

        // Add total pages if necessary
        if (typeof doc.putTotalPages === "function") {
          doc.putTotalPages(totalPagesExp);
        }

        doc.save("voucher-book.pdf");

      } catch (err) {
        message.error("Unable to Print");
        console.error(err); // Log the error for debugging
      }
    };
    return (
      <div className="flex gap-2 justify-between py-3">
        <div className="flex items-center gap-2">
          <Input
            type="text"
            placeholder="Search by Truck No / Owner Name"
            size="large"
            value={searchQuery6}
            onChange={onChangeSearch}
            // onSearch={handleSearch}
            style={{ width: 320 }}
          />
          <DatePicker
            size="large"
            placeholder="By Month"
            picker="month"
            onChange={handleMonthChange}
            value={dayjs().month(selectedDate.month - 1).year(selectedDate.year)}
          />

          <Button size="large" type="primary" onClick={handleFilterClick}>
            APPLY
          </Button>
          {searchQuery6 !== "" && (
            <Button size="large" onClick={onReset} style={{ transform: "rotate(180deg)" }} icon={<RedoOutlined />} />
          )}
        </div>
        <div className="flex gap-2">
          <Button icon={<DownloadOutlined />} onClick={handleDownload}></Button>
          <Button icon={<PrinterOutlined />} onClick={handlePrint}></Button>
          <Button onClick={onAddVoucherClick} className="bg-[#1572B6] text-white">CREATE VOUCHER</Button>
        </div>
      </div>
    );
  };
  const VoucherBookForm = () => {
    const [formData, setFormData] = useState({
      hubId: selectedHubId,
      amount: "",
      materialId: "",
      materialType: "",
      modeOfPayment: "",
      narration: "",
      ownerId: "",
      ownerName: "",
      ownerPhone: "",
      vehicleBank: "",
      vehicleId: "",
      vehicleNumber: "",
      voucherDate: "",
      voucherNumber: "",
    });
    const [materialType, setMaterialType] = useState('')

    const handleMaterialTypeChange = (value) => {
      setMaterialType(value);
      console.log(value)
    };

    const handleChange = (name, value) => {
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: value,
      }));
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      const headersOb = {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        }
      };

      try {
        const response = await API.post('create-voucher', formData, headersOb);
        console.log('Voucher created successfully:', response.data);
        alert("Voucher created successfully");
        setTimeout(() => {
          goBack()
          const month = selectedDate.month;
          const year = selectedDate.year;
          getTableData("", month, year);
        }, 2000)

      } catch (error) {
        console.error('Error creating voucher:', error);
        alert("An error occurred while creating the voucher. Please try again.");
      }
    };


    const [materials, setMaterials] = useState([]);

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
    useEffect(() => {
      fetchMaterials();
    }, [])

    const [voucherOwners, setVoucherOwners] = useState([]);

    const fetchVoucherOwners = async () => {
      try {
        const headersOb = {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${authToken}`
          }
        }
        const response = await API.get(`get-voucher-vehicles-info/${selectedHubId}`, headersOb);
        if (response.status === 201) {
          setVoucherOwners(response.data.vehicle);
        }
      } catch (error) {
        console.error('Error fetching materials:', error);
      }
    };
    const handleVoucherOwnerChange = (value) => {
      // setVoucherOwners(value);
      console.log(value)
      const selectedVehicle = voucherOwners.find(vehicle => vehicle.registrationNumber === value);
      if (selectedVehicle) {
        setFormData({
          ...formData,
          ownerId: selectedVehicle.ownerId._id,
          ownerName: selectedVehicle.ownerId.name,
          ownerPhone: selectedVehicle.ownerId.phoneNumber,
          vehicleId: selectedVehicle._id,
          vehicleNumber: selectedVehicle.registrationNumber,
          vehicleBank: selectedVehicle.accountId
        });
      }
    };
    useEffect(() => {
      fetchVoucherOwners();
    }, [])
    return (
      <>
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-bold">Create Voucher</h1>
            <img src={backbutton_logo} alt="backbutton_logo" className='w-5 h-5 object-cover cursor-pointer' onClick={goBack} />

          </div>
          <div className="flex flex-col gap-1">
            <div className="text-md font-semibold">Voucher Information</div>
            <div className="text-md font-normal">Enter Voucher Details</div>
          </div>
          <div className="flex flex-col gap-1">
            <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
              <Col className="gutter-row mt-6" span={6}>
                <Input
                  placeholder="Voucher Number*"
                  size="large"
                  value={formData.voucherNumber}
                  name="voucherNumber"
                  onChange={(e) => handleChange('voucherNumber', e.target.value)}
                />
              </Col>
              <Col className="gutter-row mt-6" span={6}>
                <DatePicker

                  style={{ width: "100%" }}
                  placeholder="Voucher Date*"
                  size="large"
                  format="DD/MM/YYYY"
                  onChange={(date, dateString) => handleChange('voucherDate', dateString)}
                />
              </Col>
              <Col className="gutter-row mt-6" span={6}>
                <Select
                  name="vehicleNumber"
                  value={formData.vehicleNumber ? formData.vehicleNumber : null}
                  placeholder="Truck Number*"
                  size="large"
                  showSearch
                  style={{ width: "100%" }}
                  onChange={handleVoucherOwnerChange}
                  filterOption={filterOption}
                >
                  {voucherOwners.map((v, index) => (
                    <Option key={index} value={v.registrationNumber}>
                      {`${v.registrationNumber}`}
                    </Option>
                  ))}
                </Select>
              </Col>
              <Col className="gutter-row mt-6" span={6}>
                <Input
                  placeholder="Owner Name*"
                  size="large"
                  disabled
                  value={formData.ownerName}
                  name="ownerName"
                  onChange={(e) => handleChange('ownerName', e.target.value)}
                />
              </Col>
              <Col className="gutter-row mt-6" span={6}>
                <Input
                  placeholder="Narration*"
                  size="large"
                  value={formData.narration}
                  name="narration"
                  onChange={(e) => handleChange('narration', e.target.value)}
                />
              </Col>
              <Col className="gutter-row mt-6" span={6}>
                <Input
                  placeholder="Amount*"
                  size="large"
                  value={formData.amount}
                  name="amount"
                  onChange={(e) => handleChange('amount', e.target.value)}
                />
              </Col>
              <Col className="gutter-row mt-6" span={6}>
                <Select
                  style={{ width: "100%" }}
                  placeholder="Mode of Payment*"
                  size="large"
                  name="modeOfPayment"
                  onChange={(value) => handleChange('modeOfPayment', value)}
                  filterOption={filterOption}
                >
                  <Option key={1} value="Bank Transfer">Bank Transfer</Option>
                  <Option key={2} value="Cash">Cash</Option>
                </Select>
              </Col>
              <Col className="gutter-row mt-6" span={6}>
                <Select
                  name="materialType"
                  value={materialType ? materialType : null}
                  placeholder="Material Type*"
                  size="large"
                  style={{ width: "100%" }}
                  onChange={handleMaterialTypeChange}
                  filterOption={filterOption}
                >
                  {materials.map((v, index) => (
                    <Option key={index} value={v.materialType}>
                      {`${v.materialType}`}
                    </Option>
                  ))}
                </Select>
              </Col>
            </Row>
          </div>
          <div className="flex gap-4 items-center justify-center reset-button-container">
            <Button type="primary" className="bg-primary" onClick={handleSubmit}>
              Save
            </Button>
          </div>
        </div>
      </>
    );
  };

  const TruckTable = ({ onEditVoucherClick, onViewVoucherClick, onDeleteVoucherClick }) => {
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys);
    };


    const rowSelection = {
      selectedRowKeys,
      onChange: onSelectChange,
    };

    const [currentPage, setCurrentPage] = useState(1);
    const [currentPageSize, setCurrentPageSize] = useState(10);
    const [activePageSize, setActivePageSize] = useState(10);
    const columns = [
      {
        title: 'Sl No',
        dataIndex: 'serialNumber',
        key: 'serialNumber',
        render: (text, record, index) => (currentPage - 1) * currentPageSize + index + 1,
        width: 80,
      },
      {
        title: 'Voucher Number',
        dataIndex: 'voucherNumber',
        key: 'voucherNumber',
        width: 120,
      },
      {
        title: 'Voucher Date',
        dataIndex: 'voucherDate',
        key: 'voucherDate',
        width: 120,
        // render: (text) => new Date(text).toLocaleDateString(), // Convert ISO date to local date string
      },
      {
        title: 'Vehicle Number',
        dataIndex: 'vehicleNumber',
        key: 'vehicleNumber',
        width: 160,
      },
      {
        title: 'Owner Name',
        dataIndex: 'ownerName',
        key: 'ownerName',
        width: 160,
        render: (text) => text.charAt(0).toUpperCase() + text.slice(1), // Capitalize owner name
      },
      {
        title: 'Owner Phone',
        dataIndex: 'ownerPhone',
        key: 'ownerPhone',
        width: 140,
      },
      {
        title: 'Narration',
        dataIndex: 'narration',
        key: 'narration',
        width: 110,
      },
      {
        title: 'Mode of Payment',
        dataIndex: 'modeOfPayment',
        key: 'modeOfPayment',
        width: 100,
      },
      {
        title: 'Amount',
        dataIndex: 'amount',
        key: 'amount',
        width: 90,
      },
      {
        title: 'Action',
        key: 'action',
        width: 90,
        fixed: 'right',
        render: (record) => (
          <Space size="middle">
            <Tooltip placement="top" title="Edit">
              <a onClick={() => onEditVoucherClick(record)}><FormOutlined /></a>
            </Tooltip>
            <Tooltip placement="top" title="Delete">
              <a onClick={() => onDeleteVoucherClick(record)}><DeleteOutlined /></a>
            </Tooltip>
          </Space>
        ),
      },
    ];

    const handlePageSizeChange = (newPageSize) => {
      setCurrentPageSize(newPageSize);
      setCurrentPage(1); // Reset to the first page
      setActivePageSize(newPageSize); // Update the active page size
    };
    return (
      <>
        <div className='flex gap-2 mb-2 items-center justify-end'>
          {/* <Button icon={<DownloadOutlined />}></Button>
          <Button icon={<PrinterOutlined />}></Button> */}

          <div className='flex   my-paginations '>
            <span className='bg-[#F8F9FD] p-1'>
              <Button
                onClick={() => handlePageSizeChange(10)}
                style={{
                  backgroundColor: activePageSize === 10 ? 'grey' : 'white',
                  color: activePageSize === 10 ? 'white' : 'black',
                  borderRadius: activePageSize === 10 ? '6px' : '0',
                  boxShadow: activePageSize === 10 ? '0px 0px 4px 0px #00000040' : 'none',
                }}
              >
                10
              </Button>
              <Button
                onClick={() => handlePageSizeChange(25)}
                style={{
                  backgroundColor: activePageSize === 25 ? 'grey' : 'white',
                  color: activePageSize === 25 ? 'white' : 'black',
                  borderRadius: activePageSize === 25 ? '6px' : '0',
                  boxShadow: activePageSize === 25 ? '0px 0px 4px 0px #00000040' : 'none',
                }}
              >
                25
              </Button>
              <Button
                onClick={() => handlePageSizeChange(50)}
                style={{
                  backgroundColor: activePageSize === 50 ? 'grey' : 'white',
                  color: activePageSize === 50 ? 'white' : 'black',
                  borderRadius: activePageSize === 50 ? '6px' : '0',
                  boxShadow: activePageSize === 50 ? '0px 0px 4px 0px #00000040' : 'none',
                }}
              >
                50
              </Button>
              <Button
                onClick={() => handlePageSizeChange(100)}
                style={{
                  backgroundColor: activePageSize === 100 ? 'grey' : 'white',
                  color: activePageSize === 100 ? 'white' : 'black',
                  borderRadius: activePageSize === 100 ? '6px' : '0',
                  boxShadow: activePageSize === 100 ? '0px 0px 4px 0px #00000040' : 'none',
                }}
              >
                100
              </Button>
            </span>
          </div>
        </div>
        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={filteredVoucherData}
          scroll={{ x: 800 }}
          rowKey="_id"
          pagination={{
            showSizeChanger: false,
            position: ['bottomCenter'],
            current: currentPage,
            pageSize: currentPageSize,
            onChange: (page) => {
              setCurrentPage(page);
            },
          }}
          // antd site header height
          sticky={{
            offsetHeader: 0,
          }}
        />
        <div className="flex my-4 text-md" style={{ backgroundColor: "#eee", padding: "1rem" }}>

          <div style={{ textAlign: 'right', width: '200px' }}>
          </div>
          <div style={{ textAlign: 'right', width: '200px' }}>
          </div>
          <div style={{ textAlign: 'right', width: '200px' }}>
          </div>
          <div style={{ fontWeight: 'bold', width: '260px' }}>
            Total Amount
          </div>
          <div style={{ fontWeight: 'bold', width: '160px' }}>
            {totalMonthlyAmount}
            {/* {totalOutstanding > 0 ? <p style={{ color: "green", fontWeight: "600" }}>{totalOutstanding}</p> : <p style={{ color: "red" }}>{totalOutstanding}</p>} */}
          </div>

        </div>

      </>
    );
  };
  const EditTruckDataRow = ({ filterTruckTableData }) => {
    const [formData, setFormData] = useState({
      amount: filterTruckTableData.amount,
      modeOfPayment: filterTruckTableData.modeOfPayment,
      voucherNumber: filterTruckTableData.voucherNumber,
      voucherDate: filterTruckTableData.voucherDate,
      voucherISODate: filterTruckTableData.voucherISODate,
      vehicleNumber: filterTruckTableData.vehicleNumber,
      materialType: filterTruckTableData.materialType,
      materialId: filterTruckTableData.materialId,
      vehicleId: filterTruckTableData.vehicleId,
      vehicleBank: filterTruckTableData.vehicleBank,
      ownerPhone: filterTruckTableData.ownerPhone,
      ownerDetails: filterTruckTableData.ownerDetails,
      vehicleDetails: filterTruckTableData.vehicleDetails,
      ownerName: filterTruckTableData.ownerName,
      ownerId: filterTruckTableData.ownerId,
      narration: filterTruckTableData.narration,
      hubId: filterTruckTableData.hubId,
      year: filterTruckTableData.year,
      month: filterTruckTableData.month,
    });
    const handleResetClick = () => {
      setFormData({
        amount: "",
        modeOfPayment: "",
        voucherNumber: "",
        voucherDate: "",
        vehicleNumber: filterTruckTableData.vehicleNumber,
        materialType: "",
        materialId: "",
        vehicleId: filterTruckTableData.vehicleId,
        vehicleBank: filterTruckTableData.vehicleBank,
        ownerPhone: filterTruckTableData.ownerPhone,
        ownerDetails: filterTruckTableData.ownerDetails,
        vehicleDetails: filterTruckTableData.vehicleDetails,
        ownerName: filterTruckTableData.ownerName,
        ownerId: filterTruckTableData.ownerId,
        narration: "",
        hubId: filterTruckTableData.hubId,
        year: filterTruckTableData.year,
        month: filterTruckTableData.month,
      });
    };
    const [materials, setMaterials] = useState([]);

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


    const [materialType, setMaterialType] = useState('')

    const handleMaterialTypeChange = (value) => {
      setMaterialType(value);
      console.log(value)
    };
    const [voucherOwners, setVoucherOwners] = useState([]);

    const fetchVoucherOwners = async () => {
      try {
        const headersOb = {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${authToken}`
          }
        };
        const response = await API.get(`get-voucher-vehicles-info/${selectedHubId}`, headersOb);
        if (response.status === 201) {
          setVoucherOwners(response.data.vehicle);
        }
      } catch (error) {
        console.error('Error fetching voucher owners:', error);
      }
    };

    const handleVoucherOwnerChange = (value) => {
      const selectedVehicle = voucherOwners.find(vehicle => vehicle.registrationNumber === value);
      if (selectedVehicle) {
        setFormData({
          ...formData,
          ownerId: selectedVehicle.ownerId._id,
          ownerName: selectedVehicle.ownerId.name,
          ownerPhone: selectedVehicle.ownerId.phoneNumber,
          vehicleId: selectedVehicle._id,
          vehicleNumber: selectedVehicle.registrationNumber,
          vehicleBank: selectedVehicle.accountId
        });
      }
    };

    useEffect(() => {
      fetchMaterials();
      fetchVoucherOwners();
    }, []);

    const handleDateChange = (date, dateString) => {
      handleChange('voucherDate', dateString)
    };
    const handleChange = (name, value) => {
      setFormData(prevFormData => ({
        ...prevFormData,
        [name]: value,
      }));
    };
    const handleSubmit = async (e) => {
      e.preventDefault();
      const vehicleId = filterTruckTableData._id;
      const oldOwnerId = filterTruckTableData.ownerId[0]._id;
      const url = `update-voucher/${vehicleId}`;

      const headersOb = {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        }
      };
      const payload = {
        amount: formData.amount,
        materialId: formData.materialId,
        materialType: formData.materialType,
        modeOfPayment: formData.modeOfPayment,
        narration: formData.narration,
        ownerId: formData.ownerId,
        ownerName: formData.ownerName,
        ownerPhone: formData.ownerPhone,
        vehicleBank: formData.vehicleBank,
        vehicleId: formData.vehicleId,
        vehicleNumber: formData.vehicleNumber,
        voucherDate: formData.voucherDate,
        voucherNumber: formData.voucherNumber
      };

      try {
        const response = await API.put(url, payload, headersOb);
        if (response.status === 201) {
          alert("Voucher data updated successfully");
          setTimeout(() => {
            goBack()
            const month = selectedDate.month;
            const year = selectedDate.year;
            getTableData("", month, year);
          }, 2000)
        } else {
          alert('Error occurred while updating truck data');
        }
      } catch (error) {
        console.error('Error updating truck data:', error);
        alert("An error occurred while updating truck data");
      }
    };

    const goBack = () => {
      setshowVoucherTable(true); // Assuming setshowVoucherTable is defined
      setShowTabs(true); // Assuming setShowTabs is defined
    };

    return (
      <>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-4">
            <div className="flex"><img src={backbutton_logo} alt="backbutton_logo" className='w-5 h-5 object-cover cursor-pointer' onClick={goBack} /> </div>
            <div className="flex flex-col">
              <h1 className='font-bold' style={{ fontSize: "16px" }}>Edit Voucher Details</h1>
              {/* Breadcrumb component */}
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex flex-col gap-1">
              <div className="text-md font-semibold">Vehicle Information</div>
              <div className="text-md font-normal">Enter Voucher Details</div>
            </div>
            <div className="flex flex-col gap-1">
              <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
                <Col className="gutter-row mt-6" span={6}>
                  <Input
                    placeholder="Voucher Number*"
                    size="large"
                    value={formData.voucherNumber}
                    name="voucherNumber"
                    onChange={(e) => handleChange('voucherNumber', e.target.value)}
                  />
                </Col>
                <Col className="gutter-row mt-6" span={6}>
                  {/* <DatePicker
                    style={{ width: "100%" }}
                    placeholder="Voucher Date*"
                    size="large"
                    format="DD/MM/YYYY"
                    value={formData.voucherDate ? moment(formData.voucherDate, 'DD/MM/YYYY') : null}
                    onChange={(date, dateString) => handleChange('voucherDate', dateString)}
                  /> */}

                  <DatePicker
                    required
                    style={{ width: "100%" }}
                    placeholder="Voucher Date*"
                    size="large"
                    format="DD/MM/YYYY"
                    onChange={handleDateChange}
                    // onChange={(date, dateString) => handleChange('voucherDate', dateString)}
                    value={dayjs(formData.voucherDate, 'DD/MM/YYYY')}
                  />
                </Col>
                <Col className="gutter-row mt-6" span={6}>
                  <Select
                    name="vehicleNumber"
                    value={formData.vehicleNumber ? formData.vehicleNumber : null}
                    placeholder="Truck Number*"
                    showSearch
                    size="large"
                    style={{ width: "100%" }}
                    onChange={handleVoucherOwnerChange}
                    filterOption={filterOption}
                  >
                    {voucherOwners.map((v, index) => (
                      <Option key={index} value={v.registrationNumber}>
                        {`${v.registrationNumber}`}
                      </Option>
                    ))}
                  </Select>
                </Col>

                <Col className="gutter-row mt-6" span={6}>
                  <Input
                    placeholder="Owner Name*"
                    size="large"
                    value={formData.ownerName}
                    name="ownerName"
                    onChange={(e) => handleChange('ownerName', e.target.value)}
                  />
                </Col>

                <Col className="gutter-row mt-6" span={6}>
                  <Input
                    placeholder="narration*"
                    size="large"
                    value={formData.narration}
                    name="narration"
                    onChange={(e) => handleChange('narration', e.target.value)}
                  />
                </Col>


                <Col className="gutter-row mt-6" span={6}>
                  <Input
                    placeholder="Amount*"
                    size="large"
                    value={formData.amount}
                    name="amount"
                    onChange={(e) => handleChange('amount', e.target.value)}
                  />
                </Col>

                <Col className="gutter-row mt-6" span={6}>
                  <Select
                    style={{ width: "100%" }}
                    placeholder="Mode of Payment*"
                    size="large"
                    value={formData.modeOfPayment}
                    onChange={(value) => handleChange('modeOfPayment', value)}
                  >
                    <Option value="Bank Transfer">Bank Transfer</Option>
                    <Option value="Cash">Cash</Option>
                  </Select>
                </Col>

                <Col className="gutter-row mt-6" span={6}>
                  <Select
                    name="materialType"
                    value={materialType ? materialType : null}
                    placeholder="Material Type*"
                    size="large"
                    style={{ width: "100%" }}
                    onChange={handleMaterialTypeChange}
                    filterOption={filterOption}
                  >
                    {materials.map((v, index) => (
                      <Option key={index} value={v.materialType}>
                        {`${v.materialType}`}
                      </Option>
                    ))}
                  </Select>
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
  return (
    <>
      {showVoucherTable ? (
        <>
          <Truck onAddVoucherClick={handleAddVoucherClick} />
          <TruckTable onEditVoucherClick={handleEditVoucherClick} onViewVoucherClick={handleViewVoucherClick} onDeleteVoucherClick={handleDeleteVoucherClick} />
        </>
      ) : (
        rowDataForTruckEdit ? (
          <>
            {showTransferForm ? (
              <></>
            ) : (
              showVoucherView ? (
                <></>
              ) : (
                <EditTruckDataRow filterTruckTableData={rowDataForTruckEdit} />
              )
            )}
          </>
        ) : (
          <VoucherBookForm />
        )
      )}
    </>
  );

}

export default VoucherBook