const fs = require('fs');
let c = fs.readFileSync('C:/Users/HI10148/.gemini/antigravity/scratch/second-brain/src/App.jsx', 'utf8');

if (!c.includes('const [plannerView, setPlannerView]')) {
  c = c.replace(
    '  // Local Editing & Dirty States\r\n  const [localPost',
    '  // Local Editing & Dirty States\r\n  const [plannerView, setPlannerView] = useState("calendar");\r\n  const [pubHistory, setPubHistory] = useState([]);\r\n  const [historyTab, setHistoryTab] = useState("Scheduled");\r\n\r\n  const [localPost'
  );
  
  c = c.replace(
    '  // Local Editing & Dirty States\n  const [localPost',
    '  // Local Editing & Dirty States\n  const [plannerView, setPlannerView] = useState("calendar");\n  const [pubHistory, setPubHistory] = useState([]);\n  const [historyTab, setHistoryTab] = useState("Scheduled");\n\n  const [localPost'
  );
  fs.writeFileSync('C:/Users/HI10148/.gemini/antigravity/scratch/second-brain/src/App.jsx', c);
  console.log('App.jsx updated!');
} else {
  console.log('Already updated.');
}
