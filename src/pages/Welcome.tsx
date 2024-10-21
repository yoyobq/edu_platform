import { PageContainer } from '@ant-design/pro-components';
import { useModel } from '@umijs/max';
import { Card, theme } from 'antd';
import React from 'react';

/**
 * 每个单独的卡片，为了复用样式抽成了组件
 * @param param0
 * @returns
 */
const InfoCard: React.FC<{
  title: string;
  index: number;
  desc: string;
  href: string;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
}> = ({ title, href, index, desc }) => {
  const { useToken } = theme;

  const { token } = useToken();

  return (
    <div
      style={{
        backgroundColor: token.colorBgContainer,
        boxShadow: token.boxShadow,
        borderRadius: '8px',
        fontSize: '14px',
        color: token.colorTextSecondary,
        lineHeight: '22px',
        padding: '16px 19px',
        minWidth: '220px',
        flex: 1,
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: '4px',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            lineHeight: '22px',
            backgroundSize: '100%',
            textAlign: 'center',
            padding: '8px 16px 16px 12px',
            color: '#FFF',
            fontWeight: 'bold',
            backgroundImage:
              "url('https://gw.alipayobjects.com/zos/bmw-prod/daaf8d50-8e6d-4251-905d-676a24ddfa12.svg')",
          }}
        >
          {index}
        </div>
        <div
          style={{
            fontSize: '16px',
            color: token.colorText,
            paddingBottom: 8,
          }}
        >
          {title}
        </div>
      </div>
      <div
        style={{
          fontSize: '14px',
          color: token.colorTextSecondary,
          textAlign: 'justify',
          lineHeight: '22px',
          marginBottom: 8,
        }}
      >
        {desc}
      </div>
      <a href={href} target="_blank" rel="noreferrer">
        了解更多 {'>'}
      </a>
    </div>
  );
};

const Welcome: React.FC = () => {
  // 主题配色信息
  const { token } = theme.useToken();

  // 获取用户的全局初始化信息
  const { initialState } = useModel('@@initialState');
  return (
    <PageContainer>
      <Card
        style={{
          borderRadius: 8,
          backgroundImage:
            initialState?.settings?.navTheme === 'realDark'
              ? 'linear-gradient(75deg, #1A1B1F 0%, #191C1F 100%)'
              : 'linear-gradient(75deg, #FBFDFF 0%, #F5F7FF 100%)',
        }}
      >
        <div
          style={{
            backgroundPosition: '100% -30%',
            backgroundRepeat: 'no-repeat',
            backgroundSize: '274px auto',
            backgroundImage:
              "url('https://gw.alipayobjects.com/mdn/rms_a9745b/afts/img/A*BuFmQqsB2iAAAAAAAAAAAAAAARQnAQ')",
          }}
        >
          <div
            style={{
              fontSize: '20px',
              color: token.colorTextHeading,
            }}
          >
            欢迎使用 Edu Platform
          </div>
          <div
            style={{
              fontSize: '14px',
              color: token.colorTextSecondary,
              lineHeight: '22px',
              marginTop: 16,
              marginBottom: 32,
              width: '65%',
              fontWeight: 500,
            }}
          >
            <div style={{ marginBottom: 16 }}>
              Edu Platform
              是一个试图整合江苏省苏州技师学院内部信息，展示信息工程系技术实力，并示范如何真正的利用计算机科学实现信息化的综合性智能平台。
            </div>
            <div>
              我们的愿景是致力于提炼出『教学』、『教育』和『教辅』工作中的典型业务场景并采用信息化手段优化工作流程，为『学生』、『教师』和『教工』服务，提升处理和解决各类学校事务过程中的体验。
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 16,
            }}
          >
            <InfoCard
              index={1}
              href="#"
              title="如果您是学生"
              desc="Edu Platform 致力于更好地展示教学过程及教学内容，提供便捷多样的专业问答、知识辅导，并提供方便监测自己的学习进度和学习成果的工具。"
            />
            <InfoCard
              index={2}
              title="如果您是教师"
              href="#"
              desc="Edu Platform 会帮助您规划、设计、展示您的教学内容，并利用信息化工具将您从重复的无谓劳动中解脱出来，让您有更多的精力为真正的教学服务。"
            />
            <InfoCard
              index={3}
              title="如果您是教工"
              href="#"
              desc="Edu Platform 的目标是更好地搜集整合有关学院方方面面的各类信息并作合理的梳理，在此基础上提供便捷地查看、搜索和处理功能。"
            />
          </div>
        </div>
      </Card>
    </PageContainer>
  );
};

export default Welcome;
