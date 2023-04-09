import { textGen } from '@/services/ant-design-pro/chat';
import { Button, Card, Col, Input, message, Row, Space, Tabs } from 'antd';
import React, { useState } from 'react';
import { MarkDownArea } from './MarkdownArea';

export const TextDavinci: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [markdownText, setMarkdownText] = useState(
    '基于 OPEN AI 的 text-davinci-003，适用文本生成。',
  );

  let API_KEY: string | null = null;

  const handleSubmit = async () => {
    // 此功能暂未上线
    // 如果用户未提供自己的 API_KEY 则使用默认提供的 API_KEY

    let mode = 'complete';
    // let mode = 'chat';

    if (inputValue && mode) {
      setInputValue('');
      // 此处涉及到一个 state 是快照造成的数据更新问题
      // 可以利用变量的批处理解决，详见我写的 React 教程新手村 4，5两章
      setMarkdownText((markdownText) => markdownText + '\n\nQ:' + inputValue);
      try {
        const response: any = await textGen({ inputValue, API_KEY, mode });
        setMarkdownText((markdownText) => markdownText + '\n\nA:' + response);
      } catch (error: any) {
        message.error(error.message);
      }
    }
  };

  return (
    <Row gutter={16}>
      <Col span={16}>
        <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
          <MarkDownArea>{markdownText}</MarkDownArea>
          <Row gutter={16}>
            <Col span={22}>
              <Input.TextArea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                rows={2}
              />
            </Col>
            <Col span={2}>
              <Button type="primary" style={{ flexShrink: 0 }} onClick={handleSubmit}>
                发送
              </Button>
            </Col>
          </Row>
        </Space>
      </Col>
      <Col
        span={6}
        // style={{ minWidth: 240 }}
      >
        <Card>
          <Tabs
            size="small"
            defaultActiveKey="chatgpt"
            items={[
              {
                label: 'ChatGPT',
                key: 'chatgpt',
                children: 'Tab 1',
              },
              {
                label: '预置提示词',
                key: 'prompt',
                children: 'Tab 2',
                // disabled: true,
              },
              {
                label: '管理对话',
                key: 'saveAndLoad',
                children: 'Tab 3',
              },
            ]}
          />
        </Card>
      </Col>
    </Row>
  );
};

// export default MarkDownArea;
