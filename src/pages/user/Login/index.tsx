import Footer from '@/components/Footer';
import { login } from '@/services/ant-design-pro/login';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { LoginForm, ProFormText } from '@ant-design/pro-components';
import { useEmotionCss } from '@ant-design/use-emotion-css';
import { FormattedMessage, Helmet, history, useIntl, useModel } from '@umijs/max';
import { Button, Tabs, message } from 'antd';
import SliderCaptcha, { ActionType } from 'rc-slider-captcha';
import React, { useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import Settings from '../../../../config/defaultSettings';
import { Lang } from './components/Lang';
import { LoginMessage } from './components/LoginMessage';
import { RegisterFrom } from './components/RegisterForm';
import './index.less';

const Login: React.FC = () => {
  // 记录登录状态及登录方式，用于切换登录方式或显示错误提示
  const [userLoginState, setUserLoginState] = useState<USER.AccountStatus>({});
  const [type, setType] = useState<string>('account');
  // 用于滑块验证
  const actionRef = useRef<ActionType>();

  // 用于弹出注册表单
  const [regFormVisible, setRegFormVisible] = useState(false);
  const showModal = () => {
    setRegFormVisible(true);
  };

  const hideModal = () => {
    setRegFormVisible(false);
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
      // backgroundImage:
      //   "url('https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/V-_oS6r-i7wAAAAAAAAAAAAAFl94AQBr')",
      backgroundSize: '100% 100%',
    };
  });

  // 引入 i18n 国际化
  const intl = useIntl();

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
      // console.log(actionRef.current);
      // 登录
      const res: any = await login({ ...values, type });
      // res = {id: 2, status: 1}
      const { id, status } = res;
      if (id !== null && status === 1) {
        const defaultLoginSuccessMessage = intl.formatMessage({
          id: 'pages.login.success',
          defaultMessage: '登录成功！',
        });
        message.success(defaultLoginSuccessMessage);

        // userAccount 表中的 id 就是 userInfo 表中的 accountId 外键
        // 根据 id 去获取对应 accountId 的数据
        await fetchUserInfo(id);
        // const urlParams = new URL(window.location.href).searchParams;
        // console.log(urlParams.get('redirect'));
        history.push('/');
        // return;
      }
    } catch (error: any) {
      // 如果失败去设置用户错误信息, 这是利用了 i18n 国际化插件的版本
      // const defaultLoginFailureMessage = intl.formatMessage({
      //   id: 'pages.login.failure',
      //   defaultMessage: error.message,
      // });
      // message.error(error.message);
      setUserLoginState({ status: 0, type });
    }
  };

  const { status, type: loginType } = userLoginState;

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
      <div
        style={{
          padding: '20vh 0',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center', // 让子元素在主轴上居中
        }}
      >
        <LoginForm
          contentStyle={{
            minWidth: 280,
            maxWidth: '70vw',
          }}
          logo={<img alt="logo" src="/logo.svg" />}
          title="智能教辅平台"
          subTitle={intl.formatMessage({ id: 'pages.layouts.userLayout.title' })}
          // submitter={{ searchConfig: { submitText: '登录 / 注册', }, }}
          initialValues={{
            autoLogin: true,
          }}
          actions={[
            // <FormattedMessage
            //   key="loginWith"
            //   id="pages.login.loginWith"
            //   defaultMessage="其他登录方式"
            // />,
            // <ActionIcons key="icons" />,
            <Button size="large" key="reg" onClick={showModal} block>
              注册
            </Button>,
          ]}
          onFinish={async (values) => {
            await handleSubmit(values as USER.LoginParams);
          }}
        >
          <Tabs
            activeKey={type}
            onChange={setType}
            // centered
            items={[
              {
                key: 'account',
                label: intl.formatMessage({
                  id: 'pages.login.accountLogin.tab',
                  defaultMessage: '邮箱密码登录',
                }),
              },
              // {
              //   key: 'mobile',
              //   label: intl.formatMessage({
              //     id: 'pages.login.phoneLogin.tab',
              //     defaultMessage: '手机号登录',
              //   }),
              // },
            ]}
          />

          {status === 0 && loginType === 'account' && (
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
                  prefix: <UserOutlined />,
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
                  prefix: <LockOutlined />,
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
                style={{
                  // flex: '1',
                  padding: '2vh 0',
                  width: '100%',
                }}
                bgSize={{
                  width: 328,
                  // height: 110
                }}
                mode="slider"
                tipText={{
                  default: '请按住滑块，拖动到最右边',
                  moving: '请按住滑块，拖动到最右边',
                  error: '验证失败，请重新操作',
                  success: '验证成功',
                }}
                errorHoldDuration={1000}
                onVerify={(data) => {
                  console.log(data);
                  // 默认背景图宽度 320 减去默认拼图宽度 60 所以滑轨宽度是 260
                  // width 被我改成了 328 减去 60
                  if (data.x === 268) {
                    return Promise.resolve();
                  }
                  return Promise.reject();
                }}
                actionRef={actionRef}
              />
            </>
          )}

          {/* {status === null && loginType === 'mobile' && <LoginMessage content="验证码错误" />}
          {type === 'mobile' && (
            <>
              <ProFormText
                fieldProps={{
                  size: 'large',
                  prefix: <MobileOutlined />,
                }}
                name="mobile"
                placeholder={intl.formatMessage({
                  id: 'pages.login.phoneNumber.placeholder',
                  defaultMessage: '手机号',
                })}
                rules={[
                  {
                    required: true,
                    message: (
                      <FormattedMessage
                        id="pages.login.phoneNumber.required"
                        defaultMessage="请输入手机号！"
                      />
                    ),
                  },
                  {
                    pattern: /^1\d{10}$/,
                    message: (
                      <FormattedMessage
                        id="pages.login.phoneNumber.invalid"
                        defaultMessage="手机号格式错误！"
                      />
                    ),
                  },
                ]}
              />
              <ProFormCaptcha
                fieldProps={{
                  size: 'large',
                  prefix: <LockOutlined />,
                }}
                captchaProps={{
                  size: 'large',
                }}
                placeholder={intl.formatMessage({
                  id: 'pages.login.captcha.placeholder',
                  defaultMessage: '请输入验证码',
                })}
                captchaTextRender={(timing, count) => {
                  if (timing) {
                    return `${count} ${intl.formatMessage({
                      id: 'pages.getCaptchaSecondText',
                      defaultMessage: '获取验证码',
                    })}`;
                  }
                  return intl.formatMessage({
                    id: 'pages.login.phoneLogin.getVerificationCode',
                    defaultMessage: '获取验证码',
                  });
                }}
                name="captcha"
                rules={[
                  {
                    required: true,
                    message: (
                      <FormattedMessage
                        id="pages.login.captcha.required"
                        defaultMessage="请输入验证码！"
                      />
                    ),
                  },
                ]}
                onGetCaptcha={async (phone) => {
                  const result = await getFakeCaptcha({
                    phone,
                  });
                  if (!result) {
                    return;
                  }
                  message.success('获取验证码成功！验证码为：1234');
                }}
              />
            </>
          )} */}
          {/* <div
            style={{
              marginBottom: 24,
            }}
          >
            <ProFormCheckbox noStyle name="autoLogin">
              <FormattedMessage id="pages.login.rememberMe" defaultMessage="自动登录" />
            </ProFormCheckbox>
            <a
              style={{
                float: 'right',
              }}
            >
              <FormattedMessage id="pages.login.forgotPassword" defaultMessage="忘记密码" />
            </a>
          </div> */}
        </LoginForm>
        <RegisterFrom visible={regFormVisible} hideModal={hideModal} />
      </div>
      <Footer />
    </div>
  );
};

export default Login;
