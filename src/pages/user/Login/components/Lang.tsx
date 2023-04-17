/**
 * 页面右上方的语言切换按钮
 */
import { useEmotionCss } from '@ant-design/use-emotion-css';
import { SelectLang } from '@umijs/max';

export const Lang: React.FC = () => {
  const langClassName = useEmotionCss(({ token }) => {
    return {
      width: 42,
      height: 42,
      lineHeight: '42px',
      position: 'fixed',
      right: 16,
      borderRadius: token.borderRadius,
      ':hover': {
        backgroundColor: token.colorBgTextHover,
      },
    };
  });

  return (
    <div className={langClassName} data-lang>
      {SelectLang && <SelectLang />}
    </div>
  );
};
