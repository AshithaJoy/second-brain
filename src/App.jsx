import { useState, useEffect, useCallback, useRef } from "react";
import { useAuthStore } from "./stores/auth.store";
import {
  getDumps as apiGetDumps,
  createDump as apiCreateDump,
  updateDump as apiUpdateDump,
  deleteDump as apiDeleteDump,
  rewriteDump as apiRewriteDump,
  getJobStatus as apiGetJobStatus
} from "./api/brain.api";
import {
  getPosts as apiGetPosts,
  createPost as apiCreatePost,
  updatePost as apiUpdatePost,
  deletePost as apiDeletePost,
  generateHooks as apiGenerateHooks,
  generateCaptions as apiGenerateCaptions,
  getShoots as apiGetShoots,
  createShoot as apiCreateShoot,
  updateShoot as apiUpdateShoot,
  deleteShoot as apiDeleteShoot
} from "./api/planner.api";
import {
  getCollabs as apiGetCollabs,
  createCollab as apiCreateCollab,
  updateCollab as apiUpdateCollab,
  deleteCollab as apiDeleteCollab,
  estimateCollab as apiEstimateCollab,
  discoverBrands as apiDiscoverBrands
} from "./api/collabs.api";
import {
  getBreakdowns as apiGetBreakdowns,
  breakdownReel as apiBreakdownReel,
  deleteBreakdown as apiDeleteBreakdown
} from "./api/reels.api";
import {
  getBRolls as apiGetBRolls,
  createBRoll as apiCreateBRoll,
  updateBRoll as apiUpdateBRoll,
  deleteBRoll as apiDeleteBRoll
} from "./api/broll.api";
import {
  getJournalEntries as apiGetJournalEntries,
  createJournalEntry as apiCreateJournalEntry,
  updateJournalEntry as apiUpdateJournalEntry,
  deleteJournalEntry as apiDeleteJournalEntry
} from "./api/journal.api";
import { SaveButton, SaveToast } from "./components/SaveUX";
import {
  connectInstagram as apiConnectInstagram,
  getInstagramProfile as apiGetInstagramProfile,
  getInstagramMedia as apiGetInstagramMedia,
  disconnectInstagram as apiDisconnectInstagram,
  syncInstagram as apiSyncInstagram,
  getInstagramIntelligence as apiGetInstagramIntelligence,
  getInstagramOAuthUrl as apiGetInstagramOAuthUrl
} from "./api/instagram.api";
import {
  getProfile as apiGetProfile,
  saveProfile as apiSaveProfile,
  updateProfile as apiUpdateProfile,
  getProfileCompletionStatus as apiGetProfileCompletionStatus
} from "./api/profile.api";
import InstagramConnectionCard from "./components/InstagramConnectionCard";
import SelectableChip from "./components/SelectableChip";
import CreatorIntelligenceDashboard from "./components/CreatorIntelligenceDashboard";
import { BRollVault } from "./components/broll/BRollVault";
import { PostEditorModal } from "./components/planner/PostEditorModal";



// ── constants ──────────────────────────────────────────────────────────────────
const MOODS = ["cinematic","soft","chaotic","reflective","motivated","low-energy","rebuilding","funny","existential"];
const MOOD_COLORS = {
  cinematic:"#c9b99a",soft:"#d4c5e2",chaotic:"#f0a090",reflective:"#a0b8c8",
  motivated:"#a8c8a0","low-energy":"#b8b8c8",rebuilding:"#c8b890",funny:"#f0c870",existential:"#b0a0c0",
  quiet:"#b8c8b8",nostalgic:"#d4b8a0",dreamy:"#c0b0d8",
  inspired:"#a0b8c8", exhausted:"#b8b8c8", proud:"#f0c870"
};
const VAULT_MOODS      = ["cinematic","reflective","quiet","rebuilding","nostalgic","dreamy","chaotic","soft","motivated"];
const CLIP_TYPES       = ["video","image","screenshot","fragment"];
const CINEMATIC_USES   = ["intro shot","transition","emotional pause","voiceover support","ending shot","filler shot"];
const ENERGY_LEVELS    = ["quiet","soft","neutral","energetic","chaotic"];
const TIME_OF_DAY      = ["golden hour","morning","afternoon","blue hour","evening","night","overcast"];
const WEATHER_OPTIONS  = ["sunny","overcast","rainy","foggy","cloudy","golden","blue hour","stormy"];
const LIGHTING_OPTIONS = ["natural","golden","warm lamp","neon","overcast","harsh","soft window","backlit"];
const MOTION_TYPES     = ["static","slow pan","handheld","timelapse","slow-mo","tracking","close-up","aerial"];

const POST_TYPES   = ["reel","carousel","story","note"];
const TYPE_ICONS   = {reel:"▶",carousel:"⊞",story:"◯",note:"✎"};
const DAYS         = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const MONTHS       = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const STATUS_COLORS= {DRAFT:"#F9D0CD",REVIEW:"#D0E5F9",APPROVED:"#D0F9D0",SCHEDULED:"#FAFFCB",PUBLISHED:"#F891BB",FAILED:"#FFCCCC",ARCHIVED:"#b8b8c8"};
const STATUS_TEXT_COLORS = {DRAFT:"#9C1D54",REVIEW:"#1D549C",APPROVED:"#1D9C54",SCHEDULED:"#706000",PUBLISHED:"#F13E93",FAILED:"#9C1D1D",ARCHIVED:"#736F6A"};

const RATES = {
  reel: 500,
  story: 50,
  carousel: 300,
  photo: 200,
  custom: 100
};

const parseQuantity = (text) => {
  if (!text) return 1;
  const match = String(text).match(/^(\d+)\s*x/i);
  return match ? parseInt(match[1], 10) : 1;
};

const calculateCollabRates = (deliverables) => {
  let reels = 0;
  let stories = 0;
  let carousels = 0;
  let photos = 0;
  let customs = [];
  
  if (Array.isArray(deliverables)) {
    deliverables.forEach(d => {
      const qty = parseQuantity(d.text);
      const type = d.type || "custom";
      if (type === "reel") reels += qty;
      else if (type === "story") stories += qty;
      else if (type === "carousel") carousels += qty;
      else if (type === "photo") photos += qty;
      else {
        customs.push({ text: d.text, qty, price: d.price || RATES.custom });
      }
    });
  }
  
  const reelsBase = reels * RATES.reel;
  const reelsCost = Math.floor(reels / 2) * 900 + (reels % 2) * 500;
  const reelsDiscount = reelsBase - reelsCost;
  
  const storiesCost = stories * RATES.story;
  const carouselsCost = carousels * RATES.carousel;
  const photosCost = photos * RATES.photo;
  
  let customsCost = 0;
  customs.forEach(c => { customsCost += c.qty * c.price; });
  
  const subtotal = reelsBase + storiesCost + carouselsCost + photosCost + customsCost;
  const discount = reelsDiscount;
  const total = subtotal - discount;

  const itemsBreakdown = [];
  if (reels > 0) {
    itemsBreakdown.push({
      name: "Reels Content Creation",
      qty: reels,
      rate: RATES.reel,
      discount: reelsDiscount,
      total: reelsCost
    });
  }
  if (stories > 0) {
    itemsBreakdown.push({
      name: "Instagram Stories",
      qty: stories,
      rate: RATES.story,
      discount: 0,
      total: storiesCost
    });
  }
  if (carousels > 0) {
    itemsBreakdown.push({
      name: "Carousel Posts",
      qty: carousels,
      rate: RATES.carousel,
      discount: 0,
      total: carouselsCost
    });
  }
  if (photos > 0) {
    itemsBreakdown.push({
      name: "Static Photo Content",
      qty: photos,
      rate: RATES.photo,
      discount: 0,
      total: photosCost
    });
  }
  customs.forEach(cust => {
    itemsBreakdown.push({
      name: cust.text || "Custom Deliverable",
      qty: cust.qty,
      rate: cust.price,
      discount: 0,
      total: cust.qty * cust.price
    });
  });
  
  return {
    reels,
    stories,
    carousels,
    photos,
    reelsCost,
    reelsDiscount,
    storiesCost,
    carouselsCost,
    photosCost,
    customsCost,
    subtotal,
    discount,
    total,
    customs,
    itemsBreakdown
  };
};

const MICROCOPY    = [
  "something cinematic could happen today","still processing, and that's okay",
  "go film the coffee before it gets cold","your future self will thank you",
  "chaos is just unedited creativity","even small posts count",
  "the light is good right now","document the ordinary moments",
];
const DUMP_PLACEHOLDERS = [
  "trying to fix my sleep schedule...","POV: rebuilding life slowly",
  "gym comeback but mentally tired","late-night overthinking voiceover",
  "rainy evening thoughts","that thing I noticed on the walk home",
  "the feeling before everything changes",
];
const STORAGE = {
  posts:"sb-posts",dumps:"sb-dumps",shoots:"sb-shoots",
  tab:"sb-tab",shootFilter:"sb-shootFilter",vault:"sb-vault",
  journal:"sb-journal",collabs:"sb-collabs",trends:"sb-trends",
  theme:"sb-theme",niche:"sb-niche"
};

// ── date helpers ───────────────────────────────────────────────────────────────
const pad         = n => String(n).padStart(2,"0");
const getNow      = () => new Date();
const toDateStr   = d => { if(!(d instanceof Date)||isNaN(d)) return ""; return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; };
const fromDateStr = s => { if(!s||typeof s!=="string") return null; const p=s.split("-").map(Number); if(p.length!==3||p.some(isNaN)) return null; const d=new Date(p[0],p[1]-1,p[2]); return isNaN(d.getTime())?null:d; };
const friendlyDate= s => { const d=fromDateStr(s); if(!d) return ""; return `${MONTHS[d.getMonth()].slice(0,3)} ${d.getDate()}`; };
const isToday     = s => { const d=fromDateStr(s); if(!d) return false; const t=getNow(); return d.getFullYear()===t.getFullYear()&&d.getMonth()===t.getMonth()&&d.getDate()===t.getDate(); };
const isThisWeek  = s => { const d=fromDateStr(s); if(!d) return false; const t=getNow(); const st=new Date(t); st.setDate(t.getDate()-t.getDay()); st.setHours(0,0,0,0); const en=new Date(st); en.setDate(st.getDate()+7); return d>=st&&d<en; };
const isThisMonth = s => { const d=fromDateStr(s); if(!d) return false; const t=getNow(); return d.getFullYear()===t.getFullYear()&&d.getMonth()===t.getMonth(); };
const isUpcoming  = s => { const d=fromDateStr(s); if(!d) return false; const t=getNow(); t.setHours(0,0,0,0); return d>=t; };
const daysOffset  = n => { const d=new Date(); d.setDate(d.getDate()+n); return toDateStr(d); };
const prevMonth   = (y,m) => m===0?[y-1,11]:[y,m-1];
const nextMonth   = (y,m) => m===11?[y+1,0]:[y,m+1];
const todayStr    = toDateStr(getNow());

// ── localStorage ───────────────────────────────────────────────────────────────
const load = (key,fb) => { try { const v=localStorage.getItem(key); return v?JSON.parse(v):fb; } catch { return fb; } };
const save = (key,val) => { try { localStorage.setItem(key,JSON.stringify(val)); } catch {} };

// ── seed data ──────────────────────────────────────────────────────────────────
const SEED_POSTS  = [];
const SEED_DUMPS  = [];
const SEED_SHOOTS = [];
const SEED_VAULT  = [];
const SEED_JOURNAL = [];
const SEED_COLLABS = [];

const COLLAB_TEMPLATES = {
  outreach: {
    label: "first outreach",
    subject: "Collaboration query: [Your Name] x [Brand Name]",
    body: "Hi [Contact Name],\n\nI’ve been documenting my journey of slow creation on my page, and my community of creators absolutely loves content around aesthetic and sustainable workspaces. I’m a huge fan of [Brand Name] and have been using your products in my daily setup.\n\nI’d love to pitch a cinematic showcase reel incorporating your brand. Let me know if you’re open to discussing a collaboration!\n\nWarmly,\n[Your Name]"
  },
  pricing: {
    label: "pricing response",
    subject: "Rates sheet & deliverables: [Your Name] x [Brand Name]",
    body: "Hi [Contact Name],\n\nThank you for reaching back! My standard rate for a dedicated Reel and supporting Story series is $[Rate]. This includes custom footage, high-fidelity audio syncing, caption scripting, and 30-day usage rights.\n\nI’m happy to package this or adapt it to align with your seasonal campaign goals.\n\nBest,\n[Your Name]"
  },
  followUp: {
    label: "follow-up nudge",
    subject: "Follow up: [Your Name] x [Brand Name]",
    body: "Hi [Contact Name],\n\nHope your week is going well! Just checking in on my previous message regarding a potential collaboration. I’d love to lock in the timeline for next month if you’re interested.\n\nLooking forward to hearing from you,\n[Your Name]"
  }
};

const NICHES = [
  {id: "minimalist-productivity", label: "minimalist productivity", tags:["desk", "workplace", "typing", "routine", "quiet", "planning"]},
  {id: "aesthetic-lifestyle", label: "aesthetic lifestyle", tags:["coffee", "steam", "morning", "sunlight", "cozy", "rain"]},
  {id: "build-in-public", label: "building in public", tags:["desk", "typing", "screen", "process", "chaos", "rebuilding"]}
];

const MOCK_TRENDS_DATA = {
  "minimalist-productivity": [
    {id:501,title:"The 3-Second Realization Hook",views:"850K views",postedDate:"3d ago",hook:"Here's the exact moment everything shifted...",whyItWorked:"It triggers curiosity immediately by starting with the transition, not the end state. Visuals show a busy workspace, then cut to empty hands or calendar.",audioTrack:"Bleeding Love (Leona Lewis) ↗",audioTrending:true,keyTakeaway:"Record a close-up of typing on a keyboard, then cut to your calendar. Overlay realization text.",visualTags:["desk", "typing", "workplace"]},
    {id:502,title:"Silent Desk Organization",views:"1.2M views",postedDate:"5d ago",hook:"Small systems still count as systems.",whyItWorked:"Audiences find organizational ASMR relaxing. Pair with list-based captions punctuted by trending beats.",audioTrack:"EVERYTHING HALLELUJAH (Justin Bieber) ↗",audioTrending:true,keyTakeaway:"Record desk cleanup clips. Use rhythmic sound design matching the audio beats.",visualTags:["desk", "planning", "quiet"]}
  ],
  "aesthetic-lifestyle": [
    {id:503,title:"Morning Coffee Steam Close-Up",views:"2.1M views",postedDate:"2d ago",hook:"POV: Rebuilding life slowly, one morning at a time.",whyItWorked:"Satisfying visual of coffee brewing mixed with golden hour lighting. Relies on microcopy about slow progress and warm emotional aesthetics.",audioTrack:"Be Like a Woman (Chris Rainbow) ↗",audioTrending:true,keyTakeaway:"Tripod close-up of steam rising in golden morning light. Slow handheld pan around the mug.",visualTags:["coffee", "steam", "morning"]},
    {id:504,title:"Rainy Evening Reflection",views:"980K views",postedDate:"4d ago",hook:"Documenting the quiet moments before everything changes.",whyItWorked:"Moody, blue-toned visuals paired with heavy rain noise and slow transitions. Relies on high-empathy confessional voiceover.",audioTrack:"Material Lover (Sienna Spiro) ↗",audioTrending:true,keyTakeaway:"Film rain sliding down window from inside car or desk. Mute original sound and add rain ASMR.",visualTags:["rain", "cozy", "sunlight"]}
  ],
  "build-in-public": [
    {id:505,title:"The Chaos vs. Creation Split",views:"740K views",postedDate:"1d ago",hook:"'You are so creative!' -> POV: the messy reality.",whyItWorked:"Shows the unpolished, chaotic desk space behind a clean, beautiful output. High relatability for digital builders.",audioTrack:"Dracula (JENNIE Remix) ↗",audioTrending:true,keyTakeaway:"Take a wide zoom shot of a chaotic workspace. Transition into a polished close-up of the laptop screen.",visualTags:["desk", "screen", "chaos"]},
    {id:506,title:"Late Night Coding Loop",views:"1.1M views",postedDate:"6d ago",hook:"POV: trying to fix my sleep schedule but the code is finally compile-ready.",whyItWorked:"Warm keyboard light contrast. Fits the 'tired but motivated' mindset of builders.",audioTrack:"Vogue (Madonna Edit) ↗",audioTrending:false,keyTakeaway:"Place warm lamp light behind monitor. Slow tracking shot from screen to face.",visualTags:["desk", "typing", "process"]}
  ]
};

// ── shared tiny components ─────────────────────────────────────────────────────
function Tag({label,color,size=12}){
  let bgColor = color + "22";
  let textColor = color;
  
  if (color === "#F9D0CD" || color === "var(--accent-light)") {
    bgColor = "#F9D0CD";
    textColor = "#9C1D54";
  } else if (color === "#FAFFCB") {
    bgColor = "#FAFFCB";
    textColor = "#706000";
  } else if (color === "#F891BB" || color === "var(--accent-dark)") {
    bgColor = "#F891BB";
    textColor = "#4A0225";
  } else if (color === "#F13E93" || color === "var(--accent-color)") {
    bgColor = "rgba(241, 62, 147, 0.08)";
    textColor = "#F13E93";
  }
  
  return <span style={{fontSize:size,padding:"2px 9px",borderRadius:20,background:bgColor,color:textColor,fontWeight:600,letterSpacing:0.3,whiteSpace:"nowrap"}}>{label}</span>;
}
function MoodPicker({value,onChange,moods=MOODS}){
  return(
    <div style={{display:"flex",flexWrap:"wrap",gap:6,margin:"6px 0"}}>
      {moods.map(m=>(
        <SelectableChip 
          key={m} 
          selected={value===m} 
          onClick={()=>onChange(m===value?"":m)}
          variant="semantic"
          mood={m}
          data-testid={`mood-chip-${m}`}
        >
          {m}
        </SelectableChip>
      ))}
    </div>
  );
}
function NavBtn({onClick,children,active=false,color="#b0a898"}){
  return(
    <button onClick={onClick} style={{
      background:"none",border:`1px solid ${active?color+"80":"var(--border-color)"}`,borderRadius:20,
      padding:"5px 14px",fontSize:12,cursor:"pointer",color:active?color:"var(--text-secondary)",
      fontFamily:"inherit",transition:"all 0.18s",
    }}>{children}</button>
  );
}
function ChipSelect({label,options,value,onChange}){
  return(
    <div>
      <span style={{fontSize:12,color:"var(--text-muted)",display:"block",marginBottom:4}}>{label}</span>
      <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
        {options.map(o=>(
          <SelectableChip 
            key={o} 
            selected={value===o} 
            onClick={()=>onChange(value===o?"":o)}
            variant="filter"
            data-testid={`filter-chip-${o.toLowerCase()}`}
          >
            {o}
          </SelectableChip>
        ))}
      </div>
    </div>
  );
}

// ── B-ROLL VAULT COMPONENT ─────────────────────────────────────────────────────

const getSuggestedShotsForMood = (mood) => {
  const suggestions = {
    motivated: {
      morning: [{ id: 1, shot: "alarm clock setup", loc: "bedroom", mood: "motivated", light: "natural", angle: "close-up", props: "phone/clock" }],
      afternoon: [{ id: 2, shot: "gym workout action footage", loc: "gym", mood: "motivated", light: "fluorescent", angle: "tracking", props: "water bottle" }],
      evening: [{ id: 3, shot: "reviewing goals / calendar plan", loc: "desk", mood: "motivated", light: "warm lamp", angle: "slow pan", props: "notebook" }]
    },
    soft: {
      morning: [{ id: 1, shot: "coffee steam rising close-up", loc: "kitchen", mood: "soft", light: "soft window", angle: "static", props: "mug" }],
      afternoon: [{ id: 2, shot: "reading or typing journal details", loc: "living room", mood: "soft", light: "natural", angle: "over-the-shoulder", props: "book/pen" }],
      evening: [{ id: 3, shot: "dimming lights, cozy setup", loc: "bedroom", mood: "soft", light: "warm lamp", angle: "slow pan", props: "candle" }]
    },
    cinematic: {
      morning: [{ id: 1, shot: "sunlight breaking through blinds", loc: "bedroom", mood: "cinematic", light: "golden hour", angle: "slow pan", props: "blinds" }],
      afternoon: [{ id: 2, shot: "walking along quiet street side profile", loc: "street", mood: "cinematic", light: "overcast", angle: "handheld", props: "camera bag" }],
      evening: [{ id: 3, shot: "city lights blur tracking", loc: "balcony", mood: "cinematic", light: "blue hour", angle: "slow-mo", props: "" }]
    },
    default: {
      morning: [{ id: 1, shot: "morning light overview", loc: "room", mood: "soft", light: "natural", angle: "wide", props: "" }],
      afternoon: [{ id: 2, shot: "details of creative work / typing", loc: "desk", mood: "cinematic", light: "natural", angle: "close-up", props: "notebook" }],
      evening: [{ id: 3, shot: "wrapping up the day / reading", loc: "room", mood: "reflective", light: "warm lamp", angle: "static", props: "" }]
    }
  };
  return suggestions[mood] || suggestions.default;
};

// ── MAIN APP ───────────────────────────────────────────────────────────────────
export default function App(){
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const [tab,      setTabRaw]    = useState(()=>load(STORAGE.tab,"dashboard"));
  const [profile, setProfile] = useState(null);
  const [profileStatus, setProfileStatus] = useState({ complete: false, score: 0, checklist: {} });
  const [showWizard, setShowWizard] = useState(false);
  const [skipWizard, setSkipWizard] = useState(() => localStorage.getItem("sb-skip-onboarding") === "true");

  const [wizardStep, setWizardStep] = useState(1);
  const [wizardForm, setWizardForm] = useState({
    primaryNiche: "Other",
    secondaryNiches: [],
    primaryGoal: "Grow Followers",
    audienceSize: "0–1k",
    creatorStage: "Just Starting",
    postingFrequency: "Weekly",
    preferredFormats: ["Reels"],
    contentPillars: ["Lifestyle"],
    toneOfVoice: "Friendly",
    biggestChallenge: "Consistency",
    aiAssistanceLevel: "Balanced"
  });

  const fetchProfileData = useCallback(async () => {
    if (!user) return;
    try {
      const status = await apiGetProfileCompletionStatus();
      setProfileStatus(status);
      
      const isSkipped = localStorage.getItem("sb-skip-onboarding") === "true";
      setSkipWizard(isSkipped);
      
      if (!status.complete && !isSkipped) {
        setShowWizard(true);
      } else {
        setShowWizard(false);
      }

      const prof = await apiGetProfile().catch(() => null);
      if (prof) {
        setProfile(prof);
        
        const parseJsonArray = (val) => {
          if (!val) return [];
          if (typeof val === "string") {
            try {
              return JSON.parse(val);
            } catch (e) {
              return [];
            }
          }
          return Array.isArray(val) ? val : [];
        };

        setWizardForm({
          primaryNiche: prof.primaryNiche || "Other",
          secondaryNiches: parseJsonArray(prof.secondaryNiches),
          primaryGoal: prof.primaryGoal || "Grow Followers",
          audienceSize: prof.audienceSize || "0–1k",
          creatorStage: prof.creatorStage || "Just Starting",
          postingFrequency: prof.postingFrequency || "Weekly",
          preferredFormats: parseJsonArray(prof.preferredFormats).length > 0 ? parseJsonArray(prof.preferredFormats) : ["Reels"],
          contentPillars: parseJsonArray(prof.contentPillars).length > 0 ? parseJsonArray(prof.contentPillars) : ["Lifestyle"],
          toneOfVoice: prof.toneOfVoice || "Friendly",
          biggestChallenge: prof.biggestChallenge || "Consistency",
          aiAssistanceLevel: prof.aiAssistanceLevel || "Balanced"
        });
      }
    } catch (err) {
      console.error("Failed to load profile details:", err);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchProfileData();
    } else {
      setProfile(null);
      setProfileStatus({ complete: false, score: 0, checklist: {} });
      setShowWizard(false);
    }
  }, [user, fetchProfileData]);

  const handleSaveWizardProgress = async (updatedForm) => {
    try {
      const saved = await apiSaveProfile(updatedForm);
      setProfile(saved);
      const status = await apiGetProfileCompletionStatus();
      setProfileStatus(status);
    } catch (err) {
      console.error("Failed to auto-save wizard progress:", err);
    }
  };

  const handleSkipWizard = () => {
    localStorage.setItem("sb-skip-onboarding", "true");
    setSkipWizard(true);
    setShowWizard(false);
    showToast("Creator DNA skipped. You can complete it in Settings at any time.");
  };

  const toggleSecondaryNiche = (niche) => {
    setWizardForm(prev => {
      const active = prev.secondaryNiches.includes(niche);
      const updated = active 
        ? prev.secondaryNiches.filter(x => x !== niche)
        : [...prev.secondaryNiches, niche];
      handleSaveWizardProgress({ ...prev, secondaryNiches: updated });
      return { ...prev, secondaryNiches: updated };
    });
  };

  const togglePreferredFormat = (format) => {
    setWizardForm(prev => {
      const active = prev.preferredFormats.includes(format);
      const updated = active
        ? prev.preferredFormats.filter(x => x !== format)
        : [...prev.preferredFormats, format];
      handleSaveWizardProgress({ ...prev, preferredFormats: updated });
      return { ...prev, preferredFormats: updated };
    });
  };

  const toggleContentPillar = (pillar) => {
    setWizardForm(prev => {
      const active = prev.contentPillars.includes(pillar);
      if (!active && prev.contentPillars.length >= 5) {
        showToast("⚠️ Maximum 5 content pillars allowed.", "error");
        return prev;
      }
      const updated = active
        ? prev.contentPillars.filter(x => x !== pillar)
        : [...prev.contentPillars, pillar];
      handleSaveWizardProgress({ ...prev, contentPillars: updated });
      return { ...prev, contentPillars: updated };
    });
  };
  const [posts,    setPosts]     = useState([]);
  const [dumps,    setDumps]     = useState([]);
  const [shoots,   setShoots]    = useState([]);
  const [vault,    setVault]     = useState([]);
  const [journal,  setJournal]   = useState([]);
  const [selectedJournalId, setSelectedJournalId] = useState(null);
  const [collabs,  setCollabs]   = useState([]);
  const [theme,    setThemeRaw]  = useState(()=>load(STORAGE.theme,"light"));
  const [activeNiche, setActiveNiche] = useState(()=>load(STORAGE.niche, NICHES[0].id));
  
  const [shootFilter,setShootFilter] = useState(()=>load(STORAGE.shootFilter,"upcoming"));
  const [vaultSearchQuery, setVaultSearchQuery] = useState("");

  // Toast and Shoot Checklist States
  const [toast, setToast] = useState(null);
  const [shootMode, setShootMode] = useState(false);
  const [completedShots, setCompletedShots] = useState({});

  // Instagram Integration States
  const [igAccessToken, setIgAccessToken] = useState("");
  const [igMedia, setIgMedia] = useState(null);
  const [igLoading, setIgLoading] = useState(false);
  const [igError, setIgError] = useState("");
  const [ideaTab, setIdeaTab] = useState("reels");
  const [intelligence, setIntelligence] = useState(null);
  const [intelLoading, setIntelLoading] = useState(false);

  // Syncing & Dashboard states
  const [syncingState, setSyncingState] = useState(false);
  const [syncStep, setSyncStep] = useState(0); // 0: None, 1: Profile, 2: Posts, 3: Analytics
  const [showIgDisconnectModal, setShowIgDisconnectModal] = useState(false);

  // Analytics event tracking logger (10 custom events)
  const trackAnalyticsEvent = (name, data = {}) => {
    console.log(`[Analytics Event] ${name}:`, data);
    window.analyticsEvents = window.analyticsEvents || [];
    window.analyticsEvents.push({ name, data, timestamp: new Date().toISOString() });
  };

  const getFriendlyLastSync = () => {
    if (!user?.instagramConnectedAt) return "Never";
    const diffMs = Date.now() - new Date(user.instagramConnectedAt).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins === 1) return "1 minute ago";
    if (diffMins < 60) return `${diffMins} minutes ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return "1 hour ago";
    if (diffHours < 24) return `${diffHours} hours ago`;
    return new Date(user.instagramConnectedAt).toLocaleDateString();
  };

  const fetchInstagramIntelligence = useCallback(async () => {
    setIntelLoading(true);
    try {
      const data = await apiGetInstagramIntelligence();
      setIntelligence(data);
      trackAnalyticsEvent("instagram_intelligence_generated");
    } catch (err) {
      console.error("Error fetching Instagram intelligence:", err);
      setIntelligence(null);
    } finally {
      setIntelLoading(false);
    }
  }, []);

  const handleFetchInstagramMedia = async () => {
    setIgLoading(true);
    setIgError("");
    try {
      const media = await apiGetInstagramMedia();
      setIgMedia(media.data || []);
    } catch (err) {
      setIgError(err.response?.data?.error || "Failed to fetch media");
    } finally {
      setIgLoading(false);
    }
  };

  const runSyncSteps = async () => {
    setSyncingState(true);
    setSyncStep(1); // Profile
    trackAnalyticsEvent("instagram_sync_started");

    try {
      await new Promise(r => setTimeout(r, 800));
      setSyncStep(2); // Posts

      await new Promise(r => setTimeout(r, 800));
      setSyncStep(3); // Analytics

      const result = await apiSyncInstagram();
      await new Promise(r => setTimeout(r, 600));

      setSyncStep(4);
      setSyncingState(false);

      if (result.instagramUsername) {
        useAuthStore.getState().updateUser({
          instagramUsername: result.instagramUsername,
          instagramConnectedAt: new Date().toISOString()
        });
      }

      await handleFetchInstagramMedia();
      await fetchInstagramIntelligence();

      trackAnalyticsEvent("instagram_sync_completed", { postsCount: result.syncedPosts });
      showToast("Instagram channel synced successfully!");
    } catch (err) {
      console.error("Error syncing Instagram:", err);
      const errorMsg = err.response?.data?.error || err.message || "Failed to sync Instagram account";
      setIgError(errorMsg);
      setSyncingState(false);
      setSyncStep(0);
      trackAnalyticsEvent("instagram_sync_failed", { error: errorMsg });
      showToast(`Sync failed: ${errorMsg}`, "error");
    }
  };

  const handleSyncInstagram = async () => {
    await runSyncSteps();
  };

  const handleAddIdeaToPlanner = async (idea, type) => {
    try {
      const typeMapping = { reels: "REEL", carousels: "CAROUSEL", stories: "STORY" };
      const payload = {
        title: idea.title || `AI Suggested ${type}`,
        date: todayStr,
        type: typeMapping[type] || "REEL",
        status: "DRAFT",
        mood: "inspired",
        caption: idea.suggestedHook ? `Hook: ${idea.suggestedHook}\n\nConcept: ${idea.concept}\n\n${idea.caption || ""}` : (idea.concept || ""),
        hashtags: ""
      };
      const newPost = await apiCreatePost(payload);
      setPosts(prev => [...prev, newPost]);
      showToast(`Added "${payload.title}" as draft to Content Planner!`);
      trackAnalyticsEvent("instagram_add_to_planner", { ideaId: idea.id, title: idea.title });
    } catch (err) {
      console.error("Error adding idea to planner:", err);
      showToast("Failed to add draft post to planner.");
    }
  };

  const handleInstagramConnectClick = async () => {
    trackAnalyticsEvent("instagram_connect_started");
    setIgLoading(true);
    setIgError("");
    try {
      const state = Math.random().toString(36).substring(2, 15);
      const { url } = await apiGetInstagramOAuthUrl(state);

      if (url.includes("instagram_mock_connect=true")) {
        const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
        window.location.href = `${apiBaseUrl}/api/instagram/oauth/callback?code=mock_code_888&state=${state}`;
      } else {
        window.location.href = url;
      }
    } catch (err) {
      console.error("Failed to start Instagram connection:", err);
      const errMsg = err.response?.data?.error || err.message || "Failed to start connection";
      setIgError(errMsg);
      trackAnalyticsEvent("instagram_connection_failed", { error: errMsg });
      showToast(errMsg, "error");
      setIgLoading(false);
    }
  };

  const handleConnectInstagram = async () => {
    if (!igAccessToken.trim()) return;
    setIgLoading(true);
    setIgError("");
    trackAnalyticsEvent("instagram_token_connect_started");
    try {
      const result = await apiConnectInstagram(igAccessToken);
      useAuthStore.getState().updateUser({
        instagramUsername: result.username || "mock_creator_partner",
        instagramConnectedAt: new Date().toISOString()
      });
      setIgAccessToken("");
      showToast("Instagram account connected! Syncing content...");
      await runSyncSteps();
    } catch (err) {
      console.error("Failed to connect Instagram:", err);
      const errMsg = err.response?.data?.error || err.message || "Connection failed";
      setIgError(errMsg);
      trackAnalyticsEvent("instagram_token_connect_failed", { error: errMsg });
      showToast(errMsg, "error");
    } finally {
      setIgLoading(false);
    }
  };

  const handleInstagramDisconnectClick = () => {
    setShowIgDisconnectModal(true);
  };

  const handleInstagramDisconnectConfirm = async () => {
    setIgLoading(true);
    try {
      await apiDisconnectInstagram();
      useAuthStore.getState().updateUser({
        instagramUserId: null,
        instagramUsername: null,
        instagramConnectedAt: null
      });
      setIgMedia(null);
      setIntelligence(null);
      showToast("Instagram account disconnected.");
    } catch (err) {
      showToast("Failed to disconnect", "error");
    } finally {
      setIgLoading(false);
    }
  };

  const handleAutoSyncAfterConnection = async () => {
    setSyncingState(true);
    setSyncStep(1); // Fetching profile
    setTab("settings"); // Hold on settings page to show connection card sync state checklist

    try {
      await useAuthStore.getState().restoreSession();
      await new Promise(r => setTimeout(r, 800));
      setSyncStep(2); // Fetching posts

      await new Promise(r => setTimeout(r, 800));
      setSyncStep(3); // Fetching analytics

      const result = await apiSyncInstagram();
      await new Promise(r => setTimeout(r, 600));

      setSyncStep(4);
      setSyncingState(false);

      await handleFetchInstagramMedia();
      await fetchInstagramIntelligence();

      trackAnalyticsEvent("instagram_sync_completed", { postsCount: result.syncedPosts });
      showToast("Instagram connected successfully and content analyzed!");
      
      // Auto redirect to dashboard view
      setTab("instagram");
    } catch (err) {
      console.error("Auto sync error:", err);
      const errorMsg = err.response?.data?.error || err.message || "Failed to auto sync";
      setIgError(errorMsg);
      setSyncingState(false);
      setSyncStep(0);
      trackAnalyticsEvent("instagram_sync_failed", { error: errorMsg });
      showToast(`Auto-sync failed: ${errorMsg}`, "error");
    }
  };

  // Path-based routing effect
  useEffect(() => {
    const path = window.location.pathname;
    if (path === "/settings") {
      setTab("settings");
    } else if (path === "/instagram") {
      setTab("instagram");
    }
  }, []);

  // URL query parameter callback handling effect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mockConnect = params.get("instagram_mock_connect");
    const connectSuccess = params.get("instagram_connect");
    const connectError = params.get("instagram_error");

    if (mockConnect === "true" || connectSuccess === "success") {
      trackAnalyticsEvent("instagram_oauth_callback_received", { success: true, mock: mockConnect === "true" });
      
      // Clean query parameters from address bar
      const newUrl = window.location.pathname + window.location.hash;
      window.history.replaceState({}, document.title, newUrl);
      
      showToast("Instagram account connected! Initializing auto sync...");
      handleAutoSyncAfterConnection();
    } else if (connectError || connectSuccess === "error") {
      const errMsg = connectError || params.get("error_description") || "OAuth connection failed";
      trackAnalyticsEvent("instagram_oauth_callback_received", { success: false, error: errMsg });
      
      const newUrl = window.location.pathname + window.location.hash;
      window.history.replaceState({}, document.title, newUrl);
      
      setIgError(errMsg);
      showToast(`Instagram connection failed: ${errMsg}`, "error");
      trackAnalyticsEvent("instagram_connection_failed", { error: errMsg });
    }
  }, []);

  // Standard component mount/refresh updates hook
  useEffect(() => {
    if (user && user.instagramUsername) {
      handleFetchInstagramMedia();
      fetchInstagramIntelligence();
    } else {
      setIgMedia(null);
      setIntelligence(null);
    }
  }, [user?.instagramUsername, fetchInstagramIntelligence]);


  // Local Editing & Dirty States
  const [plannerView, setPlannerView] = useState("calendar");
  const [pubHistory, setPubHistory] = useState([]);
  const [historyTab, setHistoryTab] = useState("Scheduled");

  const [localPost, setLocalPost] = useState(null);
  const [savingPost, setSavingPost] = useState(false);
  const [postIsDirty, setPostIsDirty] = useState(false);

  const [localDump, setLocalDump] = useState(null);
  const [savingDump, setSavingDump] = useState(false);
  const [dumpIsDirty, setDumpIsDirty] = useState(false);

  const [localShoot, setLocalShoot] = useState(null);
  const [savingShoot, setSavingShoot] = useState(false);
  const [shootIsDirty, setShootIsDirty] = useState(false);

  const [savingCollab, setSavingCollab] = useState(false);

  function showToast(message, type = "success") {
    setToast({ message, type });
  }

  // Enforce credits check on frontend
  const useCredit = () => {
    if (!user) return false;
    if (user.credits <= 0) {
      showToast("⚠️ Out of credits! Please top up your account.", "error");
      return false;
    }
    useAuthStore.setState({
      user: { ...user, credits: Math.max(0, user.credits - 1) }
    });
    return true;
  };

  function setTab(v) { setTabRaw(v); save(STORAGE.tab, v); }
  const setTheme = v => { setThemeRaw(v); save(STORAGE.theme, v); };

  // Selection state — declared BEFORE effects that depend on them
  const [selectedPost, setSelectedPost] = useState(null);
  const [selectedShootId, setSelectedShootId] = useState(null);
  const [activeDumpId, setActiveDumpId] = useState(() => load(STORAGE.dumps, SEED_DUMPS)[0]?.id || null);

  // Reel breakdown — declared here so it's available in init() effect below
  const [reelBreakdown, setReelBreakdown] = useState(null);


  useEffect(() => {
    async function init() {
      try {
        console.log("[App] Fetching initial user data...");
        const serverDumps = await apiGetDumps();
        if (serverDumps && serverDumps.length > 0) {
          setDumps(serverDumps);
          setActiveDumpId(serverDumps[0].id);
        }

        const serverPosts = await apiGetPosts();
        if (serverPosts && serverPosts.length > 0) {
          setPosts(serverPosts);
        }

        const serverCollabs = await apiGetCollabs();
        if (serverCollabs && serverCollabs.length > 0) {
          setCollabs(serverCollabs);
        }

        const serverShoots = await apiGetShoots();
        if (serverShoots && serverShoots.length > 0) {
          setShoots(serverShoots);
        }

        const serverBreakdowns = await apiGetBreakdowns();
        if (serverBreakdowns && serverBreakdowns.length > 0) {
          setReelBreakdown(serverBreakdowns[0]);
        }

        const serverBRolls = await apiGetBRolls();
        if (serverBRolls) {
          setVault(serverBRolls);
        }

        const serverJournal = await apiGetJournalEntries();
        if (serverJournal) {
          setJournal(serverJournal);
          if (serverJournal.length > 0) {
            setSelectedJournalId(prev => prev || serverJournal[0].id);
          }
        }
      } catch (err) {
        console.error("[App] Hydration failed:", err);
      }
    }
    init();
  }, []);

  // Synchronize selection changes into local edit states
  useEffect(() => {
    if (selectedPost) {
      setLocalPost(JSON.parse(JSON.stringify(selectedPost)));
      setPostIsDirty(false);
    } else {
      setLocalPost(null);
      setPostIsDirty(false);
    }
  }, [selectedPost]);

  useEffect(() => {
    const dump = dumps.find(d => d.id === activeDumpId);
    if (dump) {
      // Only reset localDump when the selected dump changes (not on every dumps update)
      // This prevents in-progress edits being stomped when updateDump triggers setDumps
      setLocalDump(prev => {
        // If we're already editing this dump (prev exists and same id), keep edits
        if (prev && prev.id === dump.id) return prev;
        return JSON.parse(JSON.stringify(dump));
      });
      setDumpIsDirty(prev => (prev && dump.id === activeDumpId) ? prev : false);
    } else {
      setLocalDump(null);
      setDumpIsDirty(false);
    }
  }, [activeDumpId, dumps]);

  useEffect(() => {
    const shoot = shoots.find(s => s.id === selectedShootId);
    if (shoot) {
      setLocalShoot(prev => {
        if (prev && prev.id === shoot.id) return prev;
        return JSON.parse(JSON.stringify(shoot));
      });
      setShootIsDirty(prev => (prev && shoot.id === selectedShootId) ? prev : false);
    } else {
      setLocalShoot(null);
      setShootIsDirty(false);
    }
  }, [selectedShootId, shoots]);

  useEffect(()=>{ save(STORAGE.shootFilter,shootFilter); },[shootFilter]);
  useEffect(()=>{ save(STORAGE.niche, activeNiche); },[activeNiche]);
  useEffect(()=>{ setAiTrends([]); }, [activeNiche]);

  useEffect(()=>{
    document.documentElement.setAttribute("data-theme", theme);
  },[theme]);

  const [quote,    setQuote]     = useState(MICROCOPY[0]);
  const [calMonth, setCalMonth]  = useState(getNow().getMonth());
  const [calYear,  setCalYear]   = useState(getNow().getFullYear());
  const [calFade,  setCalFade]   = useState(false);
  const calAnimRef = useRef(false);


  const [newDumpTitle,    setNewDumpTitle]     = useState("");
  const [editingDump,     setEditingDump]      = useState(false);
  const [shootSlot,       setShootSlot]        = useState("morning");
  const [newShot,         setNewShot]          = useState({shot:"",loc:"",mood:"cinematic",light:"",angle:"",props:""});

  // Growth Journal State
  const [newJournal, setNewJournal] = useState({ weekStart: todayStr, followers: "", posts: "", reach: "", saves: "", engagement: "", mood: "inspired", wins: "", lessons: "", reflection: "", notes: "" });
  const [addingJournal, setAddingJournal] = useState(false);

  // Collabs State
  const [selectedCollabId, setSelectedCollabId] = useState(null);
  const [addingCollab, setAddingCollab] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [newCollab, setNewCollab] = useState({ brand:"", contactName:"", email:"", platform:"Instagram", status:"dream brand", quote:"", negotiatedAmount:"", deliverables:[], dueDate:"", paymentStatus:"unpaid", notes:"", pitchDraft:"", followUpDraft:"", scriptText:"", wardrobe:"", props:"", briefFileName:"", briefFileUrl:"" });
  const [activePitchTemplate, setActivePitchTemplate] = useState("outreach");
  const [newDeliverableText, setNewDeliverableText] = useState("");
  const [formDeliverables, setFormDeliverables] = useState([]);

  useEffect(() => {
    if (addingCollab) {
      const rates = calculateCollabRates(formDeliverables);
      setNewCollab(prev => ({
        ...prev,
        quote: rates.total,
        negotiatedAmount: rates.total
      }));
    }
  }, [formDeliverables, addingCollab]);

  // AI Trend Scout State
  const [scouting, setScouting] = useState(false);
  const [scoutProgress, setScoutProgress] = useState(0);
  const [scoutLogs, setScoutLogs] = useState([]);
  const [transcriptText, setTranscriptText] = useState("");
  const [parsingTranscript, setParsingTranscript] = useState(false);
  const [aiTrends, setAiTrends] = useState(() => MOCK_TRENDS_DATA[activeNiche] || []);
  const [aiChatQuery, setAiChatQuery] = useState("");
  const [aiChatResponses, setAiChatResponses] = useState([
    {sender:"assistant",text:"Hello creator. I am your Second Brain assistant. Choose a niche above and run the 'AI Trend Scout' to scan real-time platforms, or ask me for hooks, captions, or structure support."}
  ]);

  // Fake AI States for Demo
  const [aiGeneratingPitch, setAiGeneratingPitch] = useState(false);
  const [aiGeneratingJournal, setAiGeneratingJournal] = useState(false);
  const [aiGeneratingTags, setAiGeneratingTags] = useState(false);
  const [aiGeneratingPostIdeas, setAiGeneratingPostIdeas] = useState(false);
  const [aiGeneratingCaptions, setAiGeneratingCaptions] = useState(false);
  const [discoveringBrands, setDiscoveringBrands] = useState(false);
  const [aiEstimatingCollab, setAiEstimatingCollab] = useState(false);
  const [estimationStep, setEstimationStep] = useState("");
  const [aiRewritingDump, setAiRewritingDump] = useState(false);
  const [pitchUrl, setPitchUrl] = useState("");
  const [reelUrl, setReelUrl] = useState("");
  const [analyzingReel, setAnalyzingReel] = useState(false);
  // reelBreakdown is declared earlier (above the init effect) to avoid TDZ

  const generatePostIdeasAI = async () => {
    if (!selectedPost) return;
    if (!useCredit()) return;
    setAiGeneratingPostIdeas(true);

    try {
      console.log(`[App] Triggering hooks generation for post ${selectedPost.id}...`);
      const job = await apiGenerateHooks(selectedPost.id);
      console.log(`[App] Created AI Job for hooks:`, job);

      const pollInterval = setInterval(async () => {
        try {
          const statusRes = await apiGetJobStatus(job.id);
          console.log(`[App] AI Job ${job.id} status: ${statusRes.status}`);

          if (statusRes.status === "COMPLETED") {
            clearInterval(pollInterval);
            setAiGeneratingPostIdeas(false);

            const updatedPosts = await apiGetPosts();
            setPosts(updatedPosts);
            const freshPost = updatedPosts.find(p => p.id === selectedPost.id);
            if (freshPost) {
              setSelectedPost(freshPost);
            }
          } else if (statusRes.status === "FAILED") {
            clearInterval(pollInterval);
            setAiGeneratingPostIdeas(false);
            showToast("Hook generation failed.", "error");
          }
        } catch (pollErr) {
          console.error(`[App] Error polling job status:`, pollErr);
          clearInterval(pollInterval);
          setAiGeneratingPostIdeas(false);
        }
      }, 500);
    } catch (err) {
      console.error("[App] Failed to start hook generation:", err);
      setAiGeneratingPostIdeas(false);
      showToast("Failed to start hook generation job.", "error");
    }
  };

  const generateCaptionsAI = async () => {
    if (!selectedPost) return;
    if (!useCredit()) return;
    setAiGeneratingCaptions(true);

    try {
      console.log(`[App] Triggering captions generation for post ${selectedPost.id}...`);
      const job = await apiGenerateCaptions(selectedPost.id);
      console.log(`[App] Created AI Job for captions:`, job);

      const pollInterval = setInterval(async () => {
        try {
          const statusRes = await apiGetJobStatus(job.id);
          console.log(`[App] AI Job ${job.id} status: ${statusRes.status}`);

          if (statusRes.status === "COMPLETED") {
            clearInterval(pollInterval);
            setAiGeneratingCaptions(false);

            const updatedPosts = await apiGetPosts();
            setPosts(updatedPosts);
            const freshPost = updatedPosts.find(p => p.id === selectedPost.id);
            if (freshPost) {
              setSelectedPost(freshPost);
            }
          } else if (statusRes.status === "FAILED") {
            clearInterval(pollInterval);
            setAiGeneratingCaptions(false);
            showToast("Caption generation failed.", "error");
          }
        } catch (pollErr) {
          console.error(`[App] Error polling job status:`, pollErr);
          clearInterval(pollInterval);
          setAiGeneratingCaptions(false);
        }
      }, 500);
    } catch (err) {
      console.error("[App] Failed to start caption generation:", err);
      setAiGeneratingCaptions(false);
      showToast("Failed to start caption generation job.", "error");
    }
  };

  const analyzeReelAI = async () => {
    if (!reelUrl.trim()) return;
    if (!useCredit()) return;
    setAnalyzingReel(true);
    try {
      console.log(`[App] Extracting metadata & breaking down reel: ${reelUrl}...`);
      const res = await apiBreakdownReel(reelUrl);
      setReelBreakdown(res);
      showToast("Reel analyzed successfully!");
    } catch (err) {
      console.error("[App] Failed to break down reel:", err);
      showToast("Failed to break down reel.", "error");
    } finally {
      setAnalyzingReel(false);
    }
  };

  const handleDeleteBreakdown = async () => {
    if (!reelBreakdown) return;
    if (!confirm("Are you sure you want to delete this virality report?")) return;
    try {
      await apiDeleteBreakdown(reelBreakdown.id);
      setReelBreakdown(null);
      showToast("Virality report deleted.");
    } catch (err) {
      console.error("Failed to delete virality report:", err);
      showToast("Failed to delete report.", "error");
    }
  };

  const handleParseTranscript = async () => {
    if (!transcriptText.trim()) return;
    if (!useCredit()) return;

    setParsingTranscript(true);
    try {
      const lines = transcriptText.split("\n").filter(Boolean);
      const title = `Parsed Script Pacing: ${lines[0]?.slice(0, 30) || "Reference"}`;
      const text = `--- TRANSCRIPT PACING STRUCTURE ---\n\n[HOOK SECTION]\n"${lines[0] || "Hook line placeholder"}"\n\n[BODY ANALYSIS]\n${lines.slice(1, -1).map((l, i) => `Beat ${i+1}: ${l}`).slice(0, 4).join("\n") || "Content beats go here."}\n\n[CTA / OUTRO]\n"${lines[lines.length - 1] || "CTA line placeholder"}"\n\nGenerated from reference transcript.`;

      const nd = await apiCreateDump({
        title,
        text,
        mood: "reflective",
        ts: "just now",
        archived: false
      });
      setDumps(ds => [nd, ...ds]);
      setActiveDumpId(nd.id);
      setTranscriptText("");
      showToast("Transcript pacing dump created!");
      setTab("dump");
    } catch (err) {
      console.error(err);
      showToast("Failed to parse transcript.", "error");
    } finally {
      setParsingTranscript(false);
    }
  };

  const handleRecreateTrend = async (trend) => {
    try {
      const newPost = await apiCreatePost({
        title: `Recreate: ${trend.title}`,
        date: todayStr,
        type: "reel",
        status: "draft",
        mood: "cinematic",
        caption: `--- PACING STRUCTURE ---\nHook: ${trend.hook}\nAction Plan: ${trend.keyTakeaway}\nWhy It Worked: ${trend.whyItWorked}`,
        hashtags: trend.visualTags.map(t => `#${t}`).join(" "),
        shootId: null
      });
      setPosts(prev => [...prev, newPost]);
      setSelectedPost(newPost);
      setTab("planner");
      showToast("Trend template recreated in Planner!");
      return newPost;
    } catch (err) {
      console.error("Failed to recreate trend:", err);
      showToast("Failed to recreate trend.", "error");
    }
  };

  const saveBreakdownToDump = async () => {
    if (!reelBreakdown) return;
    const nicheObj = NICHES.find(n => n.id === activeNiche);
    const title = `Reel Idea: ${nicheObj ? nicheObj.label : "General"}`;
    const text = `--- INSIGHTS ---\n${reelBreakdown.insights.map(i => `• ${i}`).join('\n')}\n\n--- RECREATION GUIDE ---\n${reelBreakdown.steps.map(s => `• ${s}`).join('\n')}`;
    try {
      const nd = await apiCreateDump({ title, text, mood: "cinematic", ts: "just now", archived: false });
      setDumps(ds => [nd, ...ds]);
      setActiveDumpId(nd.id);
    } catch (err) {
      console.error("Failed to save breakdown to server dump:", err);
      const nd = {
        id: String(Date.now()),
        title,
        text,
        mood: "cinematic",
        ts: "just now",
        archived: false
      };
      setDumps(ds => [nd, ...ds]);
      setActiveDumpId(nd.id);
    }
    setTab("dump");
  };

  const saveBreakdownToPlanner = async () => {
    if (!reelBreakdown) return;
    const nicheObj = NICHES.find(n => n.id === activeNiche);
    const postData = {
      title: `Reel Breakdown Idea - ${nicheObj ? nicheObj.label : "Reel"}`,
      date: todayStr,
      type: "reel",
      status: "draft",
      mood: "cinematic",
      caption: `--- INSIGHTS ---\n${reelBreakdown.insights.map(i => `• ${i}`).join('\n')}\n\n--- RECREATION GUIDE ---\n${reelBreakdown.steps.map(s => `• ${s}`).join('\n')}`,
      hashtags: "",
      shootId: null
    };
    const np = await createNewPost(postData);
    setSelectedPost(np);
    setTab("planner");
  };

  const saveBreakdownToShoot = async () => {
    if (!reelBreakdown) return;
    const nicheObj = NICHES.find(n => n.id === activeNiche);
    const morningShots = [];
    const afternoonShots = [];
    const eveningShots = [];
    reelBreakdown.steps.forEach((step, idx) => {
      const shotObj = {
        id: Date.now() + idx,
        shot: step.replace(/^\d+\.\s*/, ""),
        loc: "Studio",
        mood: "cinematic",
        light: "natural",
        angle: "medium",
        props: ""
      };
      if (idx === 0) morningShots.push(shotObj);
      else if (idx === 1) afternoonShots.push(shotObj);
      else eveningShots.push(shotObj);
    });
    const nsData = {
      name: `Reel Breakdown Shoot - ${nicheObj ? nicheObj.label : "Session"}`,
      shootDate: todayStr,
      postId: null,
      slots: {
        morning: morningShots,
        afternoon: afternoonShots,
        evening: eveningShots
      }
    };
    try {
      const saved = await apiCreateShoot(nsData);
      setShoots(ss => [...ss, saved]);
      setSelectedShootId(saved.id);
      setTab("shoot");
    } catch (err) {
      console.error("Failed to save shoot breakdown to server:", err);
      const fallback = { ...nsData, id: String(Date.now()) };
      setShoots(ss => [...ss, fallback]);
      setSelectedShootId(fallback.id);
      setTab("shoot");
    }
  };

  const discoverBrandsAI = async () => {
    if (!useCredit()) return;
    setDiscoveringBrands(true);
    try {
      console.log(`[App] Triggering brand discovery for niche: ${activeNiche}...`);
      const job = await apiDiscoverBrands(activeNiche);
      
      const pollInterval = setInterval(async () => {
        try {
          const statusRes = await apiGetJobStatus(job.id);
          if (statusRes.status === "COMPLETED") {
            clearInterval(pollInterval);
            setDiscoveringBrands(false);
            const freshCollabs = await apiGetCollabs();
            setCollabs(freshCollabs);
            if (freshCollabs.length > 0) {
              setSelectedCollabId(freshCollabs[0].id);
            }
            showToast("AI discovered new brand leads!");
          } else if (statusRes.status === "FAILED") {
            clearInterval(pollInterval);
            setDiscoveringBrands(false);
            showToast("Brand discovery failed.", "error");
          }
        } catch (pollErr) {
          console.error(pollErr);
          clearInterval(pollInterval);
          setDiscoveringBrands(false);
        }
      }, 500);
    } catch (err) {
      console.error(err);
      setDiscoveringBrands(false);
      showToast("Failed to start brand discovery.", "error");
    }
  };

  const analyzeAndEstimateCollabAI = async () => {
    if (!pitchUrl.trim() || !selectedCollabId) return;
    if (!useCredit()) return;
    setAiEstimatingCollab(true);
    setEstimationStep("Submitting estimation task to queue...");
    
    try {
      const activeCollab = collabs.find(x => x.id === selectedCollabId);
      if (!activeCollab) return;

      const job = await apiEstimateCollab({
        collabId: selectedCollabId,
        brandName: activeCollab.brand,
        profileUrl: pitchUrl,
        niche: activeNiche
      });
      
      setEstimationStep("Processing brand layout analysis...");
      const pollInterval = setInterval(async () => {
        try {
          const statusRes = await apiGetJobStatus(job.id);
          if (statusRes.status === "COMPLETED") {
            clearInterval(pollInterval);
            setAiEstimatingCollab(false);
            setEstimationStep("");
            const freshCollabs = await apiGetCollabs();
            setCollabs(freshCollabs);
            showToast("Collab rates estimated and pitch drafted!");
          } else if (statusRes.status === "FAILED") {
            clearInterval(pollInterval);
            setAiEstimatingCollab(false);
            setEstimationStep("");
            showToast("Collab estimation failed.", "error");
          }
        } catch (pollErr) {
          console.error(pollErr);
          clearInterval(pollInterval);
          setAiEstimatingCollab(false);
          setEstimationStep("");
        }
      }, 500);
    } catch (err) {
      console.error(err);
      setAiEstimatingCollab(false);
      setEstimationStep("");
      showToast("Failed to start collab estimate job.", "error");
    }
  };

  const generatePitchAI = async () => {
    if (!pitchUrl.trim() || !selectedCollabId) return;
    if (!useCredit()) return;
    setAiGeneratingPitch(true);
    try {
      const activeCollab = collabs.find(x => x.id === selectedCollabId);
      if (!activeCollab) return;

      const job = await apiEstimateCollab({
        collabId: selectedCollabId,
        brandName: activeCollab.brand,
        profileUrl: pitchUrl,
        niche: activeNiche
      });
      
      const pollInterval = setInterval(async () => {
        try {
          const statusRes = await apiGetJobStatus(job.id);
          if (statusRes.status === "COMPLETED") {
            clearInterval(pollInterval);
            setAiGeneratingPitch(false);
            const freshCollabs = await apiGetCollabs();
            setCollabs(freshCollabs);
            showToast("AI Pitch Draft generated!");
          } else if (statusRes.status === "FAILED") {
            clearInterval(pollInterval);
            setAiGeneratingPitch(false);
            showToast("Failed to generate pitch draft.", "error");
          }
        } catch (pollErr) {
          console.error(pollErr);
          clearInterval(pollInterval);
          setAiGeneratingPitch(false);
        }
      }, 500);
    } catch (err) {
      console.error(err);
      setAiGeneratingPitch(false);
      showToast("Failed to start pitch draft job.", "error");
    }
  };

  const generateJournalAI = () => {
    setAiGeneratingJournal(true);
    setTimeout(() => {
      setNewJournal(prev => ({...prev, reflection: "AI Analysis: Your reach spiked by 15% due to the faster pacing in the first 3 seconds. The chaotic mood correlates with higher engagement.", wins: "Algorithm favored the raw edits", lessons: "Consistency > Perfection"}));
      setAiGeneratingJournal(false);
    }, 1500);
  };
  const generateTagsAI = (id) => {
    setAiGeneratingTags(true);
    setTimeout(() => {
      updateDump(id, {title: "✨ AI: Cinematic Morning Vlog"});
      setAiGeneratingTags(false);
    }, 1500);
  };

  const createNewDump = async (title, mood = "chaotic") => {
    try {
      const nd = await apiCreateDump({ title, text: "", mood, ts: "just now", archived: false });
      setDumps(ds => [nd, ...ds]);
      setActiveDumpId(nd.id);
      return nd;
    } catch (err) {
      console.error("Failed to create dump on server:", err);
      const nd = { id: String(Date.now()), title, text: "", mood, ts: "just now", archived: false };
      setDumps(ds => [nd, ...ds]);
      setActiveDumpId(nd.id);
      return nd;
    }
  };

  const createNewPost = async (postData) => {
    try {
      const np = await apiCreatePost({
        title: postData.title || "untitled post",
        date: postData.date || todayStr,
        type: postData.type || "reel",
        status: postData.status || "draft",
        mood: postData.mood || "soft",
        caption: postData.caption || "",
        hashtags: postData.hashtags || "",
        shootId: postData.shootId || null
      });
      setPosts(ps => [...ps, np]);
      return np;
    } catch (err) {
      console.error("Failed to create post on server:", err);
      const nd = { id: String(Date.now()), ...postData };
      setPosts(ps => [...ps, nd]);
      return nd;
    }
  };

  const rewriteDumpAI = async (id) => {
    const dump = dumps.find(d => d.id === id);
    if (!dump) return;
    if (!useCredit()) return;
    
    setAiRewritingDump(true);
    
    try {
      console.log(`[App] Triggering rewrite for dump ${id}...`);
      const job = await apiRewriteDump(id);
      console.log(`[App] Created AI Job:`, job);

      const pollInterval = setInterval(async () => {
        try {
          const statusRes = await apiGetJobStatus(job.id);
          console.log(`[App] AI Job ${job.id} status: ${statusRes.status}`);

          if (statusRes.status === "COMPLETED") {
            clearInterval(pollInterval);
            setAiRewritingDump(false);

            const updatedDumps = await apiGetDumps();
            setDumps(updatedDumps);
            showToast("Dump rewritten by AI!");
          } else if (statusRes.status === "FAILED") {
            clearInterval(pollInterval);
            setAiRewritingDump(false);
            showToast("AI Rewrite failed.", "error");
          }
        } catch (pollErr) {
          console.error(`[App] Error polling job status:`, pollErr);
          clearInterval(pollInterval);
          setAiRewritingDump(false);
        }
      }, 500);
    } catch (err) {
      console.error("[App] Failed to start rewrite job:", err);
      setAiRewritingDump(false);
      showToast("Failed to start rewrite job on backend.", "error");
    }
  };

  useEffect(()=>{
    const t=setInterval(()=>setQuote(q=>{const i=(MICROCOPY.indexOf(q)+1)%MICROCOPY.length;return MICROCOPY[i];}),5000);
    return()=>clearInterval(t);
  },[]);
  useEffect(()=>{ if(selectedPost){const f=posts.find(p=>p.id===selectedPost.id);if(!f)setSelectedPost(null);} },[posts]);

  // Sync Niche Trends when niche selection changes
  useEffect(()=>{
    setAiTrends(MOCK_TRENDS_DATA[activeNiche] || []);
  },[activeNiche]);

  const navigateCal = useCallback(dir=>{
    if(calAnimRef.current) return; calAnimRef.current=true; setCalFade(true);
    setTimeout(()=>{
      if(dir==="prev"){const[y,m]=prevMonth(calYear,calMonth);setCalYear(y);setCalMonth(m);}
      if(dir==="next"){const[y,m]=nextMonth(calYear,calMonth);setCalYear(y);setCalMonth(m);}
      if(dir==="today"){setCalYear(getNow().getFullYear());setCalMonth(getNow().getMonth());}
      setCalFade(false); calAnimRef.current=false;
    },150);
  },[calYear,calMonth]);

  const calFirst=new Date(calYear,calMonth,1).getDay();
  const calTotal=new Date(calYear,calMonth+1,0).getDate();
  const cells=Array(calFirst+calTotal).fill(null).map((_,i)=>i<calFirst?null:i-calFirst+1);
  const todayInView=calYear===getNow().getFullYear()&&calMonth===getNow().getMonth();
  const postsOnDay=d=>{ if(!d)return[]; const ds=toDateStr(new Date(calYear,calMonth,d)); return posts.filter(p=>p.status!=="archived"&&p.date===ds); };
  const handleSavePost = async () => {
    if (!localPost) return;
    setSavingPost(true);
    try {
      const saved = await apiUpdatePost(localPost.id, localPost);
      setPosts(ps => ps.map(p => p.id === localPost.id ? saved : p));
      setSelectedPost(saved);
      setPostIsDirty(false);
      showToast("Post saved successfully.");
    } catch (err) {
      console.error("[App] Failed to save post:", err);
      showToast("Failed to save post.", "error");
    } finally {
      setSavingPost(false);
    }
  };

  const handleResetPost = () => {
    if (selectedPost) {
      setLocalPost(JSON.parse(JSON.stringify(selectedPost)));
      setPostIsDirty(false);
      showToast("Changes reset.");
    }
  };

  const handleCancelPost = () => {
    if (postIsDirty) {
      if (confirm("You have unsaved changes. Discard them?")) {
        setSelectedPost(null);
      }
    } else {
      setSelectedPost(null);
    }
  };

  const handleSaveDump = async () => {
    if (!localDump) return;
    setSavingDump(true);
    try {
      const saved = await apiUpdateDump(localDump.id, localDump);
      setDumps(ds => ds.map(d => d.id === localDump.id ? saved : d));
      // Explicitly update localDump to server response (keeps ts and server fields fresh)
      setLocalDump(JSON.parse(JSON.stringify(saved)));
      setDumpIsDirty(false);
      showToast("Brain dump saved successfully.");
    } catch (err) {
      console.error("[App] Failed to save dump:", err);
      showToast("Failed to save brain dump.", "error");
    } finally {
      setSavingDump(false);
    }
  };

  const handleResetDump = () => {
    const original = dumps.find(d => d.id === activeDumpId);
    if (original) {
      setLocalDump(JSON.parse(JSON.stringify(original)));
      setDumpIsDirty(false);
      showToast("Changes reset.");
    }
  };

  const selectDump = (id) => {
    if (dumpIsDirty) {
      if (!confirm("You have unsaved changes in this brain dump. Discard them?")) {
        return;
      }
    }
    setActiveDumpId(id);
  };

  const handleSaveShoot = async () => {
    if (!localShoot) return;
    setSavingShoot(true);
    try {
      const saved = await apiUpdateShoot(localShoot.id, localShoot);
      setShoots(ss => ss.map(s => s.id === localShoot.id ? saved : s));
      setLocalShoot(JSON.parse(JSON.stringify(saved)));
      setShootIsDirty(false);
      showToast("Shoot session saved successfully.");
    } catch (err) {
      console.error("[App] Failed to save shoot:", err);
      showToast("Failed to save shoot session.", "error");
    } finally {
      setSavingShoot(false);
    }
  };

  const handleResetShoot = () => {
    const original = shoots.find(s => s.id === selectedShootId);
    if (original) {
      setLocalShoot(JSON.parse(JSON.stringify(original)));
      setShootIsDirty(false);
      showToast("Changes reset.");
    }
  };

  const selectShoot = (id) => {
    if (shootIsDirty) {
      if (!confirm("You have unsaved changes in this shoot session. Discard them?")) {
        return;
      }
    }
    setSelectedShootId(id);
  };

  const updatePost = async (id, patch) => {
    try {
      const saved = await apiUpdatePost(id, patch);
      setPosts(ps => ps.map(p => p.id === id ? saved : p));
      if (selectedPost?.id === id) {
        setSelectedPost(saved);
      }
    } catch (err) {
      console.error("[App] Failed to update post:", err);
      showToast("Failed to save post.", "error");
    }
  };

  const deletePost = async id => {
    if (!confirm("Are you sure you want to delete this content planner post?")) return;
    try {
      await apiDeletePost(id);
      setPosts(ps => ps.filter(p => p.id !== id));
      setSelectedPost(null);
      showToast("Post deleted successfully.");
    } catch (err) {
      console.error(`[App] Failed to delete post ${id}:`, err);
      showToast("Failed to delete post.", "error");
    }
  };

  const updateDump = async (id, patch) => {
    try {
      const saved = await apiUpdateDump(id, patch);
      setDumps(ds => ds.map(d => d.id === id ? saved : d));
    } catch (err) {
      console.error("[App] Failed to update dump:", err);
      showToast("Failed to save dump.", "error");
    }
  };

  const deleteDump = async id => {
    if (!confirm("Are you sure you want to delete this brain dump?")) return;
    try {
      await apiDeleteDump(id);
      // Compute next selection from current state BEFORE filter
      const remaining = dumps.filter(d => d.id !== id && !d.archived);
      const nextId = remaining[0]?.id || null;
      setDumps(ds => ds.filter(d => d.id !== id));
      setActiveDumpId(nextId);
      showToast("Brain dump deleted.");
    } catch (err) {
      console.error(`[App] Failed to delete dump ${id}:`, err);
      showToast("Failed to delete brain dump.", "error");
    }
  };

  const tryParseJSON = (text) => {
    if (!text) return null;
    try {
      const parsed = typeof text === "string" ? JSON.parse(text) : text;
      if (parsed && typeof parsed === "object" && (parsed.rewrittenText || parsed.hooks || parsed.mode || parsed.shortCaptions)) {
        return parsed;
      }
    } catch (e) {}
    return null;
  };

  const getDeliverablesArray = (collab) => {
    if (!collab) return [];
    let list = [];
    if (Array.isArray(collab.deliverables)) {
      list = collab.deliverables;
    } else if (typeof collab.deliverables === "string") {
      list = collab.deliverables.split("\n").filter(Boolean).map((line, idx) => ({
        id: `${collab.id}-del-${idx}`,
        text: line.trim(),
        postId: null,
        shootId: null,
        completed: false
      }));
    }
    
    return list.map(d => {
      if (d.type) return d;
      let type = "custom";
      const textLower = (d.text || "").toLowerCase();
      if (textLower.includes("reel")) type = "reel";
      else if (textLower.includes("story") || textLower.includes("stories")) type = "story";
      else if (textLower.includes("carousel")) type = "carousel";
      else if (textLower.includes("photo") || textLower.includes("post")) type = "photo";
      return { ...d, type };
    });
  };

  const toggleDeliverableCompleted = async (collabId, delId) => {
    const collab = collabs.find(c => c.id === collabId);
    if (!collab) return;
    const parsed = getDeliverablesArray(collab);
    const updated = parsed.map(d => d.id === delId ? { ...d, completed: !d.completed } : d);
    try {
      const saved = await apiUpdateCollab(collabId, { deliverables: updated });
      setCollabs(prev => prev.map(c => c.id === collabId ? saved : c));
    } catch (err) {
      console.error("Failed to update collab deliverable:", err);
    }
  };

  const linkPostToDeliverable = async (collabId, delId, postId) => {
    const collab = collabs.find(c => c.id === collabId);
    if (!collab) return;
    const parsed = getDeliverablesArray(collab);
    const updated = parsed.map(d => d.id === delId ? { ...d, postId: postId || null } : d);
    try {
      const saved = await apiUpdateCollab(collabId, { deliverables: updated });
      setCollabs(prev => prev.map(c => c.id === collabId ? saved : c));
    } catch (err) {
      console.error("Failed to link post to collab:", err);
    }
  };

  const linkShootToDeliverable = async (collabId, delId, shootId) => {
    const collab = collabs.find(c => c.id === collabId);
    if (!collab) return;
    const parsed = getDeliverablesArray(collab);
    const updated = parsed.map(d => d.id === delId ? { ...d, shootId: shootId || null } : d);
    try {
      const saved = await apiUpdateCollab(collabId, { deliverables: updated });
      setCollabs(prev => prev.map(c => c.id === collabId ? saved : c));
    } catch (err) {
      console.error("Failed to link shoot to collab:", err);
    }
  };

  const createPostForDeliverable = async (collabId, delId, text) => {
    const postData = {
      title: text || "collab post",
      date: todayStr,
      type: "reel",
      status: "draft",
      mood: "soft",
      caption: `Collaborating with ${collabs.find(c=>c.id===collabId)?.brand || "brand"}.`,
      hashtags: "",
      shootId: null
    };
    const np = await createNewPost(postData);
    await linkPostToDeliverable(collabId, delId, np.id);
  };

  const createShootForDeliverable = async (collabId, delId, text) => {
    try {
      const ns = await apiCreateShoot({
        name: (text || "collab shoot") + " Session",
        shootDate: todayStr,
        postId: null,
        slots: getSuggestedShotsForMood("default")
      });
      setShoots(ss => [...ss, ns]);
      await linkShootToDeliverable(collabId, delId, ns.id);
      showToast("Linked Shoot session created!");
    } catch (err) {
      console.error("Failed to create shoot for deliverable:", err);
    }
  };

  const addDeliverableToCollab = async (collabId) => {
    if (!newDeliverableText.trim()) return;
    const collab = collabs.find(c => c.id === collabId);
    if (!collab) return;
    const parsed = getDeliverablesArray(collab);
    const updated = [...parsed, {
      id: Date.now(),
      text: newDeliverableText.trim(),
      postId: null,
      shootId: null,
      completed: false
    }];
    const rates = calculateCollabRates(updated);
    try {
      const saved = await apiUpdateCollab(collabId, { deliverables: updated, quote: String(rates.total), negotiatedAmount: String(rates.total) });
      setCollabs(prev => prev.map(c => c.id === collabId ? saved : c));
      setNewDeliverableText("");
    } catch (err) {
      console.error("Failed to add collab deliverable:", err);
    }
  };

  const adjustCollabDeliverable = async (collabId, type, increment) => {
    const collab = collabs.find(c => c.id === collabId);
    if (!collab) return;
    const parsed = getDeliverablesArray(collab);
    let updated = [];
    if (increment > 0) {
      const existingCount = parsed.filter(d => d.type === type).length;
      const typeLabel = type === "reel" ? "Reel" : type === "story" ? "Story" : type === "carousel" ? "Carousel" : "Photo";
      const newDel = {
        id: Date.now() + Math.random(),
        text: `1x ${typeLabel} #${existingCount + 1}`,
        type,
        postId: null,
        shootId: null,
        completed: false
      };
      updated = [...parsed, newDel];
    } else {
      const typeItems = parsed.filter(d => d.type === type);
      if (typeItems.length === 0) return;
      const lastItem = typeItems[typeItems.length - 1];
      updated = parsed.filter(d => d.id !== lastItem.id);
    }
    const rates = calculateCollabRates(updated);
    try {
      const saved = await apiUpdateCollab(collabId, { deliverables: updated, quote: String(rates.total), negotiatedAmount: String(rates.total) });
      setCollabs(prev => prev.map(c => c.id === collabId ? saved : c));
    } catch (err) {
      console.error("Failed to adjust collab deliverable:", err);
    }
  };

  const deleteDeliverableFromCollab = async (collabId, delId) => {
    const collab = collabs.find(c => c.id === collabId);
    if (!collab) return;
    const parsed = getDeliverablesArray(collab);
    const updated = parsed.filter(d => d.id !== delId);
    const rates = calculateCollabRates(updated);
    try {
      const saved = await apiUpdateCollab(collabId, { deliverables: updated, quote: String(rates.total), negotiatedAmount: String(rates.total) });
      setCollabs(prev => prev.map(c => c.id === collabId ? saved : c));
    } catch (err) {
      console.error("Failed to delete collab deliverable:", err);
    }
  };
  
  const moveDumpToPlanner=async dump=>{
    const postData={
      title:dump.title||"untitled post",
      date:todayStr,
      type: "reel",
      status: "draft",
      mood: dump.mood,
      caption: dump.text,
      hashtags: "",
      shootId: null
    };
    const np = await createNewPost(postData);
    setSelectedPost(np);
    setTab("planner");
  };

  const moveDumpToShoot = async dump => {
    try {
      const ns = await apiCreateShoot({
        name: dump.title || "new shoot session",
        shootDate: todayStr,
        postId: null,
        slots: getSuggestedShotsForMood(dump.mood)
      });
      setShoots(ss => [...ss, ns]);
      setSelectedShootId(ns.id);
      setTab("shoot");
      showToast("Shoot session created from Brain Dump!");
    } catch (err) {
      console.error("Failed to create shoot from dump:", err);
      showToast("Failed to create shoot.", "error");
    }
  };
 
  const selectedShoot = shoots.find(s => s.id === selectedShootId) || null;
  const activeDump = dumps.find(d => d.id === activeDumpId) || null;

  const updateShoot = async (id, patch) => {
    try {
      const saved = await apiUpdateShoot(id, patch);
      setShoots(ss => ss.map(s => s.id === id ? saved : s));
    } catch (err) {
      console.error("Failed to update shoot:", err);
    }
  };

  const deleteShoot = async id => {
    if (!confirm("Are you sure you want to delete this shoot session?")) return;
    try {
      await apiDeleteShoot(id);
      const remaining = shoots.filter(s => s.id !== id);
      const nextId = remaining[0]?.id || null;
      setShoots(ss => ss.filter(s => s.id !== id));
      setSelectedShootId(nextId);
      showToast("Shoot session deleted.");
    } catch (err) {
      console.error("Failed to delete shoot:", err);
      showToast("Failed to delete shoot.", "error");
    }
  };
  const filteredShoots=shoots.filter(s=>{
    if(!s.shootDate)return shootFilter==="upcoming";
    if(shootFilter==="upcoming")return isUpcoming(s.shootDate);
    if(shootFilter==="week")return isThisWeek(s.shootDate);
    if(shootFilter==="month")return isThisMonth(s.shootDate);
    return true;
  }).sort((a,b)=>{const da=fromDateStr(a.shootDate),db=fromDateStr(b.shootDate);if(!da&&!db)return 0;if(!da)return 1;if(!db)return-1;return da-db;});
  
  const shootDateLabel=s=>{if(!s.shootDate)return"no date set";if(isToday(s.shootDate))return"today ✦";if(isThisWeek(s.shootDate))return"this week · "+friendlyDate(s.shootDate);return friendlyDate(s.shootDate);};
  const addShotToShoot=()=>{
    if(!newShot.shot.trim()||!selectedShootId)return;
    const shot = {...newShot,id:Date.now()};
    setShoots(ss=>ss.map(s=>{
      if(s.id!==selectedShootId)return s;
      const existing=s.slots?.[shootSlot]||[];
      return{...s,slots:{...s.slots,[shootSlot]:[...existing,shot]}};
    }));
    setLocalShoot(prev=>prev?{...prev,slots:{...prev.slots,[shootSlot]:[...(prev.slots?.[shootSlot]||[]),shot]}}:prev);
    setShootIsDirty(true);
    setNewShot({shot:"",loc:"",mood:"cinematic",light:"",angle:"",props:""});
  };
  const removeShotFromShoot=(slot,shotId)=>{
    setShoots(ss=>ss.map(s=>{
      if(s.id!==selectedShootId)return s;
      const existing=s.slots?.[slot]||[];
      return{...s,slots:{...s.slots,[slot]:existing.filter(x=>x.id!==shotId)}};
    }));
    setLocalShoot(prev=>prev?{...prev,slots:{...prev.slots,[slot]:(prev.slots?.[slot]||[]).filter(x=>x.id!==shotId)}}:prev);
    setShootIsDirty(true);
  };

  // Add a suggested default shot concept to a slot in the shoot planner
  const handleAddDefaultConcept = (slot) => {
    if (!selectedShootId || !localShoot) return;
    const moodKey = localShoot.slots ? (Object.values(localShoot.slots).flat()[0]?.mood || "default") : "default";
    const suggestions = getSuggestedShotsForMood(moodKey);
    const slotShots = suggestions[slot] || suggestions.morning || [];
    if (!slotShots.length) return;
    const shot = { ...slotShots[0], id: Date.now() };
    setShoots(ss => ss.map(s => {
      if (s.id !== selectedShootId) return s;
      return { ...s, slots: { ...s.slots, [slot]: [...(s.slots?.[slot] || []), shot] } };
    }));
    setLocalShoot(prev => prev ? {
      ...prev,
      slots: { ...prev.slots, [slot]: [...(prev.slots?.[slot] || []), shot] }
    } : prev);
    setShootIsDirty(true);
  };

  // AI Trend Scout Trigger Simulation
  const runAiScout = () => {
    setScouting(true);
    setScoutProgress(5);
    setScoutLogs(["Connecting to Meta Graph API...", "Authenticating Instagram Token..."]);
    
    const logs = [
      "Querying #productivity reels with >100k views...",
      "Scouting sound files with ascending momentum...",
      "Evaluating visual frame-retention indexes...",
      "Simulating AI emotional sentiment filters...",
      "Trend database compilation complete!"
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      if (currentStep <= logs.length) {
        setScoutProgress(prev => Math.min(prev + 18, 95));
        setScoutLogs(prev => [...prev, logs[currentStep - 1]]);
      } else {
        clearInterval(interval);
        setScoutProgress(100);
        setTimeout(() => {
          setScouting(false);
          // Highlight trending data
          setAiTrends(MOCK_TRENDS_DATA[activeNiche] || []);
        }, 600);
      }
    }, 600);
  };

  // AI Chat Helper response logic
  const sendAiChat = () => {
    if (!aiChatQuery.trim()) return;
    const userMsg = { sender: "user", text: aiChatQuery };
    setAiChatResponses(prev => [...prev, userMsg]);
    setAiChatQuery("");

    setTimeout(() => {
      let replyText = "";
      const q = aiChatQuery.toLowerCase();
      if (q.includes("hook") || q.includes("title")) {
        replyText = "Here are 3 scroll-stopping hook structures for your niche:\n\n1. 'Unfortunately, if you spend too much time with me, I'll brainwash you into...' (Value proposition)\n2. 'Here’s the exact moment everything shifted for me...' (Realization check)\n3. 'You're so creative!' -> Cut to chaotic process footage (Unpolished transparency)";
      } else if (q.includes("music") || q.includes("audio") || q.includes("song")) {
        replyText = "The top trending tracks right now are:\n\n• 'EVERYTHING HALLELUJAH' (Justin Bieber) - Punctuated list beats.\n• 'Be Like a Woman' (Chris Rainbow) - Aesthetic montage sound.\n• 'Bleeding Love' (Leona Lewis Lip-sync) - Confessional relatable clip.";
      } else {
        replyText = "Based on current viral trends, I suggest filming slow static clips at golden hour. Mute background noise, add soft acoustic audio, and use a confessional caption starting with: 'Documenting the ordinary moments...'";
      }
      setAiChatResponses(prev => [...prev, { sender: "assistant", text: replyText }]);
    }, 700);
  };

  const S={
    card:{background:"var(--bg-secondary)",borderRadius:16,border:"1px solid var(--border-color)",padding:"20px",marginBottom:14},
    label:{fontSize:12,color:"var(--text-muted)",letterSpacing:0.4,marginBottom:4,display:"block"},
    input:{width:"100%",border:"1px solid var(--border-color)",borderRadius:10,padding:"9px 12px",fontSize:14,fontFamily:"inherit",background:"var(--bg-secondary)",color:"var(--text-primary)",outline:"none",boxSizing:"border-box"},
    textarea:{width:"100%",border:"1px solid var(--border-color)",borderRadius:10,padding:"9px 12px",fontSize:14,fontFamily:"inherit",background:"var(--bg-secondary)",color:"var(--text-primary)",outline:"none",resize:"vertical",minHeight:80,boxSizing:"border-box"},
    wizardOption:(selected, isList=false)=>({
      width: "100%",
      padding: isList ? "12px 18px" : "10px 14px",
      borderRadius: "12px",
      minHeight: 44,
      cursor: "pointer",
      fontFamily: "inherit",
      fontSize: 12,
      transition: "all var(--transition-fast)",
      display: isList ? "flex" : "inline-flex",
      alignItems: isList ? "flex-start" : "center",
      justifyContent: isList ? "flex-start" : "center",
      textAlign: "left",
      boxSizing: "border-box",
      background: selected ? "rgba(241, 62, 147, 0.08)" : "#FFFFFF",
      color: selected ? "#D01E73" : "#5A5A5A",
      border: selected ? "1px solid #F13E93" : "1px solid var(--border-color)",
      fontWeight: selected ? 600 : 400
    }),
    btn:(color="var(--accent-color)",sm=false)=>{
      const isPrimary = color === "var(--accent-color)" || color === "#F13E93";
      const isSecondary = color === "var(--accent-light)" || color === "#F9D0CD" || color === "secondary";
      const borderRadius = (isPrimary || isSecondary) ? "12px" : "20px";
      const bg = isPrimary ? "#F13E93" : (isSecondary ? "#F9D0CD" : `${color}16`);
      const fg = isPrimary ? "#FFFFFF" : (isSecondary ? "#F13E93" : color);
      const border = isPrimary ? "#F13E93" : (isSecondary ? "#F9D0CD" : color);
      return {
        padding: sm ? "4px 12px" : "8px 17px",
        borderRadius,
        border: `1px solid ${border}`,
        background: bg,
        color: fg,
        fontSize: sm ? 11 : 12,
        cursor: "pointer",
        fontFamily: "inherit",
        transition: "all 0.18s",
        whiteSpace: "nowrap",
        ...(isPrimary && !isSecondary ? {
          "--btn-bg": "#F13E93",
          "--btn-color": "#FFFFFF",
          "--btn-border": "#F13E93",
          "--btn-hover-bg": "#F891BB",
          "--btn-hover-color": "#FFFFFF",
        } : (isSecondary ? {
          "--btn-bg": "#F9D0CD",
          "--btn-color": "#F13E93",
          "--btn-border": "#F9D0CD",
          "--btn-hover-bg": "#F891BB",
          "--btn-hover-color": "#FFFFFF",
        } : {}))
      };
    },
    grid2:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12},
    row:{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"},
    ghost:{background:"none",border:"none",cursor:"pointer",fontFamily:"inherit"},
  };

  const TABS = [
    ["planner","content planner"],
    ["dump","brain dump"],
    ["shoot","shoot planner"],
    ["vault","b-roll vault"],
    ["journal","growth journal"],
    ["collabs","collabs CRM"],
    ["trends","AI trend scout"],
    ["instagram","instagram dashboard"],
    ["settings","settings"]
  ];

  const formRates = calculateCollabRates(formDeliverables);
  const selectedCollab = collabs.find(x => x.id === selectedCollabId) || null;
  const selectedCollabDeliverables = selectedCollab ? getDeliverablesArray(selectedCollab) : [];
  const selectedCollabRates = selectedCollab ? calculateCollabRates(selectedCollabDeliverables) : null;
  const c = selectedCollab;
  const cRates = selectedCollabRates;
  const delList = selectedCollabDeliverables;

  const collabDetailContent = addingCollab ? (
                <div style={S.card} className="card-in">
                    <div style={{...S.row,justifyContent:"space-between",marginBottom:14}}>
                      <h3 style={{fontSize:16,fontWeight:500}}>Log New Partnership</h3>
                    <button style={{...S.ghost,fontSize:18,color:"var(--text-muted)"}} onClick={()=>setAddingCollab(false)}>×</button>
                  </div>

                  <div style={S.grid2}>
                    <div style={{marginBottom:10}}>
                      <span style={S.label}>brand name *</span>
                      <input value={newCollab.brand} style={S.input} onChange={e=>setNewCollab({...newCollab,brand:e.target.value})} placeholder="Aesthetic Deskpads..."/>
                    </div>
                    <div style={{marginBottom:10}}>
                      <span style={S.label}>pipeline status</span>
                      <select value={newCollab.status} style={S.input} onChange={e=>setNewCollab({...newCollab,status:e.target.value})}>
                        <option value="dream brand">dream brand</option>
                        <option value="reached out">reached out</option>
                        <option value="replied">replied</option>
                        <option value="discussing">discussing</option>
                        <option value="booked">booked</option>
                        <option value="completed">completed</option>
                        <option value="ghosted 😭">ghosted 😭</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-grid-3" style={{marginBottom:10}}>
                    <div>
                      <span style={S.label}>contact person</span>
                      <input value={newCollab.contactName} style={S.input} onChange={e=>setNewCollab({...newCollab,contactName:e.target.value})} placeholder="Marcus..."/>
                    </div>
                    <div>
                      <span style={S.label}>email address</span>
                      <input value={newCollab.email} style={S.input} onChange={e=>setNewCollab({...newCollab,email:e.target.value})} placeholder="partner@brand.com"/>
                    </div>
                    <div>
                      <span style={S.label}>platform</span>
                      <input value={newCollab.platform} style={S.input} onChange={e=>setNewCollab({...newCollab,platform:e.target.value})} placeholder="Instagram, YouTube..."/>
                    </div>
                  </div>

                  <div className="form-grid-4" style={{marginBottom:10}}>
                    <div>
                      <span style={S.label}>proposed rate (₹)</span>
                      <input type="number" value={newCollab.quote} style={S.input} onChange={e=>setNewCollab({...newCollab,quote:e.target.value})} placeholder="400"/>
                    </div>
                    <div>
                      <span style={S.label}>agreed rate (₹)</span>
                      <input type="number" value={newCollab.negotiatedAmount} style={S.input} onChange={e=>setNewCollab({...newCollab,negotiatedAmount:e.target.value})} placeholder="350"/>
                    </div>
                    <div>
                      <span style={S.label}>due date</span>
                      <input type="date" value={newCollab.dueDate} style={S.input} onChange={e=>setNewCollab({...newCollab,dueDate:e.target.value})}/>
                    </div>
                    <div>
                      <span style={S.label}>payment status</span>
                      <select value={newCollab.paymentStatus} style={S.input} onChange={e=>setNewCollab({...newCollab,paymentStatus:e.target.value})}>
                        <option value="unpaid">unpaid</option>
                        <option value="invoice sent">invoice sent</option>
                        <option value="paid">paid</option>
                      </select>
                    </div>
                  </div>

                  <div style={{...S.card, background:"var(--bg-primary)", marginBottom:14, border:"1px solid var(--border-color)"}}>
                    <span style={S.label}>Deliverables Rates & Quantity Estimator</span>
                    
                    {/* Reels Counter Row */}
                    <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid var(--border-color)"}}>
                      <div>
                        <span style={{fontSize:13, fontWeight:600, color:"var(--text-primary)"}}>▶ Reels</span>
                        <span style={{fontSize:11, color:"var(--text-muted)", marginLeft:8}}>(₹500 each, 2 for ₹900)</span>
                      </div>
                      <div style={{display:"flex", alignItems:"center", gap:12}}>
                        <button type="button" onClick={() => {
                          const reels = formDeliverables.filter(d => d.type === "reel");
                          if (reels.length > 0) {
                            const toRemove = reels[reels.length - 1];
                            setFormDeliverables(formDeliverables.filter(d => d.id !== toRemove.id));
                          }
                        }} style={{padding:"2px 8px", borderRadius:4, border:"1px solid var(--border-color)", cursor:"pointer", background:"var(--bg-secondary)"}}>-</button>
                        <span style={{fontWeight:600, minWidth:20, textAlign:"center"}}>{formRates.reels}</span>
                        <button type="button" onClick={() => {
                          setFormDeliverables([...formDeliverables, {
                            id: Date.now() + Math.random(),
                            type: "reel",
                            text: `1x Reel #${formRates.reels + 1}`,
                            postId: null,
                            shootId: null,
                            completed: false
                          }]);
                        }} style={{padding:"2px 8px", borderRadius:4, border:"1px solid var(--border-color)", cursor:"pointer", background:"var(--bg-secondary)"}}>+</button>
                        <span style={{minWidth:60, textAlign:"right", fontWeight:500, fontSize:13}}>₹{formRates.reelsCost}</span>
                      </div>
                    </div>

                    {/* Stories Counter Row */}
                    <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid var(--border-color)"}}>
                      <div>
                        <span style={{fontSize:13, fontWeight:600, color:"var(--text-primary)"}}>◯ Stories</span>
                        <span style={{fontSize:11, color:"var(--text-muted)", marginLeft:8}}>(₹50 each)</span>
                      </div>
                      <div style={{display:"flex", alignItems:"center", gap:12}}>
                        <button type="button" onClick={() => {
                          const stories = formDeliverables.filter(d => d.type === "story");
                          if (stories.length > 0) {
                            const toRemove = stories[stories.length - 1];
                            setFormDeliverables(formDeliverables.filter(d => d.id !== toRemove.id));
                          }
                        }} style={{padding:"2px 8px", borderRadius:4, border:"1px solid var(--border-color)", cursor:"pointer", background:"var(--bg-secondary)"}}>-</button>
                        <span style={{fontWeight:600, minWidth:20, textAlign:"center"}}>{formRates.stories}</span>
                        <button type="button" onClick={() => {
                          setFormDeliverables([...formDeliverables, {
                            id: Date.now() + Math.random(),
                            type: "story",
                            text: `1x Story #${formRates.stories + 1}`,
                            postId: null,
                            shootId: null,
                            completed: false
                          }]);
                        }} style={{padding:"2px 8px", borderRadius:4, border:"1px solid var(--border-color)", cursor:"pointer", background:"var(--bg-secondary)"}}>+</button>
                        <span style={{minWidth:60, textAlign:"right", fontWeight:500, fontSize:13}}>₹{formRates.storiesCost}</span>
                      </div>
                    </div>

                    {/* Carousels Counter Row */}
                    <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid var(--border-color)"}}>
                      <div>
                        <span style={{fontSize:13, fontWeight:600, color:"var(--text-primary)"}}>⊞ Carousels</span>
                        <span style={{fontSize:11, color:"var(--text-muted)", marginLeft:8}}>(₹300 each)</span>
                      </div>
                      <div style={{display:"flex", alignItems:"center", gap:12}}>
                        <button type="button" onClick={() => {
                          const carousels = formDeliverables.filter(d => d.type === "carousel");
                          if (carousels.length > 0) {
                            const toRemove = carousels[carousels.length - 1];
                            setFormDeliverables(formDeliverables.filter(d => d.id !== toRemove.id));
                          }
                        }} style={{padding:"2px 8px", borderRadius:4, border:"1px solid var(--border-color)", cursor:"pointer", background:"var(--bg-secondary)"}}>-</button>
                        <span style={{fontWeight:600, minWidth:20, textAlign:"center"}}>{formRates.carousels}</span>
                        <button type="button" onClick={() => {
                          setFormDeliverables([...formDeliverables, {
                            id: Date.now() + Math.random(),
                            type: "carousel",
                            text: `1x Carousel #${formRates.carousels + 1}`,
                            postId: null,
                            shootId: null,
                            completed: false
                          }]);
                        }} style={{padding:"2px 8px", borderRadius:4, border:"1px solid var(--border-color)", cursor:"pointer", background:"var(--bg-secondary)"}}>+</button>
                        <span style={{minWidth:60, textAlign:"right", fontWeight:500, fontSize:13}}>₹{formRates.carouselsCost}</span>
                      </div>
                    </div>

                    {/* Photos Counter Row */}
                    <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid var(--border-color)"}}>
                      <div>
                        <span style={{fontSize:13, fontWeight:600, color:"var(--text-primary)"}}>✎ Photo Posts</span>
                        <span style={{fontSize:11, color:"var(--text-muted)", marginLeft:8}}>(₹200 each)</span>
                      </div>
                      <div style={{display:"flex", alignItems:"center", gap:12}}>
                        <button type="button" onClick={() => {
                          const photos = formDeliverables.filter(d => d.type === "photo");
                          if (photos.length > 0) {
                            const toRemove = photos[photos.length - 1];
                            setFormDeliverables(formDeliverables.filter(d => d.id !== toRemove.id));
                          }
                        }} style={{padding:"2px 8px", borderRadius:4, border:"1px solid var(--border-color)", cursor:"pointer", background:"var(--bg-secondary)"}}>-</button>
                        <span style={{fontWeight:600, minWidth:20, textAlign:"center"}}>{formRates.photos}</span>
                        <button type="button" onClick={() => {
                          setFormDeliverables([...formDeliverables, {
                            id: Date.now() + Math.random(),
                            type: "photo",
                            text: `1x Photo #${formRates.photos + 1}`,
                            postId: null,
                            shootId: null,
                            completed: false
                          }]);
                        }} style={{padding:"2px 8px", borderRadius:4, border:"1px solid var(--border-color)", cursor:"pointer", background:"var(--bg-secondary)"}}>+</button>
                        <span style={{minWidth:60, textAlign:"right", fontWeight:500, fontSize:13}}>₹{formRates.photosCost}</span>
                      </div>
                    </div>

                    {/* Dynamic Rate Calculations */}
                    <div style={{marginTop:12, paddingTop:8, borderTop:"2px solid var(--border-color)", display:"flex", flexDirection:"column", gap:4, alignItems:"flex-end", fontSize:12, color:"var(--text-secondary)"}}>
                      <div>Subtotal: <span style={{fontWeight:500}}>₹{formRates.subtotal}</span></div>
                      {formRates.discount > 0 && (
                        <div style={{color:"#a8c8a0"}}>Reel Bundle Discount: <span style={{fontWeight:600}}>-₹{formRates.discount}</span></div>
                      )}
                      <div style={{fontSize:14, fontWeight:600, color:"var(--text-primary)", marginTop:4}}>Estimated Total: ₹{formRates.total}</div>
                    </div>

                    {/* Form Deliverables details edit (for descriptions) */}
                    {formDeliverables.length > 0 && (
                      <div style={{marginTop:16}}>
                        <span style={S.label}>Customize Deliverables Description:</span>
                        <div style={{display:"grid", gap:8}}>
                          {formDeliverables.map((fd, idx) => (
                            <div key={fd.id} style={{display:"flex", alignItems:"center", gap:8, background:"var(--bg-secondary)", border:"1px solid var(--border-color)", padding:"8px 12px", borderRadius:10}}>
                              <span style={{fontSize:11, color:"var(--accent-dark)", fontWeight:600, width:90}}>
                                {fd.type === "reel" ? "▶ Reel" : fd.type === "story" ? "◯ Story" : fd.type === "carousel" ? "⊞ Carousel" : fd.type === "photo" ? "✎ Photo" : "✏ Custom"}
                              </span>
                              <input value={fd.text} onChange={e => {
                                const updated = [...formDeliverables];
                                updated[idx].text = e.target.value;
                                setFormDeliverables(updated);
                              }} placeholder="Deliverable details (e.g. 1x Reel showing morning)..." style={{...S.input, fontSize:12, padding:"5px 10px", flex:1}}/>
                              <button type="button" onClick={() => setFormDeliverables(formDeliverables.filter(x => x.id !== fd.id))} style={{background:"none", border:"none", color:"#f0a090", fontSize:14, cursor:"pointer"}}>×</button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Add a custom deliverable button for flexibility */}
                    <div style={{marginTop:12, display:"flex", gap:8}}>
                      <button type="button" onClick={() => {
                        setFormDeliverables([...formDeliverables, {
                          id: Date.now() + Math.random(),
                          type: "custom",
                          text: "1x Custom Deliverable",
                          price: 100,
                          postId: null,
                          shootId: null,
                          completed: false
                        }]);
                      }} style={S.btn("var(--text-secondary)", true)}>+ Add Custom Item (₹100)</button>
                    </div>
                  </div>

                  <div style={{...S.card, background:"var(--bg-primary)", marginBottom:14, border:"1px solid var(--border-color)"}}>
                    <span style={S.label}>Brand Brief & Guidelines</span>
                    
                    <div style={{...S.grid2, marginBottom:10}}>
                      <div>
                        <span style={S.label}>Wardrobe / Aesthetic (What to wear)</span>
                        <input value={newCollab.wardrobe || ""} onChange={e=>setNewCollab({...newCollab, wardrobe:e.target.value})} placeholder="e.g. earth tones, cozy knit sweater" style={S.input}/>
                      </div>
                      <div>
                        <span style={S.label}>Props & Styling Details</span>
                        <input value={newCollab.props || ""} onChange={e=>setNewCollab({...newCollab, props:e.target.value})} placeholder="e.g. ceramic mug, wooden tray" style={S.input}/>
                      </div>
                    </div>

                    <div style={{marginBottom:10}}>
                      <span style={S.label}>Brand Script / Key Talking Points</span>
                      <textarea value={newCollab.scriptText || ""} onChange={e=>setNewCollab({...newCollab, scriptText:e.target.value})} placeholder="Paste brand talking points, mandatory phrases, hook scripts, or guidelines here..." style={{...S.textarea, minHeight:70}}/>
                    </div>

                    <div>
                      <span style={S.label}>Upload Brand Brief PDF / Script File</span>
                      <div style={{
                        border: "1px dashed var(--border-color)",
                        borderRadius: 10,
                        padding: "10px",
                        textAlign: "center",
                        background: "var(--bg-secondary)",
                        cursor: "pointer",
                        position: "relative"
                      }} onClick={() => {
                        const input = document.createElement("input");
                        input.type = "file";
                        input.accept = ".pdf,.docx,.doc,.txt,image/*";
                        input.onchange = (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setNewCollab(prev => ({
                              ...prev,
                              briefFileName: file.name,
                              briefFileUrl: URL.createObjectURL(file)
                            }));
                          }
                        };
                        input.click();
                      }}>
                        {newCollab.briefFileName ? (
                          <div style={{fontSize:12, color:"var(--accent-dark)", fontWeight:500}}>📄 {newCollab.briefFileName} (Click to change)</div>
                        ) : (
                          <div style={{fontSize:11, color:"var(--text-muted)"}}>Click to upload brief or script document</div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{marginBottom:14}}>
                    <span style={S.label}>relationship notes</span>
                    <textarea value={newCollab.notes} style={S.textarea} onChange={e=>setNewCollab({...newCollab,notes:e.target.value})} placeholder="they liked warm tones, requested clean voiceover, etc."/>
                  </div>

                  <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
                    <button style={S.btn("var(--text-muted)")} onClick={()=>{
                      const isDirty = newCollab.brand.trim() || newCollab.contactName.trim() || newCollab.email.trim() || newCollab.notes.trim();
                      if (isDirty) {
                        if (confirm("You have unsaved changes in this collaboration log. Discard them?")) setAddingCollab(false);
                      } else {
                        setAddingCollab(false);
                      }
                    }}>cancel</button>
                    <button style={S.btn("var(--accent-color)")} onClick={async ()=>{
                      const nc={...newCollab, createdAt:todayStr, quote:String(Number(newCollab.quote)||0), negotiatedAmount:String(Number(newCollab.negotiatedAmount)||0), deliverables: formDeliverables};
                      try {
                        const saved = await apiCreateCollab(nc);
                        setCollabs(prev=>[saved,...prev]);
                        setSelectedCollabId(saved.id);
                      } catch(err) {
                        console.error("Failed to save collab to API, using local:", err);
                        const localNc = { ...nc, id: String(Date.now()) };
                        setCollabs(prev=>[localNc,...prev]);
                        setSelectedCollabId(localNc.id);
                      }
                      setAddingCollab(false);
                      setFormDeliverables([]);
                      setNewCollab({ brand:"", contactName:"", email:"", platform:"Instagram", status:"dream brand", quote:"", negotiatedAmount:"", deliverables:[], dueDate:"", paymentStatus:"unpaid", notes:"", pitchDraft:"", followUpDraft:"", scriptText:"", wardrobe:"", props:"", briefFileName:"", briefFileUrl:"" });
                    }} disabled={!newCollab.brand.trim()}>save collab</button>
                  </div>
                </div>
              ) : selectedCollab ? (
                  <div style={S.card} className="card-in">
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",borderBottom:"1px solid var(--border-color)",paddingBottom:10,marginBottom:16}}>
                        <div>
                          <h3 style={{fontSize:18,fontWeight:400}}>{c.brand} Collaboration</h3>
                          <span style={{fontSize:11,color:"var(--text-muted)"}}>{c.contactName} · {c.email}</span>
                        </div>
                        <Tag label={c.status} color={c.status.startsWith("ghosted")?"#f0a090":c.status==="completed"?"#a8c8a0":"#c9b99a"}/>
                      </div>

                      <div className="form-grid-4" style={{marginBottom:16}}>
                        <div style={{background:"var(--bg-primary)",borderRadius:12,padding:12,border:"1px solid var(--border-color)"}}>
                          <span style={{fontSize:11,color:"var(--text-muted)"}}>proposed rate</span>
                          <div style={{fontSize:16,fontWeight:500,marginTop:2}}>₹{c.quote}</div>
                        </div>
                        <div style={{background:"var(--bg-primary)",borderRadius:12,padding:12,border:"1px solid var(--border-color)"}}>
                          <span style={{fontSize:11,color:"var(--text-muted)"}}>negotiated rate</span>
                          <div style={{fontSize:16,fontWeight:500,marginTop:2}}>₹{c.negotiatedAmount}</div>
                        </div>
                        <div style={{background:"var(--bg-primary)",borderRadius:12,padding:12,border:"1px solid var(--border-color)"}}>
                          <span style={{fontSize:11,color:"var(--text-muted)"}}>due date</span>
                          <div style={{fontSize:14,fontWeight:500,marginTop:4}}>{c.dueDate ? friendlyDate(c.dueDate) : "no due date"}</div>
                        </div>
                        <div style={{background:"var(--bg-primary)",borderRadius:12,padding:12,border:"1px solid var(--border-color)"}}>
                          <span style={{fontSize:11,color:"var(--text-muted)"}}>payment</span>
                          <div style={{fontSize:14,fontWeight:500,marginTop:4,color:c.paymentStatus==="paid"?"#a8c8a0":"#c9b99a"}}>{c.paymentStatus}</div>
                        </div>
                      </div>

                      {/* Deliverables checklist */}
                      <div style={{marginBottom:16}}>
                        <span style={S.label}>deliverables tracker (linked to content & shoot planners)</span>
                        <div style={{background:"var(--bg-primary)",border:"1px solid var(--border-color)",borderRadius:10,padding:14}}>
                          {(() => {
                            const delList = getDeliverablesArray(c);
                            const cRates = calculateCollabRates(delList);
                            
                            return (
                              <>
                                {/* Quantity adjusters */}
                                <div className="no-print form-grid-4" style={{marginBottom:16, paddingBottom:12, borderBottom:"1px solid var(--border-color)", gap:10}}>
                                  <div style={{display:"flex", flexDirection:"column", alignItems:"center", background:"var(--bg-secondary)", border:"1px solid var(--border-color)", padding:6, borderRadius:10}}>
                                    <span style={{fontSize:10, color:"var(--text-muted)", textTransform:"lowercase", fontWeight:600}}>▶ Reels</span>
                                    <div style={{display:"flex", alignItems:"center", gap:8, marginTop:4}}>
                                      <button style={{padding:"0px 6px", fontSize:11, borderRadius:4, border:"1px solid var(--border-color)", cursor:"pointer", background:"var(--bg-primary)"}} onClick={()=>adjustCollabDeliverable(c.id, "reel", -1)}>-</button>
                                      <span style={{fontWeight:600, fontSize:12, minWidth:12, textAlign:"center"}}>{cRates.reels}</span>
                                      <button style={{padding:"0px 6px", fontSize:11, borderRadius:4, border:"1px solid var(--border-color)", cursor:"pointer", background:"var(--bg-primary)"}} onClick={()=>adjustCollabDeliverable(c.id, "reel", 1)}>+</button>
                                    </div>
                                  </div>
                                  <div style={{display:"flex", flexDirection:"column", alignItems:"center", background:"var(--bg-secondary)", border:"1px solid var(--border-color)", padding:6, borderRadius:10}}>
                                    <span style={{fontSize:10, color:"var(--text-muted)", textTransform:"lowercase", fontWeight:600}}>◯ Stories</span>
                                    <div style={{display:"flex", alignItems:"center", gap:8, marginTop:4}}>
                                      <button style={{padding:"0px 6px", fontSize:11, borderRadius:4, border:"1px solid var(--border-color)", cursor:"pointer", background:"var(--bg-primary)"}} onClick={()=>adjustCollabDeliverable(c.id, "story", -1)}>-</button>
                                      <span style={{fontWeight:600, fontSize:12, minWidth:12, textAlign:"center"}}>{cRates.stories}</span>
                                      <button style={{padding:"0px 6px", fontSize:11, borderRadius:4, border:"1px solid var(--border-color)", cursor:"pointer", background:"var(--bg-primary)"}} onClick={()=>adjustCollabDeliverable(c.id, "story", 1)}>+</button>
                                    </div>
                                  </div>
                                  <div style={{display:"flex", flexDirection:"column", alignItems:"center", background:"var(--bg-secondary)", border:"1px solid var(--border-color)", padding:6, borderRadius:10}}>
                                    <span style={{fontSize:10, color:"var(--text-muted)", textTransform:"lowercase", fontWeight:600}}>⊞ Carousels</span>
                                    <div style={{display:"flex", alignItems:"center", gap:8, marginTop:4}}>
                                      <button style={{padding:"0px 6px", fontSize:11, borderRadius:4, border:"1px solid var(--border-color)", cursor:"pointer", background:"var(--bg-primary)"}} onClick={()=>adjustCollabDeliverable(c.id, "carousel", -1)}>-</button>
                                      <span style={{fontWeight:600, fontSize:12, minWidth:12, textAlign:"center"}}>{cRates.carousels}</span>
                                      <button style={{padding:"0px 6px", fontSize:11, borderRadius:4, border:"1px solid var(--border-color)", cursor:"pointer", background:"var(--bg-primary)"}} onClick={()=>adjustCollabDeliverable(c.id, "carousel", 1)}>+</button>
                                    </div>
                                  </div>
                                  <div style={{display:"flex", flexDirection:"column", alignItems:"center", background:"var(--bg-secondary)", border:"1px solid var(--border-color)", padding:6, borderRadius:10}}>
                                    <span style={{fontSize:10, color:"var(--text-muted)", textTransform:"lowercase", fontWeight:600}}>✎ Photos</span>
                                    <div style={{display:"flex", alignItems:"center", gap:8, marginTop:4}}>
                                      <button style={{padding:"0px 6px", fontSize:11, borderRadius:4, border:"1px solid var(--border-color)", cursor:"pointer", background:"var(--bg-primary)"}} onClick={()=>adjustCollabDeliverable(c.id, "photo", -1)}>-</button>
                                      <span style={{fontWeight:600, fontSize:12, minWidth:12, textAlign:"center"}}>{cRates.photos}</span>
                                      <button style={{padding:"0px 6px", fontSize:11, borderRadius:4, border:"1px solid var(--border-color)", cursor:"pointer", background:"var(--bg-primary)"}} onClick={()=>adjustCollabDeliverable(c.id, "photo", 1)}>+</button>
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Items checklist */}
                                {delList.length === 0 ? (
                                  <span style={{fontStyle:"italic",fontSize:12,color:"var(--text-muted)"}}>No deliverables logged</span>
                                ) : (
                                  delList.map(del => {
                                    const linkedPost = posts.find(p => p.id === del.postId);
                                    const linkedShoot = shoots.find(s => s.id === del.shootId);
                                    const isCompleted = del.completed || linkedPost?.status === "posted";

                                    return (
                                      <div key={del.id} style={{
                                        display:"flex",
                                        alignItems:"center",
                                        justifyContent: "space-between",
                                        gap:12,
                                        marginBottom:10,
                                        paddingBottom:8,
                                        borderBottom:"1px solid var(--bg-secondary)",
                                        fontSize:13,
                                        flexWrap: "wrap"
                                      }}>
                                        <div style={{display:"flex",alignItems:"center",gap:8,flex:1,minWidth:"240px"}}>
                                          <input type="checkbox" checked={isCompleted} style={{cursor:"pointer"}} onChange={() => toggleDeliverableCompleted(c.id, del.id)}/>
                                          <span style={{
                                            textDecoration: isCompleted ? "line-through" : "none",
                                            color: isCompleted ? "var(--text-muted)" : "var(--text-primary)",
                                            fontWeight: 500
                                          }}>{del.text}</span>
                                          <button type="button" style={{background:"none", border:"none", color:"#f0a090", fontSize:14, cursor:"pointer", marginLeft:4}} onClick={() => deleteDeliverableFromCollab(c.id, del.id)}>×</button>
                                        </div>

                                        <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}} className="no-print">
                                          {/* Linked Post Badge or Link Tool */}
                                          {linkedPost ? (
                                            <span onClick={() => { setTab("planner"); setSelectedPost(linkedPost); }} style={{
                                              cursor:"pointer",fontSize:11,padding:"3px 8px",borderRadius:12,
                                              background:linkedPost.status==="posted"?"#a8c8a024":"var(--accent-light)",
                                              color:linkedPost.status==="posted"?"#6ea87a":"var(--accent-dark)",
                                              display:"inline-flex",alignItems:"center",gap:4
                                            }}>
                                              ▶ {linkedPost.title} ({linkedPost.status})
                                            </span>
                                          ) : (
                                            <select style={{fontSize:11,padding:"2px 6px",borderRadius:8,background:"var(--bg-secondary)",border:"1px solid var(--border-color)",color:"var(--text-secondary)"}}
                                              onChange={e => {
                                                if (e.target.value === "create") {
                                                  createPostForDeliverable(c.id, del.id, del.text);
                                                } else if (e.target.value) {
                                                  linkPostToDeliverable(c.id, del.id, e.target.value);
                                                }
                                              }} value="">
                                              <option value="">🔗 Link Post...</option>
                                              <option value="create">+ Create Draft Post</option>
                                              {posts.map(p => <option key={p.id} value={p.id}>{TYPE_ICONS[p.type]} {p.title}</option>)}
                                              </select>
                                          )}

                                          {/* Linked Shoot Badge or Link Tool */}
                                          {linkedShoot ? (
                                            <span onClick={() => { setTab("shoot"); setSelectedShootId(linkedShoot.id); }} style={{
                                              cursor:"pointer",fontSize:11,padding:"3px 8px",borderRadius:12,
                                              background:"#a0b8c824",color:"#6a8ca8",
                                              display:"inline-flex",alignItems:"center",gap:4
                                            }}>
                                              🎬 {linkedShoot.name.replace(" Session", "")}
                                            </span>
                                          ) : (
                                            <select style={{fontSize:11,padding:"2px 6px",borderRadius:8,background:"var(--bg-secondary)",border:"1px solid var(--border-color)",color:"var(--text-secondary)"}}
                                              onChange={e => {
                                                if (e.target.value === "create") {
                                                  createShootForDeliverable(c.id, del.id, del.text);
                                                } else if (e.target.value) {
                                                  linkShootToDeliverable(c.id, del.id, e.target.value);
                                                }
                                              }} value="">
                                              <option value="">🎬 Link Shoot...</option>
                                              <option value="create">+ Create Shoot Session</option>
                                              {shoots.map(s => <option key={s.id} value={s.id}>🎬 {s.name}</option>)}
                                            </select>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })
                                )}
                              </>
                            );
                          })()}
                          {/* Add Deliverable Row */}
                          <div style={{display:"flex",gap:8,marginTop:12}} className="no-print">
                            <input value={newDeliverableText} onChange={e=>setNewDeliverableText(e.target.value)} placeholder="Add custom deliverable (e.g. 1x consultation)..." style={{...S.input,fontSize:12,padding:"6px 10px",flex:1}}
                              onKeyDown={e=>{if(e.key==="Enter"){addDeliverableToCollab(c.id);}}}/>
                            <button style={S.btn("var(--accent-color)",true)} onClick={()=>addDeliverableToCollab(c.id)}>+ Add</button>
                          </div>
                        </div>
                      </div>

                      {/* Brand Guidelines Card */}
                      <div style={S.card} className="card-in">
                        <span style={S.label}>Brand Brief & Creative Guidelines</span>
                        
                        {(c.briefFileName || c.wardrobe || c.props || c.scriptText) ? (
                          <div style={{display:"grid", gap:10, fontSize:13, marginTop:8}}>
                            
                            {c.briefFileName && (
                              <div style={{background:"var(--bg-primary)", padding:"8px 12px", borderRadius:10, border:"1px solid var(--border-color)", display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                                <span style={{fontWeight:500}}>📄 Attached Brief/Script:</span>
                                <a href={c.briefFileUrl} download={c.briefFileName} style={{color:"var(--accent-dark)", textDecoration:"none", fontWeight:600}} onClick={e => e.stopPropagation()}>Download Brief</a>
                              </div>
                            )}

                            {(c.wardrobe || c.props) && (
                              <div style={{...S.grid2, gap:12}}>
                                {c.wardrobe && (
                                  <div style={{background:"var(--bg-primary)", padding:10, borderRadius:10, border:"1px solid var(--border-color)"}}>
                                    <span style={{fontSize:11, color:"var(--text-muted)", display:"block", marginBottom:2}}>👗 Outfit / Aesthetic</span>
                                    <span style={{fontWeight:500}}>{c.wardrobe}</span>
                                  </div>
                                )}
                                {c.props && (
                                  <div style={{background:"var(--bg-primary)", padding:10, borderRadius:10, border:"1px solid var(--border-color)"}}>
                                    <span style={{fontSize:11, color:"var(--text-muted)", display:"block", marginBottom:2}}>📦 Props Required</span>
                                    <span style={{fontWeight:500}}>{c.props}</span>
                                  </div>
                                )}
                              </div>
                            )}

                            {c.scriptText && (
                              <div style={{background:"var(--bg-primary)", padding:12, borderRadius:10, border:"1px solid var(--border-color)"}}>
                                <span style={{fontSize:11, color:"var(--text-muted)", display:"block", marginBottom:4}}>📝 Brand Script & Talking Points</span>
                                <pre style={{fontFamily:"inherit", whiteSpace:"pre-wrap", color:"var(--text-secondary)", lineHeight:1.6}}>{c.scriptText}</pre>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div style={{fontSize:12, fontStyle:"italic", color:"var(--text-muted)", marginTop:6}}>No brand guidelines or script logged yet.</div>
                        )}
                      </div>

                      {/* AI Collab Strategist */}
                      {["dream brand", "reached out", "replied", "lead"].includes(c.status) && (
                        <div style={{...S.card, background:"var(--accent-light)15", border:"1px solid var(--border-focus)", marginBottom:16}} className="card-in">
                          <div style={{display:"flex", alignItems:"center", gap:8, marginBottom:10}}>
                            <span style={{fontSize:16}}>✨</span>
                            <h4 style={{fontSize:13, fontWeight:600, color:"var(--text-primary)", margin:0}}>AI Collab Strategist</h4>
                          </div>
                          <p style={{fontSize:12, color:"var(--text-secondary)", margin:"0 0 12px 0", lineHeight:1.4}}>
                            Analyze a brand profile link to estimate the optimal collaboration amount, auto-configure deliverables, and draft pitch outreach messages.
                          </p>
                          <div style={{display:"flex", gap:10, alignItems:"center"}}>
                            <input value={pitchUrl} onChange={e=>setPitchUrl(e.target.value)} placeholder="Paste brand IG / TikTok / website URL..." style={{...S.input, flex:1, padding:"6px 12px", fontSize:12}}/>
                            <button onClick={analyzeAndEstimateCollabAI} disabled={aiEstimatingCollab || !pitchUrl} style={S.btn("var(--accent-color)", true)}>
                              {aiEstimatingCollab ? "Analyzing..." : "Analyze & Estimate"}
                            </button>
                          </div>
                          
                          {/* Display loading steps if estimating */}
                          {aiEstimatingCollab && (
                            <div style={{marginTop:10, fontSize:11, color:"var(--text-muted)", fontStyle:"italic", display:"flex", alignItems:"center", gap:6}}>
                              <span>⏳</span> {estimationStep}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Pitch drafting helper templates */}
                      <div style={{marginBottom:16,borderTop:"1px solid var(--border-color)",paddingTop:14}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10,flexWrap:"wrap",gap:8}}>
                          <div style={{display:"flex", alignItems:"center", gap:8}}>
                            <span style={S.label}>Pitch & Outreach Writer</span>
                            <input value={pitchUrl} onChange={e=>setPitchUrl(e.target.value)} placeholder="Paste brand IG/TikTok URL..." style={{...S.input, fontSize:11, padding:"3px 8px", width:180, border:"1px solid var(--border-focus)"}}/>
                            <button onClick={generatePitchAI} disabled={aiGeneratingPitch || !pitchUrl} style={{...S.ghost, color:"var(--accent-color)", fontSize:11, padding:"2px 8px", border:"1px solid var(--accent-light)", borderRadius:12, opacity: pitchUrl ? 1 : 0.5}}>
                              {aiGeneratingPitch ? "✨ Analyzing brand..." : "✨ Smart Pitch"}
                            </button>
                          </div>
                          <div style={S.row}>
                            {c.pitchDraft && (
                              <button onClick={()=>setActivePitchTemplate("aiDraft")} style={{
                                padding:"3px 8px",borderRadius:20,fontSize:11,border:`1px solid ${activePitchTemplate==="aiDraft"?"var(--border-focus)":"var(--border-color)"}`,
                                background:activePitchTemplate==="aiDraft"?"var(--accent-light)":"transparent",color:activePitchTemplate==="aiDraft"?"var(--text-primary)":"var(--text-muted)",cursor:"pointer"
                              }}>✨ AI Pitch</button>
                            )}
                            {Object.entries(COLLAB_TEMPLATES).map(([key,t])=>(
                              <button key={key} onClick={()=>setActivePitchTemplate(key)} style={{
                                padding:"3px 8px",borderRadius:20,fontSize:11,border:`1px solid ${activePitchTemplate===key?"var(--border-focus)":"var(--border-color)"}`,
                                background:activePitchTemplate===key?"var(--accent-light)":"transparent",color:activePitchTemplate===key?"var(--text-primary)":"var(--text-muted)",cursor:"pointer"
                              }}>{t.label}</button>
                            ))}
                          </div>
                        </div>
                        
                        <div style={{background:"var(--bg-primary)",border:"1px solid var(--border-color)",borderRadius:10,padding:12,position:"relative"}}>
                          <div style={{fontSize:11,color:"var(--text-muted)",borderBottom:"1px solid var(--border-color)",paddingBottom:4,marginBottom:6,fontStyle:"italic"}}>
                            Subject: {activePitchTemplate === "aiDraft" 
                              ? `Collaboration Proposal: Me x ${c.brand}` 
                              : COLLAB_TEMPLATES[activePitchTemplate] 
                                ? COLLAB_TEMPLATES[activePitchTemplate].subject.replace("[Brand Name]", c.brand).replace("[Your Name]", "Me")
                                : "N/A"}
                          </div>
                          <pre style={{fontSize:12,fontFamily:"inherit",whiteSpace:"pre-wrap",color:"var(--text-secondary)",lineHeight:1.6}}>
                            {activePitchTemplate === "aiDraft"
                              ? c.pitchDraft
                              : COLLAB_TEMPLATES[activePitchTemplate]
                                ? COLLAB_TEMPLATES[activePitchTemplate].body
                                    .replace("[Contact Name]", c.contactName || "Team")
                                    .replace("[Brand Name]", c.brand)
                                    .replace("[Rate]", c.negotiatedAmount || c.quote || "500")
                                    .replace("[Your Name]", "Me")
                                : "No template selected"
                            }
                          </pre>
                        </div>
                      </div>

                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:14}} className="no-print">
                        <div style={S.row}>
                          <button style={S.btn(showInvoice?"var(--text-primary)":"var(--accent-color)",true)} onClick={()=>setShowInvoice(!showInvoice)}>
                            {showInvoice ? "📄 Hide Invoice" : "📄 View Invoice"}
                          </button>
                          {showInvoice && (
                            <button style={S.btn("var(--text-primary)",true)} onClick={()=>window.print()}>
                              Print / Export PDF Invoice
                            </button>
                          )}
                        </div>
                        <div style={S.row}>
                          <button style={S.btn("var(--text-muted)",true)} onClick={async ()=>{
                            try {
                              const updated = await apiUpdateCollab(c.id, { status: "ghosted 😭" });
                              setCollabs(prev=>prev.map(x=>x.id===c.id ? updated : x));
                              showToast("Marked as ghosted.");
                            } catch (err) {
                              console.error("Failed to update collab status:", err);
                              showToast("Failed to update status.", "error");
                            }
                          }}>Nudge (Mark Ghosted 😭)</button>
                          <button style={S.btn("#f0a090",true)} onClick={async ()=>{
                            if (!confirm("Delete this collab reference?")) return;
                            try {
                              await apiDeleteCollab(c.id);
                              const remaining = collabs.filter(x=>x.id!==c.id);
                              const nextId = remaining[0]?.id || null;
                              setCollabs(prev=>prev.filter(x=>x.id!==c.id));
                              setSelectedCollabId(nextId);
                              showToast("Collab reference deleted.");
                            } catch (err) {
                              console.error("Failed to delete collab:", err);
                              showToast("Failed to delete collab.", "error");
                            }
                          }}>Delete reference</button>
                        </div>
                      </div>

                      {showInvoice && (
                        <div className="printable-invoice" style={{
                          marginTop: 20,
                          padding: "30px 40px",
                          background: "var(--bg-secondary)",
                          border: "1px solid var(--border-color)",
                          borderRadius: 16,
                          fontFamily: "var(--font-sans)",
                          boxShadow: "var(--shadow-md)"
                        }}>
                          {/* Invoice Top Branding */}
                          <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start", borderBottom:"2px solid var(--text-primary)", paddingBottom:15, marginBottom:20}}>
                            <div>
                              <h2 style={{fontFamily:"var(--font-serif)", fontSize:24, margin:0, color:"var(--text-primary)"}}>SECOND BRAIN STUDIO</h2>
                              <span style={{fontSize:11, color:"var(--text-muted)"}}>Creative Content & Storytelling</span>
                            </div>
                            <div style={{textAlign:"right"}}>
                              <h1 style={{fontFamily:"var(--font-serif)", fontSize:28, margin:0, color:"var(--text-primary)", letterSpacing:1}}>INVOICE</h1>
                              <span style={{fontSize:12, fontWeight:600, color:"var(--text-secondary)"}}>#INV-2026-{c.id}</span>
                            </div>
                          </div>

                          {/* Invoice Meta Grid */}
                          <div className="form-grid-2" style={{gap:20, marginBottom:25, fontSize:13}}>
                            <div>
                              <span style={{fontSize:10, textTransform:"uppercase", color:"var(--text-muted)", display:"block", marginBottom:4, fontWeight:600}}>Billed From</span>
                              <strong>Aesthetic Creator Studio</strong><br />
                              creator@secondbrain.co<br />
                              New Delhi, India
                            </div>
                            <div>
                              <span style={{fontSize:10, textTransform:"uppercase", color:"var(--text-muted)", display:"block", marginBottom:4, fontWeight:600}}>Billed To</span>
                              <strong>{c.brand}</strong><br />
                              {c.contactName && <>{c.contactName}<br /></>}
                              {c.email && <>{c.email}<br /></>}
                              Platform: {c.platform}
                            </div>
                          </div>

                          <div className="form-grid-2" style={{gap:20, marginBottom:30, fontSize:12, background:"var(--bg-primary)", padding:12, borderRadius:10, border:"1px solid var(--border-color)"}}>
                            <div>
                              <strong>Date of Issue:</strong> {todayStr}
                            </div>
                            <div>
                              <strong>Payment Due:</strong> {c.dueDate ? friendlyDate(c.dueDate) : "Upon Receipt"}
                            </div>
                          </div>

                          {/* Line Items Table */}
                          <table style={{width:"100%", borderCollapse:"collapse", fontSize:13, marginBottom:25}}>
                            <thead>
                              <tr style={{borderBottom:"2px solid var(--text-primary)", textAlign:"left"}}>
                                <th style={{padding:"8px 0", fontWeight:600}}>Deliverable Description</th>
                                <th style={{padding:"8px 0", fontWeight:600, textAlign:"center"}}>Qty</th>
                                <th style={{padding:"8px 0", fontWeight:600, textAlign:"right"}}>Rate</th>
                                <th style={{padding:"8px 0", fontWeight:600, textAlign:"right"}}>Total</th>
                              </tr>
                            </thead>
                            <tbody>
                              {cRates.itemsBreakdown.map((item, idx) => (
                                <tr key={idx} style={{borderBottom:"1px solid var(--border-color)"}}>
                                  <td style={{padding:"12px 0"}}>
                                    <div>{item.name}</div>
                                    {item.discount > 0 && <span style={{fontSize:10, color:"#a8c8a0", fontStyle:"italic"}}>Reels pair discount applied</span>}
                                  </td>
                                  <td style={{padding:"12px 0", textAlign:"center"}}>{item.qty}</td>
                                  <td style={{padding:"12px 0", textAlign:"right"}}>₹{item.rate}</td>
                                  <td style={{padding:"12px 0", textAlign:"right"}}>
                                    {item.discount > 0 ? (
                                      <div>
                                        <span style={{textDecoration:"line-through", color:"var(--text-muted)", fontSize:11, marginRight:6}}>₹{item.qty * item.rate}</span>
                                        <span>₹{item.total}</span>
                                      </div>
                                    ) : (
                                      <span>₹{item.total}</span>
                                    )}
                                  </td>
                                </tr>
                              ))}

                              {/* Custom manual adjustments to match c.negotiatedAmount */}
                              {c.negotiatedAmount !== undefined && c.negotiatedAmount !== null && c.negotiatedAmount !== "" && Number(c.negotiatedAmount) !== cRates.total && (
                                <tr style={{borderBottom:"1px solid var(--border-color)", fontStyle:"italic", color:"var(--text-secondary)"}}>
                                  <td style={{padding:"12px 0"}} colSpan={3}>
                                    Negotiated Client Adjustment
                                  </td>
                                  <td style={{padding:"12px 0", textAlign:"right"}}>
                                    {Number(c.negotiatedAmount) > cRates.total ? "+" : "-"}₹{Math.abs(Number(c.negotiatedAmount) - cRates.total)}
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>

                          {/* Totals Section */}
                          <div style={{display:"flex", justifyContent:"flex-end", fontSize:13, marginBottom:20}}>
                            <div style={{width:240, display:"flex", flexDirection:"column", gap:6}}>
                              <div style={{display:"flex", justifyContent:"space-between"}}>
                                <span>Subtotal</span>
                                <span>₹{cRates.subtotal}</span>
                              </div>
                              {cRates.discount > 0 && (
                                <div style={{display:"flex", justifyContent:"space-between", color:"#a8c8a0"}}>
                                  <span>Reels Discount</span>
                                  <span>-₹{cRates.discount}</span>
                                </div>
                              )}
                              {c.negotiatedAmount !== undefined && c.negotiatedAmount !== null && c.negotiatedAmount !== "" && Number(c.negotiatedAmount) !== cRates.total && (
                                <div style={{display:"flex", justifyContent:"space-between", color:"var(--text-secondary)", fontStyle:"italic"}}>
                                  <span>Brand Adjustment</span>
                                  <span>
                                    {Number(c.negotiatedAmount) > cRates.total ? "+" : "-"}₹{Math.abs(Number(c.negotiatedAmount) - cRates.total)}
                                  </span>
                                </div>
                              )}
                              <div style={{display:"flex", justifyContent:"space-between", borderTop:"2px solid var(--text-primary)", paddingTop:8, marginTop:4, fontSize:16, fontWeight:700, color:"var(--text-primary)"}}>
                                <span>Total Due</span>
                                <span>₹{c.negotiatedAmount !== undefined && c.negotiatedAmount !== "" ? c.negotiatedAmount : cRates.total}</span>
                              </div>
                            </div>
                          </div>

                          {/* Footer terms */}
                          <div style={{borderTop:"1px solid var(--border-color)", paddingTop:15, marginTop:30, fontSize:11, color:"var(--text-muted)", textAlign:"center", lineHeight:1.5}}>
                            <p style={{fontWeight:600, color:"var(--text-secondary)", marginBottom:4}}>Payment Terms & Instructions</p>
                            <p>Please send payments via Bank Transfer or UPI details shared separately.</p>
                            <p style={{marginTop:8, fontStyle:"italic"}}>Thank you for working with independent creators. Let's make something beautiful.</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                <div style={{textAlign:"center",padding:"80px 20px",color:"var(--text-muted)",background:"var(--bg-secondary)",borderRadius:16,border:"1px solid var(--border-color)"}}>
                  <div style={{fontSize:32,opacity:0.2,marginBottom:12}}>🤝</div>
                  <p style={{fontStyle:"italic",fontSize:15,marginBottom:4}}>creative work deserves organization too</p>
                  <p style={{fontSize:12,maxWidth:320,margin:"0 auto"}}>Keep relationships calm and rates documented. Soft systems still count as systems.</p>
                </div>
              );

  return(
    <div className="main-app-content" data-test-id="workspace-dashboard" data-testid="workspace-dashboard" style={{background:"var(--bg-primary)",minHeight:"100vh",color:"var(--text-primary)",transition:"all 0.3s"}}>
      <style>{`
        button:hover { opacity: 0.78; }
        select { appearance: none; -webkit-appearance: none; }
        .sparkline {
          stroke-dasharray: 1000;
          stroke-dashoffset: 1000;
          animation: drawSparkline 1.5s ease-out forwards;
        }
        @keyframes drawSparkline {
          to { stroke-dashoffset: 0; }
        }
      `}</style>

      {/* HEADER */}
      <div style={{padding:"22px 28px 0",borderBottom:"1px solid var(--border-color)"}}>
        <div className="header-row">
          <div>
            <h1 style={{fontSize:22,fontWeight:400,letterSpacing:-0.5,color:"var(--text-primary)",margin:0}}>second brain ✦</h1>
            <p style={{fontSize:12,color:"var(--text-secondary)",marginTop:3,fontStyle:"italic",margin:"3px 0 0"}}>for creators rebuilding in real time</p>
          </div>
          
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            {user && (
              <>
                <span style={{
                  fontSize: 11,
                  color: (user.credits || 0) > 0 ? "var(--text-primary)" : "#f0a090",
                  background: (user.credits || 0) > 0 ? "rgba(168, 200, 160, 0.15)" : "rgba(240, 160, 144, 0.15)",
                  border: `1px solid ${(user.credits || 0) > 0 ? "var(--accent-light)" : "#f0a090"}`,
                  padding: "4px 10px",
                  borderRadius: "12px",
                  fontWeight: 600,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px"
                }}>
                  ⚡ Credits: {user.credits || 0} / 5
                </span>
                <span style={{
                  fontSize: 11,
                  color: "var(--text-secondary)",
                  background: "var(--border-color)",
                  padding: "4px 10px",
                  borderRadius: "12px",
                  fontWeight: 500
                }}>
                  ✨ {user.creatorName}
                </span>
              </>
            )}
            {/* Theme Toggle */}
            <button onClick={()=>setTheme(theme==="light"?"dark":"light")} style={{
              background:"none",border:"1px solid var(--border-color)",borderRadius:30,padding:"6px 12px",
              cursor:"pointer",fontSize:11,color:"var(--text-secondary)"
            }}>
              {theme==="light"?"🎬 pro edit bay":"☀️ creator studio"}
            </button>
            {user && (
              <button onClick={logout} style={{
                background:"none",border:"1px solid #f0a090",borderRadius:30,padding:"6px 12px",
                cursor:"pointer",fontSize:11,color:"#f0a090",fontWeight: 500
              }}>
                Logout
              </button>
            )}
            <p style={{fontSize:12,color:"var(--accent-color)",fontStyle:"italic",textAlign:"right",letterSpacing:0.3,maxWidth:220,lineHeight:1.4}}>{quote}</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="tab-navigation-bar">
          {TABS.map(([id,label])=>(
            <button key={id} data-test-id={`tab-${id}`} onClick={()=>setTab(id)} style={{
              padding:"10px 18px",fontSize:13,cursor:"pointer",border:"none",fontFamily:"inherit",
              borderBottom:tab===id?"2px solid var(--border-focus)":"2px solid transparent",
              background:"transparent",color:tab===id?"var(--text-primary)":"var(--text-muted)",
              transition:"all 0.18s",fontWeight:tab===id?500:400,whiteSpace:"nowrap",
            }}>{label}</button>
          ))}
        </div>
      </div>

      <div style={{padding:"24px 28px"}}>
        {user && !profileStatus.complete && skipWizard && (
          <div data-test-id="creator-dna-banner" style={{
            background: "rgba(241, 62, 147, 0.08)",
            border: "1px solid var(--accent-color)",
            borderRadius: 12,
            padding: "12px 18px",
            marginBottom: 20,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12
          }}>
            <span style={{ fontSize: 13, color: "var(--text-primary)" }}>
              💡 <strong>Personalize your OS:</strong> Complete your Creator DNA profile to unlock personalized recommendations.
            </span>
            <button 
              onClick={() => {
                localStorage.removeItem("sb-skip-onboarding");
                setSkipWizard(false);
                setShowWizard(true);
              }} 
              style={{
                background: "var(--accent-color)",
                color: "#fff",
                border: "none",
                borderRadius: 20,
                padding: "6px 16px",
                fontSize: 12,
                cursor: "pointer",
                fontWeight: 500,
                minHeight: 32
              }}
            >
              Complete Profile
            </button>
          </div>
        )}

        {/* 1. CONTENT PLANNER */}
        {tab==="planner"&&(
          <div className="card-in pane-planner">
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
              <div style={{display:"flex",alignItems:"center",gap:16}}>
                <span style={S.label}>Content Planner</span>
                <div style={{display:"flex",gap:4,background:"var(--bg-primary)",padding:4,borderRadius:8,border:"1px solid var(--border-color)"}}>
                  <button onClick={()=>setPlannerView("calendar")} style={{...S.ghost,padding:"4px 12px",borderRadius:6,background:plannerView==="calendar"?"var(--bg-secondary)":"transparent",color:plannerView==="calendar"?"var(--text-primary)":"var(--text-muted)"}}>Calendar</button>
                  <button onClick={()=>setPlannerView("list")} style={{...S.ghost,padding:"4px 12px",borderRadius:6,background:plannerView==="list"?"var(--bg-secondary)":"transparent",color:plannerView==="list"?"var(--text-primary)":"var(--text-muted)"}}>List</button>
                  <button onClick={()=>setPlannerView("history")} style={{...S.ghost,padding:"4px 12px",borderRadius:6,background:plannerView==="history"?"var(--bg-secondary)":"transparent",color:plannerView==="history"?"var(--text-primary)":"var(--text-muted)"}}>Publishing History</button>
                </div>
              </div>
              <button style={S.btn("var(--accent-color)")} onClick={async ()=>{const np=await createNewPost({title:"untitled post",type:"REEL",status:"DRAFT",mood:"soft"});setSelectedPost(np);}}>+ new post</button>
            </div>

            {plannerView === "calendar" && (
              <>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    <NavBtn onClick={()=>navigateCal("prev")}>‹</NavBtn>
                    <span style={{fontSize:16,fontWeight:500,color:"var(--text-secondary)",minWidth:164,textAlign:"center"}}>{MONTHS[calMonth]} {calYear}</span>
                    <NavBtn onClick={()=>navigateCal("next")}>›</NavBtn>
                    {!todayInView&&<NavBtn onClick={()=>navigateCal("today")} active color="var(--accent-color)">today</NavBtn>}
                  </div>
                </div>

                <div className={calFade?"cal-grid cal-fade":"cal-grid cal-show"} style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4,marginBottom:22}}>
                  {DAYS.map(d=><div key={d} style={{fontSize:11,color:"var(--text-muted)",textAlign:"center",paddingBottom:6,letterSpacing:0.3}}>{d}</div>)}
                  {cells.map((d,i)=>{
                    const ds=d?toDateStr(new Date(calYear,calMonth,d)):null;
                    const tod=ds&&isToday(ds);
                    const dp=postsOnDay(d);
                    return(
                    <div key={i} style={{minHeight:66,borderRadius:12,padding:"5px 6px",background:d?(tod?"var(--accent-light)":"var(--bg-secondary)"):"transparent",border:d?(tod?"1.5px solid var(--border-focus)":"1px solid var(--border-color)"):"none"}}>
                      {d&&<><div style={{fontSize:11,color:tod?"var(--accent-color)":"var(--text-muted)",fontWeight:tod?600:400,marginBottom:3}}>{d}</div>
                      {dp.map(p=><div key={p.id} onClick={()=>setSelectedPost(p)} style={{fontSize:10,padding:"2px 5px",borderRadius:6,marginBottom:2,cursor:"pointer",background:MOOD_COLORS[p.mood]+"22",color:MOOD_COLORS[p.mood],overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>
                        {TYPE_ICONS[p.type] || "•"} {p.title}
                        {p.publishAt && <span style={{display:"block",fontSize:9,color:"var(--accent-color)",marginTop:2}}>{new Date(p.publishAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>}
                      </div>)}</>}
                    </div>
                  );})}
                </div>
              </>
            )}


            {plannerView === "history" && (
              <div style={{display:"flex",flexDirection:"column",gap:24}}>
                <div style={{display:"flex", gap:12, borderBottom:"1px solid var(--border-color)", paddingBottom:8}}>
                  {["Scheduled", "Published", "Failed"].map(ht => (
                    <button key={ht} onClick={() => setHistoryTab(ht)} style={{
                      ...S.ghost,
                      padding: "6px 16px",
                      borderRadius: 20,
                      background: historyTab === ht ? "var(--bg-secondary)" : "transparent",
                      color: historyTab === ht ? "var(--text-primary)" : "var(--text-muted)",
                      border: historyTab === ht ? "1px solid var(--border-focus)" : "1px solid transparent"
                    }}>
                      {ht}
                    </button>
                  ))}
                </div>

                <div>
                  {pubHistory.filter(j => 
                    historyTab === "Scheduled" ? ["PENDING", "PROCESSING"].includes(j.status) :
                    historyTab === "Published" ? j.status === "COMPLETED" :
                    j.status === "FAILED"
                  ).length === 0 && (
                    <div style={{fontSize:12,color:"var(--text-muted)", padding:"20px 0"}}>
                      No {historyTab.toLowerCase()} jobs found.
                    </div>
                  )}

                  {pubHistory.filter(j => 
                    historyTab === "Scheduled" ? ["PENDING", "PROCESSING"].includes(j.status) :
                    historyTab === "Published" ? j.status === "COMPLETED" :
                    j.status === "FAILED"
                  ).map(j => (
                    <div key={j.id} style={{...S.card,marginBottom:10,padding:"14px 18px",display:"flex",alignItems:"center",gap:16}}>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:14,color:"var(--text-primary)",fontWeight:600}}>{j.post?.title || "Unknown Post"}</div>
                        <div style={{fontSize:12,color:"var(--text-muted)",marginTop:4}}>
                          Publish At: {new Date(j.publishAt).toLocaleString()}
                        </div>
                        {j.lastError && (
                          <div style={{fontSize:11,color:"#f0a090",marginTop:4, background:"rgba(240, 160, 144, 0.1)", padding:"4px 8px", borderRadius:4}}>
                            Error: {j.lastError} (Attempts: {j.attempts})
                          </div>
                        )}
                        {j.instagramMediaId && (
                          <div style={{fontSize:11,color:"#a8c8a0",marginTop:4}}>
                            Media ID: {j.instagramMediaId}
                          </div>
                        )}
                      </div>
                      
                      <div style={{display:"flex", flexDirection:"column", alignItems:"flex-end", gap:8}}>
                        <Tag label={j.status} color={
                          j.status === "COMPLETED" ? "#a8c8a0" :
                          j.status === "FAILED" ? "#f0a090" :
                          "#e2c792"
                        } />
                        
                        {j.status === "FAILED" && (
                          <button 
                            onClick={async () => {
                              try {
                                await apiRetryPublishingJob(j.id);
                                showToast("Job retry queued successfully!");
                                const hist = await apiGetPublishingHistory();
                                setPubHistory(hist);
                              } catch(err) {
                                showToast("Failed to retry job", "error");
                              }
                            }}
                            style={{...S.ghost, fontSize:11, color:"var(--accent-color)", padding:"4px 12px", border:"1px solid var(--accent-light)", borderRadius:12}}
                          >
                            Retry Publish
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {plannerView === "list" && (
              <div style={{display:"flex",flexDirection:"column",gap:24}}>
                <div>
                  <h4 style={{fontSize:14,color:"var(--accent-color)",borderBottom:"1px solid var(--border-color)",paddingBottom:8,marginBottom:12}}>Publishing Pipeline</h4>
                  {posts.filter(p => ["SCHEDULED", "PUBLISHING", "PUBLISHED"].includes(p.status)).length === 0 && <div style={{fontSize:12,color:"var(--text-muted)"}}>No posts in pipeline.</div>}
                  {posts.filter(p => ["SCHEDULED", "PUBLISHING", "PUBLISHED"].includes(p.status)).sort((a,b)=>new Date(b.publishAt||b.date||0).getTime() - new Date(a.publishAt||a.date||0).getTime()).map(p => (
                    <div key={p.id} onClick={()=>setSelectedPost(p)} style={{...S.card,marginBottom:6,cursor:"pointer",padding:"10px 14px",display:"flex",alignItems:"center",gap:10}}>
                      <span style={{fontSize:15,color:MOOD_COLORS[p.mood]}}>{TYPE_ICONS[p.type]}</span>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:13,color:"var(--text-primary)",fontWeight:600}}>{p.title}</div>
                        <div style={{fontSize:11,color:"var(--text-muted)",marginTop:2}}>
                          {p.status === "PUBLISHED" ? "Published on" : "Scheduled for"}: {p.publishAt ? new Date(p.publishAt).toLocaleString() : "TBD"}
                        </div>
                      </div>
                      <Tag label={p.status} color={STATUS_COLORS[p.status] || "var(--accent-color)"}/>
                      <Tag label={p.type} color="#ccc" />
                    </div>
                  ))}
                </div>
                
                <div>
                  <h4 style={{fontSize:14,color:"orange",borderBottom:"1px solid var(--border-color)",paddingBottom:8,marginBottom:12}}>Production</h4>
                  {posts.filter(p => ["REVIEW", "APPROVED"].includes(p.status)).length === 0 && <div style={{fontSize:12,color:"var(--text-muted)"}}>No posts in production.</div>}
                  {posts.filter(p => ["REVIEW", "APPROVED"].includes(p.status)).sort((a,b)=>(a.date||"").localeCompare(b.date||"")).map(p => (
                    <div key={p.id} onClick={()=>setSelectedPost(p)} style={{...S.card,marginBottom:6,cursor:"pointer",padding:"10px 14px",display:"flex",alignItems:"center",gap:10}}>
                      <span style={{fontSize:15,color:MOOD_COLORS[p.mood]}}>{TYPE_ICONS[p.type]}</span>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:13,color:"var(--text-primary)"}}>{p.title}</div>
                        <div style={{fontSize:11,color:"var(--text-muted)",marginTop:2}}>
                          {isToday(p.date)?"today ✧":friendlyDate(p.date)} · {p.mood}
                        </div>
                      </div>
                      <Tag label={p.status} color={STATUS_COLORS[p.status]}/>
                      <Tag label={p.type} color="#ccc" />
                    </div>
                  ))}
                </div>

                <div>
                  <h4 style={{fontSize:14,color:"var(--text-secondary)",borderBottom:"1px solid var(--border-color)",paddingBottom:8,marginBottom:12}}>Ideation</h4>
                  {posts.filter(p => ["DRAFT"].includes(p.status)).length === 0 && <div style={{fontSize:12,color:"var(--text-muted)"}}>No draft posts.</div>}
                  {posts.filter(p => ["DRAFT"].includes(p.status)).sort((a,b)=>(a.date||"").localeCompare(b.date||"")).map(p => (
                    <div key={p.id} onClick={()=>setSelectedPost(p)} style={{...S.card,marginBottom:6,cursor:"pointer",padding:"10px 14px",display:"flex",alignItems:"center",gap:10}}>
                      <span style={{fontSize:15,color:MOOD_COLORS[p.mood]}}>{TYPE_ICONS[p.type]}</span>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:13,color:"var(--text-primary)"}}>{p.title}</div>
                        <div style={{fontSize:11,color:"var(--text-muted)",marginTop:2}}>
                          {isToday(p.date)?"today ✧":friendlyDate(p.date)} · {p.mood}
                        </div>
                      </div>
                      <Tag label={p.status} color={STATUS_COLORS[p.status]}/>
                      <Tag label={p.type} color="#ccc" />
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Kept "all posts" at bottom for completeness (optional) */}
            <div style={{marginTop:32}}><span style={{...S.label,marginBottom:10}}>all posts history</span>
              {["PUBLISHED", "FAILED", "ARCHIVED"].map(status=>{
                const group=posts.filter(p=>p.status===status).sort((a,b)=>(a.date||"").localeCompare(b.date||""));
                if(!group.length)return null;
                return(<div key={status} style={{marginBottom:18}}>
                  <div style={{fontSize:11,color:STATUS_COLORS[status],marginBottom:7,letterSpacing:0.5}}>{status==="PUBLISHED"?"released into the universe":status}</div>
                  {group.map(p=><div key={p.id} onClick={()=>setSelectedPost(p)} style={{...S.card,marginBottom:6,cursor:"pointer",padding:"10px 14px",display:"flex",alignItems:"center",gap:10,opacity:status==="ARCHIVED"?0.5:1}}>
                    <span style={{fontSize:15,color:MOOD_COLORS[p.mood]}}>{TYPE_ICONS[p.type]}</span>
                    <div style={{flex:1,minWidth:0}}><div style={{fontSize:13,color:"var(--text-primary)",overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>{p.title}</div><div style={{fontSize:11,color:"var(--text-muted)",marginTop:2}}>{isToday(p.date)?"today ✧":friendlyDate(p.date)} · {p.mood}{p.shootId?" · 🎬":""}</div></div>
                    <Tag label={status==="PUBLISHED"?"released":status} color={STATUS_COLORS[status]}/>
                  </div>)}
                </div>);
              })}
            </div>
          </div>
        )}

        {/* 2. BRAIN DUMP */}
        {tab==="dump"&&(
          <div className="card-in pane-dump">
            <div>
              <span style={{...S.label,marginBottom:8}}>your dumps</span>
              {dumps.filter(d=>!d.archived).map(d=>(
                <div key={d.id} onClick={()=>selectDump(d.id)} style={{padding:"10px 12px",borderRadius:12,cursor:"pointer",marginBottom:5,background:activeDumpId===d.id?"var(--bg-secondary)":"transparent",border:activeDumpId===d.id?`1px solid ${MOOD_COLORS[d.mood]||"var(--border-color)"}`:"1px solid transparent",transition:"all 0.18s"}}>
                  <div style={{fontSize:13,color:"var(--text-primary)",fontWeight:activeDumpId===d.id?500:400,overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>{d.title||"untitled"}</div>
                  <div style={{fontSize:11,color:"var(--text-muted)",marginTop:2}}>{d.mood} · {d.ts}</div>
                </div>
              ))}
              <div style={{marginTop:8}}>
                {editingDump?(
                  <div style={S.row}>
                    <input value={newDumpTitle} onChange={e=>setNewDumpTitle(e.target.value)} placeholder="title..." style={{...S.input,fontSize:12,padding:"6px 10px",flex:1}} autoFocus
                      onKeyDown={async e=>{if(e.key==="Enter"&&newDumpTitle.trim()){await createNewDump(newDumpTitle.trim());setNewDumpTitle("");setEditingDump(false);}if(e.key==="Escape")setEditingDump(false);}}/>
                    <button onClick={()=>setEditingDump(false)} style={{...S.ghost,color:"var(--text-muted)",fontSize:16}}>×</button>
                  </div>
                ):(
                  <button onClick={()=>setEditingDump(true)} style={{...S.btn("var(--accent-color)",true),width:"100%"}}>+ new dump</button>
                )}
              </div>
              
              {dumps.some(d=>d.archived)&&<div style={{marginTop:18}}><span style={{...S.label,marginBottom:6}}>archived</span>
                {dumps.filter(d=>d.archived).map(d=><div key={d.id} style={{padding:"7px 10px",borderRadius:10,fontSize:12,cursor:"pointer",marginBottom:4,background:"transparent",color:"var(--text-muted)"}} onClick={()=>selectDump(d.id)}>{d.title}</div>)}
              </div>}
            </div>

            {/* Editor Workspace */}
            <div>
              {activeDump ? (
                <div style={S.card} className="card-in">
                  <div style={{marginBottom:14}}>
                    <div style={{display:"flex", alignItems:"center", gap:8}}>
                      <input
                        value={localDump ? localDump.title : (activeDump.title || "")}
                        onChange={e => { setLocalDump(prev => prev ? {...prev, title: e.target.value} : prev); setDumpIsDirty(true); }}
                        style={{...S.input,fontSize:18,fontWeight:400,border:"none",background:"transparent",padding:0,flex:1}}
                        placeholder="Title your dump..."
                      />
                      <button onClick={()=>generateTagsAI(activeDump.id)} disabled={aiGeneratingTags} style={{...S.ghost, color:"var(--accent-color)", fontSize:11, padding:"2px 8px", border:"1px solid var(--accent-light)", borderRadius:12}}>
                        {aiGeneratingTags ? "✨ Tagging..." : "✨ Auto-tag"}
                      </button>
                      <button onClick={()=>rewriteDumpAI(activeDump.id)} disabled={aiRewritingDump} style={{...S.ghost, color:"var(--accent-color)", fontSize:11, padding:"2px 8px", border:"1px solid var(--accent-light)", borderRadius:12}}>
                        {aiRewritingDump ? "✨ Rewriting..." : "✨ AI Rewrite"}
                      </button>
                    </div>
                    <div style={{fontSize:11,color:"var(--text-muted)",marginTop:2}}>Last modified {activeDump.ts}</div>
                  </div>
                  
                  {aiRewritingDump ? (
                    <div style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      minHeight: 280,
                      background: "var(--bg-secondary)",
                      borderRadius: 16,
                      border: "1px dashed var(--accent-color)",
                      position: "relative",
                      overflow: "hidden",
                      padding: 20
                    }}>
                      <style>{`
                        @keyframes pulse-glowing {
                          0%, 100% { opacity: 0.3; transform: scale(0.95); }
                          50% { opacity: 0.8; transform: scale(1.05); }
                        }
                        @keyframes bounce-cinematic {
                          0%, 100% { transform: translateY(0); }
                          50% { transform: translateY(-6px); }
                        }
                      `}</style>
                      <div style={{
                        position: "absolute",
                        top: "-50%",
                        left: "-50%",
                        width: "200%",
                        height: "200%",
                        background: "radial-gradient(circle, rgba(216, 99, 68, 0.1) 0%, transparent 60%)",
                        animation: "pulse-glowing 3s infinite ease-in-out",
                        pointerEvents: "none"
                      }} />
                      <div style={{ fontSize: 32, marginBottom: 16, animation: "bounce-cinematic 2s infinite ease-in-out" }}>✨</div>
                      <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)", marginBottom: 8, letterSpacing: "0.03em" }}>
                        AI Rewrite In Progress...
                      </div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)", maxWidth: 320, textAlign: "center", lineHeight: 1.6 }}>
                        Analyzing raw concept, structuring storyboard, generating viral hooks, captions and b-roll ideas.
                      </div>
                    </div>
                  ) : (() => {
                    const parsed = tryParseJSON(activeDump.text);
                    if (parsed) {
                      return (
                        <div style={{ display: "flex", flexDirection: "column", gap: 20, marginBottom: 14 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 10, borderBottom: "1px solid var(--border-color)" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <span style={{
                                background: "linear-gradient(135deg, var(--accent-color) 0%, var(--accent-dark) 100%)",
                                color: "#FFFFFF",
                                fontSize: 10,
                                fontWeight: 700,
                                padding: "3px 8px",
                                borderRadius: 8,
                                letterSpacing: "0.05em",
                                textTransform: "uppercase"
                              }}>
                                {parsed.mode ? `AI: ${parsed.mode}` : "AI: MOCK"}
                              </span>
                              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Structured Creator Outline</span>
                            </div>
                            <button 
                              onClick={() => updateDump(activeDump.id, { text: parsed.rewrittenText || "" })} 
                              style={{ ...S.ghost, color: "#f0a090", fontSize: 11, border: "1px solid rgba(240, 160, 144, 0.4)", borderRadius: 8, padding: "3px 10px", cursor: "pointer" }}
                            >
                              Reset to Raw Text
                            </button>
                          </div>

                          {parsed.rewrittenText && (
                            <div>
                              <span style={{ ...S.label, display: "block", marginBottom: 6 }}>Polished Script / Outline</span>
                              <div style={{
                                background: "var(--bg-secondary)",
                                border: "1px solid var(--border-color)",
                                borderRadius: 12,
                                padding: 16,
                                fontFamily: "var(--font-serif)",
                                fontSize: 15,
                                lineHeight: 1.7,
                                color: "var(--text-primary)",
                                whiteSpace: "pre-line"
                              }}>
                                {parsed.rewrittenText}
                              </div>
                            </div>
                          )}

                          {parsed.hooks && parsed.hooks.length > 0 && (
                            <div>
                              <span style={{ ...S.label, display: "block", marginBottom: 6 }}>Viral Hooks</span>
                              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                {parsed.hooks.map((hook, idx) => (
                                  <div key={idx} style={{
                                    background: "var(--bg-secondary)",
                                    border: "1px solid var(--border-color)",
                                    borderRadius: 12,
                                    padding: "12px 16px",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    gap: 12
                                  }}>
                                    <span style={{ fontSize: 13, color: "var(--text-primary)", fontFamily: "var(--font-serif)", fontStyle: "italic", lineHeight: 1.4 }}>
                                      {hook}
                                    </span>
                                    <button 
                                      onClick={() => {
                                        navigator.clipboard.writeText(hook);
                                        alert("Hook copied!");
                                      }} 
                                      style={{ ...S.ghost, color: "var(--accent-color)", fontSize: 11, padding: "2px 6px", border: "1px solid var(--border-color)", borderRadius: 6, flexShrink: 0 }}
                                    >
                                      Copy
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {parsed.captions && parsed.captions.length > 0 && (
                            <div>
                              <span style={{ ...S.label, display: "block", marginBottom: 6 }}>Caption Templates</span>
                              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                {parsed.captions.map((caption, idx) => (
                                  <div key={idx} style={{
                                    background: "var(--bg-secondary)",
                                    border: "1px solid var(--border-color)",
                                    borderRadius: 12,
                                    padding: 14,
                                    position: "relative"
                                  }}>
                                    <p style={{ fontSize: 13, lineHeight: 1.5, color: "var(--text-primary)", margin: 0, paddingRight: 40 }}>
                                      {caption}
                                    </p>
                                    <button 
                                      onClick={() => {
                                        navigator.clipboard.writeText(caption);
                                        alert("Caption copied!");
                                      }} 
                                      style={{
                                        position: "absolute",
                                        right: 12,
                                        top: 12,
                                        ...S.ghost,
                                        color: "var(--accent-color)",
                                        fontSize: 11,
                                        padding: "2px 6px",
                                        border: "1px solid var(--border-color)",
                                        borderRadius: 6
                                      }}
                                    >
                                      Copy
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {parsed.cta && (
                            <div>
                              <span style={{ ...S.label, display: "block", marginBottom: 6 }}>Call to Action</span>
                              <div style={{
                                background: "var(--bg-secondary)",
                                border: "1px solid var(--border-color)",
                                borderRadius: 12,
                                padding: 14,
                                fontSize: 13,
                                color: "var(--text-primary)",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                gap: 12
                              }}>
                                <span style={{ fontWeight: 500 }}>{parsed.cta}</span>
                                <button 
                                  onClick={() => {
                                    navigator.clipboard.writeText(parsed.cta);
                                    alert("CTA copied!");
                                  }} 
                                  style={{ ...S.ghost, color: "var(--accent-color)", fontSize: 11, padding: "2px 6px", border: "1px solid var(--border-color)", borderRadius: 6, flexShrink: 0 }}
                                >
                                  Copy
                                </button>
                              </div>
                            </div>
                          )}

                          {parsed.hashtags && parsed.hashtags.length > 0 && (
                            <div>
                              <span style={{ ...S.label, display: "block", marginBottom: 6 }}>Hashtags</span>
                              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                                {parsed.hashtags.map((tag, idx) => (
                                  <span key={idx} style={{
                                    background: "var(--bg-secondary)",
                                    border: "1px solid var(--border-color)",
                                    color: "var(--text-muted)",
                                    fontSize: 12,
                                    padding: "4px 10px",
                                    borderRadius: 16,
                                    cursor: "pointer",
                                    transition: "all 0.15s"
                                  }} onClick={() => {
                                    navigator.clipboard.writeText(`#${tag}`);
                                    alert(`#${tag} copied!`);
                                  }}
                                  onMouseEnter={e => { e.target.style.borderColor = "var(--accent-color)"; e.target.style.color = "var(--accent-color)"; }}
                                  onMouseLeave={e => { e.target.style.borderColor = "var(--border-color)"; e.target.style.color = "var(--text-muted)"; }}
                                  >
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {parsed.shotIdeas && parsed.shotIdeas.length > 0 && (
                            <div>
                              <span style={{ ...S.label, display: "block", marginBottom: 6 }}>Shot Ideas & Storyboard</span>
                              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                {parsed.shotIdeas.map((shot, idx) => (
                                  <div key={idx} style={{
                                    background: "var(--bg-secondary)",
                                    borderLeft: `3px solid ${MOOD_COLORS[activeDump.mood] || "var(--accent-color)"}`,
                                    borderRadius: "0 12px 12px 0",
                                    padding: "12px 16px",
                                    fontSize: 13,
                                    color: "var(--text-primary)",
                                    lineHeight: 1.5
                                  }}>
                                    {shot}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    } else {
                      if (!localDump) return null;
                      return (
                        <>
                          <div style={{marginBottom:14}}>
                            <span style={S.label}>Mood for this dump</span>
                            <MoodPicker value={localDump.mood} onChange={m=>{ setLocalDump(prev=>({...prev, mood: m})); setDumpIsDirty(true); }}/>
                          </div>

                          <div style={{position:"relative",marginBottom:14}}>
                            <textarea value={localDump.text || ""} onChange={e=>{ setLocalDump(prev=>({...prev, text: e.target.value})); setDumpIsDirty(true); }} style={{...S.textarea,minHeight:220,fontFamily:"var(--font-serif)",fontSize:15,lineHeight:1.7}} placeholder="unfiltered thoughts here..."/>
                            <div style={{position:"absolute",right:10,bottom:10,fontSize:11,color:"var(--text-muted)"}}>{(localDump.text || "").length} chars · {(localDump.text || "").split(/\s+/).filter(Boolean).length} words</div>
                          </div>
                        </>
                      );
                    }
                  })()}

                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:10,flexWrap:"wrap"}}>
                    <div style={S.row}>
                      <button style={S.btn("#a8c8a0",true)} onClick={()=>moveDumpToPlanner(localDump || activeDump)}>⚡ Convert to Post</button>
                      <button style={S.btn("#a0b8c8",true)} onClick={()=>moveDumpToShoot(localDump || activeDump)}>🎬 Create Shoot</button>
                    </div>
                    <div style={{...S.row, gap:8}}>
                      <SaveButton label="Save Dump" isDirty={dumpIsDirty} saving={savingDump} onClick={handleSaveDump} />
                      {dumpIsDirty && (
                        <button style={S.btn("var(--text-muted)", true)} onClick={handleResetDump}>Reset</button>
                      )}
                      <button style={S.btn("var(--text-muted)",true)} onClick={async ()=>{
                        const isArchiving = !activeDump.archived;
                        await updateDump(activeDump.id, {archived: isArchiving});
                        if (isArchiving) {
                          // Auto-select next non-archived dump
                          const next = dumps.find(d => d.id !== activeDump.id && !d.archived);
                          setActiveDumpId(next?.id || null);
                        }
                      }}>{activeDump.archived?"Unarchive":"Archive"}</button>
                      <button style={S.btn("#f0a090",true)} onClick={()=>deleteDump(activeDump.id)}>Delete</button>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{textAlign:"center",padding:"80px 20px",color:"var(--text-muted)",background:"var(--bg-secondary)",borderRadius:16,border:"1px solid var(--border-color)"}}>
                  <div style={{fontSize:32,opacity:0.2,marginBottom:12}}>✍️</div>
                  <p style={{fontStyle:"italic",fontSize:15,marginBottom:8}}>chaos is just unedited creativity</p>
                  <p style={{fontSize:12,maxWidth:320,margin:"0 auto 16px"}}>Write down hook ideas, script scripts, or raw thoughts before they float away.</p>
                  <div style={{display:"flex",justifyContent:"center",gap:6,flexWrap:"wrap"}}>
                    {DUMP_PLACEHOLDERS.map((pl,i)=><button key={i} onClick={()=>{
                      createNewDump(pl, "reflective");
                    }} style={{...S.btn("var(--text-muted)",true),fontSize:11}}>{pl}</button>)}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 3. SHOOT PLANNER */}
        {tab==="shoot"&&(
          <div className="card-in pane-shoot">
            <div>
              <span style={S.label}>shoot status</span>
              <div style={{display:"flex",gap:4,marginBottom:14}}>
                {["upcoming","week","month"].map(f=>(
                  <SelectableChip
                    key={f}
                    selected={shootFilter===f}
                    onClick={()=>setShootFilter(f)}
                    variant="filter"
                    style={{ flex: 1 }}
                    data-testid={`shoot-filter-${f}`}
                  >
                    {f}
                  </SelectableChip>
                ))}
              </div>
              <span style={S.label}>sessions</span>
              {filteredShoots.map(s=>(
                <div key={s.id} onClick={()=>selectShoot(s.id)} style={{
                  padding:"10px 12px",borderRadius:12,cursor:"pointer",marginBottom:6,
                  background:selectedShootId===s.id?"var(--bg-secondary)":"transparent",
                  border:selectedShootId===s.id?"1px solid var(--border-focus)":"1px solid transparent"
                }}>
                  <div style={{fontSize:13,color:"var(--text-primary)",fontWeight:selectedShootId===s.id?500:400}}>{s.name}</div>
                  <div style={{fontSize:11,color:"var(--text-muted)",marginTop:2}}>{shootDateLabel(s)}</div>
                </div>
              ))}
              <button style={{...S.btn("var(--accent-color)",true),width:"100%",marginTop:10}} onClick={async ()=>{
                try {
                  const ns = await apiCreateShoot({
                    name: "untitled shoot session",
                    shootDate: todayStr,
                    postId: null,
                    slots: getSuggestedShotsForMood("default")
                  });
                  setShoots(ss=>[...ss,ns]);
                  setSelectedShootId(ns.id);
                } catch (err) {
                  console.error("Failed to create shoot on server:", err);
                  showToast("Failed to create shoot.", "error");
                }
              }}>+ new session</button>
            </div>

            {/* Shoot session detailed workspace */}
            <div>
              {selectedShoot && localShoot ? (
                <div style={S.card} className="card-in">
                  {shootMode ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-color)", paddingBottom: 10, flexWrap: "wrap", gap: 10 }}>
                        <h3 style={{ fontSize: 16, fontWeight: 500, margin: 0 }}>📱 Shoot Mode Checklist: {localShoot.name}</h3>
                        <button style={S.btn("var(--accent-color)", true)} onClick={() => setShootMode(false)}>Exit Shoot Mode</button>
                      </div>
                      {["morning", "afternoon", "evening"].map(slot => {
                        const shots = localShoot.slots?.[slot] || [];
                        if (shots.length === 0) return null;
                        return (
                          <div key={slot} style={{ marginBottom: 12 }}>
                            <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 6 }}>
                              {slot}
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                              {shots.map(sh => {
                                const isDone = !!completedShots[sh.id];
                                return (
                                  <div key={sh.id} onClick={() => setCompletedShots(prev => ({ ...prev, [sh.id]: !prev[sh.id] }))} style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 12,
                                    padding: "12px 16px",
                                    background: isDone ? "var(--bg-secondary)" : "var(--bg-primary)",
                                    border: `1px solid ${isDone ? "transparent" : "var(--border-color)"}`,
                                    borderRadius: 12,
                                    cursor: "pointer",
                                    opacity: isDone ? 0.6 : 1,
                                    transition: "all 0.2s"
                                  }}>
                                    <input type="checkbox" checked={isDone} onChange={() => {}} style={{ pointerEvents: "none" }} />
                                    <div style={{ flex: 1 }}>
                                      <div style={{ fontSize: 14, fontWeight: 500, textDecoration: isDone ? "line-through" : "none", color: isDone ? "var(--text-muted)" : "var(--text-primary)" }}>{sh.shot}</div>
                                      {(sh.loc || sh.mood || sh.light) && (
                                        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                                          {sh.loc && `📍 ${sh.loc}`} {sh.mood && `· ◎ ${sh.mood}`} {sh.light && `· ${sh.light}`}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,gap:10,flexWrap:"wrap"}}>
                        <input value={localShoot.name} onChange={e=>{ setLocalShoot(prev=>({...prev,name:e.target.value})); setShootIsDirty(true); }} style={{...S.input,fontSize:18,fontWeight:400,border:"none",background:"transparent",padding:0,flex:1}} placeholder="Enter session title"/>
                        <div style={S.row}>
                          <button style={S.btn(shootMode?"var(--accent-color)":"var(--text-muted)",true)} onClick={()=>setShootMode(true)}>
                            📱 Shoot Mode
                          </button>
                          <SaveButton label="Save Shoot" isDirty={shootIsDirty} saving={savingShoot} onClick={handleSaveShoot} />
                          {shootIsDirty && (
                            <button style={S.btn("var(--text-muted)", true)} onClick={handleResetShoot}>Reset</button>
                          )}
                          <button style={S.btn("#f0a090",true)} onClick={()=>deleteShoot(localShoot.id)}>Delete session</button>
                        </div>
                      </div>

                      <div style={{...S.grid2,marginBottom:18}}>
                        <div>
                          <span style={S.label}>shoot date</span>
                          <input type="date" value={localShoot.shootDate||""} style={S.input} onChange={e=>{ setLocalShoot(prev=>({...prev,shootDate:e.target.value})); setShootIsDirty(true); }}/>
                        </div>
                        <div>
                          <span style={S.label}>link content post</span>
                          <select value={localShoot.postId||""} style={S.input} onChange={e=>{ setLocalShoot(prev=>({...prev,postId:e.target.value || null})); setShootIsDirty(true); }}>
                            <option value="">unlinked post</option>
                            {posts.map(p=><option key={p.id} value={p.id}>{p.title}</option>)}
                          </select>
                        </div>
                      </div>

                  {/* Slot breakdown */}
                  <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:20}}>
                    {["morning","afternoon","evening"].map(slot=>(
                      <div key={slot} style={{background:"var(--bg-primary)",borderRadius:12,padding:12,border:"1px solid var(--border-color)"}}>
                        <div style={{fontSize:12,fontWeight:600,color:"var(--text-secondary)",textTransform:"capitalize",marginBottom:8,borderBottom:"1px solid var(--border-color)",paddingBottom:4}}>
                          {slot}
                        </div>
                        {(localShoot.slots?.[slot]||[]).map(sh=>(
                          <div key={sh.id} style={{background:"var(--bg-secondary)",borderRadius:8,padding:8,marginBottom:6,fontSize:11,border:"1px solid var(--border-color)",position:"relative"}}>
                            <button onClick={()=>removeShotFromShoot(slot,sh.id)} style={{position:"absolute",right:6,top:6,border:"none",background:"none",cursor:"pointer",color:"#f0a090",fontSize:12}}>×</button>
                            <div style={{fontWeight:500,color:"var(--text-primary)",marginBottom:3,maxWidth:"85%"}}>{sh.shot}</div>
                            {sh.loc && <div style={{color:"var(--text-secondary)"}}>📍 {sh.loc}</div>}
                            {sh.mood && <div style={{color:"var(--text-muted)"}}>◎ {sh.mood} · {sh.light}</div>}
                          </div>
                        ))}
                        {(localShoot.slots?.[slot]||[]).length===0 && (
                          <div style={{
                            border: "1px dashed var(--border-color)",
                            borderRadius: 10,
                            padding: "12px 8px",
                            textAlign: "center",
                            cursor: "pointer",
                            color: "var(--text-muted)",
                            transition: "all 0.2s",
                            background: "var(--bg-secondary)"
                          }} onClick={() => handleAddDefaultConcept(slot)}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--border-focus)"; e.currentTarget.style.color = "var(--text-primary)"; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border-color)"; e.currentTarget.style.color = "var(--text-muted)"; }}
                          >
                            <div style={{fontSize: 16, marginBottom: 2}}>+</div>
                            <div style={{fontSize: 10}}>Click to add suggested {slot} shot</div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Add Shot form */}
                  <div style={{borderTop:"1px solid var(--border-color)",paddingTop:14}}>
                    <span style={{fontSize:13,fontWeight:500,color:"var(--text-secondary)",display:"block",marginBottom:10}}>add new shot to list</span>
                    <div style={{...S.grid2,gap:10,marginBottom:10}}>
                      <div>
                        <span style={S.label}>shot concept *</span>
                        <input value={newShot.shot} onChange={e=>setNewShot({...newShot,shot:e.target.value})} placeholder="close-up coffee pour..." style={S.input}/>
                      </div>
                      <div>
                        <span style={S.label}>target slot</span>
                        <select value={shootSlot} onChange={e=>setShootSlot(e.target.value)} style={S.input}>
                          <option value="morning">Morning</option>
                          <option value="afternoon">Afternoon</option>
                          <option value="evening">Evening</option>
                        </select>
                      </div>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:12}}>
                      <div>
                        <span style={S.label}>location</span>
                        <input value={newShot.loc} onChange={e=>setNewShot({...newShot,loc:e.target.value})} placeholder="kitchen..." style={{...S.input,fontSize:12}}/>
                      </div>
                      <div>
                        <span style={S.label}>lighting</span>
                        <select value={newShot.light} onChange={e=>setNewShot({...newShot,light:e.target.value})} style={{...S.input,fontSize:12}}>
                          <option value="">lighting...</option>
                          {LIGHTING_OPTIONS.map(lo=><option key={lo} value={lo}>{lo}</option>)}
                        </select>
                      </div>
                      <div>
                        <span style={S.label}>angle/motion</span>
                        <select value={newShot.angle} onChange={e=>setNewShot({...newShot,angle:e.target.value})} style={{...S.input,fontSize:12}}>
                          <option value="">angle...</option>
                          {MOTION_TYPES.map(mo=><option key={mo} value={mo}>{mo}</option>)}
                        </select>
                      </div>
                      <div>
                        <span style={S.label}>props</span>
                        <input value={newShot.props} onChange={e=>setNewShot({...newShot,props:e.target.value})} placeholder="white mug..." style={{...S.input,fontSize:12}}/>
                      </div>
                    </div>
                    <button style={S.btn("var(--accent-color)")} onClick={addShotToShoot} disabled={!newShot.shot.trim()}>+ Add Shot to Timeline</button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div style={{textAlign:"center",padding:"80px 20px",color:"var(--text-muted)",background:"var(--bg-secondary)",borderRadius:16,border:"1px solid var(--border-color)"}}>
                  <div style={{fontSize:32,opacity:0.2,marginBottom:12}}>🎬</div>
                  <p style={{fontStyle:"italic",fontSize:15,marginBottom:4}}>visual layouts for execution</p>
                  <p style={{fontSize:12}}>Pick or create a shoot session in the sidebar to organize your camera angles.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 4. B-ROLL VAULT */}
        {tab==="vault"&&(
          <div className="card-in">
            <BRollVault vault={vault} setVault={setVault} vaultSearchQuery={vaultSearchQuery} setVaultSearchQuery={setVaultSearchQuery} showToast={showToast} />
          </div>
        )}

        {/* 5. GROWTH JOURNAL */}
        {tab==="journal"&&(
          <div className="card-in pane-journal">
            {/* Sidebar list of weeks */}
            <div>
              <span style={S.label}>weekly entries</span>
              {journal.map(j=>(
                <div key={j.id} onClick={()=>setSelectedJournalId(j.id)} style={{
                  padding:"10px 12px",borderRadius:12,cursor:"pointer",marginBottom:6,
                  background:selectedJournalId===j.id?"var(--bg-secondary)":"transparent",
                  border:selectedJournalId===j.id?"1px solid var(--border-focus)":"1px solid transparent"
                }}>
                  <div style={{fontSize:13,color:"var(--text-primary)",fontWeight:selectedJournalId===j.id?500:400}}>Week of {friendlyDate(j.weekStart)}</div>
                  <div style={{fontSize:11,color:"var(--text-muted)",marginTop:2}}>{j.followers} followers · mood: {j.mood}</div>
                </div>
              ))}

              {!addingJournal && (
                <button style={{...S.btn("var(--accent-color)",true),width:"100%",marginTop:10}} onClick={()=>{
                  setNewJournal({ weekStart: todayStr, followers: "", posts: "", reach: "", saves: "", engagement: "", mood: "inspired", wins: "", lessons: "", reflection: "", notes: "" });
                  setAddingJournal(true);
                }}>+ check-in this week</button>
              )}
            </div>

            {/* Checkin form / Detail view */}
            <div>
              {addingJournal ? (
                <div style={S.card} className="card-in">
                  <div style={{...S.row,justifyContent:"space-between",marginBottom:14}}>
                    <div style={{display:"flex", alignItems:"center", gap:12}}>
                      <h3 style={{fontSize:16,fontWeight:500}}>Weekly Check-In Form</h3>
                      <button onClick={generateJournalAI} disabled={aiGeneratingJournal} style={{...S.ghost, color:"var(--accent-color)", fontSize:11, padding:"4px 10px", border:"1px solid var(--accent-light)", borderRadius:12}}>
                        {aiGeneratingJournal ? "✨ Analyzing stats..." : "✨ Analyze with AI"}
                      </button>
                    </div>
                    <button style={{...S.ghost,fontSize:18,color:"var(--text-muted)"}} onClick={()=>setAddingJournal(false)}>×</button>
                  </div>
                  
                  <div style={{...S.grid2,marginBottom:12}}>
                    <div>
                      <span style={S.label}>week start date</span>
                      <input type="date" value={newJournal.weekStart} style={S.input} onChange={e=>setNewJournal({...newJournal,weekStart:e.target.value})}/>
                    </div>
                    <div>
                      <span style={S.label}>creative mood</span>
                      <select value={newJournal.mood} style={S.input} onChange={e=>setNewJournal({...newJournal,mood:e.target.value})}>
                        <option value="inspired">Inspired</option>
                        <option value="rebuilding">Rebuilding</option>
                        <option value="exhausted">Exhausted</option>
                        <option value="chaotic">Chaotic</option>
                        <option value="proud">Proud</option>
                        <option value="motivated">Motivated</option>
                        <option value="reflective">Reflective</option>
                      </select>
                    </div>
                  </div>

                  <div style={{display:"grid",gridTemplateColumns:"repeat(5, 1fr)",gap:8,marginBottom:12}}>
                    <div>
                      <span style={S.label}>followers</span>
                      <input type="number" value={newJournal.followers} style={S.input} onChange={e=>setNewJournal({...newJournal,followers:e.target.value})} placeholder="e.g. 1400"/>
                    </div>
                    <div>
                      <span style={S.label}>posts count</span>
                      <input type="number" value={newJournal.posts} style={S.input} onChange={e=>setNewJournal({...newJournal,posts:e.target.value})} placeholder="3"/>
                    </div>
                    <div>
                      <span style={S.label}>reach</span>
                      <input type="number" value={newJournal.reach} style={S.input} onChange={e=>setNewJournal({...newJournal,reach:e.target.value})} placeholder="10k"/>
                    </div>
                    <div>
                      <span style={S.label}>saves</span>
                      <input type="number" value={newJournal.saves} style={S.input} onChange={e=>setNewJournal({...newJournal,saves:e.target.value})} placeholder="50"/>
                    </div>
                    <div>
                      <span style={S.label}>engagement %</span>
                      <input type="text" value={newJournal.engagement} style={S.input} onChange={e=>setNewJournal({...newJournal,engagement:e.target.value})} placeholder="5.4"/>
                    </div>
                  </div>

                  <div style={{marginBottom:12}}>
                    <span style={S.label}>reflection (most important section)</span>
                    <textarea value={newJournal.reflection} style={S.textarea} onChange={e=>setNewJournal({...newJournal,reflection:e.target.value})} placeholder="e.g. 'voiceovers connected more, I stopped overthinking before posting...'"/>
                  </div>

                  <div style={{...S.grid2,marginBottom:14}}>
                    <div>
                      <span style={S.label}>tiny wins (one per line)</span>
                      <textarea value={newJournal.wins} style={S.textarea} onChange={e=>setNewJournal({...newJournal,wins:e.target.value})} placeholder="posted despite fear&#10;first viral reel..."/>
                    </div>
                    <div>
                      <span style={S.label}>lessons learned</span>
                      <textarea value={newJournal.lessons} style={S.textarea} onChange={e=>setNewJournal({...newJournal,lessons:e.target.value})} placeholder="editing routine mistakes..."/>
                    </div>
                  </div>

                  <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
                    <button style={S.btn("var(--text-muted)")} onClick={()=>setAddingJournal(false)}>cancel</button>
                    <button style={S.btn("var(--accent-color)")} onClick={async ()=>{
                      try {
                        const payload = {
                          weekStart: newJournal.weekStart,
                          mood: newJournal.mood,
                          followers: Number(newJournal.followers) || 0,
                          posts: Number(newJournal.posts) || 0,
                          reach: Number(newJournal.reach) || 0,
                          saves: Number(newJournal.saves) || 0,
                          engagement: String(newJournal.engagement) || "0",
                          reflection: newJournal.reflection,
                          wins: newJournal.wins,
                          lessons: newJournal.lessons,
                          notes: newJournal.notes || ""
                        };
                        const saved = await apiCreateJournalEntry(payload);
                        setJournal(prev=>[saved,...prev]);
                        setSelectedJournalId(saved.id);
                        setAddingJournal(false);
                        showToast("Journal entry saved successfully.");
                      } catch(err) {
                        console.error("[App] Failed to save journal entry:", err);
                        showToast("Failed to save journal entry.", "error");
                      }
                    }}>save journal entry</button>
                  </div>
                </div>
              ) : selectedJournalId ? (
                (() => {
                  const j=journal.find(x=>x.id===selectedJournalId);
                  if(!j) return null;
                  
                  // Simple SVG Sparkline math
                  const makePath = key => {
                    const vals = journal.map(x=>x[key]||0).reverse();
                    if(vals.length<2) return "";
                    const min = Math.min(...vals);
                    const max = Math.max(...vals);
                    const range = max-min || 1;
                    const points = vals.map((v,idx)=>{
                      const x = (idx / (vals.length-1)) * 140 + 10;
                      const y = 40 - ((v-min)/range) * 30;
                      return `${x},${y}`;
                    });
                    return "M " + points.join(" L ");
                  };

                  return(
                    <div style={S.card} className="card-in">
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:"1px solid var(--border-color)",paddingBottom:10,marginBottom:16}}>
                        <div>
                          <h3 style={{fontSize:18,fontWeight:400}}>Week of {friendlyDate(j.weekStart)} Check-In</h3>
                          <span style={{fontSize:11,color:"var(--text-muted)"}}>tracked on {friendlyDate(j.createdAt)}</span>
                        </div>
                        <Tag label={j.mood} color={MOOD_COLORS[j.mood]||"#c9b99a"}/>
                      </div>

                      {/* Stat Grid with SVGs */}
                      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:18}}>
                        {[
                          {label:"followers",key:"followers",val:j.followers},
                          {label:"weekly posts",key:"posts",val:j.posts},
                          {label:"reach",key:"reach",val:j.reach},
                          {label:"saves",key:"saves",val:j.saves}
                        ].map(st=>{
                          const isKpi = st.key === "followers" || st.key === "reach" || st.key === "saves";
                          return (
                            <div key={st.label} className={isKpi ? "kpi-card-gradient" : ""} style={{
                              background: isKpi ? undefined : "var(--bg-primary)",
                              borderRadius: 12,
                              padding: 12,
                              border: isKpi ? "none" : "1px solid var(--border-color)",
                              color: isKpi ? "#FFFFFF" : "var(--text-primary)"
                            }}>
                              <span style={{fontSize:11,color:isKpi ? "rgba(255,255,255,0.85)" : "var(--text-muted)",textTransform:"capitalize"}}>{st.label}</span>
                              <div style={{fontSize:18,fontWeight:500,margin:"2px 0",color:isKpi ? "#FFFFFF" : "var(--text-primary)"}}>{st.val}</div>
                              {journal.length>=2 && (
                                <svg width="100%" height="45" style={{marginTop:4,overflow:"visible"}}>
                                  <path className="sparkline" d={makePath(st.key)} fill="none" stroke={isKpi ? "#FFFFFF" : "var(--accent-color)"} strokeWidth="1.5" />
                                  <circle cx={150} cy={40 - (((st.val - Math.min(...journal.map(x=>x[st.key]||0))) / (Math.max(...journal.map(x=>x[st.key]||0)) - Math.min(...journal.map(x=>x[st.key]||0)) || 1)) * 30)} r="2" fill={isKpi ? "#FAFFCB" : "var(--accent-dark)"}/>
                                </svg>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Text Reflections */}
                      <div style={{marginBottom:14}}>
                        <span style={S.label}>Weekly reflection</span>
                        <div style={{fontSize:14,fontStyle:"italic",lineHeight:1.7,color:"var(--text-primary)",background:"var(--accent-light)",borderRadius:10,padding:14}}>
                          "{j.reflection}"
                        </div>
                      </div>

                      <div style={{...S.grid2,gap:12,marginBottom:14}}>
                        <div>
                          <span style={S.label}>Tiny wins celebrating</span>
                          <div style={{background:"var(--bg-primary)",border:"1px solid var(--border-color)",borderRadius:10,padding:12,fontSize:13}}>
                            {j.wins ? j.wins.split("\n").map((w,i)=><div key={i} style={{marginBottom:4}}>✦ {w}</div>) : <span style={{fontStyle:"italic",color:"var(--text-muted)"}}>No wins logged.</span>}
                          </div>
                        </div>
                        <div>
                          <span style={S.label}>lessons learned</span>
                          <div style={{background:"var(--bg-primary)",border:"1px solid var(--border-color)",borderRadius:10,padding:12,fontSize:13,color:"var(--text-secondary)",lineHeight:1.5}}>
                            {j.lessons || <span style={{fontStyle:"italic",color:"var(--text-muted)"}}>No lessons logged.</span>}
                          </div>
                        </div>
                      </div>

                      <div style={{textAlign:"right"}}>
                        <button style={S.btn("#f0a090",true)} onClick={async ()=>{
                          if(!confirm("Delete this journal entry?")) return;
                          try {
                            await apiDeleteJournalEntry(j.id);
                            const remaining = journal.filter(x=>x.id!==j.id);
                            const nextId = remaining[0]?.id || null;
                            setJournal(remaining);
                            setSelectedJournalId(nextId);
                            showToast("Journal entry deleted.");
                          } catch(err) {
                            console.error("[App] Failed to delete journal entry:", err);
                            showToast("Failed to delete journal entry.", "error");
                          }
                        }}>Delete check-in</button>
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div style={{textAlign:"center",padding:"80px 20px",color:"var(--text-muted)",background:"var(--bg-secondary)",borderRadius:16,border:"1px solid var(--border-color)"}}>
                  <div style={{fontSize:32,opacity:0.2,marginBottom:12}}>📓</div>
                  <p style={{fontStyle:"italic",fontSize:15,marginBottom:4}}>small consistency becomes momentum</p>
                  <p style={{fontSize:12,maxWidth:320,margin:"0 auto"}}>Growth is quieter than you think. Document the process, not just the milestones.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 6. COLLABS CRM */}
        {tab==="collabs"&&(
          <div className="card-in pane-collabs">
            {/* Sidebar list of pipelines */}
            <div>
              <button onClick={discoverBrandsAI} disabled={discoveringBrands} style={{...S.btn("var(--accent-color)", true), width:"100%", display:"flex", alignItems:"center", justifyContent:"center", gap:6, marginBottom:16}}>
                {discoveringBrands ? "✨ Finding brands..." : "✨ AI Brand Discovery"}
              </button>

              <div style={{fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5, color: "var(--text-muted)", marginBottom: 8, marginTop: 4}}>💼 Active Deals</div>
              {collabs.filter(c => ["discussing", "booked", "completed"].includes(c.status)).length === 0 ? (
                <div style={{fontSize:12, fontStyle:"italic", color:"var(--text-muted)", marginBottom:12, paddingLeft:4}}>No active deals</div>
              ) : (
                collabs.filter(c => ["discussing", "booked", "completed"].includes(c.status)).map(c=>(
                  <div key={c.id} onClick={()=>setSelectedCollabId(c.id)} style={{
                    padding:"10px 12px",borderRadius:12,cursor:"pointer",marginBottom:6,
                    background:selectedCollabId===c.id?"var(--bg-secondary)":"transparent",
                    border:selectedCollabId===c.id?"1px solid var(--border-focus)":"1px solid transparent"
                  }}>
                    <div style={{fontSize:13,color:"var(--text-primary)",fontWeight:selectedCollabId===c.id?500:400}}>{c.brand}</div>
                    <div style={{fontSize:11,color:"var(--text-muted)",marginTop:2}}>₹{c.negotiatedAmount} · {c.status}</div>
                  </div>
                ))
              )}

              <div style={{fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5, color: "var(--text-muted)", marginBottom: 8, marginTop: 16}}>🎯 Pitch Pipeline</div>
              {collabs.filter(c => !["discussing", "booked", "completed"].includes(c.status)).length === 0 ? (
                <div style={{fontSize:12, fontStyle:"italic", color:"var(--text-muted)", marginBottom:12, paddingLeft:4}}>No pitches in pipeline</div>
              ) : (
                collabs.filter(c => !["discussing", "booked", "completed"].includes(c.status)).map(c=>(
                  <div key={c.id} onClick={()=>setSelectedCollabId(c.id)} style={{
                    padding:"10px 12px",borderRadius:12,cursor:"pointer",marginBottom:6,
                    background:selectedCollabId===c.id?"var(--bg-secondary)":"transparent",
                    border:selectedCollabId===c.id?"1px solid var(--border-focus)":"1px solid transparent"
                  }}>
                    <div style={{fontSize:13,color:"var(--text-primary)",fontWeight:selectedCollabId===c.id?500:400}}>{c.brand}</div>
                    <div style={{fontSize:11,color:"var(--text-muted)",marginTop:2}}>{c.status}</div>
                  </div>
                ))
              )}

              {!addingCollab && (
                <button style={{...S.btn("var(--text-secondary)",true),width:"100%",marginTop:16}} onClick={()=>{
                  setNewCollab({ brand:"", contactName:"", email:"", platform:"Instagram", status:"dream brand", quote:"", negotiatedAmount:"", deliverables:[], dueDate:"", paymentStatus:"unpaid", notes:"", pitchDraft:"", followUpDraft:"", scriptText:"", wardrobe:"", props:"", briefFileName:"", briefFileUrl:"" });
                  setFormDeliverables([]);
                  setAddingCollab(true);
                }}>+ log new collab</button>
              )}
            </div>

            {/* Collab workspace detail */}
            <div>
              {collabDetailContent}
            </div>
          </div>
        )}

        {/* 7. AI TREND SCOUT */}
        {tab==="trends"&&(
          <div className="card-in">
            {/* Instagram Multi-Tenant Connection Widget */}
            <div style={{
              background: "var(--bg-secondary)",
              border: "1px solid var(--border-color)",
              borderRadius: "16px",
              padding: "20px",
              marginBottom: "24px"
            }} className="card-in">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-color)", paddingBottom: "12px", marginBottom: "14px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "20px" }}>📸</span>
                  <h3 style={{ fontSize: "15px", fontWeight: 600, margin: 0 }}>Instagram Creator Sync</h3>
                </div>
                {user?.instagramUsername ? (
                  <span style={{ fontSize: "11px", background: "#e2f8f0", color: "#107c41", padding: "4px 8px", borderRadius: "12px", fontWeight: 600 }}>
                    Connected
                  </span>
                ) : (
                  <span style={{ fontSize: "11px", background: "var(--border-color)", color: "var(--text-muted)", padding: "4px 8px", borderRadius: "12px", fontWeight: 500 }}>
                    Disconnected
                  </span>
                )}
              </div>

              {igError && (
                <div style={{ background: "#fdf2f2", color: "#e02424", padding: "10px 14px", borderRadius: "8px", fontSize: "12px", marginBottom: "14px", border: "1px solid #fbd5d5" }}>
                  {igError}
                </div>
              )}

              {!user?.instagramUsername ? (
                <div>
                  <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: "0 0 14px 0", lineHeight: 1.5 }}>
                    Link your Instagram creator account to import live profile data, track real-time analytics, and display recent media directly inside the operating system.
                  </p>
                  {import.meta.env.DEV ? (
                    <div style={{ display: "flex", gap: "10px", flexDirection: "column" }}>
                      <div style={{ display: "flex", gap: "10px", alignItems: "center", width: "100%" }}>
                        <input
                          type="password"
                          value={igAccessToken}
                          onChange={(e) => setIgAccessToken(e.target.value)}
                          style={{ ...S.input, flex: 1, padding: "10px 14px" }}
                          placeholder="[DEV ONLY] Paste Meta User Access Token (EAAN...) here"
                        />
                        <button
                          onClick={handleConnectInstagram}
                          disabled={igLoading || !igAccessToken.trim()}
                          style={{ ...S.btn("var(--accent-color)", true), padding: "10px 20px", whiteSpace: "nowrap" }}
                        >
                          {igLoading ? "Connecting..." : "Link Channel"}
                        </button>
                      </div>
                      <div style={{ width: "100%", textAlign: "center", margin: "8px 0" }}>
                        <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>— OR USE OAUTH —</span>
                      </div>
                      <button
                        onClick={handleInstagramConnectClick}
                        disabled={igLoading}
                        style={{ ...S.btn("var(--accent-color)"), minHeight: "44px", width: "100%", fontWeight: "600" }}
                        data-test-id="ig-trends-connect-btn"
                      >
                        🔌 Connect Instagram (OAuth)
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handleInstagramConnectClick}
                      disabled={igLoading}
                      style={{ ...S.btn("var(--accent-color)"), minHeight: "44px", width: "100%", fontWeight: "600" }}
                      data-test-id="ig-trends-connect-btn"
                    >
                      🔌 Connect Instagram
                    </button>
                  )}
                </div>
              ) : (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                    <div>
                      <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>
                        @{user.instagramUsername}
                      </div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
                        Linked on {user.instagramConnectedAt ? new Date(user.instagramConnectedAt).toLocaleDateString() : "recent"}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        onClick={handleFetchInstagramMedia}
                        disabled={igLoading}
                        style={{ ...S.btn("var(--border-focus)", false), fontSize: "12px", padding: "6px 14px", background: "none", border: "1px solid var(--border-color)", cursor: "pointer", color: "var(--text-primary)" }}
                      >
                        {igLoading ? "Refreshing..." : "🔄 Refresh Media"}
                      </button>
                      <button
                        onClick={handleInstagramDisconnectClick}
                        disabled={igLoading}
                        style={{ ...S.btn("#e02424", false), fontSize: "12px", padding: "6px 14px", background: "none", border: "1px solid #fbd5d5", cursor: "pointer", color: "#e02424" }}
                      >
                        Disconnect
                      </button>
                    </div>
                  </div>

                  {/* Render Recent Instagram Media Grid */}
                  {igMedia && igMedia.length > 0 && (
                    <div style={{ marginTop: "20px", borderTop: "1px solid var(--border-color)", paddingTop: "16px" }}>
                      <h4 style={{ fontSize: "13px", fontWeight: 600, marginBottom: "12px", color: "var(--text-primary)" }}>Recent Instagram Posts</h4>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "12px" }}>
                        {igMedia.map((item) => (
                          <a
                            key={item.id}
                            href={item.permalink}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ textDecoration: "none", color: "inherit" }}
                          >
                            <div style={{ border: "1px solid var(--border-color)", borderRadius: "12px", overflow: "hidden", background: "var(--bg-primary)" }} className="card-in">
                              <div style={{ height: "120px", overflow: "hidden", position: "relative" }}>
                                {item.media_type === "VIDEO" ? (
                                  <div style={{ width: "100%", height: "100%", background: "#1a1a1a", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "20px" }}>
                                    📹
                                  </div>
                                ) : (
                                  <img src={item.media_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                )}
                              </div>
                              <div style={{ padding: "8px 12px" }}>
                                <p style={{ fontSize: "11px", color: "var(--text-secondary)", margin: "0 0 6px 0", height: "30px", overflow: "hidden", textOverflow: "ellipsis" }}>
                                  {item.caption || "No caption"}
                                </p>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "var(--text-muted)", borderTop: "1px solid var(--border-color)", paddingTop: "6px" }}>
                                  <span>❤️ {item.like_count || 0}</span>
                                  <span>💬 {item.comments_count || 0}</span>
                                </div>
                              </div>
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            {/* Top selection bar */}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20,flexWrap:"wrap",gap:10}}>
              <div style={S.row}>
                {NICHES.map(n=>(
                  <button key={n.id} onClick={()=>setActiveNiche(n.id)} style={{
                    padding:"6px 14px",borderRadius:20,fontSize:12,border:`1px solid ${activeNiche===n.id?"var(--border-focus)":"var(--border-color)"}`,
                    background:activeNiche===n.id?"var(--accent-light)":"transparent",color:activeNiche===n.id?"var(--text-primary)":"var(--text-muted)",
                    fontWeight:activeNiche===n.id?600:400,cursor:"pointer"
                  }}>{n.label}</button>
                ))}
              </div>

              <button style={{...S.btn("var(--accent-color)"),fontWeight:500}} onClick={runAiScout} disabled={scouting}>
                {scouting ? "Scanning Social APIs..." : "🎬 Scan Niche Trends"}
              </button>
            </div>

            {/* Scouting Animation Overlay */}
            {scouting && (
              <div style={{
                background:"var(--bg-secondary)",border:"1px solid var(--border-color)",borderRadius:16,padding:24,
                marginBottom:20,textAlign:"center"
              }} className="card-in">
                <div style={{fontWeight:500,fontSize:14,color:"var(--text-primary)",marginBottom:8}}>Assistant Scouting platforms for {NICHES.find(x=>x.id===activeNiche)?.label}...</div>
                <div style={{width:"100%",background:"var(--border-color)",height:4,borderRadius:4,overflow:"hidden",marginBottom:14}}>
                  <div style={{width:`${scoutProgress}%`,background:"var(--accent-color)",height:"100%",transition:"width 0.3s"}}></div>
                </div>
                <div style={{fontSize:11,fontFamily:"monospace",color:"var(--text-muted)",textAlign:"left",maxHeight:100,overflowY:"auto"}}>
                  {scoutLogs.map((log,idx)=><div key={idx} style={{marginBottom:3}}>• {log}</div>)}
                </div>
              </div>
            )}

            <div style={{marginBottom: 20, background:"var(--bg-secondary)", borderRadius: 16, border:"1px solid var(--border-color)", padding:16}}>
              <div style={{display:"flex", alignItems:"center", gap:10, marginBottom:10}}>
                <span style={{fontSize:16}}>🔍</span>
                <span style={S.label}>Viral Reel Breakdown</span>
              </div>
              <div style={{display:"flex", gap:10, alignItems:"center"}}>
                <input value={reelUrl} onChange={e=>setReelUrl(e.target.value)} style={{...S.input, flex:1, padding:"8px 14px"}} placeholder="Paste TikTok / Instagram Reel URL here..."/>
                <button onClick={analyzeReelAI} disabled={analyzingReel || !reelUrl} style={S.btn("var(--accent-color)", true)}>
                  {analyzingReel ? "✨ Extracting metadata..." : "✨ Analyze & Break Down"}
                </button>
              </div>
              
              {reelBreakdown && !analyzingReel && (
                <div className="card-in" style={{marginTop:16, borderTop:"1px solid var(--border-color)", paddingTop:16, display:"grid", gridTemplateColumns:"1fr 1fr", gap:16}}>
                  <div>
                    <h4 style={{fontSize:13, fontWeight:600, color:"var(--text-primary)", marginBottom:8}}>👁️ Hidden Insights</h4>
                    <ul style={{fontSize:12, color:"var(--text-secondary)", margin:0, paddingLeft:16}}>
                      {reelBreakdown.insights.map((insight, i) => <li key={i} style={{marginBottom:4}}>{insight}</li>)}
                    </ul>
                  </div>
                  <div>
                    <h4 style={{fontSize:13, fontWeight:600, color:"var(--text-primary)", marginBottom:8}}>🎬 Recreation Guide</h4>
                    <ul style={{fontSize:12, color:"var(--text-secondary)", margin:0, paddingLeft:16}}>
                      {reelBreakdown.steps.map((step, i) => <li key={i} style={{marginBottom:4}}>{step}</li>)}
                    </ul>
                  </div>
                  <div style={{gridColumn: "span 2", display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 12, borderTop: "1px solid var(--border-color)", paddingTop: 12, flexWrap: "wrap"}}>
                    <span style={{fontSize: 11, color: "var(--text-muted)", alignSelf: "center", marginRight: "auto"}}>Move to:</span>
                    <button onClick={saveBreakdownToDump} style={S.btn("var(--accent-color)", true)}>
                      📥 Brain Dump
                    </button>
                    <button onClick={saveBreakdownToPlanner} style={S.btn("#a8c8a0", true)}>
                      📅 Content Planner
                    </button>
                    <button onClick={saveBreakdownToShoot} style={S.btn("#d4c5e2", true)}>
                      🎬 Shoot Session
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Transcript Analyzer Card */}
            <div style={{marginBottom: 20, background:"var(--bg-secondary)", borderRadius: 16, border:"1px solid var(--border-color)", padding:16}}>
              <div style={{display:"flex", alignItems:"center", gap:10, marginBottom:10}}>
                <span style={{fontSize:16}}>📝</span>
                <span style={S.label}>Transcript Reference Analyzer</span>
              </div>
              <p style={{fontSize:12, color:"var(--text-secondary)", marginBottom:10}}>
                Paste a script transcript from a viral video. The AI will parse its hook, story structure, and pacing beats, saving the structured storyboard template directly to your Brain Dumps.
              </p>
              <div style={{display:"flex", flexDirection:"column", gap:10}}>
                <textarea 
                  value={transcriptText} 
                  onChange={e=>setTranscriptText(e.target.value)} 
                  style={{...S.textarea, minHeight: 100, fontFamily: "var(--font-sans)", fontSize: 13}} 
                  placeholder="Paste video transcript here (e.g. line-by-line spoken words)..."
                />
                <div style={{display:"flex", justifyContent:"flex-end"}}>
                  <button onClick={handleParseTranscript} disabled={parsingTranscript || !transcriptText.trim()} style={S.btn("var(--accent-color)", true)}>
                    {parsingTranscript ? "✨ Parsing Script beats..." : "✨ Parse Script Structure"}
                  </button>
                </div>
              </div>
            </div>

            <div className="pane-trends">
              {/* Trends List Column */}
              <div>
                <span style={S.label}>AI Virality Reports for: {NICHES.find(x=>x.id===activeNiche)?.label}</span>
                {aiTrends.length > 0 ? (
                  aiTrends.map(t=>(
                    <div key={t.id} style={{...S.card,marginBottom:12}} className="card-in">
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                        <div>
                          <h4 style={{fontSize:15,fontWeight:500,color:"var(--text-primary)"}}>{t.title}</h4>
                          <span style={{fontSize:11,color:"var(--text-muted)"}}>{t.views} · {t.postedDate}</span>
                        </div>
                        {t.audioTrending && <Tag label="trending audio ↗" color="#a8c8a0"/>}
                      </div>

                      <div style={{background:"var(--bg-primary)",borderRadius:10,padding:12,fontSize:13,marginBottom:10,border:"1px solid var(--border-color)"}}>
                        <div style={{fontSize:11,color:"var(--text-muted)",marginBottom:2}}>visual hooks text overlay</div>
                        <div style={{fontStyle:"italic",fontWeight:500}}>"{t.hook}"</div>
                      </div>

                      <div style={{fontSize:13,color:"var(--text-secondary)",lineHeight:1.6,marginBottom:10}}>
                        <span style={{fontWeight:600,color:"var(--text-primary)"}}>Why it works: </span>
                        {t.whyItWorked}
                      </div>

                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,fontSize:12,borderTop:"1px solid var(--border-color)",paddingTop:10,marginBottom:12}}>
                        <div>
                          <span style={S.label}>suggested audio</span>
                          <span style={{fontWeight:500}}>{t.audioTrack}</span>
                        </div>
                        <div>
                          <span style={S.label}>action plan</span>
                          <span style={{color:"var(--text-secondary)"}}>{t.keyTakeaway}</span>
                        </div>
                      </div>

                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                        <div style={S.row}>
                          {t.visualTags.map(tg=><span key={tg} style={{fontSize:10,padding:"1px 6px",borderRadius:20,background:"var(--accent-light)",color:"var(--accent-dark)"}}>#{tg}</span>)}
                        </div>
                        <div style={S.row}>
                          <button style={S.btn("var(--accent-color)",true)} onClick={()=>{
                            const searchTag = t.visualTags[0];
                            setVaultSearchQuery(searchTag);
                            setTab("vault");
                          }}>🔍 Find B-Roll in Vault</button>
                          <button style={S.btn("var(--accent-dark)",true)} onClick={() => handleRecreateTrend(t)}>⚡ Recreate Trend</button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{textAlign:"center",padding:"50px 20px",color:"var(--text-muted)",background:"var(--bg-secondary)",borderRadius:16,border:"1px solid var(--border-color)"}}>
                    No trends scanned. Click 'Scan Niche Trends' at the top to search.
                  </div>
                )}
              </div>

              {/* Chat Column */}
              <div>
                <span style={S.label}>AI Assistant Chat</span>
                <div style={{
                  background:"var(--bg-secondary)",border:"1px solid var(--border-color)",borderRadius:16,
                  height:420,display:"flex",flexDirection:"column",justifyContent:"space-between",padding:14
                }} className="card-in">
                  <div style={{overflowY:"auto",flex:1,marginBottom:10,paddingRight:4}}>
                    {aiChatResponses.map((msg,idx)=>(
                      <div key={idx} style={{
                        textAlign:msg.sender==="user"?"right":"left",marginBottom:10,
                      }}>
                        <div style={{
                          display:"inline-block",padding:"8px 12px",borderRadius:12,fontSize:12,
                          background:msg.sender==="user"?"var(--accent-color)":"var(--bg-primary)",
                          color:msg.sender==="user"?"#fff":"var(--text-primary)",
                          maxWidth:"90%",lineHeight:1.5,whiteSpace:"pre-wrap",
                          border:msg.sender!=="user"?"1px solid var(--border-color)":"none"
                        }}>
                          {msg.text}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{display:"flex",gap:6}}>
                    <input value={aiChatQuery} onChange={e=>setAiChatQuery(e.target.value)} style={{...S.input,fontSize:12,padding:"6px 10px",flex:1}} placeholder="Ask: 'give me workspace hooks'..."
                      onKeyDown={e=>{if(e.key==="Enter")sendAiChat();}}/>
                    <button style={S.btn("var(--accent-color)",true)} onClick={sendAiChat}>Send</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab==="instagram"&&(
          <div className="card-in">
            {!user?.instagramUsername ? (
              <div style={{
                background: "var(--bg-secondary)",
                border: "1px solid var(--border-color)",
                borderRadius: "16px",
                padding: "24px",
                maxWidth: "600px",
                margin: "40px auto",
                textAlign: "center"
              }} className="card-in" data-test-id="ig-dashboard-not-connected">
                <div style={{fontSize: "36px", marginBottom: "12px"}}>📸</div>
                <h3 style={{fontSize: "18px", fontWeight: 600, marginBottom: "8px"}}>Connect your Instagram Channel</h3>
                <p style={{fontSize: "13px", color: "var(--text-secondary)", marginBottom: "20px", lineHeight: 1.5}}>
                  Link your Instagram creator account to unlock the Rule-Based Analytics Engine, Hook Database audits, and AI-driven content generation strategy.
                </p>

                {igError && (
                  <div style={{ background: "#fdf2f2", color: "#e02424", padding: "10px 14px", borderRadius: "8px", fontSize: "12px", marginBottom: "14px", border: "1px solid #fbd5d5", textAlign: "left" }} data-test-id="ig-dashboard-error">
                    ⚠️ {igError}
                    <button onClick={handleInstagramConnectClick} style={{ ...S.btn("#e02424"), marginTop: "8px", minHeight: "36px", fontSize: "11px" }}>
                      🔄 Retry Connection
                    </button>
                  </div>
                )}

                <div style={{display: "flex", flexDirection: "column", gap: "12px", alignItems: "stretch"}}>
                  {import.meta.env.DEV ? (
                    <>
                      <input
                        type="password"
                        value={igAccessToken}
                        onChange={(e) => setIgAccessToken(e.target.value)}
                        style={{...S.input, padding: "12px 14px", textAlign: "center"}}
                        placeholder="[DEV ONLY] Paste Meta User Access Token (EAAN...) here"
                      />
                      <button
                        onClick={handleConnectInstagram}
                        disabled={igLoading || !igAccessToken.trim()}
                        style={{...S.btn("var(--accent-color)", false), minHeight: "44px", width: "100%", fontWeight: 600}}
                      >
                        {igLoading ? "Connecting Channel..." : "Link Instagram Account (Manual)"}
                      </button>
                      <div style={{ textAlign: "center", margin: "4px 0" }}>
                        <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>— OR USE OAUTH —</span>
                      </div>
                      <button
                        onClick={handleInstagramConnectClick}
                        disabled={igLoading}
                        style={{...S.btn("var(--accent-color)", false), minHeight: "44px", width: "100%", fontWeight: 600}}
                        data-test-id="ig-dashboard-connect-btn"
                      >
                        🔌 Connect Instagram (OAuth)
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={handleInstagramConnectClick}
                      disabled={igLoading}
                      style={{...S.btn("var(--accent-color)", false), minHeight: "44px", width: "100%", fontWeight: 600}}
                      data-test-id="ig-dashboard-connect-btn"
                    >
                      🔌 Connect Instagram
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div>
                {/* Header overview row */}
                <div style={{
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center", 
                  background: "var(--bg-secondary)", 
                  borderRadius: 16, 
                  border: "1px solid var(--border-color)", 
                  padding: "16px 20px", 
                  marginBottom: 20,
                  flexWrap: "wrap",
                  gap: 12
                }}>
                  <div>
                    <h3 style={{fontSize: 16, fontWeight: 600, margin: 0}}>📸 @{user.instagramUsername} Creator Dashboard</h3>
                    <div style={{ display: "flex", gap: "12px", marginTop: "4px", fontSize: "11px", color: "var(--text-muted)" }}>
                      <span>Creator Account</span>
                      <span>•</span>
                      <span>{igMedia ? igMedia.length : 0} Posts</span>
                      <span>•</span>
                      <span>Linked on {user.instagramConnectedAt ? new Date(user.instagramConnectedAt).toLocaleDateString() : "recent"}</span>
                    </div>
                  </div>
                  <div style={{display: "flex", gap: 8}}>
                    <button 
                      onClick={handleSyncInstagram} 
                      disabled={syncingState || intelLoading} 
                      style={S.btn("var(--accent-color)", false)}
                    >
                      {syncingState ? "Syncing..." : "⚡ Sync & Analyze"}
                    </button>
                    <button 
                      onClick={handleInstagramDisconnectClick} 
                      disabled={igLoading} 
                      style={{...S.btn("#e02424", false), background: "none", border: "1px solid #fbd5d5", color: "#e02424"}}
                    >
                      Disconnect
                    </button>
                  </div>
                </div>

                {intelLoading || syncingState ? (
                  <div style={{textAlign: "center", padding: "80px 20px", color: "var(--text-secondary)"}}>
                    <div style={{fontSize: 32, marginBottom: 12, animation: "bounce-cinematic 2s infinite ease-in-out"}}>✨</div>
                    <h4 style={{fontWeight: 500}}>Compiling Creator Analytics...</h4>
                    <p style={{fontSize: 12, color: "var(--text-muted)", marginTop: 4}}>Fetching recent media, building hook database, and running AI recommendations engine.</p>
                  </div>
                ) : !intelligence ? (
                  <div className="empty-state-card" style={{padding: "60px 20px"}}>
                    <div style={{fontSize: 32, marginBottom: 12, opacity: 0.4}}>📊</div>
                    <h3 style={{fontWeight: 500, fontSize: 16, color: "var(--text-primary)"}}>No snapshot cache compiled yet</h3>
                    <p style={{fontSize: 13, color: "var(--text-secondary)", margin: "6px auto 16px", maxWidth: 360}}>Run your initial channel synchronization to parse content cadence, pillars, and opportunities.</p>
                    <button onClick={handleSyncInstagram} style={S.btn("var(--accent-color)")}>⚡ Sync Instagram Channel</button>
                  </div>
                ) : (
                  <div>
                    {/* Primary double-pane dashboard metrics */}
                    <div className="pane-trends" style={{marginBottom: 20}}>
                      
                      {/* Left: Overall Health & Opportunities */}
                      <div>
                        {/* Health Score Card */}
                        <div className="kpi-card-gradient" style={{...S.card, padding: 20}}>
                          <span style={{...S.label, color: "#FFFFFF"}}>Creator Health Index</span>
                          <div style={{display: "flex", alignItems: "center", gap: 20, margin: "14px 0"}}>
                            <div style={{
                              width: 74, 
                              height: 74, 
                              borderRadius: "50%", 
                              border: "4px solid rgba(255, 255, 255, 0.3)", 
                              borderTopColor: "#FFFFFF", 
                              display: "flex", 
                              alignItems: "center", 
                              justifyContent: "center",
                              fontSize: 22,
                              fontWeight: 600,
                              color: "#FFFFFF"
                            }}>
                              {intelligence.creatorHealthScore || 0}
                            </div>
                            <div>
                              <h4 style={{fontSize: 14, fontWeight: 600, color: "#FFFFFF"}}>Stable Growth Index</h4>
                              <p style={{fontSize: 11, color: "rgba(255, 255, 255, 0.85)", marginTop: 2}}>Based on calculated posting gaps, format variety, and hook engagement stability.</p>
                            </div>
                          </div>
                          <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, borderTop: "1px solid rgba(255, 255, 255, 0.15)", paddingTop: 12, fontSize: 12}}>
                            <div>
                              <span style={{color: "rgba(255, 255, 255, 0.85)", display: "block"}}>Consistency</span>
                              <strong style={{color: "#FFFFFF"}}>{intelligence.consistencyScore || 0} / 100</strong>
                            </div>
                            <div>
                              <span style={{color: "rgba(255, 255, 255, 0.85)", display: "block"}}>Format Mix</span>
                              <strong style={{color: "#FFFFFF"}}>Reels {intelligence.contentDistribution?.reelsPercentage || 0}%</strong>
                            </div>
                          </div>
                        </div>

                        {/* Opportunity Engine Warnings */}
                        <div style={{...S.card, padding: 20}}>
                          <span style={S.label}>Opportunity Engine Findings</span>
                          <div style={{display: "flex", flexDirection: "column", gap: 10, marginTop: 12}}>
                            {intelligence.opportunities && intelligence.opportunities.map((opp, idx) => (
                              <div key={idx} className="opportunity-card" style={{
                                padding: "10px 12px", 
                                borderRadius: 8, 
                                fontSize: 12,
                                display: "flex",
                                gap: 8
                              }}>
                                <span>⚠️</span>
                                <span style={{color: "#5E5300", lineHeight: 1.4, fontWeight: 500}}>{opp}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Visual Content Pillars */}
                        <div style={{...S.card, padding: 20}}>
                          <span style={S.label}>Deterministic Content Pillars (Captions Audit)</span>
                          <div style={{marginTop: 14}}>
                            {Object.entries(intelligence.contentPillars || {}).map(([pillar, pct]) => {
                              const colors = { productivity: "#F13E93", business: "#F891BB", lifestyle: "#F9D0CD", personal: "#FAFFCB" };
                              const col = colors[pillar] || "var(--text-muted)";
                              return (
                                <div key={pillar} style={{marginBottom: 10}}>
                                  <div style={{display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4, textTransform: "capitalize"}}>
                                    <span>{pillar}</span>
                                    <strong>{pct}%</strong>
                                  </div>
                                  <div style={{height: 6, background: "var(--bg-primary)", borderRadius: 3, border: col === "#FAFFCB" ? "1px solid #F13E93" : "none"}}>
                                    <div style={{height: "100%", width: `${pct}%`, background: col, borderRadius: 3}}></div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Right: Cadence, Hooks & Strategy */}
                      <div>
                        {/* Cadence Stats */}
                        <div style={{...S.card, padding: 20}}>
                          <span style={S.label}>Posting Cadence & Velocity</span>
                          <div style={{display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginTop: 12, textAlign: "center"}}>
                            <div style={{background: "var(--bg-primary)", padding: 10, borderRadius: 10, border: "1px solid var(--border-color)"}}>
                              <span style={{fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase"}}>posts / week</span>
                              <div style={{fontSize: 16, fontWeight: 600, marginTop: 4, color: "var(--text-primary)"}}>{intelligence.postingCadence?.postsPerWeek || 0}</div>
                            </div>
                            <div style={{background: "var(--bg-primary)", padding: 10, borderRadius: 10, border: "1px solid var(--border-color)"}}>
                              <span style={{fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase"}}>posts / month</span>
                              <div style={{fontSize: 16, fontWeight: 600, marginTop: 4, color: "var(--text-primary)"}}>{intelligence.postingCadence?.postsPerMonth || 0}</div>
                            </div>
                            <div style={{background: "var(--bg-primary)", padding: 10, borderRadius: 10, border: "1px solid var(--border-color)"}}>
                              <span style={{fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase"}}>avg gap (days)</span>
                              <div style={{fontSize: 16, fontWeight: 600, marginTop: 4, color: "var(--text-primary)"}}>{intelligence.postingCadence?.averageGapBetweenPosts || 0}</div>
                            </div>
                          </div>
                        </div>

                        {/* Hook Analysis Database */}
                        <div style={{...S.card, padding: 20}}>
                          <span style={S.label}>Hook Intelligence Database</span>
                          <div style={{marginTop: 12}}>
                            <h5 style={{fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", marginBottom: 6}}>📈 Top Performing Hooks</h5>
                            {intelligence.hookAnalysis?.strongestHooks?.map((h, i) => (
                              <div key={i} style={{fontSize: 12, background: "rgba(168, 200, 160, 0.1)", border: "1px solid rgba(168, 200, 160, 0.3)", borderRadius: 8, padding: "6px 10px", marginBottom: 6, display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                                <span style={{fontStyle: "italic", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginRight: 8}}>"{h.hook}"</span>
                                <span style={{fontSize: 10, fontWeight: 600, color: "var(--text-secondary)"}}>❤️ {h.engagement}</span>
                              </div>
                            ))}
                            <h5 style={{fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", marginTop: 14, marginBottom: 6}}>📉 Lowest Performing Hooks</h5>
                            {intelligence.hookAnalysis?.weakestHooks?.map((h, i) => (
                              <div key={i} style={{fontSize: 12, background: "rgba(240, 160, 144, 0.1)", border: "1px solid rgba(240, 160, 144, 0.2)", borderRadius: 8, padding: "6px 10px", marginBottom: 6, display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                                <span style={{fontStyle: "italic", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginRight: 8}}>"{h.hook}"</span>
                                <span style={{fontSize: 10, fontWeight: 600, color: "var(--text-secondary)"}}>❤️ {h.engagement}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* AI Suggested Hook Improvements */}
                        <div className="ai-panel" style={{...S.card, padding: 20}}>
                          <span style={{...S.label, color: "#F13E93", fontWeight: 600}}>AI Hook Optimization Proposals</span>
                          <div style={{display: "flex", flexDirection: "column", gap: 10, marginTop: 12}}>
                            {intelligence.hookAnalysis?.suggestedHooks?.slice(0, 2).map((hookOpt, idx) => (
                              <div key={idx} style={{background: "#FFFFFF", border: "1px solid #F9D0CD", padding: 10, borderRadius: 10, fontSize: 12}}>
                                <div style={{color: "var(--text-muted)", textDecoration: "line-through", fontSize: 11}}>"{hookOpt.original}"</div>
                                <div style={{color: "#F13E93", fontWeight: 600, margin: "2px 0 4px 0"}}>🎯 "{hookOpt.improved}"</div>
                                <div style={{fontSize: 10, color: "var(--text-secondary)", fontStyle: "italic"}}>{hookOpt.rationale}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* AI Content Ideas & Drafting Panel */}
                    <div className="ai-panel" style={{...S.card, padding: 20}}>
                      <span style={{...S.label, color: "#F13E93", fontWeight: 600}}>AI Creator Strategy Panel</span>
                      
                      <div style={{display: "flex", gap: 6, marginBottom: 14, marginTop: 10, borderBottom: "1px solid var(--border-color)", paddingBottom: 10}}>
                        {["reels", "carousels", "stories"].map((t) => (
                          <button key={t} onClick={() => setIdeaTab(t)} style={{
                            padding: "6px 14px",
                            fontSize: 12,
                            borderRadius: 12,
                            border: "none",
                            background: ideaTab === t ? "#F9D0CD" : "transparent",
                            color: ideaTab === t ? "#F13E93" : "var(--text-muted)",
                            fontWeight: ideaTab === t ? 600 : 400,
                            cursor: "pointer"
                          }}>
                            {t.toUpperCase()} IDEAS
                          </button>
                        ))}
                      </div>

                      <div>
                        {intelligence.contentIdeas?.[ideaTab]?.map((idea, idx) => (
                          <div key={idx} style={{
                            background: "#FFFFFF", 
                            borderRadius: 12, 
                            border: "1px solid #F9D0CD", 
                            padding: 14, 
                            marginBottom: 12,
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            gap: 16
                          }} className="card-in">
                            <div style={{flex: 1, minWidth: 0}}>
                              <h4 style={{fontSize: 13, fontWeight: 600, color: "var(--text-primary)"}}>{idea.title}</h4>
                              <p style={{fontSize: 12, color: "var(--text-secondary)", marginTop: 4, lineHeight: 1.5}}>{idea.concept}</p>
                              {idea.suggestedHook && (
                                <div style={{marginTop: 6, fontSize: 11, fontStyle: "italic", color: "#F13E93", fontWeight: 500}}>
                                  <strong>Visual Hook:</strong> "{idea.suggestedHook}"
                                </div>
                              )}
                            </div>
                            <button 
                              onClick={() => handleAddIdeaToPlanner(idea, ideaTab)} 
                              style={S.btn("var(--accent-color)", true)}
                            >
                              ⚡ Add To Planner
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {tab==="settings"&&(
          <div className="card-in">
            <h2 style={{margin:"0 0 20px",fontSize:18,fontWeight:400,color:"var(--text-primary)"}}>Settings & Creator DNA</h2>
            
            <div style={{display:"grid",gridTemplateColumns:"1fr 2fr",gap:24,alignItems:"start"}} className="responsive-settings-grid">
              
              {/* Scorecard Column */}
              <div style={{
                background:"var(--bg-secondary)",border:"1px solid var(--border-color)",borderRadius:16,padding:20
              }}>
                <h3 style={{fontSize:14,fontWeight:500,margin:"0 0 16px"}}>Completion Scorecard</h3>
                
                {/* Visual percentage score */}
                <div style={{
                  display:"flex",alignItems:"center",gap:16,marginBottom:20,
                  padding:14,borderRadius:12,background:"rgba(241, 62, 147, 0.08)",border:"1px solid var(--border-color)"
                }}>
                  <div style={{
                    fontSize:24,fontWeight:700,color:"var(--accent-color)"
                  }}>{profileStatus.score}%</div>
                  <div style={{fontSize:12,color:"var(--text-secondary)",lineHeight:1.4}}>
                    Creator DNA Completed. Fully fill your profile to unlock custom AI features.
                  </div>
                </div>

                {/* Scorecard Checklist */}
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  {[
                    { key: "niche", label: "Niche" },
                    { key: "goals", label: "Goals" },
                    { key: "audience", label: "Audience" },
                    { key: "formats", label: "Preferred Formats" },
                    { key: "pillars", label: "Content Pillars" },
                    { key: "tone", label: "Tone of Voice" },
                    { key: "challenge", label: "Biggest Challenge" }
                  ].map(item => (
                    <div key={item.key} style={{display:"flex",alignItems:"center",gap:8,fontSize:12}}>
                      <span style={{
                        color: profileStatus.checklist?.[item.key] ? "var(--accent-color)" : "var(--text-muted)",
                        fontWeight: 600
                      }}>
                        {profileStatus.checklist?.[item.key] ? "✓" : "○"}
                      </span>
                      <span style={{
                        color: profileStatus.checklist?.[item.key] ? "var(--text-primary)" : "var(--text-muted)"
                      }}>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Form Column */}
              <div style={{
                background:"var(--bg-secondary)",border:"1px solid var(--border-color)",borderRadius:16,padding:20
              }}>
                <h3 style={{fontSize:14,fontWeight:500,margin:"0 0 16px"}}>Creator DNA Parameters</h3>
                
                <div style={{display:"flex",flexDirection:"column",gap:18}}>
                  {/* Step 1: Primary Niche */}
                  <div>
                    <span style={S.label}>Primary Niche</span>
                    <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:6}}>
                      {["Business", "Marketing", "Fitness", "Travel", "Lifestyle", "Fashion", "Food", "Tech", "Finance", "Education", "Gaming", "Creator Economy", "Other"].map(n => {
                        const active = wizardForm.primaryNiche === n;
                        return (
                          <SelectableChip
                            key={n}
                            selected={active}
                            onClick={() => {
                              const updated = { ...wizardForm, primaryNiche: n };
                              setWizardForm(updated);
                              handleSaveWizardProgress(updated);
                            }}
                          >
                            {n}
                          </SelectableChip>
                        );
                      })}
                    </div>
                  </div>

                  {/* Step 2: Secondary Niches */}
                  <div>
                    <span style={S.label}>Secondary Niches (Multi-select)</span>
                    <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:6}}>
                      {["Business", "Marketing", "Fitness", "Travel", "Lifestyle", "Fashion", "Food", "Tech", "Finance", "Education", "Gaming", "Creator Economy", "Other"].map(n => {
                        const active = wizardForm.secondaryNiches.includes(n);
                        return (
                          <SelectableChip
                            key={n}
                            selected={active}
                            onClick={() => toggleSecondaryNiche(n)}
                          >
                            {n}
                          </SelectableChip>
                        );
                      })}
                    </div>
                  </div>

                  {/* Step 3: Goal */}
                  <div>
                    <span style={S.label}>Primary Goal</span>
                    <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:6}}>
                      {["Grow Followers", "Build Personal Brand", "Generate Leads", "Get Brand Deals", "Sell Products", "Sell Services", "Become Full-Time Creator", "Build Community"].map(g => {
                        const active = wizardForm.primaryGoal === g;
                        return (
                          <SelectableChip
                            key={g}
                            selected={active}
                            onClick={() => {
                              const updated = { ...wizardForm, primaryGoal: g };
                              setWizardForm(updated);
                              handleSaveWizardProgress(updated);
                            }}
                          >
                            {g}
                          </SelectableChip>
                        );
                      })}
                    </div>
                  </div>

                  {/* Step 4: Audience Size */}
                  <div>
                    <span style={S.label}>Audience Size</span>
                    <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:6}}>
                      {["0–1k", "1k–10k", "10k–50k", "50k–100k", "100k+"].map(a => {
                        const active = wizardForm.audienceSize === a;
                        return (
                          <SelectableChip
                            key={a}
                            selected={active}
                            onClick={() => {
                              const updated = { ...wizardForm, audienceSize: a };
                              setWizardForm(updated);
                              handleSaveWizardProgress(updated);
                            }}
                          >
                            {a}
                          </SelectableChip>
                        );
                      })}
                    </div>
                  </div>

                  {/* Step 5: Creator Stage */}
                  <div>
                    <span style={S.label}>Creator Stage</span>
                    <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:6}}>
                      {["Just Starting", "Growing Creator", "Established Creator", "Full-Time Creator", "Agency / Team"].map(s => {
                        const active = wizardForm.creatorStage === s;
                        return (
                          <SelectableChip
                            key={s}
                            selected={active}
                            onClick={() => {
                              const updated = { ...wizardForm, creatorStage: s };
                              setWizardForm(updated);
                              handleSaveWizardProgress(updated);
                            }}
                          >
                            {s}
                          </SelectableChip>
                        );
                      })}
                    </div>
                  </div>

                  {/* Step 6: Posting Frequency */}
                  <div>
                    <span style={S.label}>Posting Frequency</span>
                    <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:6}}>
                      {["Daily", "5x Weekly", "3x Weekly", "Weekly", "Custom"].map(f => {
                        const active = wizardForm.postingFrequency === f;
                        return (
                          <SelectableChip
                            key={f}
                            selected={active}
                            onClick={() => {
                              const updated = { ...wizardForm, postingFrequency: f };
                              setWizardForm(updated);
                              handleSaveWizardProgress(updated);
                            }}
                          >
                            {f}
                          </SelectableChip>
                        );
                      })}
                    </div>
                  </div>

                  {/* Step 7: Preferred Formats */}
                  <div>
                    <span style={S.label}>Preferred Formats (Multi-select)</span>
                    <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:6}}>
                      {["Reels", "Carousels", "Stories", "Long-form Videos", "Mixed"].map(f => {
                        const active = wizardForm.preferredFormats.includes(f);
                        return (
                          <SelectableChip
                            key={f}
                            selected={active}
                            onClick={() => togglePreferredFormat(f)}
                          >
                            {f}
                          </SelectableChip>
                        );
                      })}
                    </div>
                  </div>

                  {/* Step 8: Content Pillars */}
                  <div>
                    <span style={S.label}>Content Pillars (Multi-select, max 5)</span>
                    <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:6}}>
                      {["Education", "Tutorials", "Behind The Scenes", "Personal Stories", "Case Studies", "Industry News", "Motivation", "Product Reviews", "Opinions", "Lifestyle"].map(p => {
                        const active = wizardForm.contentPillars.includes(p);
                        return (
                          <SelectableChip
                            key={p}
                            selected={active}
                            onClick={() => toggleContentPillar(p)}
                          >
                            {p}
                          </SelectableChip>
                        );
                      })}
                    </div>
                  </div>

                  {/* Step 9: Tone of Voice */}
                  <div>
                    <span style={S.label}>Tone of Voice</span>
                    <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:6}}>
                      {["Professional", "Educational", "Friendly", "Humorous", "Bold", "Luxury", "Minimalist", "Inspirational"].map(t => {
                        const active = wizardForm.toneOfVoice === t;
                        return (
                          <SelectableChip
                            key={t}
                            selected={active}
                            onClick={() => {
                              const updated = { ...wizardForm, toneOfVoice: t };
                              setWizardForm(updated);
                              handleSaveWizardProgress(updated);
                            }}
                          >
                            {t}
                          </SelectableChip>
                        );
                      })}
                    </div>
                  </div>

                  {/* Step 10: Biggest Challenge */}
                  <div>
                    <span style={S.label}>Biggest Challenge</span>
                    <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:6}}>
                      {["Running Out Of Ideas", "Consistency", "Hooks", "Editing", "Planning", "Growth", "Brand Deals", "Monetization"].map(c => {
                        const active = wizardForm.biggestChallenge === c;
                        return (
                          <SelectableChip
                            key={c}
                            selected={active}
                            onClick={() => {
                              const updated = { ...wizardForm, biggestChallenge: c };
                              setWizardForm(updated);
                              handleSaveWizardProgress(updated);
                            }}
                          >
                            {c}
                          </SelectableChip>
                        );
                      })}
                    </div>
                  </div>

                  {/* Step 11: AI Assistance Level */}
                  <div>
                    <span style={S.label}>AI Assistance Level</span>
                    <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:6}}>
                      {["Minimal", "Balanced", "Aggressive"].map(l => {
                        const active = wizardForm.aiAssistanceLevel === l;
                        return (
                          <SelectableChip
                            key={l}
                            selected={active}
                            onClick={() => {
                              const updated = { ...wizardForm, aiAssistanceLevel: l };
                              setWizardForm(updated);
                              handleSaveWizardProgress(updated);
                            }}
                          >
                            {l}
                          </SelectableChip>
                        );
                      })}
                    </div>
                  </div>

                  <button 
                    onClick={async () => {
                      try {
                        const saved = await apiSaveProfile(wizardForm);
                        setProfile(saved);
                        const status = await apiGetProfileCompletionStatus();
                        setProfileStatus(status);
                        showToast("Creator DNA Profile updated successfully!");
                      } catch (e) {
                        showToast("Failed to save Creator DNA.", "error");
                      }
                    }} 
                    style={{
                      ...S.btn("var(--accent-color)"),
                      fontWeight: 600,
                      alignSelf: "flex-start",
                      marginTop: 10,
                      minHeight: 44,
                      padding: "10px 24px"
                    }}
                  >
                    Save Creator DNA Settings
                  </button>

                </div>
              </div>

            </div>

            {/* Connected Accounts Section */}
            <div style={{ marginTop: 32, borderTop: "1px solid var(--border-color)", paddingTop: 32 }}>
              <h3 style={{ fontSize: 16, fontWeight: 500, color: "var(--text-primary)", marginBottom: 16 }}>Connected Accounts</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
                {/* Instagram Connection Card */}
                <div>
                  <InstagramConnectionCard
                    connected={!!user?.instagramUsername}
                    profile={user?.instagramUsername ? {
                      username: user.instagramUsername,
                      mediaCount: igMedia ? igMedia.length : 0,
                      avatarUrl: null
                    } : null}
                    lastSync={getFriendlyLastSync()}
                    loading={igLoading}
                    error={igError}
                    syncing={syncingState}
                    syncStep={syncStep}
                    onConnect={handleInstagramConnectClick}
                    onSync={handleSyncInstagram}
                    onDisconnect={handleInstagramDisconnectClick}
                    onViewIntelligence={() => setTab("instagram")}
                  />
                  {!user?.instagramUsername && import.meta.env.DEV && (
                    <div style={{
                      marginTop: "12px",
                      background: "var(--bg-secondary)",
                      borderRadius: "16px",
                      border: "1px dashed var(--border-color)",
                      padding: "16px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px"
                    }}>
                      <div style={{ fontSize: "11px", fontWeight: "600", color: "var(--text-muted)" }}>[DEV ONLY] MANUAL INSTAGRAM CONNECTION</div>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <input
                          type="password"
                          value={igAccessToken}
                          onChange={(e) => setIgAccessToken(e.target.value)}
                          style={{ ...S.input, flex: 1, padding: "8px 12px", fontSize: "12px" }}
                          placeholder="Paste Meta User Access Token (EAAN...) here"
                        />
                        <button
                          onClick={handleConnectInstagram}
                          disabled={igLoading || !igAccessToken.trim()}
                          style={{ ...S.btn("var(--accent-color)", true), padding: "8px 16px", fontSize: "12px", height: "auto", minHeight: "auto", whiteSpace: "nowrap" }}
                        >
                          {igLoading ? "..." : "Link Manual"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Future Connected Accounts Placeholders */}
                <div style={{
                  background: "var(--bg-secondary)",
                  borderRadius: "16px",
                  border: "1px dashed var(--border-color)",
                  padding: "20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  opacity: 0.5
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "12px",
                      background: "var(--border-color)",
                      color: "var(--text-muted)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "20px"
                    }}>🎥</div>
                    <div>
                      <h4 style={{ fontSize: "14px", fontWeight: "600", margin: 0 }}>YouTube Channel</h4>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Coming Soon</span>
                    </div>
                  </div>
                  <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: 0, lineHeight: 1.5 }}>
                    Connect your YouTube channel to analyze shorts cadence, video hooks, and optimize video pacing.
                  </p>
                </div>

                <div style={{
                  background: "var(--bg-secondary)",
                  borderRadius: "16px",
                  border: "1px dashed var(--border-color)",
                  padding: "20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  opacity: 0.5
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "12px",
                      background: "var(--border-color)",
                      color: "var(--text-muted)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "20px"
                    }}>🎵</div>
                    <div>
                      <h4 style={{ fontSize: "14px", fontWeight: "600", margin: 0 }}>TikTok Account</h4>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Coming Soon</span>
                    </div>
                  </div>
                  <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: 0, lineHeight: 1.5 }}>
                    Connect your TikTok profile to track trend velocity, video templates, and sound popularity.
                  </p>
                </div>
              </div>
            </div>

          </div>
        )}


      </div>

            {/* New Extracted Edit Post Modal */}
      {selectedPost && localPost && (
        <PostEditorModal 
          post={localPost}
          vault={vault}
          onSave={async (updatedData) => {
            await updatePost(updatedData.id, updatedData);
            setSelectedPost(null);
          }}
          onClose={() => {
            setSelectedPost(null);
            setLocalPost(null);
          }}
        />
      )}

      {showWizard && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(18, 17, 16, 0.6)",
          backdropFilter: "blur(6px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1100,
          padding: "20px"
        }}>
          <div className="card-in wizard-question-card" style={{
            ...S.card,
            background: "#FFFFFF",
            width: "100%",
            maxWidth: "600px",
            maxHeight: "90vh",
            overflowY: "auto",
            border: "1px solid #F9D0CD",
            boxShadow: "var(--shadow-lg)",
            margin: 0,
            padding: "24px"
          }}>
            {/* Header */}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
              <div>
                <h3 style={{fontSize:16,fontWeight:600,margin:0,color:"var(--text-primary)"}}>Creator DNA Onboarding</h3>
                <span style={{fontSize:11,color:"var(--text-muted)"}}>Step {wizardStep} of 11</span>
              </div>
              <button 
                onClick={handleSkipWizard} 
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 12,
                  color: "var(--text-muted)",
                  fontWeight: 500,
                  textDecoration: "underline",
                  padding: "4px 8px"
                }}
              >
                Skip For Now
              </button>
            </div>

            {/* Visual Step Dot Indicators */}
            <div style={{display:"flex",justifyContent:"center",gap:6,marginBottom:16}}>
              {Array.from({length:11}).map((_,i)=>{
                const stepNum = i + 1;
                const isActive = wizardStep === stepNum;
                const isCompleted = wizardStep > stepNum;
                let dotBg = "var(--border-color)";
                if (isActive) dotBg = "#F13E93";
                else if (isCompleted) dotBg = "#F891BB";
                
                return (
                  <div key={i} style={{
                    width: isActive ? 10 : 8,
                    height: isActive ? 10 : 8,
                    borderRadius: "50%",
                    background: dotBg,
                    transition: "all var(--transition-fast)"
                  }}/>
                );
              })}
            </div>

            {/* Progress bar */}
            <div style={{
              width: "100%",
              height: 4,
              background: "var(--border-color)",
              borderRadius: 2,
              marginBottom: 24,
              overflow: "hidden"
            }}>
              <div style={{
                width: `${(wizardStep / 11) * 100}%`,
                height: "100%",
                background: "#F13E93",
                transition: "width 0.3s ease"
              }}/>
            </div>

            {/* Steps questions content */}
            <div style={{marginBottom: 20}}>
              {wizardStep === 1 && (
                <div>
                  <h4 style={{fontSize:15,fontWeight:500,color:"#555555",marginTop:0,marginBottom:12}}>What type of creator are you? (Primary Niche)</h4>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(130px, 1fr))",gap:8}}>
                    {["Business", "Marketing", "Fitness", "Travel", "Lifestyle", "Fashion", "Food", "Tech", "Finance", "Education", "Gaming", "Creator Economy", "Other"].map(n=>(
                      <SelectableChip data-testid="creator-dna-primary-niche"
                        key={n} 
                        selected={wizardForm.primaryNiche === n}
                        onClick={async () => {
                          const updated = { ...wizardForm, primaryNiche: n };
                          setWizardForm(updated);
                          await handleSaveWizardProgress(updated);
                          setWizardStep(2);
                        }} 
                      >
                        {n}
                      </SelectableChip>
                    ))}
                  </div>
                </div>
              )}

              {wizardStep === 2 && (
                <div>
                  <h4 style={{fontSize:15,fontWeight:500,color:"#555555",marginTop:0,marginBottom:12}}>Select any secondary niches that apply:</h4>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(130px, 1fr))",gap:8}}>
                    {["Business", "Marketing", "Fitness", "Travel", "Lifestyle", "Fashion", "Food", "Tech", "Finance", "Education", "Gaming", "Creator Economy", "Other"].map(n=>(
                      <SelectableChip data-testid="creator-dna-secondary-chip"
                        key={n} 
                        selected={wizardForm.secondaryNiches.includes(n)}
                        onClick={() => toggleSecondaryNiche(n)} 
                      >
                        {n}
                      </SelectableChip>
                    ))}
                  </div>
                </div>
              )}

              {wizardStep === 3 && (
                <div>
                  <h4 style={{fontSize:15,fontWeight:500,color:"#555555",marginTop:0,marginBottom:12}}>What are you trying to achieve? (Primary Goal)</h4>
                  <div style={{display:"flex",flexDirection:"column",gap:8}}>
                    {["Grow Followers", "Build Personal Brand", "Generate Leads", "Get Brand Deals", "Sell Products", "Sell Services", "Become Full-Time Creator", "Build Community"].map(g=>(
                      <SelectableChip 
                        key={g} 
                        selected={wizardForm.primaryGoal === g}
                        onClick={async () => {
                          const updated = { ...wizardForm, primaryGoal: g };
                          setWizardForm(updated);
                          await handleSaveWizardProgress(updated);
                          setWizardStep(4);
                        }} 
                        style={{ width: "100%", justifyContent: "flex-start" }}
                      >
                        {g}
                      </SelectableChip>
                    ))}
                  </div>
                </div>
              )}

              {wizardStep === 4 && (
                <div>
                  <h4 style={{fontSize:15,fontWeight:500,color:"#555555",marginTop:0,marginBottom:12}}>How large is your audience today?</h4>
                  <div style={{display:"flex",flexDirection:"column",gap:8}}>
                    {["0–1k", "1k–10k", "10k–50k", "50k–100k", "100k+"].map(a=>(
                      <SelectableChip data-testid="creator-dna-step"
                        key={a} 
                        selected={wizardForm.audienceSize === a}
                        onClick={async () => {
                          const updated = { ...wizardForm, audienceSize: a };
                          setWizardForm(updated);
                          await handleSaveWizardProgress(updated);
                          setWizardStep(5);
                        }} 
                        style={{ width: "100%", justifyContent: "flex-start" }}
                      >
                        {a}
                      </SelectableChip>
                    ))}
                  </div>
                </div>
              )}

              {wizardStep === 5 && (
                <div>
                  <h4 style={{fontSize:15,fontWeight:500,color:"#555555",marginTop:0,marginBottom:12}}>What stage are you currently in?</h4>
                  <div style={{display:"flex",flexDirection:"column",gap:8}}>
                    {["Just Starting", "Growing Creator", "Established Creator", "Full-Time Creator", "Agency / Team"].map(s=>(
                      <SelectableChip 
                        key={s} 
                        selected={wizardForm.creatorStage === s}
                        onClick={async () => {
                          const updated = { ...wizardForm, creatorStage: s };
                          setWizardForm(updated);
                          await handleSaveWizardProgress(updated);
                          setWizardStep(6);
                        }} 
                        style={{ width: "100%", justifyContent: "flex-start" }}
                      >
                        {s}
                      </SelectableChip>
                    ))}
                  </div>
                </div>
              )}

              {wizardStep === 6 && (
                <div>
                  <h4 style={{fontSize:15,fontWeight:500,color:"#555555",marginTop:0,marginBottom:12}}>How often would you like to post?</h4>
                  <div style={{display:"flex",flexDirection:"column",gap:8}}>
                    {["Daily", "5x Weekly", "3x Weekly", "Weekly", "Custom"].map(f=>(
                      <SelectableChip 
                        key={f} 
                        selected={wizardForm.postingFrequency === f}
                        onClick={async () => {
                          const updated = { ...wizardForm, postingFrequency: f };
                          setWizardForm(updated);
                          await handleSaveWizardProgress(updated);
                          setWizardStep(7);
                        }} 
                        style={{ width: "100%", justifyContent: "flex-start" }}
                      >
                        {f}
                      </SelectableChip>
                    ))}
                  </div>
                </div>
              )}

              {wizardStep === 7 && (
                <div>
                  <h4 style={{fontSize:15,fontWeight:500,color:"#555555",marginTop:0,marginBottom:12}}>Which content formats do you want to focus on? (Preferred Formats)</h4>
                  <div style={{display:"flex",flexDirection:"column",gap:8}}>
                    {["Reels", "Carousels", "Stories", "Long-form Videos", "Mixed"].map(f=>(
                      <SelectableChip 
                        key={f} 
                        selected={wizardForm.preferredFormats.includes(f)}
                        onClick={() => togglePreferredFormat(f)} 
                        style={{ width: "100%", justifyContent: "flex-start" }}
                      >
                        {f}
                      </SelectableChip>
                    ))}
                  </div>
                </div>
              )}

              {wizardStep === 8 && (
                <div>
                  <h4 style={{fontSize:15,fontWeight:500,color:"#555555",marginTop:0,marginBottom:12}}>What topics do you create content about? (Content Pillars, max 5)</h4>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(140px, 1fr))",gap:8}}>
                    {["Education", "Tutorials", "Behind The Scenes", "Personal Stories", "Case Studies", "Industry News", "Motivation", "Product Reviews", "Opinions", "Lifestyle"].map(p=>(
                      <SelectableChip 
                        key={p} 
                        selected={wizardForm.contentPillars.includes(p)}
                        onClick={() => toggleContentPillar(p)} 
                      >
                        {p}
                      </SelectableChip>
                    ))}
                  </div>
                </div>
              )}

              {wizardStep === 9 && (
                <div>
                  <h4 style={{fontSize:15,fontWeight:500,color:"#555555",marginTop:0,marginBottom:12}}>How do you want your content to sound? (Tone of Voice)</h4>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(130px, 1fr))",gap:8}}>
                    {["Professional", "Educational", "Friendly", "Humorous", "Bold", "Luxury", "Minimalist", "Inspirational"].map(t=>(
                      <SelectableChip 
                        key={t} 
                        selected={wizardForm.toneOfVoice === t}
                        onClick={async () => {
                          const updated = { ...wizardForm, toneOfVoice: t };
                          setWizardForm(updated);
                          await handleSaveWizardProgress(updated);
                          setWizardStep(10);
                        }} 
                      >
                        {t}
                      </SelectableChip>
                    ))}
                  </div>
                </div>
              )}

              {wizardStep === 10 && (
                <div>
                  <h4 style={{fontSize:15,fontWeight:500,color:"#555555",marginTop:0,marginBottom:12}}>What is your biggest struggle right now?</h4>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(140px, 1fr))",gap:8}}>
                    {["Running Out Of Ideas", "Consistency", "Hooks", "Editing", "Planning", "Growth", "Brand Deals", "Monetization"].map(c=>(
                      <SelectableChip 
                        key={c} 
                        selected={wizardForm.biggestChallenge === c}
                        onClick={async () => {
                          const updated = { ...wizardForm, biggestChallenge: c };
                          setWizardForm(updated);
                          await handleSaveWizardProgress(updated);
                          setWizardStep(11);
                        }} 
                      >
                        {c}
                      </SelectableChip>
                    ))}
                  </div>
                </div>
              )}

              {wizardStep === 11 && (
                <div>
                  <h4 style={{fontSize:15,fontWeight:500,color:"#555555",marginTop:0,marginBottom:12}}>How much AI assistance would you like?</h4>
                  <div style={{display:"flex",flexDirection:"column",gap:12}}>
                    {[
                      { key: "Minimal", desc: "Suggestions only — simple hints and ideas." },
                      { key: "Balanced", desc: "Suggestions + drafts — helper copy and complete draft captions." },
                      { key: "Aggressive", desc: "Full automation — complete content plans, full drafts, and advanced hooks." }
                    ].map(l => {
                      const isSelected = wizardForm.aiAssistanceLevel === l.key;
                      return (
                        <SelectableChip 
                          key={l.key} 
                          selected={isSelected}
                          onClick={async () => {
                            const updated = { ...wizardForm, aiAssistanceLevel: l.key };
                            setWizardForm(updated);
                            await handleSaveWizardProgress(updated);
                            
                            // Complete Onboarding!
                            setShowWizard(false);
                            showToast("🎉 Creator DNA onboarding completed!");
                          }} 
                          style={{
                            minHeight: 54,
                            display: "flex",
                            flexDirection: "column",
                            gap: 4,
                            alignItems: "flex-start",
                            width: "100%"
                          }}
                        >
                          <strong style={{fontSize: 13, color: isSelected ? "#FFFFFF" : "var(--text-primary)"}}>{l.key} Assistance</strong>
                          <span style={{fontSize: 11, color: isSelected ? "rgba(255,255,255,0.8)" : "var(--text-muted)"}}>{l.desc}</span>
                        </SelectableChip>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Navigation footer */}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",borderTop:"1px solid var(--border-color)",paddingTop:16}}>
              <button data-testid="creator-dna-back" 
                disabled={wizardStep === 1}
                onClick={() => setWizardStep(prev => prev - 1)}
                style={{
                  ...S.btn("var(--text-muted)", true),
                  opacity: wizardStep === 1 ? 0.3 : 1,
                  cursor: wizardStep === 1 ? "not-allowed" : "pointer",
                  minHeight: 44
                }}
              >
                ← Back
              </button>
              
              <div style={{display:"flex",gap:8}}>
                <button data-test-id="creator-dna-skip" data-testid="creator-dna-skip" 
                  onClick={handleSkipWizard} 
                  style={{...S.btn("var(--text-muted)", true), minHeight: 44}}
                >
                  Skip For Now
                </button>
                <button data-testid="creator-dna-next" 
                  disabled={wizardStep === 11}
                  onClick={() => setWizardStep(prev => prev + 1)}
                  style={{
                    ...S.btn("var(--accent-color)", true),
                    opacity: wizardStep === 11 ? 0.3 : 1,
                    cursor: wizardStep === 11 ? "not-allowed" : "pointer",
                    minHeight: 44
                  }}
                >
                  Next →
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {showIgDisconnectModal && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(18, 17, 16, 0.4)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "20px"
        }} onClick={() => setShowIgDisconnectModal(false)}>
          <div style={{
            background: "var(--bg-secondary)",
            border: "1px solid var(--border-color)",
            borderRadius: "16px",
            padding: "24px",
            maxWidth: "400px",
            width: "100%",
            boxShadow: "var(--shadow-lg)",
            display: "flex",
            flexDirection: "column",
            gap: "16px"
          }} onClick={e => e.stopPropagation()} data-test-id="ig-disconnect-modal">
            <h4 style={{ fontSize: "16px", fontWeight: "600", color: "var(--text-primary)", margin: 0 }}>Disconnect Instagram?</h4>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: 0, lineHeight: 1.5 }}>
              This will remove your Instagram access token and disconnect your account. You will lose access to content pillars and AI-generated hook strategy until re-connected.
            </p>
            <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
              <button
                onClick={() => setShowIgDisconnectModal(false)}
                style={{
                  flex: 1,
                  minHeight: "44px",
                  borderRadius: "22px",
                  border: "1px solid var(--border-color)",
                  background: "transparent",
                  color: "var(--text-secondary)",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontFamily: "inherit"
                }}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setShowIgDisconnectModal(false);
                  await handleInstagramDisconnectConfirm();
                }}
                style={{
                  flex: 1,
                  minHeight: "44px",
                  borderRadius: "22px",
                  border: "none",
                  background: "#f0a090",
                  color: "#FFFFFF",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontFamily: "inherit"
                }}
                data-test-id="ig-confirm-disconnect-btn"
              >
                Disconnect
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <SaveToast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
