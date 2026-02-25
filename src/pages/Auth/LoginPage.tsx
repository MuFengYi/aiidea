import React, { useState } from 'react';
import { Button } from 'antd';
import { AppleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import { useAuthStore } from '../../stores/authStore';
import { initializeAppleSignIn } from '../../utils/oauthUtils';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { setTokens, setUser } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const handleAppleLogin = async () => {
    try {
      setLoading(true);
      const result = await initializeAppleSignIn();
      if (result) {
        setTokens(result.tokens.accessToken, result.tokens.refreshToken);
        setUser(result.user);
        navigate('/');
      }
    } catch (error) {
      toast.error('Apple login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ios-bg flex items-center justify-center px-6">
      <div className="aiidea-login-card">
        <div className="aiidea-login-header">
          <div className="aiidea-logo">A</div>
          <h1>AiiDea</h1>
          <p>记录灵感，交给 AI 打分</p>
        </div>

        <Button
          type="primary"
          size="large"
          className="aiidea-apple-btn"
          icon={<AppleOutlined />}
          loading={loading}
          onClick={handleAppleLogin}
        >
          使用 Apple 登录
        </Button>

        <div className="aiidea-login-footer">
          登录后即可记录 idea 并获取 AI 评分
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
