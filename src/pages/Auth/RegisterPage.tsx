import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, Input, Form, Card, Select } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';

import { useAuthStore } from '../../stores/authStore';

const { Option } = Select;

const RegisterPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuthStore();

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      await register(values);
      navigate('/');
    } catch (error) {
      // Error handling is done in the store
    } finally {
      setLoading(false);
    }
  };

  const changeLanguage = (language: string) => {
    i18n.changeLanguage(language);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-xl border-0">
          <div className="text-center mb-8">
            {/* Language Selector */}
            <div className="flex justify-end mb-4">
              <Select
                value={i18n.language}
                onChange={changeLanguage}
                size="small"
                className="w-24"
                suffixIcon={<GlobalOutlined />}
              >
                <Option value="en">EN</Option>
                <Option value="zh">中</Option>
              </Select>
            </div>

            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                {t('auth.register')}
              </h1>
              <p className="text-gray-600">
                {t('app.subtitle')}
              </p>
            </motion.div>
          </div>

          <Form
            form={form}
            name="register"
            onFinish={onFinish}
            layout="vertical"
            size="large"
          >
            <Form.Item
              label={t('auth.firstName')}
              name="firstName"
            >
              <Input placeholder={t('auth.firstName')} />
            </Form.Item>

            <Form.Item
              label={t('auth.lastName')}
              name="lastName"
            >
              <Input placeholder={t('auth.lastName')} />
            </Form.Item>

            <Form.Item
              label={t('auth.email')}
              name="email"
              rules={[
                { required: true, message: 'Please input your email!' },
                { type: 'email', message: 'Please enter a valid email!' }
              ]}
            >
              <Input placeholder={t('auth.email')} />
            </Form.Item>

            <Form.Item
              label={t('auth.password')}
              name="password"
              rules={[
                { required: true, message: 'Please input your password!' },
                { min: 8, message: 'Password must be at least 8 characters!' }
              ]}
            >
              <Input.Password placeholder={t('auth.password')} />
            </Form.Item>

            <Form.Item
              label="Language"
              name="language"
              initialValue={i18n.language}
            >
              <Select>
                <Option value="en">English</Option>
                <Option value="zh">中文</Option>
              </Select>
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="w-full h-12 text-base font-medium"
              >
                {t('auth.register')}
              </Button>
            </Form.Item>
          </Form>

          <div className="text-center mt-4">
            <span className="text-gray-600 text-sm">
              {t('auth.alreadyHaveAccount')}{' '}
            </span>
            <Link
              to="/login"
              className="text-blue-500 hover:text-blue-600 font-medium text-sm"
            >
              {t('auth.login')}
            </Link>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default RegisterPage;