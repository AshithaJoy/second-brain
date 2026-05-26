import json

log_path = r"C:\Users\HI10148\.gemini\antigravity\brain\d27dbdd4-3afb-43c3-89ac-dcc09881d605\.system_generated\logs\transcript.jsonl"

try:
    with open(log_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    print(f"Read {len(lines)} lines from transcript.jsonl")
    
    for idx in range(len(lines) - 1, -1, -1):
        step = json.loads(lines[idx])
        tool_calls = step.get('tool_calls', [])
        for tc in tool_calls:
            name = tc.get('name', '')
            if 'replace_file_content' in name:
                args = tc.get('args', {})
                target = args.get('TargetFile', '')
                if 'App.jsx' in target:
                    desc = args.get('Description', '')
                    instr = args.get('Instruction', '')
                    print(f"\n--- STEP {step.get('step_index')} ({step.get('type')}) ---")
                    print(f"Description: {desc}")
                    print(f"Instruction: {instr}")
                    # print target content and replacement content
                    target_content = args.get('TargetContent', '')
                    replacement_content = args.get('ReplacementContent', '')
                    print("TargetContent (first 100 chars):", repr(target_content[:100]))
                    print("ReplacementContent (first 100 chars):", repr(replacement_content[:100]))
except Exception as e:
    print("Error:", e)
