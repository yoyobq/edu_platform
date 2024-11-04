import { checkVerifCode, resetPassword } from '@/services/ant-design-pro/register';
import { LockOutlined } from '@ant-design/icons';
import { Button, Card, Form, Input, message, Space, Spin, Typography } from 'antd';
import React, { useEffect, useState } from 'react';
import { history, useParams } from 'umi';

const { Title, Text } = Typography;

const ResetPassword: React.FC = () => {
  const [form] = Form.useForm();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loading, setLoading] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);
  const { verifCode } = useParams<{ verifCode: string }>(); // 获取 URL 中的 verifCode

  // 页面加载时验证 verifCode
  useEffect(() => {
    const validateToken = async () => {
      if (!verifCode) {
        message.error('链接无效，请检查重置链接。');
        setIsTokenValid(false);
        return;
      }

      try {
        const response = await checkVerifCode({ verifCode }); // 调用后端接口验证 verifCode
        console.log(response);
        if (response) {
          setIsTokenValid(true); // 验证成功
        } else {
          message.error('链接无效或已过期');
          setIsTokenValid(false); // 验证失败
        }
      } catch (error) {
        message.error('无法验证链接，请稍后重试。');
        setIsTokenValid(false);
      }
    };

    validateToken();
  }, [verifCode]);

  // 15 秒倒计时
  useEffect(() => {
    if (isTokenValid === false) {
      const timer = setTimeout(() => {
        history.push('/user/login'); // 跳转到登录页面
      }, 15000);

      // 清除定时器
      return () => clearTimeout(timer);
    }
  }, [isTokenValid]);

  // 处理密码重置提交
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handlePasswordReset = async (values: { password: string }) => {
    setLoading(true);
    try {
      // 调用后端的重置密码接口
      const response = await resetPassword({ verifCode, password: values.password });

      if (response) {
        message.success('密码已成功重置！自动返回登录页');
        history.push('/user/login'); // 成功后跳转至登录页面
      }
    } catch (error) {
      message.error('密码重置失败，请稍后再试。');
    } finally {
      setLoading(false);
    }
  };

  if (isTokenValid === null) {
    return (
      <div
        style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}
      >
        <Card style={{ width: 300, textAlign: 'center' }}>
          <Spin size="large" />
          <Title level={4} style={{ marginTop: 16 }}>
            正在验证您的请求...
          </Title>
          <Text type="secondary">请稍候，正在验证您链接的有效性</Text>
        </Card>
      </div>
    );
  }

  if (isTokenValid === false) {
    return (
      <div
        style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}
      >
        <Card style={{ width: '40vw', textAlign: 'center' }}>
          <Title level={4} style={{ marginTop: 16 }}>
            请检查重置链接
          </Title>
          <Text type="danger">
            链接无效或已过期，建议重新申请密码重置，并在邮件中直接点击链接访问本页面
          </Text>
          <Text type="secondary" style={{ display: 'block', marginTop: 16 }}>
            15秒后自动跳转到登录页面...
          </Text>
        </Card>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f0f2f5',
      }}
    >
      <Card
        style={{
          width: '40vh',
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
          borderRadius: '8px',
        }}
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Title level={3} style={{ textAlign: 'center' }}>
            重置密码
          </Title>
          <Text style={{ textAlign: 'center', fontSize: '14px', color: '#888' }}>
            请设置您的新密码
          </Text>
          <Form form={form} layout="vertical" onFinish={handlePasswordReset}>
            <Form.Item
              name="password"
              extra="登录密码至少 8 位，包含字母、数字、符号中的两种"
              rules={[
                { required: true, message: '请输入密码' },
                { min: 8, message: '密码至少 8 个字符' },
                {
                  pattern: /^(?=.*[a-zA-Z])(?=.*\d|[!@#$%^&*()_+}{":;'?/>.<,]).{8,}$/,
                  message: '密码需包含字母和数字或特殊字符中的至少两种',
                },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="新密码"
                style={{ borderRadius: '4px', padding: '10px' }}
              />
            </Form.Item>
            <Form.Item
              name="confirm"
              dependencies={['password']}
              rules={[
                { required: true, message: '请确认新密码' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('两次密码输入不一致！'));
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="确认新密码"
                style={{ borderRadius: '4px', padding: '10px' }}
              />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                style={{
                  backgroundColor: '#1890ff',
                  borderColor: '#1890ff',
                  color: '#fff',
                  fontWeight: 'bold',
                  borderRadius: '4px',
                }}
              >
                重置密码
              </Button>
            </Form.Item>
          </Form>
        </Space>
      </Card>
    </div>
  );
};

export default ResetPassword;
