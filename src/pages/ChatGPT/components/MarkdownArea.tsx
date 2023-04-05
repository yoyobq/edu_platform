import hljs from 'highlight.js';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './MarkdownArea.css';
// import "./github-dark.css";

export const MarkDownArea: React.FC<{ children: string }> = ({ children }) => {
  // console.log(children);
  const splitMarkdown = (markdownStr: string): { content: string; type?: string }[] => {
    // 使用正则表达式匹配代码块
    const pattern = /(```[\s\S]*?```)/g;
    const codeBlocks = markdownStr.match(pattern) || [];

    // 将字符串按代码块分段
    let segments: { content: string; language?: string }[] = [];
    let lastIndex = 0;
    for (const codeBlock of codeBlocks) {
      const startIndex = markdownStr.indexOf(codeBlock, lastIndex);
      const endIndex = startIndex + codeBlock.length;

      // 将代码块前面的文本作为一个段落添加到结果数组
      if (startIndex > lastIndex) {
        segments.push({
          content: markdownStr.substring(lastIndex, startIndex),
          language: 'string',
        });
      }

      try {
        const codeObj = codeBlock.match(/^```(\w+)?\n([\s\S]+?)\n```$/m);
        // 截取 ``` 和 /n 之间的字符（编程语言）
        // 如果不存在，就记录 unknown
        const language = codeObj && codeObj[1] ? codeObj[1] : 'unknown';
        const code = codeObj![2];
        // 将代码块作为一个段落添加到结果数组
        segments.push({ content: code, language });
        lastIndex = endIndex;
      } catch (error) {
        console.log(error);
      }
    }

    // 将代码块后面的文本作为一个段落添加到结果数组
    if (lastIndex < markdownStr.length) {
      segments.push({ content: markdownStr.substring(lastIndex), language: 'string' });
    }
    // console.log(segments);
    return segments;
  };

  const Markdown: React.FC<any> = (markdownElements) => {
    // console.log(markdownElements);
    const renderedElements = [];
    for (let i = 0; i < markdownElements.length; i++) {
      const element = markdownElements[i];
      if (element.language === 'string') {
        renderedElements.push(
          <ReactMarkdown remarkPlugins={[remarkGfm]} key={i}>
            {element.content}
          </ReactMarkdown>,
        );
      } else {
        if (element.language === 'unknown') {
          element.language = hljs.highlightAuto(element.content).language;
          element.language = element.language !== '' ? element.language : 'plaintext';
          // console.log(element);
        }

        const highlightedCode = hljs.highlight(element.content, {
          language: element.language,
        }).value;
        renderedElements.push(
          <>
            <header key={`t{i}`} className="codeTitle">
              {element.language}
            </header>
            <pre key={`c{i}`} className="codeBlock">
              <code className={`language-${element.language}`}>
                <span dangerouslySetInnerHTML={{ __html: highlightedCode }} />
              </code>
            </pre>
          </>,
        );
      }
    }

    return <>{renderedElements}</>;
  };

  const markdownElements = splitMarkdown(children);
  return Markdown(markdownElements);
};
