import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export const MarkDownArea: React.FC<{ children: string }> = ({ children }) => {
  return <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>;
};

// export default MarkDownArea;
