import { sstsGetCurriPlan, sstsSubmitTeachingLog } from '@/services/my-ssts/getCurriPlan'; // 教学日志相关
import { sstsLogin } from '@/services/my-ssts/login'; // 登录相关
import { useModel } from '@umijs/max'; // 用于访问全局状态管理的钩子
import { Button, Empty, Flex, Form, Input, message, Modal, Table, Typography } from 'antd';
import { AnimatePresence, motion } from 'framer-motion';
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

  const [curriDetails, setCurriDetails] = useState<CurriDetails[] | null>(null); // 存储需要填写的日志数据
  // const [sstsUserName, setSstsUserName] = useState(false);
  const [form] = Form.useForm();
  const jobId: number | null = initialState?.currentUser?.staffInfo?.jobId ?? null;
  const accessGroup: string[] = initialState?.currentUser?.accessGroup ?? ['guest'];

  const currentDate = new Date();
  const formattedDate = currentDate.toISOString().split('T')[0];
  /**
   * 示例函数 exampleUpdate: 使用 flushSync 来强制同步更新 initialState 中的 currentUser 数据
   * flushSync 是 React 的同步刷新函数，确保更新立即生效
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const exampleUpdate: any = () => {
    flushSync(() => {
      setInitialState((s: any) => ({
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
      const hide = message.loading('正在登录，请稍候...', 0);
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
        message.error('登录过程中断，请参考校园网信息后重试。');
      } finally {
        hide();
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

  const handleSubmitTeachingLog = async (teachingLogData: TeachingLogData) => {
    const formData = form.getFieldsValue();
    const userId = formData.userId;
    const password = formData.password;

    const loginParams = {
      userId,
      password,
    };
    try {
      await sstsSubmitTeachingLog({
        loginParams,
        teachingLogData,
      });

      // 更新 curriDetails，移除成功上传的日志项
      setCurriDetails((prevDetails) =>
        prevDetails
          ? prevDetails.filter(
              (detail) =>
                detail.teaching_date !== teachingLogData.teaching_date ||
                detail.section_id !== teachingLogData.section_id,
            )
          : [],
      );
    } catch (error) {
      message.error('上传失败，请稍后再试');
    }
  };

  const getCurriPlan = async () => {
    const hide = message.loading('正在获取日志数据，受限于校园网的访问速度，请耐心等待...', 0); // 第二个参数 0 表示不自动关闭
    setLoading(true);

    try {
      const formData = form.getFieldsValue();
      const userId = formData.userId;
      const password = formData.password;

      const curriPlan = await sstsGetCurriPlan({ userId, password });
      setData(curriPlan.planList);
      setCurriDetails(curriPlan.curriDetails);

      message.success('日志数据获取成功！');
    } catch (error) {
      message.error('日志数据获取失败，请稍后重试。');
    } finally {
      hide();
      setLoading(false);
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
            <Button type="primary" htmlType="submit" loading={loading} disabled={loading}>
              登录校园网
            </Button>
          </Form.Item>
          <Form.Item>
            <Button type="primary" loading={loading} disabled={loading} onClick={getCurriPlan}>
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
            style={{
              width: '28vw',
              // minWidth: '130px',
              paddingTop: '2vh',
              maxHeight: '75',
              overflowY: 'auto',
            }}
          >
            <Typography>
              <Typography.Text strong>操作提示：</Typography.Text>
              <ol style={{ marginTop: '8px' }}>
                <li>填写校园网工号和密码，点击【登录校园网】获取会话。</li>
                <li>点击【获取日志】查看教学计划。</li>
                <li>务必核对计划是否与实际一致。</li>
                <li>根据计划和日志的填写情况，会出现日志信息确认卡片。</li>
                <li>核对日志内容并补充信息后【保存到校园网】。</li>
                <li>保存按钮只会在校园网生成日志信息但不会提交。</li>
                <li>自动化流程完毕后，请登录校园网检查并补完数据后正式提交。</li>
              </ol>
              <Typography.Text strong>安全提示：</Typography.Text>
              <ol style={{ marginTop: '8px' }}>
                <li>若本页面在同台设备上多开并同时填写，可能会导致无法追踪的错误，应尽量避免。</li>
                <li>系统不会以任何形式记录用户校园网密码。</li>
                <li>密码的明文会随登录流程发送给校园网。</li>
                <li>自动化流程进行中的所有数据，都是从校园网实时抓取。</li>
                <li>请登录后尽快完成操作，如果长时间未操作，建议重新抓取数据后再继续。</li>
              </ol>
            </Typography>
            <Typography.Text strong style={{ color: '#ff4d4f', fontSize: '1.2rem' }}>
              运动会，新生入学等情况会导致计划和日志不符，请注意修正。
            </Typography.Text>
          </div>

          <Flex vertical style={{ flexBasis: '68vw' }}>
            {/* 表格区域 */}
            <Table
              columns={columns}
              dataSource={data}
              rowKey="curriPlanId"
              size="small"
              pagination={{ pageSize: 10, hideOnSinglePage: true }}
              style={{ width: '66vw', marginBottom: '1vh', paddingRight: '1vw' }}
              // scroll={{ x: 'max-content' }}
            />

            {/* TeachingLogCards 区域 */}
            <div style={{ maxHeight: '61vh', overflowY: 'auto', paddingRight: '0.5vw' }}>
              {curriDetails === null ? (
                // curriDetails 为 null 时，不显示任何内容
                <></> // 返回空的片段
              ) : curriDetails.length === 0 ? (
                <Empty
                  description={
                    <span>
                      截止 {formattedDate}，所有需要填写的日志都在校园网找到已填写并保存的记录。
                    </span>
                  }
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              ) : (
                <AnimatePresence>
                  {curriDetails.map((detail) => (
                    <motion.div
                      key={`${detail.teaching_date}-${detail.section_id.charAt(0)}`}
                      initial={{ opacity: 0, scale: 0.95 }} // 初始状态：不透明且稍微缩小
                      animate={{ opacity: 1, scale: 1 }} // 动画结束：完全透明且恢复原始大小
                      exit={{
                        opacity: 0, // 退出时完全透明
                        scale: 0.9, // 退出时缩小
                        y: 10, // 退出时稍微下移
                      }}
                      transition={{
                        duration: 0.6, // 增加退出动画时间
                        ease: 'easeInOut', // 使用更平滑的过渡效果
                      }}
                    >
                      <TeachingLogCard {...detail} onSubmitTeachingLog={handleSubmitTeachingLog} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </Flex>
        </Flex>
      </div>
      <div className="content-padding"></div>
      {/* 页面底部组件 */}
      {/* <Footer /> */}
    </>
  );
};

export default LogAutoMate;
