import React, {Component} from "react";
import {Table, Button, Card, Row, Col, message, Spin} from "antd";

import axios from "axios";
import {BASE_URL} from "../../constants/constants";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import DownloadIcon from "../../assests/images/download.svg";
import "./report.css";

const convertDataToExcel = (head, body, footer) => {
    const headKeyMap = head.reduce((acc, val) => {
      acc[val.dataIndex] = val.title;
      return acc;
    }, {});
  
    const headKeys = head.map((item) => item.title);
  
    let footerObj = {};
  
    if (Array.isArray(footer)) {
      for (var i = 0, j = 0; i < head.length; j++) {
        footerObj[headKeys[i]] = footer[j] && footer[j].content;
        if (footer[i] && footer[i].colSpan) {
          i += footer[i].colSpan;
        } else {
          i++;
        }
      }
    }
  
    const bodyArr =
      (Array.isArray(body) &&
        body.map((item) => {
          let changedItem = {};
          for (var i in headKeyMap) {
            changedItem[headKeyMap[i]] = item[i];
          }
          return changedItem;
        })) ||
      [];
  
    const result = [...(bodyArr || []), footerObj];
  
    return result;
  };
class PrintDownloadReport extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      ownerTransferLog: [],
    };
  }
  getOwnertransferLog = async () => {
    const response = await axios.get(`${BASE_URL}get-all-users-logs`);
    const ownerDetails = response.data.ownerDetails || "";
    this.setState({
      ownerTransferLog: ownerDetails,
    });
  };
  componentDidMount() {
    this.getOwnertransferLog();
  }
  render() {
    const {ownerDetails, dataSource} = this.props;
    const {ownerTransferLog} = this.state;
    const tripRegisterData =
      formatTripRegisterData(
        dataSource.tripRegister && dataSource.tripRegister.value
      ) || {};

    const bankAccDetails =
      (dataSource.bankDetails && dataSource.bankDetails.value) || [];
    const ownersAdvance =
      (dataSource.ownersAdvance &&
        dataSource.ownersAdvance.value &&
        dataSource.ownersAdvance.value[0]) ||
      {};
    const advanceVoucher =
      (dataSource.advanceVoucher &&
        dataSource.advanceVoucher.value &&
        dataSource.advanceVoucher.value[0]) ||
      {};
    const dataExpenses = [
      {
        particulars: "Total Amount",
        amount:
          tripRegisterData.tripAggrigate &&
          tripRegisterData.tripAggrigate.totalAmount &&
          decimals(tripRegisterData.tripAggrigate.totalAmount),
      },
      {
        particulars: "Commision",
        amount:
          tripRegisterData.tripAggrigate &&
          tripRegisterData.tripAggrigate.totalCommisionTotal &&
          decimals(tripRegisterData.tripAggrigate.totalCommisionTotal),
      },
      {
        particulars: "Diesel",
        amount:
          tripRegisterData.tripAggrigate &&
          tripRegisterData.tripAggrigate.totalDiesel &&
          decimals(tripRegisterData.tripAggrigate.totalDiesel),
      },
      {
        particulars: "Cash",
        amount:
          tripRegisterData.tripAggrigate &&
          tripRegisterData.tripAggrigate.totalCash &&
          decimals(tripRegisterData.tripAggrigate.totalCash),
      },
      {
        particulars: "Bank Transfer",
        amount:
          tripRegisterData.tripAggrigate &&
          tripRegisterData.tripAggrigate.totalBankTransfer &&
          decimals(tripRegisterData.tripAggrigate.totalBankTransfer),
      },
      {
        particulars: "Shortage",
        amount:
          tripRegisterData.tripAggrigate &&
          tripRegisterData.tripAggrigate.totalShortage &&
          decimals(tripRegisterData.tripAggrigate.totalShortage),
      },
      {
        particulars: "Outstanding Debit",
        amount:
          ownersAdvance && ownersAdvance.totalOutstandingDebit
            ? decimals(ownersAdvance.totalOutstandingDebit)
            : "0",
      },
      {
        particulars: "Advance Voucher",
        amount: advanceVoucher.total ? decimals(advanceVoucher.total) : "0",
      },
    ];

    const tripRegisterFooter = [
      [
        {
          content: "Total:",
          colSpan: 5,
        },
        {
          content:
            tripRegisterData.tripAggrigate &&
            tripRegisterData.tripAggrigate.totalQuantity &&
            decimals(tripRegisterData.tripAggrigate.totalQuantity),
        },
        {
          content: "",
        },
        {
          content:
            tripRegisterData.tripAggrigate &&
            tripRegisterData.tripAggrigate.totalAmount &&
            decimals(tripRegisterData.tripAggrigate.totalAmount),
        },
        {
          content:
            tripRegisterData.tripAggrigate &&
            tripRegisterData.tripAggrigate.totalCommisionTotal &&
            decimals(tripRegisterData.tripAggrigate.totalCommisionTotal),
        },
        {
          content:
            tripRegisterData.tripAggrigate &&
            tripRegisterData.tripAggrigate.totalDiesel &&
            decimals(tripRegisterData.tripAggrigate.totalDiesel),
        },
        {
          content:
            tripRegisterData.tripAggrigate &&
            tripRegisterData.tripAggrigate.totalCash &&
            decimals(tripRegisterData.tripAggrigate.totalCash),
        },
        {
          content:
            tripRegisterData.tripAggrigate &&
            tripRegisterData.tripAggrigate.totalBankTransfer &&
            decimals(tripRegisterData.tripAggrigate.totalBankTransfer),
        },
        {
          content:
            tripRegisterData.tripAggrigate &&
            tripRegisterData.tripAggrigate.totalShortage &&
            decimals(tripRegisterData.tripAggrigate.totalShortage),
        },
      ],
    ];

    const ownersAdvanceFooter = [
      [
        {
          content: "",
        },
        {
          content: "New Outstanding:",
          colSpan: 2,
        },
        {
          content: ownersAdvance.outStandingAmount || 0,
          colSpan: 2,
          styles: {
            halign: "center",
          },
        },
      ],
    ];
     const advanceVoucherFooter = [
      [
        {
          content: "Total:",
          colSpan: 2,
        },
        {
          content: advanceVoucher.total || 0,
        },
      ],
    ];

    const ownerExpenseFooter = [
      [
        {
          content: "Balance:",
        },
        {
          content: decimals(calculateTotalBalance(dataExpenses)),
          styles: {
            textColor:
              calculateTotalBalance(dataExpenses) <= 0 ? "red" : [0, 136, 170],
          },
        },
      ],
    ];

    const handleDownload = (e) => {
      const ws = XLSX.utils.json_to_sheet(
        convertDataToExcel(
          columns,
          tripRegisterData.tripDetails,
          tripRegisterFooter[0]
        )
      );
      const ws2 = XLSX.utils.json_to_sheet(
        convertDataToExcel(columnsExpenses, dataExpenses, ownerExpenseFooter[0])
      );
      const ws3 = XLSX.utils.json_to_sheet(
        convertDataToExcel(
          columnsAdvance,
          ownersAdvance.ledgerDetails,
          ownersAdvanceFooter[0]
        )
      );
      const ws4 = XLSX.utils.json_to_sheet(
        convertDataToExcel(
          columnsAdvanceVoucher,
          advanceVoucher.voucherDetails,
          advanceVoucherFooter[0]
        )
      );
      const ws5 = XLSX.utils.json_to_sheet(
        convertDataToExcel(
          accountDetailsColumn,
          bankAccDetails.map((item) => ({
            ...item,
            phoneNumber: ownerDetails.ownerPhone,
          }))
        )
      );

      const wb = {
        Sheets: {
          "Trip Register": ws,
          Expenses: ws2,
          Advance: ws3,
          Voucher: ws4,
          "Bank Details": ws5,
        },
        SheetNames: [
          "Trip Register",
          "Expenses",
          "Advance",
          "Voucher",
          "Bank Details",
        ],
      };
      const excelBuffer = XLSX.write(wb, {bookType: "xlsx", type: "array"});
      const data = new Blob([excelBuffer], {
        type:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
      });
      var url = window.URL.createObjectURL(data, "Report.xlsx");
      window.open(url, "_blank");
    };
 
    return (
      // <Spin spining={isLoading} delay={500}>
      <div className="report">
        <div style={{padding: "0px 0px 0px 20px"}}>
          <Row>
            <Col
              xs={12}
              sm={12}
              md={12}
              lg={12}
              xl={12}
              style={{padding: "10px", marginTop: "10px"}}
            >
              <div style={{display: "flex", float: "right"}}>
                <div style={{padding: "5px"}}>
                  <Button
                    className="outlineBtn"
                    icon={
                      <img src={DownloadIcon} style={{paddingRight: "7px"}} />
                    }
                    onClick={handleDownload}
                  >
                    Download
                  </Button>
                </div>
              </div>
            </Col>
          </Row>
        </div>
      
      </div>
      // </Spin>
    );
  }
}

export default PrintDownloadReport;
