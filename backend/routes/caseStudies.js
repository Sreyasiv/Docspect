const axios = require("axios");

const GNEWS_API_KEY =process.env.GNEWS_API_KEY; // Replace this with actual key

async function extractCaseStudies(clauses) {
  if (!Array.isArray(clauses) || clauses.length === 0) {
    return [];
  }

  const results = [];
  
  for (const clause of clauses) {
    try {
      const response = await axios.get("https://gnews.io/api/v4/search", {
        params: {
          q: clause,
          lang: "en",
          country: "in",
          max: 1,
          token: GNEWS_API_KEY,
        },
      });

      const articles = response.data.articles;

      if (articles.length > 0) {
        const a = articles[0];
        results.push({
          title: a.title,
          date: a.publishedAt,
          image: a.image,
          url: a.url,
        });
      } else {
        results.push(null); // no match for this clause
      }
    } catch (err) {
      console.error("Error fetching for clause:", clause, err.message);
      results.push(null); // skip on error
    }
  }

  return results;
}

module.exports = extractCaseStudies;
