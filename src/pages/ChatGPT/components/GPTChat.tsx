import { chat } from '@/services/ant-design-pro/chat';
import { ClearOutlined, HistoryOutlined, SendOutlined, UndoOutlined } from '@ant-design/icons';
import { Button, Card, Col, Input, Row, Space } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import ChatBubble from './ChatBubble';
import './github-dark.css';
import SliderWithInfo from './SliderWithInfo';

export const GPTChat: React.FC = () => {
  const initMessage = [
    // { role: 'system', content: 'You are a teaching assistant for a python class, and you are currently taking the course, If someone were to ask u about any other programming language, I would inform them that this is a Python course and that I am not equipped to help with questions related to other languages.' },
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

  // 输入框内容
  const [inputValue, setInputValue] = useState<string>('');
  // 完整的聊天参数
  const [chatValue, setChatValue] = useState<ChatGPT.ChatInterface>(initChatValue);
  // 是否加载中
  const [isLoading, setIsLoading] = useState(false);
  const [temperature, setTemperature] = useState<number>(1);
  const [maxTokens, setMaxTokens] = useState<number>(384);

  const handleTempChange = (value: number) => {
    setTemperature(value);
  };

  const handleMaxTokensChange = (value: number) => {
    setMaxTokens(value);
  };

  let API_KEY: string | null = null;

  // useEffect 侦测 state 是否变化, 第二个参数是变化列表
  useEffect(() => {
    // console.log(chatValue.messages);
    // 此处用于保证聊天内容改变触发渲染时，保证滚动条在最下
    const container = document.getElementById('card-container');
    container!.scrollTop = container!.scrollHeight;
  }, [chatValue.messages, inputValue, temperature, maxTokens]);

  const createNewChatValue = (messages: ChatGPT.messageObj[]) => ({
    model: 'gpt-3.5-turbo',
    messages: [...chatValue.messages, ...messages],
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
  });

  // 用一个递归函数，删除最后一轮对话，并把最后一轮对话中的提问部分放回 input 框
  const handleUndo = () => {
    // = (len : number) => { ... } 这一行是变量的赋值语句，给函数变量 rollback 赋值了一个匿名函数，
    // 该匿名函数接受一个 len 参数，返回值为 void，实现了 rollback 的功能。
    // 这一行的意义是声明并赋值了一个函数变量，并且规定了该函数变量可以接受的参数类型和返回值类型。
    const rollback: (len: number) => void = (len: number) => {
      const unDoMessage: ChatGPT.messageObj | null = chatValue.messages[len - 1];
      // 如果对话长度为 0，或者已经回退到系统级 prompt 则终止递归
      if (len === 0 || unDoMessage.role === 'system') {
        return;
      }

      chatValue.messages.pop();

      if (unDoMessage.role === 'user') {
        setInputValue(unDoMessage.content);
        return;
      } else {
        return rollback(len - 1);
      }
    };

    const messagesLen: number = chatValue.messages.length;
    rollback(messagesLen);

    const newMessages = chatValue.messages;
    setChatValue((prevChatValue) => ({ ...prevChatValue, newMessages }));
  };

  const handleClear = () => {
    setChatValue(initChatValue);
  };

  const handleSubmit = async () => {
    // 用户自定义 API_KEY 功能暂未上线
    // 如果用户未提供自己的 API_KEY 则后台会使用默认提供的 API_KEY

    const newMessages = [{ role: 'user', content: inputValue }];
    const newChatValue = createNewChatValue(newMessages);

    if (inputValue) {
      setInputValue('');
      setChatValue(newChatValue);

      try {
        setIsLoading(true);
        const response: any = await chat({
          chatValue: newChatValue,
          API_KEY,
        });
        // console.log(response);
        setChatValue(() => {
          const resMessage = response.data.message;
          const resUsage = response.data.usage.total_tokens;
          console.log('消耗 token：', resUsage);
          const newMessages = [
            { role: 'user', content: inputValue },
            { role: resMessage.role, content: resMessage.content },
          ];
          const newChatValue = createNewChatValue(newMessages);
          return newChatValue;
        });
      } catch (error: any) {
        // message.error(error.message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // 根据 messages 数组，生成问答式的对话界面
  const ChatCard: React.FC<ChatGPT.ChatProps> = React.memo(({ messages }) => {
    // 这里的 cm + index 做 key 有隐患
    // console.log(messages);
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
  });

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    // console.log(e);
    setInputValue(e.target.value);
  }, []);

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
                onChange={handleInputChange}
                rows={3}
                placeholder="问答轮次越多，消耗的 Api tokens 越快，费用越高，测试期间对回答轮次限制在 7 轮以内，建议在切换主题时按清空按钮，删除无用问答记录。"
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
                    <Button icon={<UndoOutlined />} style={{ flexShrink: 0 }} onClick={handleUndo}>
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
            description={`数值越高可能的 API Tokens 消耗越大，对长回答更友好，默认 384`}
            step={128}
            onChange={handleMaxTokensChange}
          />
        </Card>
      </Col>
    </Row>
  );
};
