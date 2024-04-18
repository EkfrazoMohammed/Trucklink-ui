import React, { useState } from 'react';
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
import { Button, Layout, Menu } from 'antd';
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined
} from '@ant-design/icons';
import HeaderContainer from '../../containers/HeaderContainer';
import DashboardContainer from '../../containers/Dashboard/DashboardContainer';
import OnboardingContainer from '../../containers/Onboarding/OnboardingContainer';
import DispatchContainer from '../../containers/Dispatch/DispatchContainer';
import ReceiveContainer from '../../containers/Receive/ReceiveContainer';
import AccountingContainer from '../../containers/Accounting/AccountingContainer';
import ReportsContainer from '../../containers/Reports/ReportsContainer';
import SettingsContainer from '../../containers/Settings/SettingsContainer';

const { Content, Footer, Sider } = Layout;
interface IconImageProps {
  src: string;
}
const Dashboard: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState('1');
  const [title,setTitle]=useState('Dashboard')

  const handleMenuClick = (menuItemKey: string,menuTitle: string) => {
    setSelectedMenuItem(menuItemKey);
    setTitle(menuTitle)
  };

  const IconImage: React.FC<IconImageProps> = ({ src }) => {
    return (
      <img src={src} alt={src} className='IconImage-icon' />
    )
  }

  const items = [
    { key: '1', label: 'Dashboard', icon: <IconImage src={dashboard_logo} /> ,container: <DashboardContainer/> },
    { key: '2', label: 'Onboarding', icon: <IconImage src={onboarding_logo} />,container: <OnboardingContainer /> },
    { key: '3', label: 'Dispatch', icon: <IconImage src={dispatch_logo} /> ,container: <DispatchContainer />},
    { key: '4', label: 'Receive', icon: <IconImage src={recieve_logo} /> ,container: <ReceiveContainer />},
    { key: '5', label: 'Accounting', icon: <IconImage src={accounting_logo} />,container: <AccountingContainer /> },
    { key: '6', label: 'Reports', icon: <IconImage src={reports_logo} />,container: <ReportsContainer /> },
    { key: '7', label: 'Settings', icon: <IconImage src={settings_logo} />,container: <SettingsContainer />},
  ];

  return (
    <Layout style={{ minHeight: '90vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)} >
        <div className="demo-logo-vertical" style={{display:"flex",justifyContent:"spaceBetween"}}  />
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={() => setCollapsed(!collapsed)}
          style={{
            fontSize: '16px',
            width: "100%",
            height: "auto",
            color: "#fff",
            margin:"1rem 0"
          }}
        />
        <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline">
          {items.map(item => (
            <Menu.Item key={item.key} icon={item.icon} onClick={() => handleMenuClick(item.key,item.label)}>
              {item.label}
            </Menu.Item>
          ))}
        </Menu>
        <div className="mt-64">'
        <button className='flex justify-center items-center m-auto px-4 py-2'> <img src={logout_logo} alt="" /></button>
        {collapsed ? <img src={truck_logo} alt="truck_logo"  className='flex justify-center m-auto'/> : <img src={dark_logo} alt="dark_logo" />}
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
            <HeaderContainer title={title}/>
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

    </Layout>
  );
};

export default Dashboard;
