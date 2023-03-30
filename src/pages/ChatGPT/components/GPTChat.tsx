// import { chat } from '@/services/ant-design-pro/chat';
import { Button, Card, Col, Input, Row, Space } from 'antd';
import React, { useState } from 'react';
import ChatBubble from './ChatBubble';

export const GPTChat: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  // const [markdownText, setMarkdownText] = useState('请愉快体会 **科学** 和 **聊天**。')

  // let API_KEY: string | null = null;

  // const handleSubmit = async () => {

  //   // 此功能暂未上线
  //   // 如果用户未提供自己的 API_KEY 则使用默认提供的 API_KEY
  //   if (!API_KEY) {
  //     API_KEY = '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';
  //   }
  //   let mode = 'chat';

  //   if (inputValue && API_KEY && mode) {
  //     setInputValue('');
  //     // 此处涉及到一个 state 是快照造成的数据更新问题
  //     // 可以利用变量的批处理解决，详见我写的 React 教程新手村 4，5两章
  //     setMarkdownText(markdownText => markdownText + '\n\nQ:' + inputValue);
  //     try {
  //       const response: any = await chat({ inputValue, API_KEY, mode});
  //       setMarkdownText(markdownText => markdownText + '\n\nA:' + response);
  //     } catch (error:any) {
  //       message.error(error.message);
  //     }
  //   }
  // };

  return (
    <Row gutter={16}>
      <Col span={16}>
        <Space direction="vertical" size="large">
          <Card style={{ height: '60vh', overflow: 'auto' }}>
            <ChatBubble role="system" content="### 系统级别提示，用于确定会话的大前提." />
            <ChatBubble role="user" content="**Hello!**"></ChatBubble>
            <ChatBubble role="assistant" content="*Hi!*"></ChatBubble>
            <ChatBubble
              role="user"
              content="**Hello!** I'm a user message.**Hello!** I'm a user message.**Hello!** I'm a user message.**Hello!** I'm a user message.**Hello!** I'm a user message.**Hello!** I'm a user message."
            />
            <ChatBubble
              role="assistant"
              content="*Hi!* I'm an assistant message.*Hi!* I'm an assistant message.*Hi!* I'm an assistant message.*Hi!* I'm an assistant message.*Hi!* I'm an assistant message.*Hi!* I'm an assistant message."
            />
          </Card>
          <Row gutter={16}>
            <Col span={22}>
              <Input.TextArea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                rows={2}
              />
            </Col>
            <Col span={2}>
              <Button
                type="primary"
                style={{ flexShrink: 0 }}
                // onClick={handleSubmit}
              >
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
        <Card>card</Card>
      </Col>
    </Row>
  );
};

export default GPTChat;
