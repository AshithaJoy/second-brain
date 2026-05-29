const fs = require('fs');
const path = require('path');

// Playwright generates a JSON report in `test-results` when the `--reporter=json` option is used.
// By default Playwright includes a JSON report if `outputFile` is configured. We'll read the latest JSON file.
const resultsDir = path.resolve(__dirname, '..', 'test-results');

function getLatestJsonReport() {
  if (!fs.existsSync(resultsDir)) return null;
  const files = fs.readdirSync(resultsDir)
    .filter(f => f.endsWith('.json'))
    .map(f => ({ name: f, time: fs.statSync(path.join(resultsDir, f)).mtime }))
    .sort((a, b) => b.time - a.time);
  return files.length ? path.join(resultsDir, files[0].name) : null;
}

function generateMarkdown(reportPath) {
  const data = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
  const { suites, stats } = data;

  const total = stats?.expected ?? 0;
  const passed = stats?.passed ?? 0;
  const failed = stats?.failed ?? 0;

  const criticalFailures = [];
  suites.forEach(suite => {
    suite.tests.forEach(test => {
      if (test.status === 'failed') {
        const severity = test.annotations?.find(a => a.type === 'severity')?.description || 'unknown';
        criticalFailures.push({
          title: test.title,
          severity,
          error: test.results?.[0]?.error?.message || 'No error message',
          steps: test.results?.[0]?.steps?.map(s => s.title).join(' → ') || ''
        });
      }
    });
  });

  let md = `# TEST REPORT\n\n`;
  md += `**Summary**\n- Total: ${total}\n- Passed: ${passed}\n- Failed: ${failed}\n\n`;

  if (criticalFailures.length) {
    md += `## Critical / High Severity Failures\n`;
    criticalFailures.forEach((f, i) => {
      md += `### ${i + 1}. ${f.title}\n`;
      md += `- Severity: ${f.severity}\n`;
      md += `- Error: ${f.error}\n`;
      if (f.steps) md += `- Steps: ${f.steps}\n`;
      md += `\n`;
    });
  } else {
    md += `All tests passed. 🎉\n`;
  }

  return md;
}

function main() {
  const reportPath = getLatestJsonReport();
  if (!reportPath) {
    console.error('🚨 No Playwright JSON report found in test-results.');
    process.exit(1);
  }
  const markdown = generateMarkdown(reportPath);
  const outDir = path.resolve(__dirname, '..', 'reports');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);
  const outPath = path.join(outDir, 'TEST_REPORT.md');
  fs.writeFileSync(outPath, markdown, 'utf8');
  console.log(`✅ Test report generated at ${outPath}`);
}

main();
