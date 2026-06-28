const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// Strip Vercel Services route prefix if present
app.use((req, res, next) => {
  if (req.url.startsWith("/_/backend")) {
    req.url = req.url.replace("/_/backend", "");
  }
  next();
});

const SCHEMES_FILE = path.join(__dirname, "schemes.json");

// Helper to read schemes
function readSchemes() {
  try {
    const data = fs.readFileSync(SCHEMES_FILE, "utf8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading schemes file:", err);
    return [];
  }
}

// Helper to write schemes
function writeSchemes(schemes) {
  try {
    fs.writeFileSync(SCHEMES_FILE, JSON.stringify(schemes, null, 2), "utf8");
    return true;
  } catch (err) {
    console.error("Error writing schemes file:", err);
    return false;
  }
}

// Welcome route
app.get("/", (req, res) => {
  res.send("Govt Scheme AI Backend Running");
});

// GET /api/schemes - Fetch all schemes
app.get("/api/schemes", (req, res) => {
  const schemes = readSchemes();
  res.json(schemes);
});



// POST /api/chat - AI Assistant Endpoint
app.post("/api/chat", (req, res) => {
  const { message, userProfile } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Message is required." });
  }

  const schemes = readSchemes();
  const lowerMessage = message.toLowerCase();

  // 1. NLP Keyword extraction
  const keywords = {
    farmer: ["farmer", "farm", "kisan", "crop", "agriculture", "land", "விவசாயம்", "விவசாயி"],
    student: ["student", "school", "college", "scholarship", "study", "education", "படிப்பு", "மாணவர்"],
    housing: ["house", "housing", "home", "awas", "construction", "yojana", "வீடு", "வசிப்பிடம்"],
    business: ["business", "loan", "mudra", "shop", "industry", "entrepreneur", "தொழில்", "வியாபாரம்"],
    pension: ["pension", "old", "elderly", "retirement", "atal", "apy", "ஓய்வூதியம்", "முதியோர்"],
    medical: ["medical", "health", "hospital", "ayushman", "insurance", "treatment", "மருத்துவம்", "சிகிச்சை"]
  };

  let matchedCategory = null;
  for (const [cat, words] of Object.entries(keywords)) {
    if (words.some(word => lowerMessage.includes(word))) {
      matchedCategory = cat;
      break;
    }
  }

  // 2. Parse age and income from string if present
  let parsedAge = null;
  let parsedIncome = null;

  const ageMatch = message.match(/(?:age|old|வயது|வயசு)\s*(\d+)/i) || message.match(/(\d+)\s*(?:years|years old|வயது)/i);
  if (ageMatch) {
    parsedAge = parseInt(ageMatch[1]);
  }

  const incomeMatch = message.match(/(?:income|salary|வருமானம்)\s*(?:of|is)?\s*(?:rs\.?|inr)?\s*([\d,]+)/i);
  if (incomeMatch) {
    parsedIncome = parseInt(incomeMatch[1].replace(/,/g, ""));
  }

  // 3. Matchmaker scoring system
  const scoredSchemes = schemes.map(scheme => {
    let score = 0;
    
    // Exact scheme name mention
    const words = scheme.scheme_name.toLowerCase().split(/[\s()\-]+/);
    words.forEach(w => {
      if (w.length > 2 && lowerMessage.includes(w)) score += 10;
    });

    // Profile match scoring
    const profile = userProfile || {};
    const age = parsedAge !== null ? parsedAge : (profile.age !== undefined ? Number(profile.age) : null);
    const income = parsedIncome !== null ? parsedIncome : (profile.income !== undefined ? Number(profile.income) : null);
    const category = profile.category || (lowerMessage.includes("sc") ? "SC" : lowerMessage.includes("st") ? "ST" : lowerMessage.includes("obc") ? "OBC" : null);
    const occupation = profile.occupation || (matchedCategory === "farmer" ? "Farmer" : matchedCategory === "student" ? "Student" : matchedCategory === "business" ? "Business Owner" : null);

    // Age validation check
    if (age !== null) {
      if (age >= scheme.min_age && age <= scheme.max_age) score += 3;
      else score -= 5; // Penalty for mismatch
    }

    // Income validation check
    if (income !== null) {
      if (income <= scheme.income_limit) score += 4;
      else score -= 6;
    }

    // Category check
    if (category && scheme.category_allowed.includes(category)) {
      score += 2;
    }

    // Occupation checks
    if (occupation) {
      if (scheme.occupation_required === "Any" || scheme.occupation_required.toLowerCase() === occupation.toLowerCase()) {
        score += 5;
      } else {
        score -= 3;
      }
    }

    // Sector keyword checks
    if (matchedCategory) {
      const sectorMap = {
        farmer: "Agriculture",
        student: "Education",
        housing: "Housing",
        business: "Business & Entrepreneurship",
        pension: "Social Security",
        medical: "Healthcare"
      };
      if (scheme.sector === sectorMap[matchedCategory]) {
        score += 8;
      }
    }

    return { scheme, score };
  });

  // Sort and filter matching schemes
  const eligibleMatches = scoredSchemes
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score);

  // 4. Construct AI agent style response
  let responseText = `### Hello! I am **Scheme Mitra**, your AI Government Schemes Guide. 🌟\n\n`;

  if (eligibleMatches.length > 0) {
    responseText += `Based on your request, I found the following matching schemes that you might be eligible for:\n\n`;
    
    eligibleMatches.forEach(({ scheme, score }, idx) => {
      responseText += `#### ${idx + 1}. **${scheme.scheme_name}** *(Confidence: ${score > 12 ? 'High' : 'Medium'})*\n`;
      responseText += `*   **Sector:** ${scheme.sector}\n`;
      responseText += `*   **Benefits:** ${scheme.benefits}\n`;
      responseText += `*   **Eligibility Details:** Income limit up to **₹${scheme.income_limit.toLocaleString('en-IN')}**/year, Ages ${scheme.min_age}-${scheme.max_age}.\n`;
      responseText += `*   **Required Documents:** ${scheme.documents_required.join(", ")}.\n`;
      responseText += `*   **Tamil Translation:** *${scheme.tamil_explanation}*\n`;
      responseText += `*   [Official Apply Link](${scheme.official_link}) 🔗\n\n`;
    });

    responseText += `Would you like me to guide you on how to apply for any of these specific schemes? You can also update your profile variables on the **Scheme Finder** page to refine these matches further!`;
  } else {
    responseText += `I analyzed our database for your request, but did not find any highly matching schemes. \n\n`;
    responseText += `Could you share a bit more information? For instance, try telling me:\n`;
    responseText += `- Your occupation (e.g., Farmer, Student, Business Owner)\n`;
    responseText += `- Your approximate annual family income (e.g., ₹2,50,000)\n`;
    responseText += `- What sector you are looking for assistance in (e.g., Housing, Health, Education)\n\n`;
    responseText += `Alternatively, you can explore the full catalog in the **Scheme Explorer** tab!`;
  }

  res.json({ response: responseText });
});

// Run server or export for Vercel Serverless
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;