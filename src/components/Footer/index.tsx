import { DefaultFooter } from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';
import React from 'react';

const Footer: React.FC = () => {
  const intl = useIntl();
  const defaultMessage = intl.formatMessage({
    id: 'app.copyright.produced',
    defaultMessage: '江苏省苏州技师学院 信息工程系',
  });

  const currentYear = new Date().getFullYear();

  return (
    <DefaultFooter
      style={{
        background: 'none',
        position: 'fixed',
        bottom: 0,
        width: '100%',
        margin: 0,
        marginBlockStart: 0,
        marginBlockEnd: 0,
        fontSize: '14px',
        color: 'rgba(0, 0, 0, 0.65)',
        fontWeight: 400,
        textAlign: 'center',
        padding: '12px 0',
        // backdropFilter: 'blur(8px)',
        // backgroundColor: 'rgba(255, 255, 255, 0.6)',
        // boxShadow: '0 -1px 2px rgba(0, 0, 0, 0.03)',
      }}
      copyright={`${currentYear} ${defaultMessage} - 智能教辅平台`}
      links={
        [
          // {
          //   key: 'Ant Design Pro',
          //   title: 'Ant Design Pro',
          //   href: 'https://pro.ant.design',
          //   blankTarget: true,
          // },
          // {
          //   key: 'github',
          //   title: <GithubOutlined />,
          //   href: 'https://github.com/ant-design/ant-design-pro',
          //   blankTarget: true,
          // },
          // {
          //   key: 'Ant Design',
          //   title: 'Ant Design',
          //   href: 'https://ant.design',
          //   blankTarget: true,
          // },
        ]
      }
    />
  );
};

export default Footer;
