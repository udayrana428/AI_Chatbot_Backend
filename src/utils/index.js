import axios from "axios";
import * as cheerio from "cheerio";

const scrapePageText = async (url) => {
  try {
    const { data: html } = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; scraper/1.0)",
      },
    });

    const $ = cheerio.load(html);

    console.log("Starting scraping");

    const headText = $("head").text().replace(/\s+/g, " ").trim();
    const bodyText = $("body").text().replace(/\s+/g, " ").trim();

    console.log("Starting scraping links");

    const internalLinks = new Set();
    const externalLinks = new Set();

    $("a").each((_, el) => {
      const link = $(el).attr("href");
      if (!link || typeof link !== "string" || link.startsWith("javascript"))
        return;

      if (link.startsWith("http")) {
        externalLinks.add(link);
      } else {
        internalLinks.add(link);
      }
    });

    console.log("internalLinks:", Array.from(internalLinks));
    console.log("externalLinks:", Array.from(externalLinks));

    console.log("Going to return");

    return {
      headText,
      bodyText,
      combinedText: `${headText}\n\n${bodyText}`,
      //   internalLinks: Array.from(internalLinks),
      //   externalLinks: Array.from(externalLinks),
    };
  } catch (error) {
    throw new Error(`Failed to scrape text from url: ${url}`);
  }
};

scrapePageText(
  "https://www.thehindu.com/news/national/pahalgam-terror-attack-jammu-and-kashmir-loc-tensions-april-30-2025/article69507675.ece"
);

export { scrapePageText };
