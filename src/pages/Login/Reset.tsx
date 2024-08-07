
import React, { useState, useEffect } from 'react';
import { Button, Input, Space, message } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from "./../../assets/newlogo.png";
import FooterContainer from '../../containers/FooterContainer';
import { API } from "../../API/apirequest"
const Reset = () => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [location, setLocation] = useState(null);
    const navigate = useNavigate();
    const { search } = useLocation();

    useEffect(() => {
        const loc = search ? search.split("key=") : null;
        setLocation(loc);
    }, [search]);
    const handleClick = async () => {
        if (newPassword !== confirmPassword) {
            message.error('New password and confirm password do not match!');
            return;
        }
        const token = location && location.length > 1 ? location[1] : '';
        const payload = {
            resetPasswordToken: token,
            password: newPassword,
        };
        const headersOb={
            headers: {
              'Content-Type': 'application/json',
            }
          }
        try {
            const response = await API.put('reset-password',payload,headersOb);
            if (response.status === 200 || response.status === 201) {
                console.log(response)
                message.success('Password successfully reset');
                setTimeout(() => {
                    navigate('/');
                }, 200);
            } else {
                message.error(response.data.message || 'Error resetting password');
            }
        } catch (error) {
            console.error('Error resetting password:', error);
            message.error('An error occurred while resetting the password');
        }
    };

    const login = () => {
        navigate('/');
    };

    return (
        <div className='bg-[#D7F1FF] text-black max-h-[100vh]'>
            <div className='relative w-full h-[95vh]'>
                <div className="absolute top-[15%] right-[30%] rounded-yellow w-[255px] h-[255px] border-[#8FE8FF] border-[16px] rounded-[50%] drop-shadow-xl"></div>
                <div className="absolute bottom-[15%] right-[10%] rounded-yellow w-[255px] h-[255px] border-[#FFE2AA] border-[16px] rounded-[50%] drop-shadow-xl"></div>
                <div className='relative flex justify-center items-center'>
                    <div className='w-full h-[95vh] rounded-md p-3 backdrop-blur-sm flex justify-center items-center'>
                        <div className="flex items-center justify-center gap-40 w-full h-auto">
                            <div className="heading mb-4">
                                <div className="flex items-center justify-center ">
                                    <img src={logo} alt="" className='w-full h-full' />
                                </div>
                            </div>
                            <div className="w-full max-w-[400px] h-full bg-white/60 backdrop-blur rounded-md custom-shadow p-8">
                                <h1 className='mb-2 font-semibold text-lg'>Reset Password</h1>
                                <div className="font-regular mb-2">Reset Password to continue to your account</div>
                                <Space direction="vertical" className='w-full mb-2'>

                                    <Input.Password
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className='mb-2 p-2'
                                        size="large"
                                        placeholder="New Password"
                                        visibilityToggle={{ visible: passwordVisible, onVisibleChange: setPasswordVisible }}
                                    />
                                    <Input.Password
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className='mb-2 p-2'
                                        size="large"
                                        placeholder="Confirm New Password"
                                        visibilityToggle={{ visible: passwordVisible, onVisibleChange: setPasswordVisible }}
                                    />
                                </Space>
                                <div className="flex gap-2 flex-col">
                                    <Button type="primary" onClick={handleClick}>Reset</Button>
                                    <Button type="link" className='text-black' onClick={login}>Back to Login</Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <FooterContainer />
            </div>
        </div>
    );
};

export default Reset;
