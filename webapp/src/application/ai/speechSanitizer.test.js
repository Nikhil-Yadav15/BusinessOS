import { cleanTextForSpeech } from './speechSanitizer.js';

const testCases = [
  {
    name: 'Bold and Italic asterisks',
    input: 'Hello **John**! Here is *your* status update.',
    expected: 'Hello John! Here is your status update.'
  },
  {
    name: 'Headers with hashtags',
    input: '# Daily Summary\n## Inventory Report\nEverything looks good.',
    expected: 'Daily Summary. Inventory Report. Everything looks good.'
  },
  {
    name: 'List items with dashes and asterisks',
    input: 'Here are the items:\n- Product A\n* Product B\n1. Product C',
    expected: 'Here are the items:. Product A. Product B. Product C'
  },
  {
    name: 'Inline code and backticks',
    input: 'Run `npm run dev` to start the server.',
    expected: 'Run npm run dev to start the server.'
  },
  {
    name: 'Markdown links',
    input: 'Please visit [our website](https://example.com) for details.',
    expected: 'Please visit our website for details.'
  },
  {
    name: 'JSON code block action confirmation',
    input: '```json\n{"_type": "ACTION_CONFIRMATION", "action": "CREATE_INVOICE"}\n```',
    expected: 'Action confirmation required.'
  },
  {
    name: 'General code block',
    input: 'Here is the code:\n```javascript\nconsole.log("hello");\n```\nDone.',
    expected: 'Here is the code:. Code snippet omitted. Done.'
  }
];

console.log('Running Speech Sanitizer Tests...\n');
let passed = 0;

for (const tc of testCases) {
  const output = cleanTextForSpeech(tc.input);
  if (output === tc.expected) {
    console.log(`[PASS] ${tc.name}`);
    passed++;
  } else {
    console.error(`[FAIL] ${tc.name}`);
    console.error(`  Input:    "${tc.input}"`);
    console.error(`  Got:      "${output}"`);
    console.error(`  Expected: "${tc.expected}"\n`);
  }
}

console.log(`\nTests completed: ${passed}/${testCases.length} passed.`);
if (passed !== testCases.length) {
  process.exit(1);
}
