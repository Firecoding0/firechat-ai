import React, { useState } from 'react'; 
import { FiEye, FiEyeOff, FiCopy, FiCheck } from 'react-icons/fi'; 
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';

function Message({ sender, segments = [], isStreaming, onToggleThinkBlock }) {
  const hasContent = segments.length > 0;
  const isEffectivelyEmpty = segments.every(seg => !seg.content.trim());

  const CodeBlock = ({ className, children }) => {
    const [isCopied, setIsCopied] = useState(false); 
    const match = /language-(\w+)/.exec(className || '');
    const language = match ? match[1] : 'text'; 
    const codeToCopy = String(children).replace(/\n$/, ''); 

    const handleCopy = () => {
      navigator.clipboard.writeText(codeToCopy).then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000); 
      }).catch(err => {
        console.error('Ошибка копирования кода:', err);

      });
    };

    return (
      <div className="code-block-wrapper"> {}
        <button
          onClick={handleCopy}
          className={`copy-code-button ${isCopied ? 'copied' : ''}`}
          aria-label={isCopied ? 'Код скопирован' : 'Скопировать код'}
        >
          {isCopied ? <FiCheck size="1em"/> : <FiCopy size="1em"/>}
          {}
        </button>
        <SyntaxHighlighter
          style={vscDarkPlus}
          language={language}
          PreTag="div"

        >
          {codeToCopy}
        </SyntaxHighlighter>
      </div>
    );
  };

  const markdownComponents = {
    code({ node, inline, className, children, ...props }) {

      if (!inline) {

        return <CodeBlock className={className}>{children}</CodeBlock>;
      }

      return (
        <code className={className} {...props}>
          {children}
        </code>
      );
    },

  };

  return (
    <div className={`message ${sender} ${!hasContent && isStreaming ? 'placeholder' : ''}`}>
      {segments.map((segment, index) => {
        if (segment.type === 'think') {

          return (
            <div key={index} className={`think-block ${segment.isExpanded ? 'expanded' : ''}`}>
              <button
                className="think-block-header"
                onClick={() => onToggleThinkBlock(index)}
                aria-expanded={segment.isExpanded}
              >
                {segment.isExpanded ? <FiEyeOff /> : <FiEye /> }
                <span>Ход мыслей AI</span>
              </button>
              <div className="think-block-content-wrapper">
                <div className="think-block-content">
                  <ReactMarkdown
                    components={markdownComponents}
                    remarkPlugins={[remarkGfm]}
                  >
                    {}
                    {`\`\`\`text\n${segment.content}\n\`\`\``}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          );
        }

        return (
          <div key={index} className="text-segment">
            <ReactMarkdown
              components={markdownComponents} 
              remarkPlugins={[remarkGfm]}
            >
              {segment.content}
            </ReactMarkdown>
          </div>
        );
      })}
      {}
      {sender === 'ai' && isStreaming && (!isEffectivelyEmpty || !hasContent) && <span className="ai-typing-cursor"></span>}
    </div>
  );
}

export default Message;