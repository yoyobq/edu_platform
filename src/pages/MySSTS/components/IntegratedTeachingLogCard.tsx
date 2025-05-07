import { QuestionCircleOutlined } from '@ant-design/icons';
import {
  Button,
  Card,
  Divider,
  Flex,
  Form,
  Input,
  message,
  Modal,
  Radio,
  Space,
  Tooltip,
  Typography,
} from 'antd';
import React, { useEffect, useState } from 'react';

const { Text } = Typography;
const chineseNumbers = [
  '〇',
  '一',
  '二',
  '三',
  '四',
  '五',
  '六',
  '七',
  '八',
  '九',
  '十',
  '十一',
  '十二',
  '十三',
  '十四',
  '十五',
  '十六',
  '十七',
  '十八',
  '十九',
  '二十',
  '二十一',
  '二十二',
  '二十三',
  '二十四',
  '二十五',
];

// 班次选项
const shiftOptions = [
  { label: '早班', value: '1' },
  { label: '中班', value: '2' },
  { label: '常日班', value: '3' },
];

type IntegratedTeachingLogCardProps = {
  teaching_date?: string;
  week_number: string;
  day_of_week: string;
  listening_teacher_id?: string;
  guidance_teacher_id?: string;
  listening_teacher_name?: string;
  lesson_hours?: number;
  section_id?: string;
  journal_type?: number;
  shift?: string;
  problem_and_solve?: string;
  complete_and_summary?: string;
  discipline_situation?: string;
  security_and_maintain?: string;
  lecture_plan_detail_id?: string;
  lecture_journal_detail_id?: string;
  production_project_title?: string;
  teaching_class_id?: string;
  className?: string;
  courseName?: string;
  onSubmitTeachingLog?: (teachingLogData: any) => Promise<void>;
};

const delay = (ms: number | undefined) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const IntegratedTeachingLogCard: React.FC<IntegratedTeachingLogCardProps> = ({
  teaching_date,
  week_number,
  day_of_week,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  listening_teacher_name,
  lesson_hours,
  section_id,
  shift,
  problem_and_solve,
  complete_and_summary,
  discipline_situation,
  security_and_maintain,
  teaching_class_id,
  className,
  courseName,
  onSubmitTeachingLog,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    form.setFieldsValue({
      problem_and_solve,
      complete_and_summary,
      discipline_situation,
      security_and_maintain,
      shift,
    });
  }, [
    form,
    problem_and_solve,
    complete_and_summary,
    discipline_situation,
    security_and_maintain,
    shift,
  ]);

  const confirmChange = async (
    field: string,
    currentValue: any,
    originalValue: any,
    resetFn: () => void,
  ) => {
    return new Promise<boolean>((resolve) => {
      if (currentValue !== originalValue) {
        Modal.confirm({
          title: `${field}被改动`,
          content: `检测到您修改了${field}，是否确认保存更改？`,
          okText: '确认修改',
          cancelText: '数据回滚',
          onCancel: () => {
            resetFn(); // 取消时重置为原始值
            resolve(false);
          },
          onOk: () => resolve(true),
          style: { right: '5vw', top: '15vh', position: 'absolute' }, // 靠右显示
        });
      } else {
        resolve(true);
      }
    });
  };

  // 上传数据到校园网的函数
  const uploadToSSTS = async () => {
    const hide = message.loading('正在向校园网提交一体化教学日志，请稍候...', 0);
    setLoading(true);
    // 获取表单中的最新数据
    const formValues = form.getFieldsValue();

    try {
      // 第一轮比较 `problem_and_solve`
      const problemConfirmed = await confirmChange(
        '问题与解决方案',
        formValues.problem_and_solve,
        problem_and_solve,
        () => form.setFieldsValue({ problem_and_solve }),
      );

      if (!problemConfirmed) {
        message.warning('问题与解决方案已恢复至教学计划一致。');
        return; // 若取消则退出
      }

      // 第二轮比较 `complete_and_summary`
      const completeConfirmed = await confirmChange(
        '完成情况与总结',
        formValues.complete_and_summary,
        complete_and_summary,
        () => form.setFieldsValue({ complete_and_summary }),
      );

      if (!completeConfirmed) {
        message.warning('完成情况与总结已恢复至教学计划一致。');
        return; // 若取消则退出
      }

      // 第三轮比较 `discipline_situation`
      const disciplineConfirmed = await confirmChange(
        '纪律情况',
        formValues.discipline_situation,
        discipline_situation,
        () => form.setFieldsValue({ discipline_situation }),
      );

      if (!disciplineConfirmed) {
        message.warning('纪律情况已恢复至教学计划一致。');
        return; // 若取消则退出
      }

      // 第四轮比较 `security_and_maintain`
      const securityConfirmed = await confirmChange(
        '安全与保养',
        formValues.security_and_maintain,
        security_and_maintain,
        () => form.setFieldsValue({ security_and_maintain }),
      );

      if (!securityConfirmed) {
        message.warning('安全与保养已恢复至教学计划一致。');
        return; // 若取消则退出
      }

      // 所有确认通过后，组织数据并上传
      const teachingLogData = {
        teaching_class_id,
        teaching_date,
        week_number,
        day_of_week,
        lesson_hours,
        section_id,
        journal_type: 3, // 确保 journal_type 是 number 类型
        shift: formValues.shift,
        problem_and_solve: formValues.problem_and_solve,
        complete_and_summary: formValues.complete_and_summary,
        discipline_situation: formValues.discipline_situation,
        security_and_maintain: formValues.security_and_maintain,
      };

      // 进行上传逻辑
      if (onSubmitTeachingLog) {
        await onSubmitTeachingLog(teachingLogData);
        console.log('上传到校园网的数据:', teachingLogData);
      } else {
        message.success('测试模式：数据已准备好，但未上传');
        console.log('测试数据:', teachingLogData);
      }
    } catch (error) {
      // 此处只能处理智能平台宕机或网络出错导致的上传失败
      message.error('日志信息上传失败，请稍后再试');
    } finally {
      hide();
      await delay(500);
      setLoading(false);
    }
  };

  return (
    <Card
      style={{
        marginBottom: '8px', // 增加卡片之间的间距
        marginRight: '8px', // 设置卡片与左侧滚动条的距离
        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)', // 增加卡片阴影
        borderRadius: '8px', // 设置卡片圆角
        border: '1px solid #f0f0f0', // 增加浅色边框
      }}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          problem_and_solve,
          complete_and_summary,
          discipline_situation,
          security_and_maintain,
          shift,
        }}
      >
        <Flex gap="middle" justify="space-between" align="flex-end">
          <Text strong style={{ color: '#2d3e50' }}>
            第{chineseNumbers[parseInt(week_number)]}周 星期{chineseNumbers[parseInt(day_of_week)]}{' '}
            {section_id ? `${section_id}节` : ''}
            <Tooltip title="如果是不连续的多次课程组成一个教学环节，仅显示该环节首次开课时的节次安排">
              <QuestionCircleOutlined
                style={{ fontSize: '14px', color: '#FA8C16', paddingLeft: '0.5vw' }}
              />
            </Tooltip>
          </Text>
          <Text style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#FA8C16' }}>
            <Space size="large">
              {className}
              <Tooltip title={courseName}>
                <span>{courseName ? courseName.slice(8) : null}</span>
              </Tooltip>
            </Space>
          </Text>
          <Text style={{ color: '#2d3e50' }}>
            <Space>
              <Text strong>开课日期: </Text>
              <Text>{teaching_date}</Text>
              <Text strong>课时数: </Text>
              <Text style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#ff4d4f' }}>
                {lesson_hours}
              </Text>
              {/* <Text strong>听课教师: </Text>
              <Text>{listening_teacher_name}</Text> */}
            </Space>
          </Text>
          <Space>
            <Button
              type="primary"
              onClick={uploadToSSTS}
              loading={loading}
              disabled={loading}
              style={{ backgroundColor: '#FA8C16', borderColor: '#FA8C16' }}
            >
              保存到校园网
            </Button>
          </Space>
        </Flex>

        <Divider style={{ margin: '12px 0' }} />

        <Flex justify="flex-start" wrap="wrap" gap="middle">
          <Form.Item
            label="问题与解决方案"
            name="problem_and_solve"
            rules={[{ required: true, message: '请输入问题与解决方案' }]}
            style={{ width: '48%' }}
          >
            <Input.TextArea
              maxLength={200}
              placeholder="输入问题与解决方案"
              autoSize={{ minRows: 2 }}
            />
          </Form.Item>

          <Form.Item
            label="完成情况与总结"
            name="complete_and_summary"
            rules={[{ required: true, message: '请输入完成情况与总结' }]}
            style={{ width: '48%' }}
          >
            <Input.TextArea
              maxLength={200}
              placeholder="输入完成情况与总结"
              autoSize={{ minRows: 2 }}
            />
          </Form.Item>
        </Flex>

        <Flex justify="flex-start" wrap="wrap" gap="middle">
          <Form.Item
            label="纪律情况"
            name="discipline_situation"
            rules={[{ required: true, message: '请输入纪律情况' }]}
            style={{ width: '30%' }}
          >
            <Input.TextArea maxLength={100} placeholder="输入纪律情况" autoSize={{ minRows: 1 }} />
          </Form.Item>

          <Form.Item
            label="安全与保养"
            name="security_and_maintain"
            rules={[{ required: true, message: '请输入安全与保养情况' }]}
            style={{ width: '30%' }}
          >
            <Input.TextArea
              maxLength={100}
              placeholder="输入安全与保养情况"
              autoSize={{ minRows: 1 }}
            />
          </Form.Item>

          <Form.Item
            label="班次"
            name="shift"
            rules={[{ required: true, message: '请选择班次' }]}
            style={{ width: '30%' }}
          >
            <Radio.Group buttonStyle="solid" size="small">
              {shiftOptions.map((option) => (
                <Radio.Button key={option.value} value={option.value}>
                  {option.label}
                </Radio.Button>
              ))}
            </Radio.Group>
          </Form.Item>
        </Flex>
      </Form>
    </Card>
  );
};

export default IntegratedTeachingLogCard;
