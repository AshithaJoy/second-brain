import json

log_path = r"C:\Users\HI10148\.gemini\antigravity\brain\d27dbdd4-3afb-43c3-89ac-dcc09881d605\.system_generated\logs\transcript.jsonl"

try:
    with open(log_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    print(f"Read {len(lines)} lines from transcript.jsonl")
    
    # We want to find the last step where App.jsx was modified or written.
    # Let's search backward.
    found = False
    for idx in range(len(lines) - 1, -1, -1):
        step = json.loads(lines[idx])
        # Look for tool calls to write_to_file or replace_file_content for App.jsx
        tool_calls = step.get('tool_calls', [])
        for tc in tool_calls:
            args = tc.get('args', {})
            # Wait, some steps have 'tool_calls' as a string or list
            # Let's inspect the keys
            target = args.get('TargetFile', '') or args.get('AbsolutePath', '')
            if 'App.jsx' in target:
                print(f"Found match at step index {step.get('step_index')}, type: {step.get('type')}")
                # Let's print the first 200 chars of args to verify
                print(str(args)[:200])
except Exception as e:
    print("Error:", e)
