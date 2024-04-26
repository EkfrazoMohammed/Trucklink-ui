import { useState } from 'react'
import FooterContainer from '../../containers/FooterContainer';
import logo from "./../../assets/newlogo.png";
import { Button, Input, Space } from 'antd';
import axios from "axios";

import { useNavigate } from 'react-router-dom';
const Login = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const navigate = useNavigate();

  const [user, setUser] = useState({
    email: "",
    password: ""
  })
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUser(prevState => ({
      ...prevState,
      [name]: value
    }));
  }

  const handleClick = async () => {
    await axios.post("https://trucklinkuatnew.thestorywallcafe.com/api/auth/login", user)
      .then((res) => {
        console.log(res)
        if (res.status == 200) {
          localStorage.setItem("token", res.data.access_token)
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
                  <Button type="link" className='text-black'>Reset password</Button>
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
