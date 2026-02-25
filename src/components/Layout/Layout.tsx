import React from 'react';
import { Layout as AntLayout, Button } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { SettingOutlined, LogoutOutlined } from '@ant-design/icons';

import { useAuthStore } from '../../stores/authStore';

const { Header, Content } = AntLayout;

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AntLayout className="min-h-screen bg-ios-bg">
      <Header className="aiidea-header">
        <div className="aiidea-header__title" onClick={() => navigate('/')}>
          AiiDea
        </div>
        <div className="aiidea-header__actions">
          {location.pathname !== '/settings' && (
            <Button
              type="text"
              icon={<SettingOutlined />}
              onClick={() => navigate('/settings')}
              className="aiidea-header__icon"
            />
          )}
          <Button
            type="text"
            icon={<LogoutOutlined />}
            onClick={handleLogout}
            className="aiidea-header__icon"
          />
        </div>
      </Header>
      <Content className="aiidea-content">
        {children}
      </Content>
    </AntLayout>
  );
};

export default Layout;
