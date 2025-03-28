export function parseMessageContent(text = '') {
    const segments = [];

    const regex = /(<think>.*?<\/think>)|([^<]+|<)/gs;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      const [fullMatch, thinkBlock, otherText] = match;

      const textBefore = text.substring(lastIndex, match.index);
      if (textBefore) {
        segments.push({ type: 'text', content: textBefore });
      }

      if (thinkBlock) {

         const thinkContent = thinkBlock.slice(7, -8).trim(); 
         segments.push({ type: 'think', content: thinkContent, isExpanded: false }); 
      } else if (otherText) {

          if (segments.length > 0 && segments[segments.length - 1].type === 'text') {

              segments[segments.length - 1].content += otherText;
          } else {

              segments.push({ type: 'text', content: otherText });
          }
      }

      lastIndex = regex.lastIndex;
    }

    const remainingText = text.substring(lastIndex);
    if (remainingText) {
       if (segments.length > 0 && segments[segments.length - 1].type === 'text') {
          segments[segments.length - 1].content += remainingText;
       } else {
           segments.push({ type: 'text', content: remainingText });
       }
    }

    const mergedSegments = [];
    for (const seg of segments) {
        if (mergedSegments.length > 0 && seg.type === 'text' && mergedSegments[mergedSegments.length - 1].type === 'text') {
            mergedSegments[mergedSegments.length - 1].content += seg.content;
        } else {
            mergedSegments.push(seg);
        }
    }

    return mergedSegments;
  }
