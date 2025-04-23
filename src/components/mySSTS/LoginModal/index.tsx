import { SstsSessionManager } from '@/services/my-ssts/sessionManager';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Checkbox, Form, Input, Modal, Typography, message } from 'antd';
import React, { forwardRef, useImperativeHandle, useState } from 'react';
import styles from './style.less';

// 定义组件接口
export interface LoginModalRef {
  showModal: () => void;
  hideModal: () => void;
}

interface LoginModalProps {
  jobId?: number | null;
  isAdmin?: boolean;
  onLoginSuccess?: (userName: string) => void;
}

const LoginModal = forwardRef<LoginModalRef, LoginModalProps>((props, ref) => {
  const { jobId, isAdmin = false, onLoginSuccess } = props;
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  // 暴露方法给父组件
  useImperativeHandle(ref, () => ({
    showModal: () => {
      setVisible(true);
    },
    hideModal: () => {
      setVisible(false);
    },
  }));

  // 登录处理函数
  const handleLogin = async (values: { userId: string; password: string; remember?: boolean }) => {
    setLoading(true);
    const hide = message.loading('正在登录，请稍候...', 0);

    try {
      // 使用会话管理服务登录
      const result = await SstsSessionManager.login({
        userId: values.userId,
        password: values.password,
      });

      if (result.success) {
        // 如果用户选择了记住密码，则保存凭据
        if (values.remember) {
          SstsSessionManager.saveCredentials(values.userId, values.password);
        }

        message.success(`登录成功！`);
        setVisible(false);

        // 调用成功回调
        if (onLoginSuccess && result.userName) {
          onLoginSuccess(result.userName);
        }
      } else {
        message.error(result.message || '登录失败，请检查工号或密码。');
      }
    } catch (error) {
      message.error('登录过程中断，请稍后重试。');
    } finally {
      hide();
      setLoading(false);
    }
  };

  // 加载保存的凭据
  const loadSavedCredentials = () => {
    const credentials = SstsSessionManager.loadCredentials();

    if (credentials) {
      form.setFieldsValue({
        userId: credentials.jobId,
        password: credentials.password,
        remember: true,
      });
    }
  };

  // 组件挂载时加载保存的凭据
  React.useEffect(() => {
    if (visible) {
      // 尝试加载保存的凭据
      loadSavedCredentials();

      // 设置默认工号
      if (jobId) {
        form.setFieldsValue({ userId: jobId });
      }
    }
  }, [visible, jobId, form]);

  return (
    <Modal
      title={
        <Typography.Title level={4} className={styles['modal-title']}>
          校园网登录
        </Typography.Title>
      }
      open={visible}
      onCancel={() => setVisible(false)}
      footer={null}
      maskClosable={false}
      width={400}
      centered
      className={styles['login-modal']}
    >
      <Typography.Paragraph type="secondary" className={styles['modal-description']}>
        请输入您的校园网账号和密码进行登录
      </Typography.Paragraph>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleLogin}
        initialValues={{ userId: jobId, remember: false }}
        className={styles['login-form']}
        size="large"
      >
        <Form.Item name="userId" rules={[{ required: true, message: '请输入您的工号' }]}>
          <Input
            prefix={<UserOutlined className={styles['input-prefix-icon']} />}
            placeholder="校园网工号"
            readOnly={!isAdmin}
            className={styles['input-field']}
            onFocus={() => {
              if (!isAdmin) {
                message.warning('为了数据安全，您只可以查询本人信息');
              }
            }}
          />
        </Form.Item>

        <Form.Item name="password" rules={[{ required: true, message: '请输入您的密码' }]}>
          <Input.Password
            prefix={<LockOutlined className={styles['input-prefix-icon']} />}
            placeholder="校园网密码"
            className={styles['password-field']}
          />
        </Form.Item>

        <Form.Item name="remember" valuePropName="checked">
          <Checkbox>记住校园网登录凭据</Checkbox>
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            block
            size="large"
            className={styles['login-button']}
          >
            登录
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
});

export default LoginModal;
