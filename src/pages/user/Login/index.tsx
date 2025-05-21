import Footer from '@/components/Footer';
import { login } from '@/services/ant-design-pro/login';
import { LockOutlined, UserAddOutlined, UserOutlined } from '@ant-design/icons';
import { LoginForm, ProFormText } from '@ant-design/pro-components';
import { useEmotionCss } from '@ant-design/use-emotion-css';
import { FormattedMessage, Helmet, history, useIntl, useModel } from '@umijs/max';
import { Button, Card, Col, FormInstance, Row, Tabs, message } from 'antd';
import SliderCaptcha, { ActionType } from 'rc-slider-captcha';
import React, { useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import Settings from '../../../../config/defaultSettings';
import InfoCard from './components/InfoCard';
import { Lang } from './components/Lang';
import { LoginMessage } from './components/LoginMessage';
import { PwResetForm } from './components/PwResetForm';
import { RegisterFrom } from './components/RegisterForm';
import './index.less';

const Login: React.FC = () => {
  const formRef = useRef<FormInstance>(null); // 创建 formRef
  // 用于滑块验证
  // @ts-ignore
  const actionRef = useRef<ActionType>();

  // 记录登录状态及登录方式，用于切换登录方式或显示错误提示
  const [userLoginState, setUserLoginState] = useState<USER.AccountStatus>({});
  const [type, setType] = useState<string>('account');
  // 用于弹出注册表单
  const [regFormVisible, setRegFormVisible] = useState(false);
  // 用于弹出密码重置表单
  const [PwResetFormVisible, setPwResetFormVisible] = useState(false);
  const showModal = () => {
    setRegFormVisible(true);
  };

  // 鉴权流程：
  // 从 @@initialState 读取默认设置的全局初始数据并存放到 state 变量 initialState 中去。
  const { initialState, setInitialState } = useModel('@@initialState');

  const containerClassName = useEmotionCss(() => {
    return {
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      overflow: 'auto',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundImage: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      position: 'relative',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage:
          'url("https://gw.alipayobjects.com/zos/rmsportal/TVYTbAXWheQpRcWDaDMu.svg")',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center 110px',
        backgroundSize: '100%',
        opacity: 0.1,
        pointerEvents: 'none',
      },
    };
  });

  // 引入 i18n 国际化
  const intl = useIntl();

  // 从后台获取当前登录用户的具体信息
  const fetchUserInfo = async (accountId: number) => {
    const userInfo = await initialState?.fetchUserInfo?.(accountId);
    if (userInfo) {
      // flushSync 是 React DOM 中的一个函数，它的作用是在调用它的时候，
      // 强制同步更新所有的挂起更新，而不是等待浏览器空闲时再执行更新，以提高更新性能
      flushSync(() => {
        setInitialState((s) => ({
          ...s,
          currentUser: userInfo,
        }));
      });
    }
  };

  const handleSubmit = async (values: USER.LoginParams) => {
    try {
      // 登录
      const res: any = await login({ ...values, type });
      // res = {id: 2, status: 1} 旧数据， status 是数值常量
      // res = {id: 2, status: 'ACTIVE'} 新数据，改动了数据库中存储的 status 为枚举类型
      // TODO：根据不同的 status 做不同的处理
      const { id, status } = res;
      if (id !== null && status === 'ACTIVE') {
        const defaultLoginSuccessMessage = intl.formatMessage({
          id: 'pages.login.success',
          defaultMessage: '登录成功！',
        });
        message.success(defaultLoginSuccessMessage);

        // userAccount 表中的 id 就是 userInfo 表中的 accountId 外键
        // 根据 id 去获取对应 accountId 的数据
        await fetchUserInfo(id);
        history.push('/');
      }
    } catch (error: any) {
      actionRef.current?.refresh();
      setUserLoginState({ status: 'UNKNOWN', type });
    }
  };

  const { status, type: loginType } = userLoginState;

  // 欢迎内容组件
  const WelcomeContent = () => (
    <Card className="welcome-card">
      <div className="welcome-decoration-top"></div>
      <div className="welcome-decoration-bottom"></div>

      <div className="welcome-content-container">
        <div>
          <div className="platform-logo">
            <img src="/logo.svg" alt="平台Logo" />
            <span>Edu Platform</span>
          </div>

          <div className="platform-title">欢迎使用 Edu Platform</div>
          <div className="platform-description">
            <div style={{ marginBottom: 16 }}>
              Edu Platform
              是一个整合江苏省苏州技师学院内部信息，展示信息工程系技术实力，并示范如何真正利用计算机科学实现信息化的综合性智能平台。
            </div>
            <div>
              我们致力于提炼『教学』、『教育』和『教辅』工作中的典型业务场景，采用信息化手段优化工作流程，为『学生』、『教师』和『教工』提供便捷服务，提升处理和解决各类学校事务的体验。
            </div>
          </div>
        </div>

        <div className="info-cards-container">
          <InfoCard
            index={1}
            href="#"
            title="如果您是学生"
            desc="获取便捷的教学内容展示、专业问答、知识辅导，以及监测学习进度和成果的工具。"
          />
          <InfoCard
            index={2}
            title="如果您是教师"
            href="#"
            desc="规划、设计、展示您的教学内容，利用信息化工具减少重复劳动，专注于真正的教学服务。"
          />
          <InfoCard
            index={3}
            title="如果您是教工"
            href="#"
            desc="整合搜集学院各类信息并合理梳理，提供便捷的查看、搜索和处理功能。"
          />
        </div>
      </div>
    </Card>
  );

  return (
    <div className={containerClassName}>
      <Helmet>
        <title>
          {intl.formatMessage({
            id: 'menu.login',
            defaultMessage: '登录页',
          })}
          - {Settings.title}
        </title>
      </Helmet>
      <Lang />
      <div className="login-container">
        <div className="mobile-slogan">信息化的目的是解放生产力而非束缚</div>
        <Row
          gutter={32}
          style={{
            width: '90%',
            maxWidth: '1400px',
          }}
          className="login-row"
        >
          {/* 欢迎内容部分 - 在小屏幕上隐藏 */}
          <Col xs={0} sm={0} md={14} lg={16} xl={16} className="welcome-col">
            <WelcomeContent />
          </Col>

          {/* 登录表单部分 */}
          <Col xs={24} sm={24} md={10} lg={8} xl={8} className="login-form-col">
            <Card className="login-card">
              <LoginForm
                formRef={formRef}
                contentStyle={{
                  minWidth: 280,
                  maxWidth: '100%',
                }}
                style={{
                  width: '100%',
                }}
                initialValues={{
                  autoLogin: true,
                }}
                submitter={false}
                actions={[
                  <Button
                    type="primary"
                    size="large"
                    key="reg"
                    onClick={showModal}
                    icon={<UserAddOutlined />}
                    block
                    className="register-button register-button-style"
                  >
                    注册
                  </Button>,
                  <div style={{ marginTop: '16px', textAlign: 'right' }} key="forgotPassword">
                    <Button
                      type="link"
                      key="pwdReset"
                      className="forgot-password-button"
                      onClick={() => setPwResetFormVisible(true)}
                    >
                      <FormattedMessage id="pages.login.forgotPassword" defaultMessage="忘记密码" />
                    </Button>
                  </div>,
                ]}
              >
                <Tabs
                  activeKey={type}
                  onChange={setType}
                  items={[
                    {
                      key: 'account',
                      label: (
                        <span className="login-tab-label">
                          {intl.formatMessage({
                            id: 'pages.login.accountLogin.tab',
                            defaultMessage: '邮箱密码登录',
                          })}
                        </span>
                      ),
                    },
                  ]}
                  style={{ marginBottom: '24px' }}
                />

                {status === 'UNKNOWN' && loginType === 'account' && (
                  <LoginMessage
                    content={intl.formatMessage({
                      id: 'pages.login.accountLogin.errorMessage',
                      defaultMessage: '访客可以用 guest / guest 登录试用',
                    })}
                  />
                )}
                {type === 'account' && (
                  <>
                    <ProFormText
                      name="loginName"
                      fieldProps={{
                        size: 'large',
                        prefix: <UserOutlined className="form-icon" />,
                        style: { width: '100%', height: '48px' },
                      }}
                      placeholder={intl.formatMessage({
                        id: 'pages.login.loginName.placeholder',
                        defaultMessage: '输入账号或邮箱均可登录',
                      })}
                      rules={[
                        {
                          required: true,
                          message: (
                            <FormattedMessage
                              id="pages.login.loginName.required"
                              defaultMessage="请输入用户名!"
                            />
                          ),
                        },
                      ]}
                    />
                    <ProFormText.Password
                      name="loginPassword"
                      fieldProps={{
                        size: 'large',
                        prefix: <LockOutlined className="form-icon" />,
                        style: { height: '48px' },
                      }}
                      placeholder={intl.formatMessage({
                        id: 'pages.login.loginPassword.placeholder',
                        defaultMessage: '请输入密码',
                      })}
                      rules={[
                        {
                          required: true,
                          message: (
                            <FormattedMessage
                              id="pages.login.loginPassword.required"
                              defaultMessage="请输入密码！"
                            />
                          ),
                        },
                      ]}
                    />
                    <SliderCaptcha
                      className="slider-captcha slider-captcha-style"
                      bgSize={{
                        width: 322,
                      }}
                      mode="slider"
                      tipText={{
                        default: '滑动验证登录',
                        moving: '请按住滑块，拖动到最右边',
                        error: '验证失败，请重新操作',
                        success: '验证成功',
                      }}
                      errorHoldDuration={1000}
                      onVerify={(data) => {
                        if (data.x === 262) {
                          Promise.resolve().then(() => {
                            const values = formRef.current?.getFieldsValue() as USER.LoginParams;
                            handleSubmit(values);
                          });
                          return Promise.resolve();
                        } else {
                          return Promise.reject();
                        }
                      }}
                      actionRef={actionRef}
                    />
                  </>
                )}
              </LoginForm>
            </Card>
          </Col>
        </Row>

        <RegisterFrom visible={regFormVisible} onClose={() => setRegFormVisible(false)} />
        <PwResetForm
          visible={PwResetFormVisible}
          onClose={() => {
            setPwResetFormVisible(false);
          }}
        />
      </div>
      <Footer />
    </div>
  );
};

export default Login;
