import React, { useState, useEffect, useRef } from "react";

// Default fallback data in case backend is offline
const LOCAL_SCHEMES_FALLBACK = [
  {
    "scheme_name": "Pradhan Mantri Awas Yojana (PMAY)",
    "income_limit": 600000,
    "min_age": 18,
    "max_age": 70,
    "category_allowed": ["General", "OBC", "SC", "ST"],
    "occupation_required": "Any",
    "documents_required": ["Aadhaar Card", "Income Certificate", "Address Proof", "Bank Passbook"],
    "tamil_explanation": "இந்த திட்டம் வீடு இல்லாத ஏழை மற்றும் நடுத்தர குடும்பங்களுக்கு புதிய வீடு கட்ட அல்லது புதுப்பிக்க மானியம் வழங்குகிறது.",
    "official_link": "https://pmaymis.gov.in/",
    "benefits": "Up to ₹2.67 Lakhs interest subsidy on home loans.",
    "sector": "Housing"
  },
  {
    "scheme_name": "PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)",
    "income_limit": 200000,
    "min_age": 18,
    "max_age": 100,
    "category_allowed": ["General", "OBC", "SC", "ST"],
    "occupation_required": "Farmer",
    "documents_required": ["Aadhaar Card", "Land Ownership Documents", "Bank Passbook"],
    "tamil_explanation": "விவசாயிகளுக்கு ஆண்டுக்கு ₹6,000 நிதியுதவி மூன்று சம தவணைகளாக நேரடியாக வங்கிக் கணக்கில் செலுத்தப்படும்.",
    "official_link": "https://pmkisan.gov.in/",
    "benefits": "₹6,000 per year in three equal installments of ₹2,000.",
    "sector": "Agriculture"
  },
  {
    "scheme_name": "Atal Pension Yojana (APY)",
    "income_limit": 1000000,
    "min_age": 18,
    "max_age": 40,
    "category_allowed": ["General", "OBC", "SC", "ST"],
    "occupation_required": "Unorganized Sector",
    "documents_required": ["Aadhaar Card", "Savings Bank Account", "Mobile Number"],
    "tamil_explanation": "இத்திட்டம் 60 வயதுக்கு பின் மாதந்தோறும் ₹1,000 முதல் ₹5,000 வரை ஓய்வூதியம் வழங்குகிறது.",
    "official_link": "https://www.npscra.nsdl.co.in/",
    "benefits": "Guaranteed minimum pension of ₹1,000 to ₹5,000 per month after age 60.",
    "sector": "Social Security"
  },
  {
    "scheme_name": "PM Mudra Yojana (PMMY)",
    "income_limit": 5000000,
    "min_age": 18,
    "max_age": 65,
    "category_allowed": ["General", "OBC", "SC", "ST"],
    "occupation_required": "Business Owner",
    "documents_required": ["Aadhaar Card", "Business Registration", "Project Report", "Identity/Address Proof"],
    "tamil_explanation": "சிறு தொழில்கள் தொடங்க அல்லது விரிவாக்க பிணையில்லா கடன் ₹10 லட்சம் வரை வழங்கப்படுகிறது.",
    "official_link": "https://www.mudra.org.in/",
    "benefits": "Collateral-free business loans up to ₹10 Lakhs under Shishu, Kishor, and Tarun categories.",
    "sector": "Business & Entrepreneurship"
  },
  {
    "scheme_name": "Post-Matric Scholarship Scheme",
    "income_limit": 250000,
    "min_age": 15,
    "max_age": 30,
    "category_allowed": ["SC", "ST", "OBC"],
    "occupation_required": "Student",
    "documents_required": ["Aadhaar Card", "Community Certificate", "Income Certificate", "Fee Receipt", "Mark sheet"],
    "tamil_explanation": "பத்தாம் வகுப்புக்கு மேல் பயிலும் தாழ்த்தப்பட்ட மற்றும் பிற்படுத்தப்பட்ட மாணவர்களின் கல்விச் செலவை ஏற்க அரசு வழங்கும் நிதியுதவி.",
    "official_link": "https://scholarships.gov.in/",
    "benefits": "100% tuition fee reimbursement and monthly maintenance allowance.",
    "sector": "Education"
  },
  {
    "scheme_name": "Ayushman Bharat (PM-JAY)",
    "income_limit": 250000,
    "min_age": 0,
    "max_age": 120,
    "category_allowed": ["General", "OBC", "SC", "ST"],
    "occupation_required": "Any",
    "documents_required": ["Aadhaar Card", "Ration Card (NFSA)", "Income Certificate"],
    "tamil_explanation": "ஏழை எளிய குடும்பங்களுக்கு ஆண்டுக்கு ₹5 லட்சம் வரையிலான மருத்துவச் செலவுகளை இலவசமாக வழங்கும் காப்பீட்டுத் திட்டம்.",
    "official_link": "https://pmjay.gov.in/",
    "benefits": "Cashless health cover of up to ₹5 Lakhs per family per year for secondary and tertiary care hospitalisation.",
    "sector": "Healthcare"
  }
];

// Simple custom markdown-like renderer to avoid dependency issues on React 19
const renderMarkdown = (text) => {
  if (!text) return null;
  
  const lines = text.split("\n");
  return lines.map((line, idx) => {
    // Headers
    if (line.startsWith("#### ")) {
      return <h4 key={idx} className="md-h4">{line.replace("#### ", "")}</h4>;
    }
    if (line.startsWith("### ")) {
      return <h3 key={idx} className="md-h3">{line.replace("### ", "")}</h3>;
    }
    // Bullet list
    if (line.startsWith("* ") || line.startsWith("- ")) {
      const content = line.substring(2);
      return <li key={idx} className="md-li">{parseInlineFormatting(content)}</li>;
    }
    // Numbered list
    if (/^\d+\.\s/.test(line)) {
      const content = line.replace(/^\d+\.\s/, "");
      return <li key={idx} className="md-li-numbered">{parseInlineFormatting(content)}</li>;
    }
    // Empty line
    if (line.trim() === "") {
      return <div key={idx} style={{ height: "8px" }} />;
    }
    // Standard paragraph
    return <p key={idx} className="md-p">{parseInlineFormatting(line)}</p>;
  });
};

const parseInlineFormatting = (content) => {
  // Bold formatting **text**
  const boldRegex = /\*\*(.*?)\*\*/g;
  // Link formatting [text](url)
  const linkRegex = /\[(.*?)\]\((.*?)\)/g;
  
  let elements = [];
  let lastIndex = 0;
  let match;
  
  let workingString = content;
  
  // Replace links first with JSX, then bold
  // For simplicity, handle standard bolding and links inline
  const parts = [];
  let txt = content;
  
  // Simple bold extraction
  const regex = /(\*\*.*?\*\*|\[.*?\]\(.*?\))/g;
  const matches = txt.split(regex);
  
  return matches.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("[") && part.includes("](")) {
      const linkText = part.substring(1, part.indexOf("]("));
      const url = part.substring(part.indexOf("](") + 2, part.length - 1);
      return <a key={index} href={url} target="_blank" rel="noopener noreferrer" className="chat-link">{linkText}</a>;
    }
    return part;
  });
};

const API_BASE_URL = process.env.REACT_APP_API_URL || (process.env.NODE_ENV === "production" ? "/_/backend" : "http://localhost:5000");

function App() {
  const [activeTab, setActiveTab] = useState("finder");
  const [schemes, setSchemes] = useState(LOCAL_SCHEMES_FALLBACK);
  const [backendOnline, setBackendOnline] = useState(false);
  const [loading, setLoading] = useState(true);

  // Profile fields for Matchmaker Wizard
  const [profile, setProfile] = useState({
    age: 28,
    income: 240000,
    category: "General",
    occupation: "Farmer",
  });

  // Filter fields for catalog explorer
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSector, setSelectedSector] = useState("All");
  const [tamilToggle, setTamilToggle] = useState(false);

  // Scheme Comparison State
  const [compareList, setCompareList] = useState([]);

  // Chat State
  const [chatMessages, setChatMessages] = useState([
    {
      sender: "mitra",
      text: "### Welcome to Scheme Mitra! 🌾\n\nI am your AI Government Schemes assistant. Tell me a bit about your background (e.g., *'I am a student from OBC category with annual family income of ₹1,80,000'*) or ask about a specific scheme, and I will check your eligibility instantly!",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatBottomRef = useRef(null);



  // Fetch schemes from backend on mount
  useEffect(() => {
    const fetchSchemes = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/schemes`);
        if (response.ok) {
          const data = await response.json();
          setSchemes(data);
          setBackendOnline(true);
        } else {
          setBackendOnline(false);
        }
      } catch (err) {
        console.log("Backend offline, utilizing local schemes mock.");
        setBackendOnline(false);
      } finally {
        setLoading(false);
      }
    };
    fetchSchemes();
  }, []);

  // Scroll to bottom on new chat messages
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, chatLoading]);

  // Eligibility checking logic for matching schemes
  const getEligibilityStatus = (scheme, userProfile) => {
    const reasons = [];
    let eligible = true;

    if (userProfile.age < scheme.min_age || userProfile.age > scheme.max_age) {
      eligible = false;
      reasons.push(`Age ${userProfile.age} outside allowed range (${scheme.min_age}-${scheme.max_age} years)`);
    }

    if (userProfile.income > scheme.income_limit) {
      eligible = false;
      reasons.push(`Income ₹${userProfile.income.toLocaleString('en-IN')} exceeds limit of ₹${scheme.income_limit.toLocaleString('en-IN')}`);
    }

    if (!scheme.category_allowed.includes(userProfile.category)) {
      eligible = false;
      reasons.push(`Category ${userProfile.category} not eligible (Allowed: ${scheme.category_allowed.join(", ")})`);
    }

    if (scheme.occupation_required !== "Any" && scheme.occupation_required.toLowerCase() !== userProfile.occupation.toLowerCase()) {
      eligible = false;
      reasons.push(`Requires occupation: ${scheme.occupation_required} (Your input: ${userProfile.occupation})`);
    }

    return { eligible, reasons };
  };

  // Toggle scheme in comparison list
  const toggleComparison = (schemeName) => {
    if (compareList.includes(schemeName)) {
      setCompareList(compareList.filter(name => name !== schemeName));
    } else {
      if (compareList.length >= 3) {
        alert("You can compare up to 3 schemes at a time.");
        return;
      }
      setCompareList([...compareList, schemeName]);
    }
  };

  // Chat message submission
  const handleSendMessage = async (customMessage = null) => {
    const textToSend = customMessage || chatInput;
    if (!textToSend.trim()) return;

    // Add user message
    const userMsg = {
      sender: "user",
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setChatMessages(prev => [...prev, userMsg]);
    if (!customMessage) setChatInput("");
    setChatLoading(true);

    try {
       const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          userProfile: profile
        })
      });

      if (response.ok) {
        const data = await response.json();
        setChatMessages(prev => [...prev, {
          sender: "mitra",
          text: data.response,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      } else {
        throw new Error("Chat endpoint returned an error");
      }
    } catch (err) {
      // Local fallback chatbot matching
      console.log("Chat service error, running local client intelligence.");
      setTimeout(() => {
        const matchingSchemes = schemes.filter(scheme => {
          const status = getEligibilityStatus(scheme, profile);
          const nameMatch = scheme.scheme_name.toLowerCase().includes(textToSend.toLowerCase()) || 
                            scheme.sector.toLowerCase().includes(textToSend.toLowerCase());
          return status.eligible || nameMatch;
        });

        let reply = `### Hello! I am **Scheme Mitra (Offline Mode)**. 🌾\n\n`;
        if (matchingSchemes.length > 0) {
          reply += `Based on your query and current profile, here are some recommended schemes:\n\n`;
          matchingSchemes.forEach((s, i) => {
            reply += `#### ${i+1}. **${s.scheme_name}**\n`;
            reply += `*   **Sector:** ${s.sector}\n`;
            reply += `*   **Benefits:** ${s.benefits}\n`;
            reply += `*   **Required Docs:** ${s.documents_required.join(", ")}\n`;
            reply += `*   [Official Website](${s.official_link}) 🔗\n\n`;
          });
        } else {
          reply += `I couldn't find matches in our local records for "${textToSend}". Try searching for categories like "Farmer", "Student", "Housing", or check the Explorer tab.`;
        }

        setChatMessages(prev => [...prev, {
          sender: "mitra",
          text: reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      }, 800);
    } finally {
      setChatLoading(false);
    }
  };



  // Get Analytics stats
  const totalSchemes = schemes.length;
  const sectors = [...new Set(schemes.map(s => s.sector))];
  const avgIncomeLimit = schemes.reduce((acc, s) => acc + s.income_limit, 0) / (totalSchemes || 1);

  // Categorize for charts
  const sectorCounts = schemes.reduce((acc, s) => {
    acc[s.sector] = (acc[s.sector] || 0) + 1;
    return acc;
  }, {});

  const occupationCounts = schemes.reduce((acc, s) => {
    acc[s.occupation_required] = (acc[s.occupation_required] || 0) + 1;
    return acc;
  }, {});

  return (
    <div style={styles.appContainer}>
      {/* Premium Glowing Header */}
      <header style={styles.header}>
        <div style={styles.logoContainer}>
          <i className="fa-solid fa-brain" style={styles.logoIcon}></i>
          <span style={styles.logoText}>GovtScheme<span style={{ color: "var(--accent-indigo)" }}>.AI</span></span>
        </div>
        <nav style={styles.nav}>
          <button 
            id="tab-finder"
            style={activeTab === "finder" ? styles.activeTabBtn : styles.tabBtn} 
            onClick={() => setActiveTab("finder")}
          >
            <i className="fa-solid fa-wand-magic-sparkles"></i> Scheme Finder
          </button>
          <button 
            id="tab-explorer"
            style={activeTab === "explorer" ? styles.activeTabBtn : styles.tabBtn} 
            onClick={() => setActiveTab("explorer")}
          >
            <i className="fa-solid fa-list-check"></i> Explorer & Compare
          </button>
          <button 
            id="tab-analytics"
            style={activeTab === "analytics" ? styles.activeTabBtn : styles.tabBtn} 
            onClick={() => setActiveTab("analytics")}
          >
            <i className="fa-solid fa-chart-line"></i> Analytics
          </button>
          <button 
            id="tab-chatbot"
            style={activeTab === "chatbot" ? styles.activeTabBtn : styles.tabBtn} 
            onClick={() => setActiveTab("chatbot")}
          >
            <i className="fa-solid fa-comments"></i> Scheme Mitra Chat
          </button>

        </nav>
        
        {/* Status Indicator */}
        <div style={styles.statusBadge}>
          <span style={{
            ...styles.statusDot, 
            backgroundColor: backendOnline ? "var(--accent-emerald)" : "var(--accent-rose)",
            boxShadow: backendOnline ? "0 0 8px var(--accent-emerald)" : "0 0 8px var(--accent-rose)"
          }}></span>
          <span style={styles.statusText}>{backendOnline ? "AI Server Online" : "Sandbox Mode"}</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={styles.mainContent}>
        
        {/* TAB 1: SCHEME FINDER */}
        {activeTab === "finder" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "30px" }} className="animate-slide">
            {/* Top Section: Form Panel */}
            <div className="glass-panel" style={styles.panel}>
              <h2 style={styles.panelTitle}>
                <i className="fa-solid fa-sliders" style={{ color: "var(--accent-indigo)" }}></i> Matchmaker Profile
              </h2>
              <p style={styles.panelSubtitle}>Input your profile credentials. The engine dynamically calculates eligibility matching rules.</p>
              
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px" }}>
                <div className="form-group" style={styles.sliderContainer}>
                <label className="form-label" htmlFor="input-age">Select Age: <span className="slider-val">{profile.age} years</span></label>
                <input 
                  id="input-age"
                  type="range" 
                  min="5" 
                  max="90" 
                  value={profile.age} 
                  onChange={(e) => setProfile({ ...profile, age: Number(e.target.value) })}
                />
                <div style={styles.rangeLabels}><span>5 yrs</span><span>90 yrs</span></div>
              </div>

              <div className="form-group" style={styles.sliderContainer}>
                <label className="form-label" htmlFor="input-income">Annual Family Income: <span className="slider-val">₹{profile.income.toLocaleString('en-IN')}</span></label>
                <input 
                  id="input-income"
                  type="range" 
                  min="20000" 
                  max="1200000" 
                  step="10000" 
                  value={profile.income} 
                  onChange={(e) => setProfile({ ...profile, income: Number(e.target.value) })}
                />
                <div style={styles.rangeLabels}><span>₹20,000</span><span>₹12,00,000+</span></div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="select-category">Category Group</label>
                <select 
                  id="select-category"
                  className="form-select"
                  value={profile.category} 
                  onChange={(e) => setProfile({ ...profile, category: e.target.value })}
                >
                  <option value="General">General (Unreserved)</option>
                  <option value="OBC">OBC (Other Backward Classes)</option>
                  <option value="SC">SC (Scheduled Castes)</option>
                  <option value="ST">ST (Scheduled Tribes)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="select-occupation">Primary Occupation</label>
                <select 
                  id="select-occupation"
                  className="form-select"
                  value={profile.occupation} 
                  onChange={(e) => setProfile({ ...profile, occupation: e.target.value })}
                >
                  <option value="Farmer">Farmer / Agricultural Worker</option>
                  <option value="Student">Student (High School / Higher Ed)</option>
                  <option value="Business Owner">Business Owner / Self-employed</option>
                  <option value="Unorganized Sector">Unorganized Labour / Worker</option>
                  <option value="Any">General Salaried / Freelancer</option>
                </select>
              </div>
              </div>

              <div style={{ ...styles.profileBadgeSummary, marginTop: "15px", paddingTop: "15px" }}>
                <span style={styles.profileSummaryText}>Active Engine Filters:</span>
                <div style={styles.badgeRow}>
                  <span className="badge badge-blue">{profile.occupation}</span>
                  <span className="badge badge-purple">{profile.category}</span>
                  <span className="badge badge-indigo">Age {profile.age}</span>
                </div>
              </div>
            </div>

            {/* Bottom Section: Dynamic Results Grid */}
            {(() => {
              const eligibleSchemes = schemes.filter(s => getEligibilityStatus(s, profile).eligible);
              return (
                <div style={styles.resultsContainer}>
                  <h2 style={styles.panelTitle}>
                    <i className="fa-solid fa-clipboard-check" style={{ color: "var(--accent-emerald)" }}></i> Eligible Schemes ({eligibleSchemes.length})
                  </h2>
                  
                  {eligibleSchemes.length > 0 ? (
                    <div style={styles.cardsGridThree}>
                      {eligibleSchemes.map((scheme, idx) => (
                        <div 
                          key={idx} 
                          className="glass-panel animate-fade" 
                          style={{
                            ...styles.schemeCard,
                            borderLeft: "4px solid var(--accent-emerald)",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between"
                          }}
                        >
                          <div>
                            <div style={styles.cardHeader}>
                              <span className="badge badge-indigo">{scheme.sector}</span>
                              <span className="badge badge-emerald">Eligible</span>
                            </div>
                            
                            <h3 style={{ ...styles.cardTitle, margin: "12px 0 6px 0" }}>{scheme.scheme_name}</h3>
                            
                            <div style={{ ...styles.cardRow, margin: "4px 0" }}>
                              <span style={styles.cardMetaLabel}>Benefits:</span>
                              <span style={{ ...styles.cardMetaVal, fontWeight: "600", color: "var(--text-primary)" }}>{scheme.benefits}</span>
                            </div>

                            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", margin: "10px 0" }}>
                              {scheme.documents_required.map((doc, dIdx) => (
                                <span key={dIdx} style={styles.docBadge}>{doc}</span>
                              ))}
                            </div>
                          </div>

                          <div>
                            <div style={{ ...styles.successBox, margin: "10px 0" }}>
                              <i className="fa-solid fa-circle-check" style={{ color: "var(--accent-emerald)", marginRight: "8px" }}></i>
                              Matched! All eligibility criteria met.
                            </div>

                            <div style={{ ...styles.cardActionRow, gap: "10px", marginTop: "10px" }}>
                              <button 
                                className="btn-secondary"
                                style={{ padding: "8px 12px", fontSize: "0.85rem", flex: 1, justifyContent: "center" }}
                                onClick={() => {
                                  setActiveTab("explorer");
                                  setSearchQuery(scheme.scheme_name);
                                }}
                              >
                                Details <i className="fa-solid fa-arrow-right-long"></i>
                              </button>
                              <a 
                                href={scheme.official_link} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="btn-primary" 
                                style={{ padding: "8px 12px", fontSize: "0.85rem", textDecoration: "none", flex: 1, justifyContent: "center" }}
                              >
                                Apply <i className="fa-solid fa-arrow-up-right-from-square"></i>
                              </a>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="glass-panel" style={{ padding: "40px", textAlign: "center", borderRadius: "16px" }}>
                      <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: "2.5rem", color: "var(--accent-orange)", marginBottom: "15px" }}></i>
                      <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, marginBottom: "8px" }}>No Matching Schemes Found</h3>
                      <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", maxWidth: "500px", margin: "0 auto" }}>
                        We couldn't find any matching schemes based on your profile inputs. Try adjusting your age filters, category, or annual family income to discover relevant support.
                      </p>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}

        {/* TAB 2: SCHEME EXPLORER */}
        {activeTab === "explorer" && (
          <div style={styles.panel} className="glass-panel animate-slide">
            <div style={styles.explorerHeader}>
              <div>
                <h2 style={styles.panelTitle}>
                  <i className="fa-solid fa-compass" style={{ color: "var(--accent-indigo)" }}></i> Government Schemes Directory
                </h2>
                <p style={styles.panelSubtitle}>Browse the active catalog, verify requirements, and translate documentation.</p>
              </div>
              <div style={styles.explorerControls}>
                <button 
                  className="btn-secondary" 
                  style={{
                    backgroundColor: tamilToggle ? "rgba(99, 102, 241, 0.2)" : "rgba(255,255,255,0.05)",
                    borderColor: tamilToggle ? "var(--accent-indigo)" : "var(--border-color)"
                  }}
                  onClick={() => setTamilToggle(!tamilToggle)}
                >
                  <i className="fa-solid fa-language"></i> {tamilToggle ? "English Explanations" : "தமிழ் விளக்கம் (Tamil)"}
                </button>
              </div>
            </div>

            {/* Filter controls */}
            <div style={styles.filterRow}>
              <div style={{ flex: 2, position: "relative" }}>
                <i className="fa-solid fa-magnifying-glass" style={styles.searchIcon}></i>
                <input 
                  id="search-schemes"
                  type="text" 
                  className="form-input" 
                  style={{ paddingLeft: "42px" }}
                  placeholder="Search schemes by name, benefits, or documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div style={{ flex: 1 }}>
                <select 
                  id="filter-sector"
                  className="form-select" 
                  value={selectedSector}
                  onChange={(e) => setSelectedSector(e.target.value)}
                >
                  <option value="All">All Sectors</option>
                  {sectors.map((sec, i) => <option key={i} value={sec}>{sec}</option>)}
                </select>
              </div>
            </div>

            {/* Comparison drawer preview */}
            {compareList.length > 0 && (
              <div style={styles.comparisonDrawer} className="glass-panel">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <span style={{ fontWeight: 600 }}>Scheme Comparison Deck ({compareList.length}/3 selected)</span>
                    <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Compare income limit, documents, and benefits side-by-side.</p>
                  </div>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button className="btn-secondary" onClick={() => setCompareList([])}>Clear</button>
                    {compareList.length >= 2 && (
                      <a href="#comparison-table" className="btn-primary" style={{ padding: "8px 16px", textDecoration: "none" }}>
                        Compare Now <i className="fa-solid fa-arrows-left-right"></i>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Grid display */}
            <div style={styles.cardsGridThree}>
              {schemes
                .filter(s => {
                  const matchesSearch = s.scheme_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                      s.benefits.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                      s.sector.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                      s.documents_required.some(doc => doc.toLowerCase().includes(searchQuery.toLowerCase()));
                  const matchesSector = selectedSector === "All" || s.sector === selectedSector;
                  return matchesSearch && matchesSector;
                })
                .map((scheme, idx) => (
                  <div key={idx} className="glass-panel" style={styles.explorerCard}>
                    <div style={styles.cardHeader}>
                      <span className="badge badge-indigo">{scheme.sector}</span>
                      <label style={styles.checkboxLabel}>
                        <input 
                          type="checkbox" 
                          checked={compareList.includes(scheme.scheme_name)}
                          onChange={() => toggleComparison(scheme.scheme_name)}
                          style={{ marginRight: "6px" }}
                        /> Compare
                      </label>
                    </div>

                    <h3 style={{ ...styles.cardTitle, margin: "10px 0", fontSize: "1.2rem" }}>{scheme.scheme_name}</h3>
                    
                    <div style={styles.detailRow}>
                      <span style={styles.detailLabel}>Income Eligibility:</span>
                      <span style={styles.detailVal}>Up to ₹{scheme.income_limit.toLocaleString('en-IN')}/year</span>
                    </div>

                    <div style={styles.detailRow}>
                      <span style={styles.detailLabel}>Age Group:</span>
                      <span style={styles.detailVal}>{scheme.min_age} - {scheme.max_age} years</span>
                    </div>

                    <div style={styles.detailRow}>
                      <span style={styles.detailLabel}>Target Occupation:</span>
                      <span style={styles.detailVal}>{scheme.occupation_required}</span>
                    </div>

                    <div style={{ margin: "14px 0" }}>
                      <span style={styles.detailLabel}>Benefits:</span>
                      <p style={styles.benefitsText}>{scheme.benefits}</p>
                    </div>

                    <div style={{ margin: "10px 0" }}>
                      <span style={styles.detailLabel}>Required Documents:</span>
                      <div style={styles.docBadgeContainer}>
                        {scheme.documents_required.map((doc, dIdx) => (
                          <span key={dIdx} style={styles.docBadge}>{doc}</span>
                        ))}
                      </div>
                    </div>

                    {tamilToggle && (
                      <div style={styles.tamilExplanationBox}>
                        <strong style={{ color: "var(--accent-orange)", fontSize: "0.85rem", display: "block", marginBottom: "4px" }}>
                          <i className="fa-solid fa-language"></i> தமிழ் விளக்கம்:
                        </strong>
                        <p style={{ fontSize: "0.85rem", fontStyle: "italic" }}>{scheme.tamil_explanation}</p>
                      </div>
                    )}

                    <div style={{ ...styles.cardActionRow, marginTop: "auto", borderTop: "1px solid var(--border-color)", paddingTop: "12px" }}>
                      <a href={scheme.official_link} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ width: "100%", justifyContent: "center", textDecoration: "none" }}>
                        Official Website <i className="fa-solid fa-external-link"></i>
                      </a>
                    </div>
                  </div>
                ))}
            </div>

            {/* Comparison Side-by-side view */}
            {compareList.length >= 2 && (
              <div id="comparison-table" style={{ marginTop: "40px", borderTop: "1px solid var(--border-color)", paddingTop: "30px" }} className="animate-slide">
                <h3 style={{ ...styles.panelTitle, marginBottom: "20px" }}>
                  <i className="fa-solid fa-code-compare" style={{ color: "var(--accent-indigo)" }}></i> Side-by-Side Scheme Comparison
                </h3>
                <div style={{ overflowX: "auto" }}>
                  <table style={styles.compareTable}>
                    <thead>
                      <tr>
                        <th style={styles.tableTh}>Attribute</th>
                        {compareList.map(name => {
                          const s = schemes.find(x => x.scheme_name === name);
                          return <th key={name} style={{ ...styles.tableTh, color: "var(--accent-indigo)" }}>{s.scheme_name}</th>;
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={styles.tableTd}>Sector</td>
                        {compareList.map(name => {
                          const s = schemes.find(x => x.scheme_name === name);
                          return <td key={name} style={styles.tableTd}><span className="badge badge-blue">{s.sector}</span></td>;
                        })}
                      </tr>
                      <tr>
                        <td style={styles.tableTd}>Income Cap</td>
                        {compareList.map(name => {
                          const s = schemes.find(x => x.scheme_name === name);
                          return <td key={name} style={{ ...styles.tableTd, fontWeight: 600 }}>₹{s.income_limit.toLocaleString('en-IN')}</td>;
                        })}
                      </tr>
                      <tr>
                        <td style={styles.tableTd}>Age Limits</td>
                        {compareList.map(name => {
                          const s = schemes.find(x => x.scheme_name === name);
                          return <td key={name} style={styles.tableTd}>{s.min_age} - {s.max_age} yrs</td>;
                        })}
                      </tr>
                      <tr>
                        <td style={styles.tableTd}>Target Occupation</td>
                        {compareList.map(name => {
                          const s = schemes.find(x => x.scheme_name === name);
                          return <td key={name} style={styles.tableTd}><span className="badge badge-purple">{s.occupation_required}</span></td>;
                        })}
                      </tr>
                      <tr>
                        <td style={styles.tableTd}>Financial Benefits</td>
                        {compareList.map(name => {
                          const s = schemes.find(x => x.scheme_name === name);
                          return <td key={name} style={{ ...styles.tableTd, fontSize: "0.9rem" }}>{s.benefits}</td>;
                        })}
                      </tr>
                      <tr>
                        <td style={styles.tableTd}>Documents Required</td>
                        {compareList.map(name => {
                          const s = schemes.find(x => x.scheme_name === name);
                          return (
                            <td key={name} style={styles.tableTd}>
                              <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                                {s.documents_required.map((doc, idx) => (
                                  <span key={idx} style={{ ...styles.docBadge, margin: 0 }}>{doc}</span>
                                ))}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                      <tr>
                        <td style={styles.tableTd}>Official Link</td>
                        {compareList.map(name => {
                          const s = schemes.find(x => x.scheme_name === name);
                          return (
                            <td key={name} style={styles.tableTd}>
                              <a href={s.official_link} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ padding: "6px 12px", fontSize: "0.8rem", textDecoration: "none" }}>
                                Apply <i className="fa-solid fa-chevron-right"></i>
                              </a>
                            </td>
                          );
                        })}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ANALYTICS & INSIGHTS */}
        {activeTab === "analytics" && (
          <div style={styles.gridTwoCol} className="animate-slide">
            {/* Left: General Stats & SVG Chart */}
            <div className="glass-panel" style={styles.panel}>
              <h2 style={styles.panelTitle}>
                <i className="fa-solid fa-chart-pie" style={{ color: "var(--accent-indigo)" }}></i> Database Demographics
              </h2>
              <p style={styles.panelSubtitle}>Key distribution metrics parsed from the active schemes registry.</p>
              
              <div style={styles.statsKpiGrid}>
                <div style={styles.kpiCard}>
                  <span style={styles.kpiLabel}>Total Registered</span>
                  <span style={styles.kpiVal}>{totalSchemes}</span>
                </div>
                <div style={styles.kpiCard}>
                  <span style={styles.kpiLabel}>Sectors Covered</span>
                  <span style={styles.kpiVal}>{sectors.length}</span>
                </div>
                <div style={styles.kpiCard}>
                  <span style={styles.kpiLabel}>Avg Income Ceiling</span>
                  <span style={styles.kpiVal}>₹{(avgIncomeLimit / 100000).toFixed(1)}L</span>
                </div>
              </div>

              {/* Custom SVG Bar Chart */}
              <div style={{ marginTop: "30px" }}>
                <h3 style={{ ...styles.panelSubtitle, color: "var(--text-primary)", fontWeight: 600 }}>Income Eligibility Cap (in ₹ Lakhs)</h3>
                <div style={styles.chartWrapper}>
                  <svg viewBox="0 0 400 200" style={styles.svgChart}>
                    {/* Grid lines */}
                    <line x1="50" y1="20" x2="380" y2="20" stroke="rgba(255,255,255,0.05)" />
                    <line x1="50" y1="60" x2="380" y2="60" stroke="rgba(255,255,255,0.05)" />
                    <line x1="50" y1="100" x2="380" y2="100" stroke="rgba(255,255,255,0.05)" />
                    <line x1="50" y1="140" x2="380" y2="140" stroke="rgba(255,255,255,0.05)" />
                    <line x1="50" y1="170" x2="380" y2="170" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
                    
                    {/* Y-Axis Labels */}
                    <text x="40" y="25" fill="var(--text-muted)" fontSize="8" textAnchor="end">50L</text>
                    <text x="40" y="65" fill="var(--text-muted)" fontSize="8" textAnchor="end">10L</text>
                    <text x="40" y="105" fill="var(--text-muted)" fontSize="8" textAnchor="end">5L</text>
                    <text x="40" y="145" fill="var(--text-muted)" fontSize="8" textAnchor="end">2L</text>
                    <text x="40" y="174" fill="var(--text-muted)" fontSize="8" textAnchor="end">0</text>

                    {/* Bars */}
                    {schemes.map((s, idx) => {
                      const maxVal = 5000000;
                      // Logarithmic-like scaling for visual presentation of wide ranges (2L to 50L)
                      const val = s.income_limit;
                      let percent = 0.1;
                      if (val <= 200000) percent = 0.2;
                      else if (val <= 250000) percent = 0.3;
                      else if (val <= 600000) percent = 0.55;
                      else if (val <= 1000000) percent = 0.75;
                      else percent = 0.95;

                      const barHeight = percent * 140;
                      const xPos = 65 + (idx * 50);
                      const yPos = 170 - barHeight;

                      return (
                        <g key={idx}>
                          {/* Gradient definition for bars */}
                          <defs>
                            <linearGradient id={`barGrad-${idx}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="var(--accent-indigo)" />
                              <stop offset="100%" stopColor="var(--accent-purple)" stopOpacity="0.6" />
                            </linearGradient>
                          </defs>
                          <rect 
                            x={xPos} 
                            y={yPos} 
                            width="24" 
                            height={barHeight} 
                            rx="3"
                            fill={`url(#barGrad-${idx})`} 
                          />
                          {/* Tiny value label */}
                          <text 
                            x={xPos + 12} 
                            y={yPos - 5} 
                            fill="var(--text-primary)" 
                            fontSize="7" 
                            textAnchor="middle"
                            fontWeight="600"
                          >
                            {val >= 100000 ? `${(val/100000).toFixed(1)}L` : val}
                          </text>
                          {/* Abbreviated x axis label */}
                          <text 
                            x={xPos + 12} 
                            y="185" 
                            fill="var(--text-secondary)" 
                            fontSize="6.5" 
                            textAnchor="middle"
                          >
                            {s.scheme_name.split(" ")[0] || "Scheme"}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>
            </div>

            {/* Right: Sector & Demographic Breakdown Cards */}
            <div className="glass-panel" style={styles.panel}>
              <h2 style={styles.panelTitle}>
                <i className="fa-solid fa-cubes" style={{ color: "var(--accent-emerald)" }}></i> Sector Coverage
              </h2>
              <p style={styles.panelSubtitle}>How schemes are categorized across social and industry areas.</p>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "15px", marginTop: "20px" }}>
                {Object.entries(sectorCounts).map(([sec, count], i) => {
                  const percent = (count / totalSchemes) * 100;
                  return (
                    <div key={i} style={styles.progBarRow}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                        <span style={{ fontWeight: 500, fontSize: "0.9rem" }}>{sec}</span>
                        <span style={{ color: "var(--accent-emerald)", fontWeight: 600, fontSize: "0.9rem" }}>{count} Scheme(s)</span>
                      </div>
                      <div style={styles.progTrack}>
                        <div style={{ 
                          ...styles.progFill, 
                          width: `${percent}%`,
                          background: "var(--gradient-emerald)"
                        }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <h2 style={{ ...styles.panelTitle, marginTop: "35px" }}>
                <i className="fa-solid fa-users" style={{ color: "var(--accent-orange)" }}></i> Target Occupations
              </h2>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "15px" }}>
                {Object.entries(occupationCounts).map(([occ, count], i) => (
                  <div key={i} style={styles.occChip} className="glass-panel">
                    <span style={{ fontWeight: 600, color: "var(--accent-orange)" }}>{occ}</span>
                    <span style={styles.occChipCount}>{count} Match{count > 1 ? "es" : ""}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SCHEME MITRA CHATBOT */}
        {activeTab === "chatbot" && (
          <div className="glass-panel" style={styles.chatContainer}>
            {/* Chat header */}
            <div style={styles.chatHeader}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={styles.botAvatar}>
                  <i className="fa-solid fa-robot"></i>
                </div>
                <div>
                  <span style={{ fontWeight: 700, fontSize: "1.1rem" }}>Scheme Mitra AI</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.75rem", color: "var(--accent-emerald)" }}>
                    <span style={styles.pulsingGreenDot}></span> Online Agent Assistance
                  </div>
                </div>
              </div>
              <button className="btn-secondary" style={{ padding: "6px 12px", fontSize: "0.8rem" }} onClick={() => setChatMessages([
                {
                  sender: "mitra",
                  text: "### Welcome to Scheme Mitra! 🌾\n\nI am your AI Government Schemes assistant. Tell me a bit about your background (e.g., *'I am a student from OBC category with annual family income of ₹1,80,000'*) or ask about a specific scheme, and I will check your eligibility instantly!",
                  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }
              ])}>
                <i className="fa-solid fa-rotate-left"></i> Reset Chat
              </button>
            </div>

            {/* Chat log */}
            <div style={styles.chatLog}>
              {chatMessages.map((msg, i) => (
                <div 
                  key={i} 
                  style={{
                    ...styles.messageWrapper,
                    justifyContent: msg.sender === "user" ? "flex-end" : "flex-start"
                  }}
                  className="animate-fade"
                >
                  {msg.sender === "mitra" && (
                    <div style={styles.messageAvatar}>
                      <i className="fa-solid fa-hand-holding-heart"></i>
                    </div>
                  )}
                  
                  <div style={{
                    ...styles.messageBubble,
                    background: msg.sender === "user" ? "var(--gradient-primary)" : "rgba(255,255,255,0.03)",
                    border: msg.sender === "user" ? "none" : "1px solid var(--border-color)",
                    borderBottomLeftRadius: msg.sender === "mitra" ? "2px" : "12px",
                    borderBottomRightRadius: msg.sender === "user" ? "2px" : "12px",
                  }}>
                    <div className="md-output" style={{ color: msg.sender === "user" ? "white" : "var(--text-primary)" }}>
                      {msg.sender === "user" ? <p style={{ color: "white" }}>{msg.text}</p> : renderMarkdown(msg.text)}
                    </div>
                    <span style={{
                      ...styles.messageTime,
                      color: msg.sender === "user" ? "rgba(255,255,255,0.7)" : "var(--text-muted)"
                    }}>{msg.time}</span>
                  </div>
                </div>
              ))}
              
              {chatLoading && (
                <div style={{ ...styles.messageWrapper, justifyContent: "flex-start" }}>
                  <div style={styles.messageAvatar}>
                    <i className="fa-solid fa-hand-holding-heart"></i>
                  </div>
                  <div style={{ ...styles.messageBubble, background: "rgba(255,255,255,0.03)", border: "1px solid var(--border-color)" }}>
                    <div style={styles.typingIndicator}>
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Prompt bubbles */}
            <div style={styles.quickPromptsRow}>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", alignSelf: "center" }}>Suggestions:</span>
              <button className="glass-panel" style={styles.promptBubble} onClick={() => handleSendMessage("I am a farmer with income under ₹2,00,000. Any benefits?")}>
                🚜 Farmer under ₹2L
              </button>
              <button className="glass-panel" style={styles.promptBubble} onClick={() => handleSendMessage("Scholarship schemes for SC/ST student")}>
                🎓 SC/ST Scholarship
              </button>
              <button className="glass-panel" style={styles.promptBubble} onClick={() => handleSendMessage("Tell me about Ayushman Bharat")}>
                🏥 Ayushman Bharat
              </button>
            </div>

            {/* Input field */}
            <div style={styles.chatInputRow}>
              <input 
                id="chat-input"
                type="text" 
                className="form-input" 
                placeholder="Ask Scheme Mitra about eligibility, documents, or benefits..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                disabled={chatLoading}
              />
              <button 
                className="btn-primary" 
                onClick={() => handleSendMessage()}
                disabled={chatLoading || !chatInput.trim()}
              >
                <i className="fa-solid fa-paper-plane"></i> Send
              </button>
            </div>
          </div>
        )}


      </main>
    </div>
  );
}

// Inline JS Styling matching Premium Glassmorphism Theme
const styles = {
  appContainer: {
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
    width: "100%",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 40px",
    background: "rgba(11, 15, 25, 0.7)",
    backdropFilter: "blur(12px)",
    borderBottom: "1px solid var(--border-color)",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  logoContainer: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  logoIcon: {
    fontSize: "1.6rem",
    color: "var(--accent-indigo)",
    filter: "drop-shadow(0 0 8px rgba(99, 102, 241, 0.6))",
  },
  logoText: {
    fontFamily: "var(--font-display)",
    fontSize: "1.4rem",
    fontWeight: 800,
    letterSpacing: "-0.02em",
  },
  nav: {
    display: "flex",
    gap: "6px",
    background: "rgba(255, 255, 255, 0.03)",
    padding: "4px",
    borderRadius: "12px",
    border: "1px solid var(--border-color)",
  },
  tabBtn: {
    background: "none",
    border: "none",
    color: "var(--text-secondary)",
    padding: "8px 16px",
    borderRadius: "8px",
    fontFamily: "var(--font-display)",
    fontWeight: 600,
    fontSize: "0.9rem",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    transition: "all 0.2s ease",
  },
  activeTabBtn: {
    background: "rgba(255,255,255,0.07)",
    border: "none",
    color: "var(--text-primary)",
    padding: "8px 16px",
    borderRadius: "8px",
    fontFamily: "var(--font-display)",
    fontWeight: 600,
    fontSize: "0.9rem",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.1), 0 2px 4px rgba(0,0,0,0.1)",
    borderBottom: "2px solid var(--accent-indigo)",
  },
  statusBadge: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "rgba(255,255,255,0.04)",
    padding: "6px 12px",
    borderRadius: "999px",
    border: "1px solid var(--border-color)",
  },
  statusDot: {
    width: "7px",
    height: "7px",
    borderRadius: "50%",
  },
  statusText: {
    fontSize: "0.75rem",
    fontWeight: 600,
    color: "var(--text-secondary)",
  },
  mainContent: {
    flex: 1,
    padding: "40px",
    maxWidth: "1280px",
    width: "100%",
    margin: "0 auto",
  },
  gridTwoCol: {
    display: "grid",
    gridTemplateColumns: "380px 1fr",
    gap: "30px",
    alignItems: "start",
  },
  panel: {
    padding: "30px",
  },
  panelTitle: {
    fontFamily: "var(--font-display)",
    fontSize: "1.45rem",
    fontWeight: 700,
    marginBottom: "8px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  panelSubtitle: {
    fontSize: "0.875rem",
    color: "var(--text-secondary)",
    marginBottom: "24px",
    lineHeight: "1.4",
  },
  sliderContainer: {
    marginBottom: "20px",
  },
  rangeLabels: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "0.75rem",
    color: "var(--text-muted)",
    marginTop: "4px",
  },
  profileBadgeSummary: {
    marginTop: "30px",
    paddingTop: "20px",
    borderTop: "1px solid var(--border-color)",
  },
  profileSummaryText: {
    fontSize: "0.8rem",
    fontWeight: 600,
    color: "var(--text-muted)",
    display: "block",
    marginBottom: "10px",
  },
  badgeRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
  },
  resultsContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  cardsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "20px",
  },
  cardsGridThree: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "20px",
    marginTop: "20px",
  },
  schemeCard: {
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "start",
    gap: "10px",
  },
  cardTitle: {
    fontFamily: "var(--font-display)",
    fontSize: "1.15rem",
    fontWeight: 700,
    lineHeight: "1.3",
  },
  cardRow: {
    display: "flex",
    fontSize: "0.9rem",
    gap: "10px",
  },
  cardMetaLabel: {
    color: "var(--text-muted)",
    width: "70px",
    flexShrink: 0,
  },
  cardMetaVal: {
    color: "var(--text-secondary)",
  },
  successBox: {
    background: "rgba(16, 185, 129, 0.08)",
    border: "1px solid rgba(16, 185, 129, 0.15)",
    padding: "10px 14px",
    borderRadius: "8px",
    color: "#a7f3d0",
    fontSize: "0.85rem",
    display: "flex",
    alignItems: "center",
  },
  errorBox: {
    background: "rgba(249, 115, 22, 0.08)",
    border: "1px solid rgba(249, 115, 22, 0.15)",
    padding: "12px 14px",
    borderRadius: "8px",
    color: "#ffedd5",
    fontSize: "0.85rem",
  },
  cardActionRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    marginTop: "6px",
  },
  explorerHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "start",
    marginBottom: "24px",
    gap: "20px",
  },
  explorerControls: {
    display: "flex",
    gap: "10px",
  },
  filterRow: {
    display: "flex",
    gap: "15px",
    marginBottom: "24px",
  },
  searchIcon: {
    position: "absolute",
    left: "16px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "var(--text-muted)",
  },
  checkboxLabel: {
    fontSize: "0.8rem",
    fontWeight: 600,
    color: "var(--text-secondary)",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
  },
  explorerCard: {
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    minHeight: "400px",
  },
  detailRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "0.85rem",
    padding: "8px 0",
    borderBottom: "1px solid rgba(255,255,255,0.03)",
  },
  detailLabel: {
    color: "var(--text-muted)",
  },
  detailVal: {
    color: "var(--text-primary)",
    fontWeight: "500",
  },
  benefitsText: {
    fontSize: "0.85rem",
    color: "var(--text-secondary)",
    lineHeight: "1.4",
    background: "rgba(255,255,255,0.02)",
    padding: "8px 12px",
    borderRadius: "6px",
    borderLeft: "2px solid var(--accent-indigo)",
  },
  docBadgeContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: "4px",
    marginTop: "6px",
  },
  docBadge: {
    fontSize: "0.7rem",
    background: "rgba(255,255,255,0.05)",
    color: "var(--text-secondary)",
    padding: "3px 8px",
    borderRadius: "4px",
    border: "1px solid var(--border-color)",
  },
  tamilExplanationBox: {
    marginTop: "14px",
    background: "rgba(249, 115, 22, 0.04)",
    border: "1px solid rgba(249, 115, 22, 0.08)",
    padding: "10px 12px",
    borderRadius: "8px",
    color: "#ffedd5",
  },
  comparisonDrawer: {
    padding: "16px 24px",
    marginBottom: "24px",
    background: "rgba(99, 102, 241, 0.08)",
    border: "1px solid rgba(99, 102, 241, 0.25)",
  },
  compareTable: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "16px",
    minWidth: "600px",
  },
  tableTh: {
    padding: "14px",
    textAlign: "left",
    background: "rgba(255,255,255,0.02)",
    borderBottom: "2px solid var(--border-color)",
    fontWeight: "600",
    fontSize: "0.95rem",
  },
  tableTd: {
    padding: "14px",
    borderBottom: "1px solid var(--border-color)",
    color: "var(--text-secondary)",
    fontSize: "0.875rem",
  },
  statsKpiGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "15px",
  },
  kpiCard: {
    background: "rgba(255,255,255,0.02)",
    border: "1px solid var(--border-color)",
    borderRadius: "12px",
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  kpiLabel: {
    fontSize: "0.75rem",
    color: "var(--text-muted)",
    textTransform: "uppercase",
    fontWeight: 600,
    letterSpacing: "0.05em",
  },
  kpiVal: {
    fontFamily: "var(--font-display)",
    fontSize: "1.7rem",
    fontWeight: 800,
    color: "var(--accent-indigo)",
  },
  chartWrapper: {
    marginTop: "20px",
    padding: "15px",
    background: "rgba(0,0,0,0.2)",
    borderRadius: "12px",
    border: "1px solid var(--border-color)",
  },
  svgChart: {
    width: "100%",
    height: "auto",
  },
  progBarRow: {
    display: "flex",
    flexDirection: "column",
  },
  progTrack: {
    width: "100%",
    height: "6px",
    background: "rgba(255,255,255,0.05)",
    borderRadius: "3px",
    overflow: "hidden",
  },
  progFill: {
    height: "100%",
    borderRadius: "3px",
  },
  occChip: {
    padding: "10px 16px",
    display: "flex",
    flexDirection: "column",
    gap: "2px",
    borderRadius: "10px",
  },
  occChipCount: {
    fontSize: "0.75rem",
    color: "var(--text-muted)",
  },
  chatContainer: {
    height: "620px",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    maxWidth: "850px",
    margin: "0 auto",
  },
  chatHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 24px",
    borderBottom: "1px solid var(--border-color)",
    background: "rgba(255,255,255,0.01)",
  },
  botAvatar: {
    width: "38px",
    height: "38px",
    background: "var(--gradient-primary)",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.1rem",
    boxShadow: "0 0 10px rgba(99,102,241,0.4)",
  },
  pulsingGreenDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    backgroundColor: "var(--accent-emerald)",
    animation: "blink 1.5s infinite",
  },
  chatLog: {
    flex: 1,
    padding: "24px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    background: "rgba(0,0,0,0.08)",
  },
  messageWrapper: {
    display: "flex",
    gap: "12px",
    alignItems: "start",
    maxWidth: "85%",
  },
  messageAvatar: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    background: "rgba(99, 102, 241, 0.15)",
    border: "1px solid var(--border-color-active)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.85rem",
    color: "var(--accent-indigo)",
    flexShrink: 0,
  },
  messageBubble: {
    padding: "14px 18px",
    borderRadius: "12px",
    position: "relative",
    maxWidth: "100%",
  },
  messageTime: {
    display: "block",
    fontSize: "0.7rem",
    marginTop: "6px",
    textAlign: "right",
  },
  typingIndicator: {
    display: "flex",
    gap: "4px",
    alignItems: "center",
    padding: "4px 0",
  },
  quickPromptsRow: {
    display: "flex",
    gap: "10px",
    padding: "12px 24px",
    background: "rgba(0,0,0,0.04)",
    borderTop: "1px solid var(--border-color)",
    overflowX: "auto",
  },
  promptBubble: {
    padding: "6px 12px",
    fontSize: "0.75rem",
    fontWeight: 500,
    cursor: "pointer",
    borderRadius: "8px",
    whiteSpace: "nowrap",
    color: "var(--text-secondary)",
    background: "rgba(255,255,255,0.02)",
    transition: "all 0.2s ease",
    border: "1px solid var(--border-color)",
  },
  chatInputRow: {
    display: "flex",
    padding: "16px 24px",
    gap: "12px",
    borderTop: "1px solid var(--border-color)",
    background: "rgba(11, 15, 25, 0.5)",
  },
  gridTwoColForm: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "15px",
  },
  gridThreeColForm: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "15px",
  },
  statusMessage: {
    padding: "12px 16px",
    borderRadius: "8px",
    border: "1px solid",
    fontSize: "0.9rem",
    display: "flex",
    alignItems: "center",
    marginBottom: "20px",
  },
};

export default App;
