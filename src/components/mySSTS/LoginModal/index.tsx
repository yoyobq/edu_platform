import { SstsSessionManager } from '@/services/my-ssts/sessionManager';
import {
  ExclamationCircleFilled,
  InfoCircleOutlined,
  LockOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Button, Checkbox, Form, Input, message, Modal, Space, Tooltip, Typography } from 'antd';
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
  onLoginSuccess?: (userName: string, userId?: string) => void;
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

  // 执行登录操作
  const performLogin = async (
    values: { jobId: string; password: string; remember?: boolean },
    saveCredentials: boolean,
  ) => {
    setLoading(true);
    const hide = message.loading('正在登录，请稍候...', 0);

    try {
      // 使用会话管理服务登录
      const result = await SstsSessionManager.login({
        jobId: values.jobId,
        password: values.password,
      });

      if (result.success) {
        // 如果用户确认了保存凭据
        if (saveCredentials) {
          SstsSessionManager.saveCredentials(values.jobId, values.password);
        }

        message.success(`登录成功！`);
        setVisible(false);

        // 调用成功回调，传递用户名和用户ID
        if (onLoginSuccess && result.userName) {
          onLoginSuccess(result.userName, values.jobId);
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

  // 登录处理函数
  const handleLogin = (values: { jobId: string; password: string; remember?: boolean }) => {
    // 如果用户选择了记住密码，显示安全警告确认弹窗
    if (values.remember) {
      // 创建一个Modal实例，以便我们可以更新它的属性
      const modal = Modal.confirm({
        title: '安全警告',
        icon: <ExclamationCircleFilled className={styles['warning-icon']} />,
        content: (
          <div className={styles['warning-content']}>
            <Typography.Paragraph className={styles['warning-paragraph']}>
              您选择了记住校园网登录凭据，请注意：
            </Typography.Paragraph>
            <ul className={styles['warning-list']}>
              <li>
                凭据将<span className={styles['warning-text-bold']}>仅保存在您自己的电脑上</span>
                ，不会上传到服务器
              </li>
              <li>
                此操作存在<span className={styles['warning-text-bold']}>安全风险</span>
                ，请在个人设备上谨慎选择
              </li>
              <li>
                如果您使用的是公共电脑，
                <span className={styles['warning-text-bold']}>不要！不要！不要！</span>保存凭据
              </li>
            </ul>
            <Typography.Paragraph className={styles['warning-confirm']}>
              确定要保存登录凭据吗？
              <span className={styles['countdown-text']}>(10秒后可点击确认)</span>
            </Typography.Paragraph>
          </div>
        ),
        okText: '确认保存',
        cancelText: '不保存凭据',
        okButtonProps: { disabled: true },
        onOk: () => {
          // 用户确认后继续登录流程，并保存凭据
          performLogin(values, true);
        },
        onCancel: () => {
          // 用户取消后继续登录流程，但不保存凭据
          performLogin(values, false);
        },
      });

      // 设置倒计时
      let countdown = 10;
      const timer = setInterval(() => {
        countdown -= 1;
        if (countdown <= 0) {
          clearInterval(timer);
          // 启用确认按钮
          modal.update({
            okButtonProps: { disabled: false },
            content: (
              <div className={styles['warning-content']}>
                <Typography.Paragraph className={styles['warning-paragraph']}>
                  您选择了记住校园网登录凭据，请注意：
                </Typography.Paragraph>
                <ul className={styles['warning-list']}>
                  <li>
                    凭据将
                    <span className={styles['warning-text-bold']}>仅保存在您自己的电脑上</span>
                    ，不会上传到服务器
                  </li>
                  <li>
                    此操作存在<span className={styles['warning-text-bold']}>安全风险</span>
                    ，请在个人设备上谨慎选择
                  </li>
                  <li>
                    如果您使用的是公共电脑，强烈建议
                    <span className={styles['warning-text-bold']}>不要</span>保存凭据
                  </li>
                </ul>
                <Typography.Paragraph className={styles['warning-confirm']}>
                  确定要保存登录凭据吗？
                  <span className={styles['countdown-text']}>现在可以点击确认</span>
                </Typography.Paragraph>
              </div>
            ),
          });
        } else {
          // 更新倒计时显示
          modal.update({
            content: (
              <div className={styles['warning-content']}>
                <Typography.Paragraph className={styles['warning-paragraph']}>
                  您选择了记住校园网登录凭据，请注意：
                </Typography.Paragraph>
                <ul className={styles['warning-list']}>
                  <li>
                    凭据将
                    <span className={styles['warning-text-bold']}>仅保存在您自己的电脑上</span>
                    ，不会上传到服务器
                  </li>
                  <li>
                    此操作存在<span className={styles['warning-text-bold']}>安全风险</span>
                    ，请在个人设备上谨慎选择
                  </li>
                  <li>
                    如果您使用的是公共电脑，强烈建议
                    <span className={styles['warning-text-bold']}>不要</span>保存凭据
                  </li>
                </ul>
                <Typography.Paragraph className={styles['warning-confirm']}>
                  确定要保存登录凭据吗？
                  <span className={styles['countdown-text']}>({countdown}秒后可点击确认)</span>
                </Typography.Paragraph>
              </div>
            ),
          });
        }
      }, 1000);
    } else {
      // 用户未选择记住密码，直接登录
      performLogin(values, false);
    }
  };

  // 加载保存的凭据
  const loadSavedCredentials = () => {
    const credentials = SstsSessionManager.loadCredentials();

    if (credentials) {
      form.setFieldsValue({
        jobId: credentials.jobId,
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
        initialValues={{ jobId: jobId, remember: false }}
        className={styles['login-form']}
        size="large"
      >
        <Form.Item name="jobId" rules={[{ required: true, message: '请输入您的工号' }]}>
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
          <Space align="start">
            <Checkbox>记住校园网登录凭据</Checkbox>
            <Tooltip
              title={
                <div className={styles['tooltip-warning']}>
                  <p>安全警告：</p>
                  <ul>
                    <li>凭据仅保存在您自己的电脑上，不会上传到服务器</li>
                    <li>此操作存在安全风险，请在个人设备上谨慎选择</li>
                  </ul>
                </div>
              }
              placement="right"
            >
              <InfoCircleOutlined className={styles['tooltip-icon']} />
            </Tooltip>
          </Space>
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
