import  { useState } from 'react'
import FooterContainer from '../../containers/FooterContainer';
import logo from "./../../assets/newlogo.png";
import { Button, Input, Space } from 'antd';
// import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
const Login = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const navigate=useNavigate();

  const handleClick = () => {
    console.log("Sign in button clicked");
    navigate("/dashboard");
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

                <Space direction="vertical" className='w-full mb-2'>
                  <Input size="large" placeholder="User Name" className='mb-2 p-2' />
                  <Input.Password
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
