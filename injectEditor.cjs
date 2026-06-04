const fs = require('fs');
const file = 'C:/Users/HI10148/.gemini/antigravity/scratch/second-brain/src/App.jsx';
let content = fs.readFileSync(file, 'utf8');

// Import
if (!content.includes('import { PostEditorModal }')) {
  content = content.replace(
    'import { BRollVault } from "./components/broll/BRollVault";',
    'import { BRollVault } from "./components/broll/BRollVault";\nimport { PostEditorModal } from "./components/planner/PostEditorModal";'
  );
}

const lines = content.split('\n');
const start = lines.findIndex(l => l.includes('Relocated Edit Post Modal'));

if (start !== -1) {
  let bracketCount = 0;
  let started = false;
  let end = -1;
  for (let i = start + 1; i < lines.length; i++) {
    if (lines[i].includes('(')) bracketCount += (lines[i].match(/\(/g) || []).length;
    if (lines[i].includes(')')) bracketCount -= (lines[i].match(/\)/g) || []).length;
    
    if (lines[i].includes('selectedPost&&localPost&&(')) {
      started = true;
    }

    if (started && bracketCount === 0) {
      end = i;
      break;
    }
  }

  if (end !== -1) {
    const replacement = `      {/* New Extracted Edit Post Modal */}
      {selectedPost && localPost && (
        <PostEditorModal 
          post={localPost}
          vault={brollVault}
          onSave={async (updatedData) => {
            await updatePost(updatedData.id, updatedData);
            setSelectedPost(null);
          }}
          onClose={() => {
            setSelectedPost(null);
            setLocalPost(null);
          }}
        />
      )}`;
    
    lines.splice(start, end - start + 1, replacement);
    fs.writeFileSync(file, lines.join('\n'));
    console.log("Successfully replaced modal!");
  } else {
    console.log("Could not find end of modal.", start, started, bracketCount);
  }
} else {
  console.log("Could not find modal start.");
}
