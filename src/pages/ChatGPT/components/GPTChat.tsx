import { chat } from '@/services/ant-design-pro/chat';
import { ClearOutlined, HistoryOutlined, SendOutlined, UndoOutlined } from '@ant-design/icons';
import { Button, Card, Col, Input, message, Row, Space } from 'antd';
import React, { useEffect, useState } from 'react';
import ChatBubble from './ChatBubble';
import SliderWithInfo from './SliderWithInfo';

export const GPTChat: React.FC = () => {
  const initMessage = [
    { role: 'system', content: 'You are a helpful assistant.' },
    // {"role": "user", "content": "Who won the world series in 2020?"},
    // {"role": "assistant", "content": "The Los Angeles Dodgers won the World Series in 2020."},
    // {"role": "user", "content": "Where was it played?"}
  ];

  const initChatValue = {
    model: 'gpt-3.5-turbo',
    messages: [...initMessage],
    temperature: 1, // 默认 1，范围0-2 越高答题思路越宽
    top_p: 1, // 默认1，范围 0-2，不要和 temperature 一起修改
    n: 1, //  1 | 最多返回几份答案
    // stream?: false, // 像官网一样流式传输结果
    // stop: null, // 终止流式传输的字符
    max_tokens: 256, // 512 infinite | 最高 2048，太低没用 | 每次最多使用多少 token
    // presence_penalty: 0, //  0 | -2 to 2 | 正值允许创新，负值防止跑题
    // frequency_penalty: 0, //  0 | -2 to 2 | 正值防止逐字重复同一行
    // logit_bias?: any, // map | optional | null 没看懂
    // user?: string // 用户标识符
  };

  const [inputValue, setInputValue] = useState('');
  // const [messages, setMessages] = useState<ChatGPT.messageObj[]>([...initMessage]);
  const [chatValue, setChatValue] = useState<ChatGPT.ChatInt>(initChatValue);

  const [isLoading, setIsLoading] = useState(false);
  const [temperature, setTemperature] = useState<number>(1);
  const [maxTokens, setMaxTokens] = useState<number>(256);

  const handleTempChange = (value: number) => {
    // console.log('Temp value changed:', value);
    setTemperature(value);
  };

  const handleMaxTokensChange = (value: number) => {
    // console.log('MaxTokens value changed:', value);
    setMaxTokens(value);
  };

  const handleClear = () => {
    setChatValue(initChatValue);
  };

  let API_KEY: string | null = null;

  // useEffect 侦测 state 是否变化, 第二个参数是变化列表
  useEffect(() => {
    // console.log(chatValue.messages);
    // 此处用于保证聊天内容改变触发渲染时，保证滚动条在最下
    const container = document.getElementById('card-container');
    container!.scrollTop = container!.scrollHeight;
  }, [chatValue.messages, inputValue, temperature, maxTokens]);

  const handleSubmit = async () => {
    // 用户自定义 API_KEY 功能暂未上线
    // 如果用户未提供自己的 API_KEY 则使用默认提供的 API_KEY
    if (!API_KEY) {
      API_KEY = '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';
    }

    const newChatValue = {
      model: 'gpt-3.5-turbo',
      messages: [...chatValue.messages, { role: 'user', content: inputValue }],
      temperature: temperature, // 默认 1，范围0-2 越高答题思路越宽
      top_p: 1, // 默认1，范围 0-2，不要和 temperature 一起修改
      n: 1, //  1 | 最多返回几份答案
      // stream?: false, // 像官网一样流式传输结果
      // stop: null, // 终止流式传输的字符
      max_tokens: maxTokens, // 512 infinite | 最高 2048，太低没用 | 每次最多使用多少 token
      // presence_penalty: 0, //  0 | -2 to 2 | 正值允许创新，负值防止跑题
      // frequency_penalty: 0, //  0 | -2 to 2 | 正值防止逐字重复同一行
      // logit_bias?: any, // map | optional | null 没看懂
      // user?: string // 用户标识符
    };

    if (inputValue && API_KEY) {
      setInputValue('');
      setChatValue(() => newChatValue);

      try {
        setIsLoading(true);
        const response: any = await chat({
          chatValue: newChatValue,
          API_KEY,
        });
        console.log(response);
        setChatValue(() => {
          return {
            model: 'gpt-3.5-turbo',
            messages: [
              ...chatValue.messages,
              { role: 'user', content: inputValue },
              { role: response.role, content: response.content },
            ],
            temperature: temperature, // 默认 1，范围0-2 越高答题思路越宽
            top_p: 1, // 默认1，范围 0-2，不要和 temperature 一起修改
            n: 1, //  1 | 最多返回几份答案
            // stream?: false, // 像官网一样流式传输结果
            // stop: null, // 终止流式传输的字符
            max_tokens: maxTokens, // 512 infinite | 最高 2048，太低没用 | 每次最多使用多少 token
            // presence_penalty: 0, //  0 | -2 to 2 | 正值允许创新，负值防止跑题
            // frequency_penalty: 0, //  0 | -2 to 2 | 正值防止逐字重复同一行
            // logit_bias?: any, // map | optional | null 没看懂
            // user?: string // 用户标识符
          };
        });
      } catch (error: any) {
        message.error(error.message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // 关于这个参数 messages 很有意思，请看文档后部的讨论
  const ChatCard: React.FC<ChatGPT.ChatCardProps> = ({ messages }) => {
    // 这里的 cm + index 做 key 有隐患
    return (
      <div id="card-container" style={{ margin: '0vh 1vh', height: '70vh', overflow: 'auto' }}>
        <Card style={{ height: '70vh', width: 'auto' }}>
          {messages.map((message, index) => {
            if (message.role === 'system') {
              return <ChatBubble key={'cm' + index} role="system" content={message.content} />;
            } else if (message.role === 'user') {
              return <ChatBubble key={'cm' + index} role="user" content={message.content} />;
            } else if (message.role === 'assistant') {
              return <ChatBubble key={'cm' + index} role="assistant" content={message.content} />;
            } else {
              return null; // 如果role属性不是system/user/assistant，返回null
            }
          })}
        </Card>
      </div>
    );
  };

  return (
    <Row gutter={4}>
      <Col xs={24} sm={24} md={18} lg={18} xl={18}>
        <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
          <Row>
            <Col span={24}>
              <ChatCard messages={chatValue.messages} />
            </Col>
          </Row>
          <Row gutter={16} style={{ margin: '0vh 1vh' }}>
            <Col span={19}>
              <Input.TextArea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                rows={3}
                placeholder="问答轮次越多，消耗的 Api tokens 越快，费用越高，测试期间不对回答轮次进行限制，但请在切换主题时按清空按钮，删除无用问答记录。"
              />
            </Col>
            <Col span={4}>
              <Space direction="horizontal" size="middle" style={{ display: 'flex' }}>
                <Row gutter={16}>
                  <Space direction="vertical" size="small" style={{ display: 'flex' }}>
                    <Button
                      type="primary"
                      icon={<SendOutlined />}
                      style={{ flexShrink: 0 }}
                      onClick={handleSubmit}
                      loading={isLoading}
                    >
                      发送
                    </Button>
                    <Button
                      disabled
                      type="primary"
                      icon={<UndoOutlined />}
                      style={{ flexShrink: 0 }}
                      onClick={handleSubmit}
                    >
                      回撤
                    </Button>
                  </Space>
                </Row>
                <Row>
                  <Space direction="vertical" size="small" style={{ display: 'flex' }}>
                    <Button
                      danger
                      type="primary"
                      icon={<ClearOutlined />}
                      style={{ flexShrink: 0 }}
                      onClick={handleClear}
                    >
                      清空
                    </Button>
                    <Button
                      disabled
                      type="primary"
                      icon={<HistoryOutlined />}
                      style={{ flexShrink: 0 }}
                      onClick={handleSubmit}
                    >
                      历史
                    </Button>
                  </Space>
                </Row>
              </Space>
            </Col>
          </Row>
        </Space>
      </Col>
      <Col xs={0} sm={0} md={5} lg={5} xl={5}>
        <Card>
          <SliderWithInfo
            label="Temperature"
            min={0}
            max={2}
            defaultValue={temperature}
            step={0.1}
            description={'数值越高答题思路越发散，默认 1'}
            onChange={handleTempChange}
          />
          <SliderWithInfo
            label="Maximum length"
            min={128}
            max={1024}
            defaultValue={maxTokens}
            description={'数值越高可能的 API Tokens 消耗越大，对长回答更友好，默认 256'}
            step={128}
            onChange={handleMaxTokensChange}
          />
        </Card>
      </Col>
    </Row>
  );
};
