import CourseTable from '@/components/mySSTS/CourseTable';
import LoginModal, { LoginModalRef } from '@/components/mySSTS/LoginModal';
import {
  sstsGetCurriPlan,
  sstsSubmitIntegratedTeachingLog,
  sstsSubmitTeachingLog,
} from '@/services/my-ssts/getCurriPlan'; // 教学日志相关
import { SstsSessionManager } from '@/services/my-ssts/sessionManager'; // 会话管理服务
import { getSemesters } from '@/services/plan/semester';
import type { Semester } from '@/services/plan/types';
import {
  CheckCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  LogoutOutlined,
  QuestionCircleOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useModel } from '@umijs/max'; // 用于访问全局状态管理的钩子
import { Button, Card, Empty, Flex, message, Modal, Tooltip, Typography } from 'antd';
import dayjs from 'dayjs';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect, useRef, useState } from 'react';
import IntegratedTeachingLogCard from './components/IntegratedTeachingLogCard';
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

  // 学期相关状态 - 简化为只获取默认学期
  const [semester, setSemester] = useState<Semester | null>(null);
  const [semesterId, setSemesterId] = useState<number | null>(null);

  // 添加一个状态来跟踪会话状态变化
  const [sessionValid, setSessionValid] = useState(SstsSessionManager.isSessionValid());
  const loginModalRef = useRef<LoginModalRef>(null);

  const accessGroup: string[] = initialState?.currentUser?.accessGroup ?? ['guest'];
  const isAdmin = accessGroup.includes('admin');

  const savedCredentials = SstsSessionManager.loadCredentials();

  /**
   * 获取用户工号
   * 管理员用户优先使用保存的凭据中的工号，如果无效则尝试使用当前用户的工号
   * 普通用户直接使用当前用户的工号
   * @returns 工号或null
   */
  const getJobId = (): number | null => {
    // 普通用户逻辑：从当前用户的 staffInfo 中获取 jobId
    let jobId = initialState?.currentUser?.staffInfo?.jobId ?? null;

    // 管理员用户逻辑：如果是管理员且有保存的凭据，则使用保存的凭据中的 jobId
    if (isAdmin && savedCredentials?.jobId) {
      const adminJobId = Number(savedCredentials.jobId);
      // 确保转换后的 jobId 是有效的数字
      if (!isNaN(adminJobId)) {
        jobId = adminJobId;
      }
    }

    // 如果获取失败，显示错误信息
    if (jobId === null) {
      message.error('无法获取有效的工号信息，请确保已正常登录系统或保存了有效凭据');
    }

    return jobId;
  };

  const jobId = getJobId();
  const staffInfo = initialState?.currentUser?.staffInfo;

  const currentDate = new Date();
  const formattedDate = currentDate.toISOString().split('T')[0];

  // 获取默认学期信息
  useEffect(() => {
    getSemesters({})
      .then((data) => {
        const sorted = [...data].sort(
          (a, b) => dayjs(b.startDate).unix() - dayjs(a.startDate).unix(),
        );
        const current = sorted.find((s) => s.isCurrent);
        const latest = sorted[0];
        const defaultSemester = current || latest;
        if (defaultSemester) {
          setSemesterId(defaultSemester.id);
          setSemester(defaultSemester);
        }
      })
      .catch((error) => console.error('获取学期信息失败:', error));
  }, []);

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

  const handleSubmitIntegratedTeachingLog = async (teachingLogData: TeachingLogData) => {
    try {
      // 不再传递密码，只传递用户ID和日志数据
      await sstsSubmitIntegratedTeachingLog({
        userId: jobId?.toString() || '',
        teachingLogData,
      });

      console.log('上传到校园网的数据:', teachingLogData);

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

  // 添加一个清除会话的函数
  const clearSessionStatus = () => {
    SstsSessionManager.clearSession();
    message.success('已清除登录状态');
    setSessionValid(false);
  };

  // 添加一个清除本地凭据的函数
  const clearSavedCredentials = () => {
    SstsSessionManager.clearCredentials();
    message.success('已清除本地保存的凭据');
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
    <div className="log-automate-container">
      {/* 两栏布局容器 */}
      <div className="two-column-layout">
        {/* 左侧栏 - 课表和日志 */}
        <div className="left-column">
          {/* 课程表区域 */}
          {/* <div className="course-table-container"> */}
          <CourseTable
            semesterId={semesterId}
            semester={semester}
            staffId={staffInfo?.id}
            scheduleData={data}
          />
          {/* </div> */}

          {/* 日志填写区域 */}
          {curriDetails === null ? (
            <Empty description="请先获取日志数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />
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
                  {detail.journal_type === 3 ? (
                    <IntegratedTeachingLogCard
                      {...detail}
                      onSubmitTeachingLog={handleSubmitIntegratedTeachingLog}
                    />
                  ) : (
                    <TeachingLogCard {...detail} onSubmitTeachingLog={handleSubmitTeachingLog} />
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* 右侧栏 - 操作卡片 */}
        <div className="right-column">
          <Card title="日志伴侣" className="operation-card">
            {/* 登录状态显示 */}
            <div className="login-status">
              {sessionValid ? (
                <div className="logged-in-container">
                  <div className="user-info">
                    <CheckCircleOutlined className="status-icon" />
                    <Typography.Text strong>
                      {SstsSessionManager.getUserName() || '未知用户'}老师已登录
                    </Typography.Text>
                  </div>
                  <Flex gap="large" justify="center">
                    <Tooltip title="从校园网注销">
                      <Button
                        icon={<LogoutOutlined />}
                        onClick={clearSessionStatus}
                        type="dashed"
                        className="action-button"
                        size="small"
                      />
                    </Tooltip>
                    <Tooltip title="清除本地保存的凭据">
                      <Button
                        icon={<DeleteOutlined />}
                        onClick={clearSavedCredentials}
                        type="dashed"
                        className="action-button"
                        size="small"
                      />
                    </Tooltip>
                  </Flex>
                </div>
              ) : (
                <Button
                  type="primary"
                  onClick={showLoginModal}
                  loading={loading}
                  disabled={loading}
                  icon={<UserOutlined />}
                  block
                >
                  登录校园网
                </Button>
              )}
            </div>

            {/* 获取日志按钮 */}
            <div className="action-buttons">
              <Button
                type="primary"
                loading={loading}
                disabled={loading || !sessionValid}
                onClick={getCurriPlan}
                block
              >
                获取日志
              </Button>
            </div>

            {/* 操作提示 - 使用 Tooltip 替代直接显示 */}
            <div className="operation-guide">
              <Tooltip
                title={
                  <div>
                    <Typography.Title level={5} style={{ color: 'white', margin: '0 0 8px 0' }}>
                      操作提示：
                    </Typography.Title>
                    <ol style={{ paddingLeft: '16px', margin: 0 }}>
                      <li>1. 点击【登录校园网】按钮，输入工号和密码登录。</li>
                      <li>2. 点击【获取日志】查看未填日志列表。</li>
                      <li>3. 核对日志内容并补充信息后【保存到校园网】。</li>
                    </ol>
                    <Typography.Title level={5} style={{ color: 'white', margin: '16px 0 8px 0' }}>
                      安全提示：
                    </Typography.Title>
                    <ul style={{ paddingLeft: '16px', margin: 0 }}>
                      <li>1. 本站服务端不会以任何形式记录用户校园网密码。</li>
                      <li>2. 密码的明文会随登录流程发送给校园网。</li>
                      <li>3. 自动化流程进行中的所有数据，都是从校园网实时抓取。</li>
                      <li>4. 应尽量避免页面多开后提交。</li>
                    </ul>
                  </div>
                }
                placement="left"
                color="#1f1f1f"
                overlayStyle={{ maxWidth: '400px' }}
              >
                <a className="guide-link">
                  <QuestionCircleOutlined className="guide-icon" />
                  <span>操作指南</span>
                </a>
              </Tooltip>

              {/* 添加课程表勘误链接 */}
              <div className="correction-link-container">
                <a
                  className="correction-link"
                  onClick={() =>
                    message.info(
                      '课程表勘误功能正在制作中，敬请期待！目前如发现课程表错误，请直接联系管理员。',
                    )
                  }
                >
                  <EditOutlined className="correction-icon" />
                  <span>课程表勘误</span>
                </a>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* 登录 Modal 组件 */}
      <LoginModal
        ref={loginModalRef}
        jobId={jobId}
        isAdmin={isAdmin}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
};

export default LogAutoMate;
