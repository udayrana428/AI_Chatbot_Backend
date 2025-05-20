const parseGeminiResponseToJson = (rawText) => {
  const lines = rawText.split("\n");
  const result = [];
  let insideCodeBlock = false;
  let insideTable = false;
  let currentTable = [];

  lines.forEach((line) => {
    line = line.trim();

    // Handle Code Block
    if (line.startsWith("```")) {
      insideCodeBlock = !insideCodeBlock;
      if (!insideCodeBlock) {
        result.push({ type: "code", content: currentTable.join("\n") });
        currentTable = [];
      }
      return;
    }
    if (insideCodeBlock) {
      currentTable.push(line);
      return;
    }

    // Handle Table
    if (line.startsWith("|") && line.endsWith("|")) {
      insideTable = true;
      currentTable.push(line);
      return;
    }
    if (insideTable && line.trim() === "") {
      result.push({ type: "table", content: currentTable });
      currentTable = [];
      insideTable = false;
      return;
    }

    // Handle Blockquote
    if (line.startsWith(">")) {
      result.push({ type: "blockquote", content: line.slice(1).trim() });
      return;
    }

    // Handle Heading
    if (line.startsWith("**") && line.endsWith("**")) {
      result.push({
        type: "heading",
        content: line.replace(/\*\*/g, "").trim(),
      });
      return;
    }

    // Handle List
    if (line.startsWith("* ")) {
      if (result.length === 0 || result[result.length - 1].type !== "list") {
        result.push({ type: "list", items: [] });
      }
      result[result.length - 1].items.push(line.replace("* ", "").trim());
      return;
    }

    // Handle Paragraph
    if (line.length > 0) {
      result.push({ type: "paragraph", content: line });
    }
  });

  return result;
};

export { parseGeminiResponseToJson };
