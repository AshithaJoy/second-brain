const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

// Rename createNewPost to createPost
code = code.replace(/const createNewPost = /g, 'const createPost = ');
code = code.replace(/createNewPost\(/g, 'createPost(');

// Replace apiCreatePost usage outside of createPost
// Line 669 context: handleAddIdeaToPlanner
code = code.replace(
  /const newPost = await apiCreatePost\(payload\);\n\s*setPosts\(prev => \[\.\.\.prev, newPost\]\);/g,
  'const newPost = await createPost(payload);'
);

// Line 1198 context: handleRecreateTrend
code = code.replace(
  /const newPost = await apiCreatePost\(\{\n\s*title: `Recreate: \$\{trend\.title\}`,\n\s*date: todayStr,\n\s*type: "reel",\n\s*status: "draft",\n\s*mood: "cinematic",\n\s*caption: `--- PACING STRUCTURE ---\\nHook: \$\{trend\.hook\}\\nAction Plan: \$\{trend\.keyTakeaway\}\\nWhy It Worked: \$\{trend\.whyItWorked\}`,\n\s*hashtags: trend\.visualTags\.map\(t => `#\$\{t\}`\)\.join\(" "\),\n\s*shootId: null\n\s*\}\);\n\s*setPosts\(prev => \[\.\.\.prev, newPost\]\);/g,
  'const newPost = await createPost({\n        title: `Recreate: ${trend.title}`,\n        type: "reel",\n        status: "draft",\n        mood: "cinematic",\n        caption: `--- PACING STRUCTURE ---\\nHook: ${trend.hook}\\nAction Plan: ${trend.keyTakeaway}\\nWhy It Worked: ${trend.whyItWorked}`,\n        hashtags: trend.visualTags.map(t => `#${t}`).join(" ")\n      });'
);

fs.writeFileSync('src/App.jsx', code);
console.log('App.jsx refactored to unify createPost calls.');
