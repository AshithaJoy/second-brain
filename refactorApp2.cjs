const fs = require('fs');
const file = 'C:/Users/HI10148/.gemini/antigravity/scratch/second-brain/src/App.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add imports
if (!content.includes('import { BRollVault }')) {
  content = content.replace(
    'import SelectableChip from "./components/SelectableChip";',
    'import SelectableChip from "./components/SelectableChip";\nimport CreatorIntelligenceDashboard from "./components/CreatorIntelligenceDashboard";\nimport { BRollVault } from "./components/broll/BRollVault";\nimport { PostEditorModal } from "./components/planner/PostEditorModal";'
  );
}

// 2. Update Status Enums
content = content.replace(
  'const STATUS_COLORS= {draft:"#F9D0CD",scheduled:"#FAFFCB",posted:"#F891BB",archived:"#b8b8c8"};',
  'const STATUS_COLORS= {DRAFT:"#F9D0CD",REVIEW:"#D0E5F9",APPROVED:"#D0F9D0",SCHEDULED:"#FAFFCB",PUBLISHED:"#F891BB",FAILED:"#FFCCCC",ARCHIVED:"#b8b8c8"};'
);
content = content.replace(
  'const STATUS_TEXT_COLORS = {draft:"#9C1D54",scheduled:"#706000",posted:"#F13E93",archived:"#736F6A"};',
  'const STATUS_TEXT_COLORS = {DRAFT:"#9C1D54",REVIEW:"#1D549C",APPROVED:"#1D9C54",SCHEDULED:"#706000",PUBLISHED:"#F13E93",FAILED:"#9C1D1D",ARCHIVED:"#736F6A"};'
);

content = content.replace(
  '{["draft","scheduled","posted","archived"].map(status=>{',
  '{["DRAFT", "REVIEW", "APPROVED", "SCHEDULED", "PUBLISHED", "FAILED", "ARCHIVED"].map(status=>{'
);
content = content.replace(
  '{status==="posted"?"released into the universe":status}',
  '{status==="PUBLISHED"?"released into the universe":status}'
);
content = content.replace(
  'opacity:status==="archived"?0.5:1',
  'opacity:status==="ARCHIVED"?0.5:1'
);
content = content.replace(
  'label={status==="posted"?"released":status}',
  'label={status==="PUBLISHED"?"released":status}'
);

// 3. Extract BRollVault - I will just replace the inline content.
// `tab === "broll"` -> I will find where `tab === "broll"` starts.
// Wait, looking back at my previous work, `App.jsx` rendered `<BRollVault>` inside `tab === "broll"`.
const brollStartIdx = content.indexOf('{tab === "broll" && (');
if (brollStartIdx !== -1) {
  const innerContentStart = content.indexOf('<div style={{marginBottom:18}}>', brollStartIdx);
  if (innerContentStart !== -1) {
    // Find the end of the `tab === "broll"` block. It ends with: `)}`
    // This is risky, I will replace the block with `<BRollVault vault={vault} setVault={setVault} showToast={showToast} />`
    let bracketCount = 1;
    let endIdx = -1;
    for (let i = brollStartIdx + 22; i < content.length; i++) {
      if (content[i] === '{') bracketCount++;
      if (content[i] === '}') bracketCount--;
      if (bracketCount === 0) {
        // Find the ending `)` for `tab === "broll" && (...)`
        endIdx = content.indexOf(')', i);
        break;
      }
    }
    if (endIdx !== -1) {
      const before = content.substring(0, brollStartIdx);
      const after = content.substring(endIdx + 1);
      content = before + '{tab === "broll" && <BRollVault vault={vault} setVault={setVault} showToast={showToast} />}\n' + after;
    }
  }
}

// 4. Extract PostEditorModal
const modalStartIdx = content.indexOf('{/* Relocated Edit Post Modal');
if (modalStartIdx !== -1) {
  const modalEndStr = '{showWizard && (';
  const modalEndIdx = content.indexOf(modalEndStr, modalStartIdx);
  if (modalEndIdx !== -1) {
    const before = content.substring(0, modalStartIdx);
    const after = content.substring(modalEndIdx);
    content = before + `      {/* New Extracted Edit Post Modal */}
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
      )}\n\n      ` + after;
  }
}

fs.writeFileSync(file, content);
console.log("App.jsx refactored successfully!");
