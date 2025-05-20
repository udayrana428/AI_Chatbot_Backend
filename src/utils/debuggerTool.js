import fs from "fs";

function extractContextFromStack(stack) {
  const lines = stack.split("\n");
  const fileContexts = [];

  for (let line of lines) {
    const match = line.match(
      /\(?([a-zA-Z0-9+_.-]*:?\/{0,3}[^\s:]+):(\d+):\d+\)?/
    );
    if (match) {
      let file = match[1];
      const lineNumber = parseInt(match[2]);

      // Clean up 'file://'
      if (file.startsWith("file:///")) {
        file = file.replace("file:///", "");
      }

      // Ignore node internals and node_modules
      if (file.startsWith("node:") || file.includes("node_modules")) {
        continue;
      }

      // Normalize for Windows
      file = file.replace(/\\/g, "/");

      try {
        const content = fs.readFileSync(file, "utf8").split("\n");
        // const context = content
        //   .slice(Math.max(0, lineNumber - 5), lineNumber + 4)
        //   .join("\n");
        fileContexts.push({ file, lineNumber, content });
      } catch (err) {
        console.warn(`Skipping unreadable file: ${file}`);
      }
    }
  }

  return fileContexts;
}

const fileContexts =
  extractContextFromStack(`TypeError: rawText.split is not a function
    at parseGeminiResponseToJson (file:///D:/Ebos/Chat_Bot/backend/src/utils/customParser.js:2:25)
    at file:///D:/Ebos/Chat_Bot/backend/src/controllers/message.controller.js:111:35
    at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
    at async file:///D:/Ebos/Chat_Bot/backend/src/utils/asyncHandler.js:9:5`);

fs.writeFileSync("context.json", JSON.stringify(fileContexts, null, 2), "utf8");

console.log(fileContexts);
