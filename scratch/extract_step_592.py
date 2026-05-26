import json
import sys
import re

log_path = r"C:\Users\HI10148\.gemini\antigravity\brain\d27dbdd4-3afb-43c3-89ac-dcc09881d605\.system_generated\logs\transcript.jsonl"

try:
    with open(log_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    print(f"Read {len(lines)} lines from transcript.jsonl")
    
    for idx in range(len(lines)):
        step = json.loads(lines[idx])
        step_idx = step.get('step_index')
        if 590 <= step_idx <= 595:
            print(f"\nStep {step_idx}: type={step.get('type')}, source={step.get('source')}, keys={list(step.keys())}")
            # Check content length
            content = step.get('content', '')
            print(f"  content length: {len(content)}")
            # Check if export default function App is in content
            if 'export default function App' in content:
                print("  Found App.jsx in content!")
                # Let's save it
                clean_lines = []
                raw_lines = content.split('\n')
                for rl in raw_lines:
                    # Match line prefix of format "1: ..." or "  1: ..."
                    m = re.match(r'^\s*\d+:\s*(.*)', rl)
                    if m:
                        clean_lines.append(m.group(1))
                    else:
                        if 'File Path:' in rl or 'Total Lines:' in rl or 'Showing lines' in rl or '```' in rl:
                            continue
                        clean_lines.append(rl)
                code = '\n'.join(clean_lines)
                with open('scratch/App_step_592.jsx', 'w', encoding='utf-8') as out:
                    out.write(code)
                print("  Saved to scratch/App_step_592.jsx")
                sys.exit(0)
except Exception as e:
    print("Error:", e)
