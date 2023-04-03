import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export const MarkDownArea: React.FC<{ children: string }> = ({ children }) => {
  return <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>;
};

// export default MarkDownArea;
// import React from 'react';
// import ReactMarkdown, { Components } from 'react-markdown';
// import SyntaxHighlighter from 'react-syntax-highlighter';
// import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/hljs';
// import remarkGfm from 'remark-gfm';

// interface Props {
//   children: string;
// }

// export const MarkDownArea: React.FC<Props> = ({ children }) => {
//   const components: Components = {
//     code: ({ language, value }: { language: string; value: string }) => {
//       return (
//         <SyntaxHighlighter language={language} style={tomorrow}>
//           {value}
//         </SyntaxHighlighter>
//       );
//     },
//   };

//   return (
//     <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
//       {children}
//     </ReactMarkdown>
//   );
// };

// export default MarkDownArea;
