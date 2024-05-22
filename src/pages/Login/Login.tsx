import { useState, useEffect } from 'react'
import FooterContainer from '../../containers/FooterContainer';
import logo from "./../../assets/newlogo.png";
import { Button, Input, Space } from 'antd';
import moment from "moment";

import { publicIpv4 } from 'public-ip';
import { API } from "../../API/apirequest"

import { useNavigate } from 'react-router-dom';
const Login = () => {
  const navigator = window.navigator;
  const hostreff = window.location.host;

  const nAgt = navigator.userAgent;
  let browserName = navigator.appName;
  let fullVersion = "" + parseFloat(navigator.appVersion);
  let majorVersion = parseInt(navigator.appVersion, 10);
  let nameOffset, verOffset, ix;

  // In Opera 15+, the true version is after "OPR/"
  if ((verOffset = nAgt.indexOf("OPR/")) != -1) {
    browserName = "Opera";
    fullVersion = nAgt.substring(verOffset + 4);
  }
  // In older Opera, the true version is after "Opera" or after "Version"
  else if ((verOffset = nAgt.indexOf("Opera")) != -1) {
    browserName = "Opera";
    fullVersion = nAgt.substring(verOffset + 6);
    if ((verOffset = nAgt.indexOf("Version")) != -1)
      fullVersion = nAgt.substring(verOffset + 8);
  }
  // In MSIE, the true version is after "MSIE" in userAgent
  else if ((verOffset = nAgt.indexOf("MSIE")) != -1) {
    browserName = "Microsoft Internet Explorer";
    fullVersion = nAgt.substring(verOffset + 5);
  }
  // In Chrome, the true version is after "Chrome"
  else if ((verOffset = nAgt.indexOf("Chrome")) != -1) {
    browserName = "Chrome";
    fullVersion = nAgt.substring(verOffset + 7);
  }
  // In Safari, the true version is after "Safari" or after "Version"
  else if ((verOffset = nAgt.indexOf("Safari")) != -1) {
    browserName = "Safari";
    fullVersion = nAgt.substring(verOffset + 7);
    if ((verOffset = nAgt.indexOf("Version")) != -1)
      fullVersion = nAgt.substring(verOffset + 8);
  }
  // In Firefox, the true version is after "Firefox"
  else if ((verOffset = nAgt.indexOf("Firefox")) != -1) {
    browserName = "Firefox";
    fullVersion = nAgt.substring(verOffset + 8);
  }
  // In most other browsers, "name/version" is at the end of userAgent
  else if (
    (nameOffset = nAgt.lastIndexOf(" ") + 1) < (verOffset = nAgt.lastIndexOf("/"))
  ) {
    browserName = nAgt.substring(nameOffset, verOffset);
    fullVersion = nAgt.substring(verOffset + 1);
    if (browserName.toLowerCase() == browserName.toUpperCase()) {
      browserName = navigator.appName;
    }
  }
  // trim the fullVersion string at semicolon/space if present
  if ((ix = fullVersion.indexOf(";")) != -1)
    fullVersion = fullVersion.substring(0, ix);
  if ((ix = fullVersion.indexOf(" ")) != -1)
    fullVersion = fullVersion.substring(0, ix);

  majorVersion = parseInt("" + fullVersion, 10);
  if (isNaN(majorVersion)) {
    fullVersion = "" + parseFloat(navigator.appVersion);
    majorVersion = parseInt(navigator.appVersion, 10);
  }

  const [passwordVisible, setPasswordVisible] = useState(false);
  const navigate = useNavigate();
  const curDate = moment(new Date());
  const [systemIp, setSystemIp] = useState("");
  const [user, setUser] = useState({
    email: "",
    password: "",
    browserAgent: browserName,
    referrer: hostreff,
    loginTime: curDate,
    ipAddress: "", // Initialize ipAddress with an empty string
  });

  useEffect(() => {
    const fetchIp = async () => {
      const ip = await publicIpv4();
      setSystemIp(ip);
    };

    fetchIp();
  }, []);

  // Update the user state when systemIp changes
  useEffect(() => {
    setUser(prevUser => ({
      ...prevUser,
      ipAddress: systemIp,
    }));
  }, [systemIp]);

  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUser(prevState => ({
      ...prevState,
      [name]: value
    }));
  }

  const handleClick = async () => {
    await API.post("/login", user)
      .then((res: { status: number; data: { userDetails: []; token: string; }; }) => {
        console.log(res)
        if (res.status == 201) {
          localStorage.setItem("userDetails", JSON.stringify(res.data.userDetails))
          localStorage.setItem("token", res.data.token)
          localStorage.setItem("loginData", JSON.stringify(res.data.userDetails))
          localStorage.setItem('selectedMenuItem','1')
          navigate("/dashboard");
        }
        else {
          if (res.status == 401) {
            setError("Invalid credentials");
          }
        }
      }).catch((err) => {
        console.log(err)
        setError("Invalid credentials");
      })

  }

  return (
    <div className=' bg-[#D7F1FF]  text-black max-h-[100vh]'>
      <div className='relative  w-full h-[95vh]'>

        <div className="absolute top-[15%] right-[30%] rounded-yellow w-[255px] h-[255px] border-[#8FE8FF] border-[16px] rounded-[50%] drop-shadow-xl">
        </div>

        <div className="absolute bottom-[15%] right-[10%] rounded-yellow w-[255px] h-[255px] border-[#FFE2AA] border-[16px] rounded-[50%] drop-shadow-xl">
        </div>

        <div className='relative flex justify-center items-center'>
          <div className=' w-full h-[95vh]  rounded-md p-3 backdrop-blur-sm flex justify-center items-center'>
            <div className="flex items-center justify-center gap-40  w-full h-auto">
              <div className="heading mb-4">
                <div className="flex items-center justify-center ">
                  <img src={logo} alt="" className='w-full h-full' />
                </div>
              </div>
              <div className="w-full max-w-[400px] h-full bg-white/60 backdrop-blur rounded-md custom-shadow p-8">
                <h1 className='mb-2 font-semibold text-lg'>Log in to your account</h1>
                {error && <p className="text-red-500 mb-2">{error}</p>}
                <Space direction="vertical" className='w-full mb-2'>
                  <Input size="large" placeholder="User Name" className='mb-2 p-2' name="email" onChange={handleChange} />
                  <Input.Password
                    name="password"
                    onChange={handleChange}
                    className='mb-2 p-2'
                    size="large"
                    placeholder="Password"
                    visibilityToggle={{ visible: passwordVisible, onVisibleChange: setPasswordVisible }}
                  />
                </Space>
                <div className="flex gap-2 flex-col">

                  <Button type="primary" onClick={handleClick}>Sign in</Button>
                  <Button type="link" className='text-black'>Reset password here</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <FooterContainer />

      </div>
    </div>
  )
}

export default Login
