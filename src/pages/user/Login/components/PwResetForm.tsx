import { checkEmailUsage, sendPwdResetEmail } from '@/services/ant-design-pro/register';
import { Button, Form, Input, message, Modal } from 'antd';
import React, { useEffect, useState } from 'react';

interface PwResetFormProps {
  visible: boolean;
  onClose: () => void;
}

export const PwResetForm: React.FC<PwResetFormProps> = ({ visible, onClose }) => {
  // 请注意 Form.useForm(); 这个用法，这是 Antd 特有的为受控表单设计的访问方法
  const [form] = Form.useForm();

  // 注释掉的 useRef<FormInstance>() 是 Recat 提供的访问表单的实现
  // 具体的应用请看 ./RegisterForm.tsx 中的实力，
  // 和 Form.useForm(); 一样，都是为了方便的访问表单，此处留存供比较这两种方法
  // const formRef = useRef<FormInstance>();

  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [emailSent, setEmailSent] = useState(false);

  // 页面加载时检查 sessionStorage 中是否有存储的倒计时结束时间
  useEffect(() => {
    const storedExpiryTime = sessionStorage.getItem('emailCountdown');
    if (storedExpiryTime) {
      const timeLeft = parseInt(storedExpiryTime, 10) - Date.now();

      if (timeLeft > 0) {
        setCountdown(Math.floor(timeLeft / 1000)); // 设置剩余倒计时
        setEmailSent(true); // 恢复已发送状态
      } else {
        sessionStorage.removeItem('emailCountdown'); // 如果倒计时已过期，清除存储
      }
    }
  }, []);

  // 倒计时逻辑
  useEffect(() => {
    if (countdown > 0 && emailSent) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer); // 在回调中正确清除定时器
            sessionStorage.removeItem('emailCountdown'); // 倒计时结束时移除存储
            return 0; // 倒计时结束，重置为 0
          }
          return prev - 1;
        });
      }, 1000);

      // 组件卸载或 countdown 变化时清除定时器
      return () => clearInterval(timer);
    }
  }, [countdown, emailSent]); // 确保依赖项正确

  // 用于发送密码重置邮件
  const sendResetEmail = async (values: { email: string }) => {
    setLoading(true);
    // 检查是否已经有有效倒计时
    const storedExpiryTime = sessionStorage.getItem('emailCountdown');
    const timeLeft = storedExpiryTime ? parseInt(storedExpiryTime, 10) - Date.now() : 0;

    if (timeLeft > 0) {
      const secondsLeft = Math.ceil(timeLeft / 1000);
      message.warning(`邮件发送计时被非法重置，请等待 ${secondsLeft} 秒后再发送验证邮件。`);
      setCountdown(secondsLeft);
      setLoading(false); // 恢复 loading 状态
      return; // 倒计时尚未结束，阻止邮件发送
    }

    try {
      // 获取 Email 地址
      const email: string = values.email;

      // 检查邮箱是否填写
      if (!email) {
        // 注意和 formRef 的区别
        form.setFields([
          {
            name: 'email',
            errors: ['请输入邮箱地址'],
          },
        ]);
        return;
      }

      // 使用正则表达式来检查 Email 格式是否有效
      const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailPattern.test(email)) {
        form.setFields([
          {
            name: 'email',
            errors: ['请输入有效的邮箱地址'],
          },
        ]);
        return;
      }

      // 检查该邮箱是否已注册
      const res = await checkEmailUsage({ loginEmail: email });

      if (res.used) {
        message.success('密码重置信发送中。');

        const param = {
          email,
        };

        // 发送密码重置邮件
        const sendEmailResult = await sendPwdResetEmail(param);

        if (sendEmailResult) {
          message.success('验证邮件已成功发送！');
          setEmailSent(true);

          // 为防止高级用户随意跳过倒计时滥发邮件，将倒计时结束时间存入 sessionStorage
          // 请注意这并不是一个严格的限制，还是有办法跳过的
          const expiryTime = Date.now() + 60 * 1000;
          sessionStorage.setItem('emailCountdown', expiryTime.toString());

          // 重置倒计时
          setCountdown(60);
          form.resetFields(); // 清空表单
          onClose(); // 关闭 modal
        } else {
          message.error('验证邮件发送失败，请更换邮箱或稍后再试。');
        }
      } else {
        message.error(`${email} 邮箱未被注册，若确已注册，请联系管理员。`);
      }
    } catch (error) {
      message.error('操作失败，请检查您的网络连接或稍后重试，若多次出现此提示，请联系管理员。');
      // console.error('检查邮箱或发送邮件时出错:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    form.resetFields(); // 在关闭 modal 时清空表单
    onClose(); // 触发父组件的关闭操作
  };

  return (
    <Modal
      title="重置密码"
      onCancel={handleClose} // 关闭时清空表单
      open={visible}
      destroyOnClose
      footer={null}
    >
      <Form form={form} layout="vertical" onFinish={sendResetEmail}>
        <Form.Item
          label="注册邮箱"
          name="email"
          rules={[
            { required: true, message: '请输入您的注册邮箱' },
            { type: 'email', message: '请输入有效的邮箱地址' },
          ]}
        >
          <Input placeholder="请输入您的注册邮箱" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block disabled={countdown > 0}>
            {countdown > 0 ? `${countdown} 秒后可重发` : `发送密码重置邮件`}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};
