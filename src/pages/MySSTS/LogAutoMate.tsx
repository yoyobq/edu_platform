import Footer from '@/components/Footer'; // 导入底部组件，用于页面底部展示
import { sstsGetCurriPlan } from '@/services/my-ssts/getCurriPlan'; // 教学日志相关
import { sstsLogin } from '@/services/my-ssts/login'; // 登录相关
import { useModel } from '@umijs/max'; // 用于访问全局状态管理的钩子
import { Button, Flex, Form, Input, message, Modal, Table, Typography } from 'antd';
import React, { useState } from 'react';
import { flushSync } from 'react-dom'; // React DOM 的同步刷新函数
import TeachingLogCard from './components/TeachingLogCard';
import './style.less'; // 引入样式文件，包含页面整体布局的样式

/**
 * LogAutoMate 组件：用于 Edu Platform 的新页面模板，结构清晰，方便快速创建和定制
 */
const LogAutoMate: React.FC = () => {
  // 使用 useModel 钩子访问 initialState，包含全局的初始化数据
  const { initialState, setInitialState } = useModel('@@initialState');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]); // 存储表格数据

  const [curriDetails, setcurriDetails] = useState<CurriDetails[]>([]); // 存储需要填写的日志数据
  // const [sstsUserName, setSstsUserName] = useState(false);
  const [form] = Form.useForm();
  const jobId: number | null = initialState?.currentUser?.staffInfo?.jobId ?? null;
  const accessGroup: string[] = initialState?.currentUser?.accessGroup ?? ['guest'];
  /**
   * 示例函数 exampleUpdate: 使用 flushSync 来强制同步更新 initialState 中的 currentUser 数据
   * flushSync 是 React 的同步刷新函数，确保更新立即生效
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const exampleUpdate: any = () => {
    flushSync(() => {
      setInitialState((s) => ({
        ...s,
        currentUser: initialState?.currentUser,
      }));
    });
  };

  /**
   * 登录测试，提交 SSTS 的登陆表单，尝试获取 token 和 session
   * 根据后台返回的成功/失败状态显示相应的提示
   */
  const handleSstsLogin = async (values: { userId: string; password: string }) => {
    // 检查 sessionStorage 是否有 ssts_token 和 ssts_JSESSIONID_A
    const existingToken = sessionStorage.getItem('ssts_token');
    const existingJSESSIONID = sessionStorage.getItem('ssts_JSESSIONID_A');

    const executeLogin = async (values: { userId: string; password: string }) => {
      setLoading(true);
      try {
        // 发起校园网登录请求
        const response = await sstsLogin({ userId: values.userId, password: values.password });

        if (response.success) {
          const sstsUserName = response.userInfo.userName;
          const currentUserName = initialState?.currentUser?.staffInfo?.name;

          // 校验用户名是否一致，非 admin 用户需确保一致
          if (sstsUserName !== currentUserName && !accessGroup.includes('admin')) {
            message.error('出于校园网数据安全的考虑，非本人禁止操作此工具，请勿跳过安全检查。');
          }

          // 存储 ssts_token 和 JSESSIONID_A 到 sessionStorage
          sessionStorage.setItem('ssts_token', response.cookie.token);
          sessionStorage.setItem(
            'ssts_JSESSIONID_A',
            response.jsessionCookie.split(';')[0].split('=')[1],
          );
          message.success(`你好，${sstsUserName}老师，登录成功！可以进行日志抓取。`);
        } else {
          message.error('登录失败，请检查工号或密码。');
        }
      } catch (error) {
        message.error('登录过程意外中断，请稍后再试。');
      } finally {
        setLoading(false);
      }
    };

    if (existingToken && existingJSESSIONID) {
      Modal.confirm({
        title: '已发现现有会话',
        content:
          '检测到您已经成功登录过校园网。如果自动化流程正常，请勿短时间内重复登录，是否坚持重新登录？',
        okText: '坚持更新会话',
        cancelText: '取消',
        onOk: async () => {
          await executeLogin(values); // 如果用户选择“坚持重新测试”，则执行登录操作
        },
      });
      return; // 防止继续执行
    }
    // 如果不存在旧的 token，则直接执行登录操作
    await executeLogin(values);
  };

  const getCurriPlan = async () => {
    try {
      const formData = form.getFieldsValue();
      const userId = formData.userId;
      const password = formData.password;
      const curriPlan = await sstsGetCurriPlan({ userId, password });
      setData(curriPlan.planList);
      setcurriDetails(curriPlan.curriDetails);
    } catch (error) {
      console.log(error);
    }
  };

  // 定义表格列
  const columns = [
    { title: '课程', dataIndex: 'courseName', key: 'courseName' },
    { title: '班级', dataIndex: 'className', key: 'className' },
    // { title: '任课老师', dataIndex: 'teacherName', key: 'teacherName' },
    { title: '起止周', dataIndex: 'teachingWeeksRange', key: 'teachingWeeksRange' },
    { title: '周数', dataIndex: 'teachingWeeksCount', key: 'teachingWeeksCount' },
    { title: '周学时', dataIndex: 'weeklyHours', key: 'weeklyHours' },
  ];

  return (
    <>
      {/* 顶部表单区域 */}
      <div className="top-form card-container">
        {/* <Card className={`${styles.topCardForm} top-form`} > */}
        <Form
          form={form}
          layout="inline"
          onFinish={handleSstsLogin}
          initialValues={{ userId: jobId }} // 设置 JobId 默认值
        >
          <Form.Item
            label="工号"
            name="userId"
            rules={[{ required: true, message: '请输入您的工号' }]}
          >
            <Input
              placeholder="输入工号"
              readOnly={!accessGroup.includes('admin')}
              style={{ width: 120 }}
              onFocus={() => {
                if (!accessGroup.includes('admin')) {
                  message.warning('为了数据安全，您只可以查询本人信息');
                }
              }}
            />
          </Form.Item>
          <Form.Item
            label="密码"
            name="password"
            rules={[{ required: true, message: '请输入您的密码' }]}
          >
            <Input.Password placeholder="输入密码" style={{ width: 120 }} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              登录校园网
            </Button>
          </Form.Item>
          <Form.Item>
            <Button type="primary" loading={loading} onClick={getCurriPlan}>
              获取日志
            </Button>
          </Form.Item>
        </Form>
      </div>
      <div className="container">
        <Flex gap="middle">
          {/* 操作提示区域 */}
          <div
            className="card-container"
            style={{ width: '28vw', minWidth: '150px', paddingTop: '8px' }}
          >
            <Typography>
              <Typography.Text strong>操作提示：</Typography.Text>
              <ol style={{ marginTop: '8px' }}>
                <li>填写校园网工号和密码，点击登录获取校园网会话。</li>
                <li>点击获取日志详情查看教学计划。</li>
                <li>务必核对计划是否与实际一致。</li>
                <li>根据计划和日志的填写情况，会出现日志信息确认卡片。</li>
                <li>核对日志内容并补充信息后提交。</li>
              </ol>
            </Typography>
          </div>

          <Flex vertical style={{ flexBasis: '68vw' }}>
            {/* 表格区域 */}
            <Table
              columns={columns}
              dataSource={data}
              rowKey="curriPlanId"
              size="small"
              pagination={{ pageSize: 10, hideOnSinglePage: true }}
              style={{ width: '66vw', marginBottom: '1vh' }}
              // scroll={{ x: 'max-content' }}
            />

            {/* card区域 */}
            {curriDetails.map((detail) => (
              <TeachingLogCard
                key={`${detail.teaching_date}-${detail.section_id.charAt(0)}`}
                {...detail}
              />
            ))}
          </Flex>
        </Flex>
      </div>
      <div className="content-padding"></div>
      {/* 页面底部组件 */}
      <Footer />
    </>
  );
};

export default LogAutoMate;
