import json

log_path = r"C:\Users\HI10148\.gemini\antigravity\brain\d27dbdd4-3afb-43c3-89ac-dcc09881d605\.system_generated\logs\transcript.jsonl"

try:
    with open(log_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    for idx in range(len(lines)):
        step = json.loads(lines[idx])
        step_idx = step.get('step_index')
        if 500 <= step_idx <= 542:
            tool_calls = step.get('tool_calls', [])
            for tc in tool_calls:
                name = tc.get('name', '')
                args = tc.get('args', {})
                target = args.get('TargetFile', '') or args.get('AbsolutePath', '')
                if 'App.jsx' in target:
                    desc = args.get('Description', '')
                    instr = args.get('Instruction', '')
                    print(f"Step {step_idx}: {name}")
                    print(f"  Description: {desc}")
                    print(f"  Instruction: {instr}")
except Exception as e:
    print("Error:", e)
