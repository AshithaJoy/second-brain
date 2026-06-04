const fs = require('fs');
let app = fs.readFileSync('src/App.jsx', 'utf8');

app = app.replace('import { VaultPicker } from "./components/planner/VaultPicker";', 'import { VaultPicker } from "./components/planner/VaultPicker";\nimport { Dashboard } from "./components/dashboard/Dashboard";');

app = app.replace('const TABS = [\n    ["planner","content planner"],', 'const TABS = [\n    ["dashboard", "dashboard"],\n    ["planner","content planner"],');

app = app.replace('{/* --- MAIN CONTENT AREA --- */}', '{/* --- MAIN CONTENT AREA --- */}\n        {tab === "dashboard" && (<Dashboard posts={posts} brolls={vault} collabs={collabs} setTab={setTab} />)}');

app = app.replace('const [tab,      setTabRaw]    = useState(()=>load(STORAGE.tab,"planner"));', 'const [tab,      setTabRaw]    = useState(()=>load(STORAGE.tab,"dashboard"));');

fs.writeFileSync('src/App.jsx', app);
console.log("Successfully added dashboard to App.jsx");
