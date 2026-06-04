const axios = require('axios');

async function verify() {
  try {
    const baseURL = 'http://localhost:5000';
    let token;
    
    // Register (ignore error if already exists)
    try {
      await axios.post(`${baseURL}/api/auth/register`, {
        email: 'test4@example.com',
        password: 'password123'
      });
      console.log("Registered successfully.");
    } catch (e) {
      // ignore
    }
    
    // Login
    const loginRes = await axios.post(`${baseURL}/api/auth/login`, {
      email: 'test4@example.com',
      password: 'password123'
    });
    token = loginRes.data.accessToken;
    console.log("Logged in successfully. Token length:", token.length);
    
    const config = { headers: { Authorization: `Bearer ${token}` } };
    
    // 2. Create B-Roll
    const brollRes = await axios.post(`${baseURL}/api/broll`, {
      title: 'Test Attachment B-Roll',
      description: 'Verifying attachment',
      mood: 'cinematic',
      visualTags: [],
      emotionTags: [],
      fileUrl: 'http://res.cloudinary.com/demo/video/upload/sample.mp4',
      thumbnailUrl: 'http://res.cloudinary.com/demo/video/upload/sample.jpg',
      clipType: 'video',
      energy: 'soft'
    }, config);
    
    const brollId = brollRes.data.id;
    console.log("Created B-Roll with ID:", brollId);
    
    // 3. Create Post attached to B-Roll
    const postRes = await axios.post(`${baseURL}/api/planner/posts`, {
      title: 'Test Post with BRoll',
      date: '2026-06-10',
      type: 'REEL',
      status: 'DRAFT',
      mood: 'cinematic',
      caption: 'This post should have a broll attached',
      brollIds: [brollId]
    }, config);
    
    const postId = postRes.data.id;
    console.log("Created Post with ID:", postId);
    
    // 4. Fetch Post to verify persistence
    const fetchRes = await axios.get(`${baseURL}/api/planner/posts/${postId}`, config);
    const fetchedPost = fetchRes.data;
    
    if (fetchedPost.brolls && fetchedPost.brolls.length > 0 && fetchedPost.brolls[0].id === brollId) {
      console.log("SUCCESS: BRoll successfully attached and persisted with Post!");
      console.log("Attached BRoll Title:", fetchedPost.brolls[0].title);
    } else {
      console.error("FAILURE: BRoll was NOT attached or persisted correctly.");
      console.log("Fetched post data:", JSON.stringify(fetchedPost, null, 2));
    }
    
  } catch (err) {
    console.error("Error during verification:", err.response ? err.response.data : err.message);
  }
}

verify();
