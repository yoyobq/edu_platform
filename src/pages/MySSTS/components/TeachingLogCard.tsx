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

type TeachingLogCardProps = {
  teaching_class_id: string;
  teaching_date: string;
  week_number: string;
  day_of_week: string;
  lesson_hours: number;
  course_content: string;
  homework_assignment: string;
  topic_record: string;
  section_id: string;
  section_name: string;
  journal_type: string;
  className: string;
  courseName: string;
  onSubmitTeachingLog: (teachingLogData: TeachingLogData) => Promise<void>;
};

const delay = (ms: number | undefined) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const TeachingLogCard: React.FC<TeachingLogCardProps> = ({
  teaching_class_id,
  teaching_date,
  week_number,
  day_of_week,
  lesson_hours,
  section_id,
  section_name,
  course_content,
  homework_assignment,
  journal_type,
  className,
  courseName,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onSubmitTeachingLog,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    form.setFieldsValue({ course_content, homework_assignment });
  }, [form, course_content, homework_assignment]);

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
    const hide = message.loading('正在向校园网提交课程日志，请稍候...', 0);
    setLoading(true);
    // 获取表单中的最新数据
    const formValues = form.getFieldsValue();

    try {
      // 第一轮比较 `course_content`
      const courseConfirmed = await confirmChange(
        '课程内容',
        formValues.course_content,
        course_content,
        () => form.setFieldsValue({ course_content }),
      );

      if (!courseConfirmed) {
        message.warning('课程内容已恢复至教学计划一致。');
        return; // 若取消则退出
      }
      // 第二轮比较 `homework_assignment`
      const homeworkConfirmed = await confirmChange(
        '作业布置情况',
        formValues.homework_assignment,
        homework_assignment,
        () => form.setFieldsValue({ homework_assignment }),
      );

      if (!homeworkConfirmed) {
        message.warning('作业布置情况已恢复至教学计划一致。');
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
        section_name,
        journal_type,
        // 虽然有简便写法，但这么写更容易阅读
        //...formValues
        topic_record: formValues.topic_record,
        homework_assignment: formValues.homework_assignment || '无',
        course_content: formValues.course_content,
      };
      // 模拟上传逻辑
      console.log(teachingLogData);
      // await onSubmitTeachingLog(teachingLogData);
      // console.log('上传到校园网的数据:', teachingLogData);
      // message.success('数据已成功上传到校园网');
    } catch (error) {
      message.error('上传失败，请稍后再试');
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
      <Form form={form} layout="vertical" initialValues={{ course_content, homework_assignment }}>
        <Flex gap="middle" justify="space-between" align="flex-end">
          <Text strong style={{ color: '#2d3e50' }}>
            第{chineseNumbers[parseInt(week_number)]}周 星期{chineseNumbers[parseInt(day_of_week)]}{' '}
            {section_name ? ` ${section_id}节` : ''}
          </Text>
          <Text style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#3A5FCD' }}>
            <Space size="large">
              {className}
              <Tooltip title={courseName}>
                <span>{courseName ? courseName.slice(8) : null}</span>
              </Tooltip>
            </Space>
          </Text>
          <Text style={{ color: '#2d3e50' }}>
            <Space>
              <Text strong>上课日期: </Text>
              <Text>{teaching_date}</Text>
              <Text strong>课时数: </Text>
              <Text style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#ff4d4f' }}>
                {lesson_hours}
              </Text>
            </Space>
          </Text>
          <Space>
            <Button type="primary" onClick={uploadToSSTS} loading={loading} disabled={loading}>
              保存到校园网
            </Button>
            <Button type="primary" hidden danger>
              提交
            </Button>
          </Space>
        </Flex>

        <Divider style={{ margin: '12px 0' }} />

        <Flex justify="flex-start">
          <Form.Item
            label="课程内容"
            name="course_content"
            // initialValue={course_content}
            rules={[{ required: true, message: '请输入课程内容' }]}
            // style={{width: '30vw'}}
          >
            <Input.TextArea
              maxLength={200}
              placeholder="输入课程内容"
              autoSize={{ minRows: 1 }}
              style={{ width: '30vw', marginRight: '1vw' }}
            />
          </Form.Item>

          <Form.Item
            label="作业布置情况"
            name="homework_assignment"
            // initialValue={homework_assignment}
            rules={[{ required: true, message: '请输入作业布置情况' }]}
          >
            <Input.TextArea
              maxLength={200}
              placeholder="输入作业布置情况"
              autoSize={{ minRows: 1 }}
              style={{ width: '10vw', marginRight: '1vw' }}
            />
          </Form.Item>

          <Form.Item
            label="课堂情况记录"
            name="topic_record"
            initialValue="优" // 默认选中“良”
            rules={[{ required: true }]}
          >
            <Radio.Group
              buttonStyle="solid"
              size="small"
              // style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}
            >
              <Radio.Button value="优">优</Radio.Button>
              <Radio.Button value="良">良</Radio.Button>
              <Radio.Button value="好">好</Radio.Button>
              <Radio.Button value="正常">正常</Radio.Button>
              <Radio.Button value="一般">一般</Radio.Button>
            </Radio.Group>
          </Form.Item>
        </Flex>
      </Form>
    </Card>
  );
};

export default TeachingLogCard;
