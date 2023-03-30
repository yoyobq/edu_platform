/* eslint-disable @typescript-eslint/no-unused-vars */

import { PageContainer } from '@ant-design/pro-components';

import { Tabs } from 'antd';
import React from 'react';
import { GPTChat } from './components/GPTChat';
import { TextDavinci } from './components/TextDavinci';

const ChatGPT: React.FC = () => {
  /**
   * @en-US International configuration
   * @zh-CN 国际化配置
   * */
  // const intl = useIntl();

  return (
    <PageContainer>
      <Tabs
        size="large"
        defaultActiveKey="textGen"
        items={[
          {
            label: 'GPT 聊天',
            key: 'chatgpt',
            children: <GPTChat />,
          },
          {
            label: '文本生成',
            key: 'textGen',
            children: <TextDavinci />,
            // disabled: true,
          },
        ]}
      />
    </PageContainer>
  );
};

export default ChatGPT;
