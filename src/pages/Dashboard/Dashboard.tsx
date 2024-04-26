import React, { useState,useEffect } from 'react';
import "../../App.css";
import truck_logo from "../../assets/logo.png"
import dark_logo from "../../assets/dark_logo.png"
import dashboard_logo from "../../assets/Dashboard.png"
import dispatch_logo from "../../assets/Dispatch.png"
import onboarding_logo from "../../assets/Onboarding.png"
import recieve_logo from "../../assets/Receive.png"
import accounting_logo from "../../assets/Accounting.png"
import reports_logo from "../../assets/Reports.png"
import settings_logo from "../../assets/Settings.png"
import logout_logo from "../../assets/Logout.png"
import menu_logo from "../../assets/Menu.png"
import {  Layout, Menu,Modal } from 'antd';

import HeaderContainer from '../../containers/HeaderContainer';
import DashboardContainer from '../../containers/Dashboard/DashboardContainer';
import OnboardingContainer from '../../containers/Onboarding/OnboardingContainer';
import DispatchContainer from '../../containers/Dispatch/DispatchContainer';
import ReceiveContainer from '../../containers/Receive/ReceiveContainer';
import AccountingContainer from '../../containers/Accounting/AccountingContainer';
import ReportsContainer from '../../containers/Reports/ReportsContainer';
import SettingsContainer from '../../containers/Settings/SettingsContainer';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const { Content, Footer, Sider } = Layout;
interface RootState {
  hub: {
    selectedHub: string; // Assuming selectedHub is of type string
    // Other properties of the hub slice
  };
  // Other slices of the Redux store
}



const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState('1');
  const [title, setTitle] = useState('Dashboard');
  // Usage in useSelector
const selectedHubRedux = useSelector((state: RootState) => state.hub.selectedHub);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false); // State variable for logout modal visibility

  useEffect(() => {
    // Function to navigate to the selected menu item after selecting a hub
    const navigateToMenu = () => {
      if (selectedHubRedux !== "") {
        setSelectedMenuItem('2'); // Set the menu item key for Onboarding
        setTitle('Onboarding'); // Update the title to reflect the selected menu item
      }
    };

    navigateToMenu(); // Call navigateToMenu when component mounts or selectedHubRedux changes
  }, [selectedHubRedux]);

  const handleMenuClick = (menuItemKey: string, menuTitle: string) => {
    setSelectedMenuItem(menuItemKey);
    setTitle(menuTitle);
  };

  const IconImage: React.FC<{ src: string }> = ({ src }) => <img src={src} alt={src} className='IconImage-icon' />;

  const items = [
    { key: '1', label: 'Dashboard', icon: <IconImage src={dashboard_logo} />, container: <DashboardContainer /> },
    { key: '2', label: 'Onboarding', icon: <IconImage src={onboarding_logo} />, container: <OnboardingContainer /> },
    { key: '3', label: 'Dispatch', icon: <IconImage src={dispatch_logo} />, container: <DispatchContainer /> },
    { key: '4', label: 'Receive', icon: <IconImage src={recieve_logo} />, container: <ReceiveContainer /> },
    { key: '5', label: 'Accounting', icon: <IconImage src={accounting_logo} />, container: <AccountingContainer /> },
    { key: '6', label: 'Reports', icon: <IconImage src={reports_logo} />, container: <ReportsContainer /> },
    { key: '7', label: 'Settings', icon: <IconImage src={settings_logo} />, container: <SettingsContainer /> },
  ];

  // Logout function
  const handleLogout = () => {
    console.log("Logout clicked");
    
    setLogoutModalVisible(false);
    navigate("/")
  };
  return (
    <Layout style={{ minHeight: '90vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)} >
        <div className="demo-logo-vertical" style={{ display: "flex", justifyContent: "space-between" }} />
        {/* <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={() => setCollapsed(!collapsed)}
          style={{
            fontSize: '16px',
            width: "100%",
            height: "auto",
            color: "#fff",
            margin: "1rem 0"
          }}
        /> */}
        <div
        className='flex justify-end items-center py-2 px-4 cursor-pointer'
          onClick={() => setCollapsed(!collapsed)}>
        <img src={menu_logo} alt={menu_logo} 
        style={{
            fontSize: '16px',
            width: "40px",
            height: "40px",
            color: "#fff",
            margin: ".5rem 0"
          }}/>
          </div>
        <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline"  selectedKeys={[selectedMenuItem]}>
          {items.map(item => (
            <Menu.Item key={item.key} icon={item.icon} onClick={() => handleMenuClick(item.key, item.label)}>
              {item.label}
            </Menu.Item>
          ))}
        </Menu>
        
        <div className="mt-64">
          <button className='flex justify-center items-center m-auto px-4 py-2' onClick={() => setLogoutModalVisible(true)}> <img src={logout_logo} alt="" />{collapsed ? null : <span className='text-white'>Logout</span>}</button>
          {collapsed ? <img src={truck_logo} alt="truck_logo" className='flex justify-center m-auto' /> : <img src={dark_logo} alt="dark_logo" />}
        </div>
      </Sider>
      <Layout>
        <Content style={{ margin: '1.5rem' }}>
          <div
            style={{
              padding: 24,
              minHeight: "90vh",
              background: "#fff",
              borderRadius: "8px",
              boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.1)",
            }}
          >
            <HeaderContainer title={title} />
            {items.map(item => (
              <React.Fragment key={item.key}>
                {selectedMenuItem === item.key && (
                  <> {item.container}</>
                )}
              </React.Fragment>
            ))}
          </div>
        </Content>
        <Footer
          style={{
            textAlign: 'center',
          }}
        >
          Trucklink ©{new Date().getFullYear()}
        </Footer>
      </Layout>
      
{/* Logout Modal */}
<Modal
      
        title="Logout"
        open={logoutModalVisible}
        onOk={handleLogout}
        onCancel={() => setLogoutModalVisible(false)}
      >
        <p>Are you sure you want to logout?</p>
      </Modal>
    </Layout>
  );
};

export default Dashboard;
