import LoginModal, { LoginModalRef } from '@/components/mySSTS/LoginModal';
import { sstsGetCurriPlan, sstsSubmitTeachingLog } from '@/services/my-ssts/getCurriPlan'; // 教学日志相关
import { SstsSessionManager } from '@/services/my-ssts/sessionManager'; // 会话管理服务
import { CheckCircleOutlined, DownOutlined, LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { useModel } from '@umijs/max'; // 用于访问全局状态管理的钩子
import { Button, Dropdown, Empty, Flex, message, Modal, Space, Table, Typography } from 'antd';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect, useRef, useState } from 'react';
import TeachingLogCard from './components/TeachingLogCard';
import './style.less'; // 引入样式文件，包含页面整体布局的样式

/**
 * LogAutoMate 组件：用于 Edu Platform 的新页面模板，方便快速创建和定制
 */
const LogAutoMate: React.FC = () => {
  // 使用 useModel 钩子访问 initialState，包含全局的初始化数据
  const { initialState } = useModel('@@initialState');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]); // 存储表格数据
  const [curriDetails, setCurriDetails] = useState<CurriDetails[] | null>(null); // 存储需要填写的日志数据
  // 添加一个状态来跟踪会话状态变化
  const [sessionValid, setSessionValid] = useState(SstsSessionManager.isSessionValid());
  const loginModalRef = useRef<LoginModalRef>(null);

  const jobId: number | null = initialState?.currentUser?.staffInfo?.jobId ?? null;
  const accessGroup: string[] = initialState?.currentUser?.accessGroup ?? ['guest'];
  const isAdmin = accessGroup.includes('admin');

  const currentDate = new Date();
  const formattedDate = currentDate.toISOString().split('T')[0];

  /**
   * 处理登录成功事件
   */
  const handleLoginSuccess = (userName: string) => {
    const currentUserName = initialState?.currentUser?.staffInfo?.name;

    // 校验用户名是否一致，非 admin 用户需确保一致
    if (userName !== currentUserName && !isAdmin) {
      message.error('出于校园网数据安全的考虑，非本人禁止操作此工具，请勿跳过安全检查。');
    }

    // 更新会话状态
    setSessionValid(true);
  };

  /**
   * 显示登录对话框或自动登录
   */
  const showLoginModal = () => {
    // 检查会话是否有效
    const isSessionValid = SstsSessionManager.isSessionValid();

    if (isSessionValid) {
      Modal.confirm({
        title: '已发现现有会话',
        content:
          '检测到您已经成功登录过校园网。如果自动化流程正常，请勿短时间内重复登录，是否坚持重新登录？',
        okText: '坚持更新会话',
        cancelText: '取消',
        onOk: () => {
          loginModalRef.current?.showModal();
        },
      });
    } else {
      // 检查是否有保存的凭据
      const savedCredentials = SstsSessionManager.loadCredentials();

      if (savedCredentials) {
        // 有保存的凭据，直接登录
        const hide = message.loading('正在使用保存的凭据登录...', 0);
        setLoading(true);

        SstsSessionManager.login({
          userId: savedCredentials.jobId,
          password: savedCredentials.password,
        })
          .then((result) => {
            if (result.success) {
              message.success('自动登录成功！');
              setSessionValid(true);

              // 调用成功回调
              if (result.userName) {
                handleLoginSuccess(result.userName);
              }
            } else {
              message.error(result.message || '自动登录失败，请手动登录');
              // 自动登录失败，显示登录模态框
              loginModalRef.current?.showModal();
            }
          })
          .catch((error) => {
            console.error('自动登录失败:', error);
            message.error('自动登录失败，请手动登录');
            // 自动登录失败，显示登录模态框
            loginModalRef.current?.showModal();
          })
          .finally(() => {
            hide();
            setLoading(false);
          });
      } else {
        // 没有保存的凭据，显示登录模态框
        loginModalRef.current?.showModal();
      }
    }
  };

  const handleSubmitTeachingLog = async (teachingLogData: TeachingLogData) => {
    try {
      // 不再传递密码，只传递用户ID和日志数据
      await sstsSubmitTeachingLog({
        userId: jobId?.toString() || '',
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
    // 检查会话是否有效
    if (!SstsSessionManager.isSessionValid()) {
      message.warning('请先登录校园网');
      showLoginModal();
      return;
    }

    const hide = message.loading('正在获取日志数据，受限于校园网的访问速度，请耐心等待...', 0);
    setLoading(true);

    try {
      // 不再传递密码，只传递用户ID
      const curriPlan = await sstsGetCurriPlan({ userId: jobId?.toString() || '' });
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
    { title: '起止周', dataIndex: 'teachingWeeksRange', key: 'teachingWeeksRange' },
    { title: '周数', dataIndex: 'teachingWeeksCount', key: 'teachingWeeksCount' },
    { title: '周学时', dataIndex: 'weeklyHours', key: 'weeklyHours' },
  ];

  // 添加一个清除会话的函数
  const clearSessionStatus = () => {
    SstsSessionManager.clearSession();
    message.success('已清除登录状态');
    setSessionValid(false);
  };

  // 添加一个定期检查会话状态的效果
  useEffect(() => {
    // 初始检查
    setSessionValid(SstsSessionManager.isSessionValid());

    // 设置定时器，每分钟检查一次会话状态
    const timer = setInterval(() => {
      const isValid = SstsSessionManager.isSessionValid();
      if (sessionValid !== isValid) {
        setSessionValid(isValid);
      }
    }, 60000); // 每分钟检查一次

    return () => clearInterval(timer);
  }, [sessionValid]);

  return (
    <>
      {/* 顶部操作区域 */}
      <div className="top-form card-container">
        <Flex align="center" justify="space-between">
          <Flex gap="middle">
            {sessionValid ? (
              <Dropdown
                menu={{
                  items: [
                    {
                      key: '1',
                      icon: <LogoutOutlined />,
                      label: '清除登录状态',
                      danger: true,
                      onClick: clearSessionStatus,
                    },
                  ],
                }}
              >
                <Button type="default" style={{ color: '#52c41a', borderColor: '#52c41a' }}>
                  <Space>
                    <CheckCircleOutlined />
                    {SstsSessionManager.getUserName() || '未知用户'}老师已登录
                    <DownOutlined />
                  </Space>
                </Button>
              </Dropdown>
            ) : (
              <Button
                type="primary"
                onClick={showLoginModal}
                loading={loading}
                disabled={loading}
                icon={<UserOutlined />}
              >
                登录校园网
              </Button>
            )}

            <Button
              type="primary"
              loading={loading}
              disabled={loading || !sessionValid}
              onClick={getCurriPlan}
              style={!sessionValid ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
            >
              获取日志
            </Button>
          </Flex>
        </Flex>
      </div>

      <div className="container">
        <Flex gap="middle">
          {/* 操作提示区域 */}
          <div
            className="card-container"
            style={{
              width: '28vw',
              paddingTop: '2vh',
              maxHeight: '75',
              overflowY: 'auto',
            }}
          >
            <Typography>
              <Typography.Text strong>操作提示：</Typography.Text>
              <ol style={{ marginTop: '8px' }}>
                <li>点击【登录校园网】按钮，输入工号和密码登录。</li>
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
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{
                        opacity: 0,
                        scale: 0.9,
                        y: 10,
                      }}
                      transition={{
                        duration: 0.6,
                        ease: 'easeInOut',
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

      {/* 登录 Modal 组件 */}
      <LoginModal
        ref={loginModalRef}
        jobId={jobId}
        isAdmin={isAdmin}
        onLoginSuccess={handleLoginSuccess}
      />
    </>
  );
};

export default LogAutoMate;
