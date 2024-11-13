import { Button, Card, Divider, Flex, Form, Input, Radio, Space, Tooltip, Typography } from 'antd';
import React, { useEffect } from 'react';

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
};

const TeachingLogCard: React.FC<TeachingLogCardProps> = ({
  teaching_date,
  week_number,
  day_of_week,
  lesson_hours,
  section_id,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  section_name,
  course_content,
  homework_assignment,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  topic_record,
  className,
  courseName,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    console.log('form use');
    form.setFieldsValue({ course_content, homework_assignment });
  }, [form, course_content, homework_assignment]);

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
            {section_id}节
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
            <Button>清空</Button>
            <Button type="primary">保存</Button>
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
            initialValue={course_content}
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
            initialValue={homework_assignment}
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
