const extractJson = async (text) => {
  if (!text) return null;

  try {
    // ─── Step 1: Clean markdown fences ──────────────────────────────────────
    let cleaned = text
      .replace(/```json\s*/gi, "")
      .replace(/```\s*/g, "")
      .trim();

    // ─── Step 2: Find the outermost { } ─────────────────────────────────────
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");

    if (firstBrace === -1 || lastBrace === -1) return null;

    let jsonString = cleaned.slice(firstBrace, lastBrace + 1);

    // ─── Step 3: Try direct parse first ─────────────────────────────────────
    try {
      return JSON.parse(jsonString);
    } catch (_) {
      // continue to repair steps
    }

    // ─── Step 4: Fix unterminated strings (truncated responses) ─────────────
    // Strategy: extract "code" value manually using indexOf instead of JSON.parse
    const codeKeyIndex = jsonString.indexOf('"code"');
    const messageKeyIndex = jsonString.indexOf('"message"');

    if (codeKeyIndex !== -1) {
      // Extract message value
      let message = "Website generated successfully.";
      if (messageKeyIndex !== -1) {
        const msgStart = jsonString.indexOf('"', messageKeyIndex + 9) + 1;
        const msgEnd = jsonString.indexOf('"', msgStart);
        if (msgStart > 0 && msgEnd > msgStart) {
          message = jsonString.slice(msgStart, msgEnd);
        }
      }

      // Extract code value — find opening quote after "code":
      const codeColonIndex = jsonString.indexOf(":", codeKeyIndex);
      const codeStart = jsonString.indexOf('"', codeColonIndex) + 1;

      if (codeStart > 0) {
        // Find the code value — scan for closing quote not preceded by backslash
        let codeEnd = codeStart;
        while (codeEnd < jsonString.length) {
          const q = jsonString.indexOf('"', codeEnd);
          if (q === -1) {
            // Truncated — take everything until end and close tags
            codeEnd = jsonString.length;
            break;
          }
          // Check if escaped
          let backslashes = 0;
          let pos = q - 1;
          while (pos >= 0 && jsonString[pos] === "\\") {
            backslashes++;
            pos--;
          }
          if (backslashes % 2 === 0) {
            codeEnd = q;
            break;
          }
          codeEnd = q + 1;
        }

        let code = jsonString
          .slice(codeStart, codeEnd)
          .replace(/\\n/g, "\n")
          .replace(/\\t/g, "\t")
          .replace(/\\"/g, '"')
          .replace(/\\\\/g, "\\");

        // If truncated, close open HTML tags gracefully
        if (codeEnd === jsonString.length) {
          if (!code.includes("</html>")) {
            if (!code.includes("</body>")) code += "\n</body>";
            code += "\n</html>";
          }
        }

        if (code.trim()) {
          return { message, code };
        }
      }
    }

    return null;
  } catch (err) {
    console.error("extractJson error:", err.message);
    return null;
  }
};

export default extractJson;
