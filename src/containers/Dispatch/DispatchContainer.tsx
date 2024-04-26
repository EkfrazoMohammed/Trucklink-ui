
// import React, { useState } from 'react';
// import { Row, Col, Select, Input, Button } from 'antd';

// const { Search } = Input;
// const { Option } = Select;

// const DispatchContainer = () => {
//   const [value, setValue] = useState('');
//   const [bankDetail, setBankDetail] = useState({});
//   const [style, setStyle] = useState({ display: 'none' });
//   const [message, setMessage] = useState('');

//   const handleChangeBank = (e) => {
//     setValue(e.target.value);
//     setBankDetail({});
//     setMessage('');
//   };

//   const fetchBankDetails = () => {
//     if (!value) {
//       setMessage('Please fill IFSC code');
//       setStyle({ display: 'none' });
//       return;
//     }

//     fetch(`https://ifsc.razorpay.com/${value}`)
//       .then(response => response.json())
//       .then(data => {
//         setBankDetail(data);
//         setStyle({ display: 'block' });
//         setMessage('');
//       })
//       .catch(error => {
//         setMessage('Invalid IFSC code');
//         setBankDetail({});
//         setStyle({ display: 'none' });
//       });
//   };

//   return (
//     <div>
//       <Row justify="center">
//         <Col span={24}>
//           <h1 style={{ textAlign: 'center' }}>Search by IFSC Code</h1>
//           <Search
//             placeholder="Enter IFSC Code"
//             allowClear
//             enterButton="Search"
//             size="large"
//             value={value}
//             onChange={handleChangeBank}
//             onSearch={fetchBankDetails}
//           />
//           {message && <p style={{ color: 'red', marginTop: '10px' }}>{message}</p>}
//           <div className="BANK_DETAILS" style={style}>
//             <b>Bank Name :</b> {bankDetail.BANK}<br />
//             <b>Branch Name :</b> {bankDetail.BRANCH}<br />
//             <b>Address :</b> {bankDetail.ADDRESS}<br />
//             <b>IFSC Code :</b> {bankDetail.IFSC}<br />
//             <b>City :</b> {bankDetail.CITY}<br />
//             <b>State :</b> {bankDetail.STATE}
//           </div>
//         </Col>
//       </Row>
//     </div>
//   );
// };



// export default DispatchContainer


const DispatchContainer = () => {
  return (
    <div>DispatchContainer</div>
  )
}

export default DispatchContainer