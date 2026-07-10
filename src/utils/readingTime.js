/**
 * Estimate the reading time of a blog post based on word count.
 * Handles both stringified TipTap JSON document formats and raw text/HTML fallbacks.
 * @param {string} contentString - The content string to parse.
 * @returns {number} Estimated reading time in minutes.
 */
export function calculateReadingTime(contentString) {
  if (!contentString) return 1;
  
  try {
    const doc = JSON.parse(contentString);
    let text = '';

    // Recursively traverse TipTap JSON nodes to extract raw text
    function extractText(node) {
      if (!node) return;
      if (node.type === 'text' && node.text) {
        text += ' ' + node.text;
      }
      if (node.content && Array.isArray(node.content)) {
        node.content.forEach(extractText);
      }
    }

    extractText(doc);
    const wordCount = text.trim().split(/\s+/).filter((w) => w.length > 0).length;
    const minutes = Math.ceil(wordCount / 225); // Average adult reading speed: 225 WPM
    return minutes < 1 ? 1 : minutes;
  } catch (error) {
    // Fallback parsing for raw strings/HTML
    const cleanText = contentString.replace(/<[^>]*>/g, ' '); // Strip HTML tags
    const wordCount = cleanText.trim().split(/\s+/).filter((w) => w.length > 0).length;
    const minutes = Math.ceil(wordCount / 225);
    return minutes < 1 ? 1 : minutes;
  }
}
