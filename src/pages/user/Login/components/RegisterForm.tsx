import {
  checkEmailUsage,
  checkStaffByJobId,
  checkVerifCode,
  registerUser,
  sendRegistrationEmail,
  validateTeacherIdentity,
} from '@/services/ant-design-pro/register';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import {
  CheckCard,
  ProForm,
  ProFormText,
  // ProFormTextArea,
  StepsForm,
} from '@ant-design/pro-components';
import {
  Alert,
  Avatar,
  Button,
  Col,
  Descriptions,
  FormInstance,
  message,
  Modal,
  Result,
  Row,
  Tag,
} from 'antd';
import { useEffect, useRef, useState } from 'react';

// const waitTime = (time: number = 100) => {
//   return new Promise((resolve) => {
//     setTimeout(() => {
//       resolve(true);
//     }, time);
//   });
// };

interface RegisterFormProps {
  visible: boolean;
  hideModal: () => void;
}

export const RegisterFrom: React.FC<RegisterFormProps> = (props) => {
  // const [jobId, setJobId]: [string | undefined, React.Dispatch<React.SetStateAction<string>>] =
  //   useState('');
  const formRef = useRef<FormInstance>();
  // 默认教师身份
  const [identityType, setIdentityType] = useState<string>('teacher');

  // 用于存放注册过程中，各个分部表单的数据
  const [registrationData, setRegistrationData] = useState<Record<string, any>>({});

  // 提供 loading 状态，避免用户多次点击按钮导致重复操作
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loading, setLoading] = useState(false);

  const [countdown, setCountdown] = useState(0);
  const [emailSent, setEmailSent] = useState(false);

  // 用于存储验证码
  const [verifCode, setVerifCode] = useState('');

  // step1：选择身份并提供相关信息进行验证
  const chooseAndValidateIdentity = async (formData: Record<string, any>) => {
    // 将当前步骤数据合并到全局状态
    // React 会保证 prevData 是最新的状态，因此你合并数据时不会遗漏前面的表单数据。
    setRegistrationData((prevData) => ({ ...prevData, ...formData }));

    // 此处需要注意的是 setRegistrationData 是异步更新，所以当前步骤数据还是应该从 formData 中获得
    const { name, jobId, stuname, studentId, department, advisorName } = formData;

    try {
      let res: boolean = false;
      if (identityType === 'teacher') {
        // 若存在匹配信息，res 变成 true
        res = await validateTeacherIdentity({ name, jobId });
        setRegistrationData((prevData) => ({ ...prevData, role: 'STAFF' }));
      } else if (identityType === 'student') {
        // 此部分代码未完成
        console.log('学生身份验证');
        console.log(`姓名: ${stuname}`);
        console.log(`学号: ${studentId}`);
        console.log(`系部: ${department}`);
        console.log(`班主任姓名: ${advisorName}`);
      }

      if (!res) {
        message.error(`查无匹配 [${jobId}]${name} 的教职工。新进教师若确认无误，请联系管理员。`);
      } else {
        // 根据 jobId 核对该教职工是否已经注册过
        const staffInfo = await checkStaffByJobId({ jobId });
        // 如果查无 staffInfo，为 null 则允许注册
        res = !staffInfo;
        if (res) {
          message.success('姓名工号验证成功。');
        } else {
          message.error(`教师 [${jobId}]${name} 已经注册，若有疑问，请联系管理员。`);
        }
      }

      return res;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  // step2.1 验证 Email 发送流程
  const sendRegEmail = async () => {
    // 检查是否已经有有效倒计时
    const storedExpiryTime = sessionStorage.getItem('emailCountdown');
    const timeLeft = storedExpiryTime ? parseInt(storedExpiryTime, 10) - Date.now() : 0;

    if (timeLeft > 0) {
      const secondsLeft = Math.ceil(timeLeft / 1000);
      message.warning(`邮件发送计时被非法重置，请等待 ${secondsLeft} 秒后再发送验证邮件。`);
      setCountdown(secondsLeft);
      return; // 倒计时尚未结束，阻止邮件发送
    }

    try {
      // 获取 Email 地址
      const email: string = formRef.current?.getFieldValue('email');
      const { name, jobId, identityType } = registrationData;

      console.log(email);
      // 检查邮箱是否填写
      if (!email) {
        formRef.current?.setFields([
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
        formRef.current?.setFields([
          {
            name: 'email',
            errors: ['请输入有效的邮箱地址'],
          },
        ]);
        return;
      }

      // 检查该邮箱是否已注册
      const res = await checkEmailUsage({ loginEmail: email });

      if (!res.used) {
        message.success('邮箱已记录，注册信发送中。');

        // 此处应该有不同身份的不同注册逻辑，待后期补充
        const param = {
          applicantType: 'registration',
          email,
          applicantId: 1,
          issuerId: 0,
          data: {
            name,
            jobId,
            email,
            identityType,
          },
        };

        // 发送注册验证邮件
        const sendEmailResult = await sendRegistrationEmail(param);

        if (sendEmailResult) {
          message.success('验证邮件已成功发送！');
          setRegistrationData((prevData) => ({ ...prevData, loginEmail: email }));
          setEmailSent(true);

          // 为防止高级用户随意跳过倒计时滥发邮件，将倒计时结束时间存入 sessionStorage
          // 请注意这并不是一个严格的限制，还是有办法跳过的
          const expiryTime = Date.now() + 60 * 1000;
          sessionStorage.setItem('emailCountdown', expiryTime.toString());

          // 重置倒计时
          setCountdown(60);

          setRegistrationData((prevData) => ({ ...prevData, email }));
        } else {
          message.error('验证邮件发送失败，请更换邮箱或稍后再试。');
        }
      } else {
        message.error(`${email} 邮箱已被使用，若确已注册，请找回密码；若从未注册，请联系管理员。`);
      }
    } catch (error) {
      message.error('操作失败，请检查您的网络连接或稍后重试，若多次出现此提示，请联系管理员。');
      // console.error('检查邮箱或发送邮件时出错:', error);
    }
  };

  // step2.2：提交验证码，供后台二次验证
  const sendAndcheckVerifCode = async (formData: Record<string, any>) => {
    // 提取表单中的 email 和 verificationString
    // const { email, verificationString } = formData;
    setRegistrationData((prevData) => ({ ...prevData, ...formData }));

    try {
      setLoading(true);

      // 出于安全考虑只将验证码提交给后台，其余 name，jobId 等信息
      // 由验证码 decode 后计算得出
      const { verificationString } = formData;
      const verifResult = await checkVerifCode({ verifCode: verificationString });

      if (verifResult) {
        // 假设验证通过，可以进入下一步
        message.success('邮箱验证成功！');
        setVerifCode(verificationString);
        return true; // 成功后进入下一步
      }
    } catch (error) {
      formRef.current?.setFields([
        {
          name: 'verificationString',
          errors: ['验证码无效或过期，请检查输入'],
        },
      ]);
      return false; // 验证失败，不进入下一步
    } finally {
      setLoading(false);
    }
  };

  // step3: 补完并验证信息，开启后台流程
  const completeUserInfo = async (formData: Record<string, any>) => {
    // 提取数据
    const { loginEmail } = registrationData;
    const { loginName, nickname, password } = formData;
    // 1. 检查 loginName 是否存在，不存在则置为空字符串
    const validatedLoginName = loginName?.trim() || '';
    // 2. 检查 nickname 是否存在，不存在则职位空字符串
    const validatedNickname = nickname?.trim() || '';
    // 3. 检查 password 是否符合规则
    const passwordPattern = /^(?=.*[a-zA-Z])(?=.*\d|[!@#$%^&*()_+}{":;'?/>.<,]).{8,}$/;
    if (!password || !passwordPattern.test(password)) {
      message.error('密码不符合要求，请确保至少 8 位，包含字母和数字或特殊字符的组合');
      return false;
    }
    const validatedPassword = password;

    // 4. 检查 verificationString 是否存在并符合规则
    const verifCodePattern = /^[0-9a-fA-F]{64}$/;
    if (!verifCode || !verifCodePattern.test(verifCode)) {
      message.error('验证码出错或被非法修改，请重新开始注册流程');
      return false;
    }

    // 如果以上所有验证都通过，则开始后台通信逻辑
    try {
      setLoading(true);

      // 准备调用 registerUser 的数据
      const input = {
        loginEmail,
        loginName: validatedLoginName,
        loginPassword: validatedPassword,
        nickname: validatedNickname,
        verifCode,
      };

      // 调用 registerUser 服务
      const result = await registerUser(input);

      if (result) {
        message.success('注册成功！');
        // 这里可以添加注册成功后的处理逻辑，例如跳转到登录页面
        return true; // 表示表单提交成功
      } else {
        message.error('注册失败，请检查输入并重试');
        return false;
      }
    } catch (error) {
      console.error('提交信息时发生错误：', error);
      message.error('提交信息时发生错误，请稍后重试');
      return false;
    } finally {
      setLoading(false);
    }
  };

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
            return 0; // 倒计时结束，重置为 0
          }
          return prev - 1;
        });
      }, 1000);

      // 组件卸载或 countdown 变化时清除定时器
      return () => clearInterval(timer);
    }
  }, [countdown, emailSent]); // 确保依赖项正确

  const { visible, hideModal } = props;
  return (
    <>
      <StepsForm
        formRef={formRef} // 将 formRef 绑定到 StepsForm
        onFinish={async () => {
          hideModal();
          message.success('提交成功');
        }}
        formProps={{
          validateMessages: {
            required: '此项为必填项',
          },
        }}
        submitter={{
          submitButtonProps: {
            loading, // 当任一操作在加载时显示 loading
          },
          render: (props, dom) => {
            // 判断是否为最后一步，隐藏默认提交按钮
            return props.step === 3 ? null : dom;
          },
        }}
        stepsFormRender={(dom, submitter) => {
          return (
            <Modal
              title="新用户注册"
              width={'60%'}
              onCancel={() => hideModal()}
              open={visible}
              footer={submitter}
              destroyOnClose
              maskClosable={false} // 禁止点击遮罩关闭
            >
              {dom}
            </Modal>
          );
        }}
      >
        <StepsForm.StepForm
          name="base"
          title="身份选择"
          onFinish={chooseAndValidateIdentity}
          // onValuesChange={handleFormValuesChange}
        >
          <ProForm.Group title="身份">
            <CheckCard.Group
              style={{ width: '100%' }}
              defaultValue="teacher"
              multiple={false}
              onChange={(value) => setIdentityType((value as string) || 'teacher')}
            >
              <CheckCard
                title="教师"
                avatar={
                  <Avatar
                    src="https://gw.alipayobjects.com/zos/bmw-prod/2dd637c7-5f50-4d89-a819-33b3d6da73b6.svg"
                    size="large"
                  />
                }
                description="账号可以获得更高的权限和使用教辅功能，注册需通过严格的身份认证。"
                value="teacher"
              />
              <CheckCard
                title="学生"
                disabled
                avatar={
                  <Avatar
                    src="https://gw.alipayobjects.com/zos/bmw-prod/6935b98e-96f6-464f-9d4f-215b917c6548.svg"
                    size="large"
                  />
                }
                description="学生可通过自己的专属账号，获取教学内容，参与教学过程。"
                value="student"
              />
            </CheckCard.Group>
          </ProForm.Group>
          {identityType === 'teacher' ? (
            <>
              <ProFormText
                name="name"
                width="md"
                label="您的真实姓名"
                transform={(value) => value.trim()}
                // tooltip="最长为 24 位，用于标定的唯一 id"
                placeholder="请输入姓名"
                rules={[
                  { required: true },
                  { min: 2, message: '姓名至少为2个字' },
                  { max: 30, message: '姓名最多为30个字' },
                  {
                    pattern: /^[\u4e00-\u9fa5a-zA-Z]+$/,
                    message: '姓名必须为纯中文或纯英文，首末位不应有空格',
                  },
                ]}
              />
              <ProFormText
                name="jobId"
                width="md"
                label="您的工号"
                tooltip="请提供校园网工号，用于验证教师身份"
                placeholder="请输入工号"
                rules={[
                  { required: true },
                  {
                    pattern: /^[0-9]{3,5}$/,
                    message: '工号一般是4位纯数字组成，首末位不应有空格',
                  },
                ]}
              />
            </>
          ) : (
            <>
              <ProFormText
                name="stuname"
                width="md"
                label="您的真实姓名"
                placeholder="请输入姓名"
                rules={[
                  { required: true },
                  { min: 2, message: '姓名至少为2个字' },
                  { max: 30, message: '姓名最多为30个字' },
                  { pattern: /^[\u4e00-\u9fa5a-zA-Z]+$/, message: '姓名必须为纯中文或纯英文' },
                ]}
              />
              <ProFormText
                name="studentId"
                width="md"
                label="您的学号"
                placeholder="请输入学号"
                rules={[
                  { required: true },
                  {
                    pattern: /^[0-9]{5,10}$/,
                    message: '学号一般是5到10位纯数字组成',
                  },
                ]}
              />
              <ProFormText
                name="department"
                width="md"
                label="系部"
                placeholder="请输入系部"
                rules={[{ required: true, message: '请输入系部' }]}
              />
              <ProFormText
                name="advisorName"
                width="md"
                label="班主任姓名"
                placeholder="请输入班主任姓名"
                rules={[{ required: true, message: '请输入班主任姓名' }]}
              />
            </>
          )}
        </StepsForm.StepForm>
        <StepsForm.StepForm name="email" title="验证邮箱" onFinish={sendAndcheckVerifCode}>
          <Alert
            message={null} // 去掉默认 message，使 description 填满整个 Alert
            description={
              <span>
                <ol style={{ marginLeft: '4px', marginTop: '4px' }}>
                  <li>
                    1. <strong>该邮箱将作为注册后的登录凭证。</strong>
                  </li>
                  <li>
                    2. 如果未在收件箱中找到确认邮件，<strong>请检查垃圾邮件文件夹</strong>。
                  </li>
                  <li>3. 测试表明 QQ 邮箱和 Hotmail 邮箱能确保收到邮件。</li>
                  <li>4. 非主流邮箱地址可能存在邮件延迟。</li>
                </ol>
              </span>
            }
            type="warning"
            showIcon
            icon={<ExclamationCircleOutlined style={{ fontSize: '16px' }} />} // 调整图标大小
            style={{
              marginBottom: '16px',
              padding: '12px 24px',
            }}
          />
          <Row gutter={6} align="middle">
            {/* 表单部分 */}
            <Col xs={24} sm={16} md={16}>
              <ProFormText
                name="email"
                width="md"
                label="邮箱地址"
                placeholder="请输入邮箱地址"
                rules={[
                  { required: true, message: '请输入邮箱地址' },
                  { type: 'email', message: '请输入有效的邮箱地址' },
                ]}
              />
            </Col>
            {/* 按钮部分 */}
            <Col xs={24} sm={8} md={8}>
              <Button
                type="primary"
                onClick={sendRegEmail}
                disabled={countdown > 0}
                style={{ marginTop: '4px' }} // 只添加顶部间距，保持对齐
                block // 在小屏幕时让按钮自适应宽度
              >
                {countdown > 0 ? `${countdown} 后可重发` : `发送验证码`}
              </Button>
            </Col>
          </Row>
          {registrationData.email && (
            <>
              <Alert
                message={
                  <>
                    验证码已发送，30 分钟内有效，请检查收件箱或垃圾邮件，
                    <br />
                    若确未收到邮件，可倒计时结束后重发。
                  </>
                }
                type="info"
                style={{
                  marginBottom: '16px',
                  padding: '8px 16px',
                }}
              />
              <ProFormText
                name="verificationString"
                width="xl"
                label="验证码"
                placeholder="请输入64位16进制字符串"
                rules={[
                  { required: true, message: '请输入验证字符串' },
                  { len: 64, message: '验证字符串必须为64位' },
                  { pattern: /^[0-9a-fA-F]+$/, message: '验证字符串必须为16进制' },
                ]}
                transform={(value) => value.trim()}
              />
            </>
          )}
        </StepsForm.StepForm>
        <StepsForm.StepForm name="info" title="信息补完" onFinish={completeUserInfo}>
          {/* 使用 Descriptions 显示不可修改的信息 */}
          <Descriptions
            bordered
            column={1} // 单列显示
            size="small" // 设置为 small 以缩小字体和行高
            style={{ marginBottom: '16px' }}
          >
            {identityType === 'teacher' && (
              <Descriptions.Item label="工号">{registrationData.jobId}</Descriptions.Item>
            )}
            <Descriptions.Item label="姓名">{registrationData.name}</Descriptions.Item>
            <Descriptions.Item label="邮箱">{registrationData.email}</Descriptions.Item>
          </Descriptions>

          {/* 登录名 */}
          <Row gutter={6} align="middle" style={{ marginBottom: '8px' }}>
            <Col xs={24} sm={24}>
              <ProFormText
                name="loginName"
                label={
                  <>
                    <strong>登录名</strong>
                    <Tag color="green" style={{ marginLeft: '8px' }}>
                      选填
                    </Tag>
                  </>
                }
                placeholder="登录名可替代邮箱作为登录凭证"
                extra="登录名只能包含小写字母、数字和下划线，不得少于 4 位"
                rules={[
                  { min: 4, message: '登录名不得少于 4 位' },
                  { pattern: /^[a-z0-9_]+$/, message: '登录名只能包含小写字母、数字、下划线' },
                ]}
              />
            </Col>
          </Row>

          {/* 昵称 */}
          <Row gutter={6} align="middle" style={{ marginBottom: '8px' }}>
            <Col xs={24} sm={24}>
              <ProFormText
                name="nickname"
                label={
                  <>
                    <strong>昵称</strong>
                    <Tag color="green" style={{ marginLeft: '8px' }}>
                      选填
                    </Tag>
                  </>
                }
                placeholder="昵称用于日常使用时的名字显示"
                extra="昵称可以包含中文、字母、数字、下划线，2 到 20 个字符"
                rules={[
                  { min: 2, message: '昵称最少 2 个字符' },
                  { max: 20, message: '昵称最多 20 个字符' },
                  {
                    pattern: /^[\u4e00-\u9fa5_a-zA-Z0-9]+$/,
                    message: '昵称只能包含中文、字母、数字、下划线',
                  },
                ]}
              />
            </Col>
          </Row>

          {/* 密码输入 */}
          <Row gutter={6} align="middle" style={{ marginBottom: '8px' }}>
            <Col xs={24} sm={24}>
              <ProFormText.Password
                name="password"
                label={
                  <>
                    <strong>登录密码</strong>
                    <Tag color="red" style={{ marginLeft: '8px' }}>
                      必填
                    </Tag>
                  </>
                }
                placeholder="密码用于今后的登录"
                extra="登录密码至少 8 位，包含字母、数字、符号中的两种"
                rules={[
                  { required: true, message: '请输入密码' },
                  { min: 8, message: '密码至少 8 个字符' },
                  // {
                  //   pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+}{":;'?/>.<,]).{8,}$/,
                  //   message: '密码需包含大小写字母、数字和特殊字符中的三种',
                  // },
                  {
                    pattern: /^(?=.*[a-zA-Z])(?=.*\d|[!@#$%^&*()_+}{":;'?/>.<,]).{8,}$/,
                    message: '密码需包含字母和数字或特殊字符中的至少两种',
                  },
                ]}
              />
            </Col>
          </Row>
        </StepsForm.StepForm>
        <StepsForm.StepForm name="complete" title="完成注册">
          <Result
            status="success"
            title="注册成功"
            subTitle="您的账号已成功注册，现在可以使用您的登录名或邮箱进行登录。"
            extra={[
              <Button
                type="primary"
                key="login"
                onClick={() => {
                  hideModal(); // 关闭注册步骤对话框
                }}
              >
                去登录
              </Button>,
            ]}
          />
        </StepsForm.StepForm>
      </StepsForm>
    </>
  );
};
