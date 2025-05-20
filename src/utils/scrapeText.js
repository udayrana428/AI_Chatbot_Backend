import puppeteer from "puppeteer";
import { URL } from "url";

const scrapeTextFromWeb = async (targetUrl) => {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.goto(targetUrl, { waitUntil: "networkidle0" });

  // Clean up DOM to avoid unnecessary junk
  await page.evaluate(() => {
    document
      .querySelectorAll("script, style, noscript, iframe, svg")
      .forEach((el) => el.remove());
  });

  // Extract body text
  const bodyText = await page.evaluate(() => {
    return document.body.innerText.replace(/\s+/g, " ").trim();
  });

  // Extract links
  const links = await page.evaluate(() => {
    return Array.from(document.querySelectorAll("a"))
      .map((a) => a.getAttribute("href"))
      .filter((href) => href && typeof href === "string");
  });

  await browser.close();

  // Separate internal and external links
  const base = new URL(targetUrl);
  const internalLinks = new Set();
  const externalLinks = new Set();

  for (const link of links) {
    if (link.startsWith("javascript") || link.startsWith("#")) continue;

    try {
      const parsed = new URL(link, base);
      if (parsed.hostname === base.hostname) {
        internalLinks.add(parsed.href);
      } else {
        externalLinks.add(parsed.href);
      }
    } catch (e) {
      // Skip malformed URLs
      continue;
    }
  }

  return {
    bodyText,
    internalLinks: Array.from(internalLinks),
    externalLinks: Array.from(externalLinks),
  };
};

// Example usage
// const url = "https://uday-rana-portfolio.vercel.app/about"; // Replace with your page
// scrapeText(url)
//   .then((res) => {
//     console.log("Extracted Text:\n", res.bodyText);
//     console.log("\nInternal Links:\n", res.internalLinks);
//     console.log("\nExternal Links:\n", res.externalLinks);
//   })
//   .catch((err) => {
//     console.error("Error scraping page:", err);
//   });

import fs from "fs/promises";
import path from "path";
// import pdfParse from "pdf-parse";
import textract from "textract";
import { fileTypeFromBuffer } from "file-type";

const scrapeTextFromFile = async (filePath) => {
  const buffer = await fs.readFile(filePath);
  const fileType = await fileTypeFromBuffer(buffer);
  const ext = fileType?.ext || path.extname(filePath).slice(1).toLowerCase();

  // For PDF files
  if (ext === "pdf") {
    const data = await pdfParse(buffer);
    return data.text.replace(/\s+/g, " ").trim();
  }

  // For DOC, DOCX, TXT, PPTX, XLSX, etc.
  return new Promise((resolve, reject) => {
    textract.fromBufferWithName(
      path.basename(filePath),
      buffer,
      (err, text) => {
        if (err) return reject(`Failed to extract: ${err}`);
        resolve(text.replace(/\s+/g, " ").trim());
      }
    );
  });
};

// Example usage
// const text = await scrapeTextFromFile("./newFile.pdf");
// console.log(text);

// export { scrapeTextFromFile };

export { scrapeTextFromWeb, scrapeTextFromFile };
