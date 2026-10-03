#!/usr/bin/env node
// Deterministic privacy gate for the staged set; run by timesheet-committer before every commit.
// Usage: node scripts/precommit-check.mjs              inspect `git diff --cached` (exit 1 = block)
//        node scripts/precommit-check.mjs --self-test  exercise every rule on synthetic samples, no git
// Heuristic only: it cannot recognise personal data in prose, so the staged diff is still read by a person/agent.
import { execFileSync } from 'node:child_process';

const MAX_BYTES = 5 * 1024 * 1024;
const TEMPLATE = 'reference/inputs/Timesheet_Rev8_2026.xlsx';
const SYNTHETIC_MEDIA = ['reference/fixtures/', 'reference/examples/'];
const SYNTHETIC_SHEETS = ['reference/fixtures/', 'reference/examples/'];
const SOURCE_EXTENSIONS = /\.(?:ts|tsx|js|mjs|md|sql|css|html)$/;
const ALLOWED_DOMAINS = /(?:^|\.)example\.(?:com|org|net)$|\.(?:test|invalid|example)$|^localhost$/i;
const PLACEHOLDER = /^(?:<.*>|\$\{.*\}|\$\w+|%.*%|\{\{.*\}\}|[x*.#-]{3,}|process\.env.*)$|changeme|placeholder|example|dummy|fake|synthetic|redacted|your[_-]|^(?:null|none|undefined|string|test|secret|password|token)$/i;

const SECRET_NAME = String.raw`[\w.-]*(?:password|passwd|pwd|secret|token|api[_-]?key|smtp[_-]?(?:user(?:name)?|pass(?:word)?|credentials?))`;
const SECRET_QUOTED = new RegExp(String.raw`(?:^|[^\w])${SECRET_NAME}["']?\s*[:=]\s*(["'])([^\s"']{6,})\1`, 'i');
const SECRET_ENV = new RegExp(String.raw`^\s*(?:export\s+)?${SECRET_NAME}\s*=\s*([^\s"']{6,})\s*$`, 'i');
// Unquoted YAML/INI value: `name: value`, `- name: value`, `name = value`, optional trailing comment.
const SECRET_YAML = new RegExp(String.raw`^\s*(?:-\s+)?${SECRET_NAME}\s*[:=]\s*([\w@%+=/.!$^&*~-]{6,})\s*(?:#.*)?$`, 'i');
// Spaced app-password layout (four groups of four letters/digits, single spaces), as issued by common SMTP
// providers: quoted anywhere after the name, or unquoted up to the end of the line or a trailing comment.
const SPACED = String.raw`[a-z0-9]{4}(?: [a-z0-9]{4}){3}`;
const SECRET_SPACED = new RegExp(String.raw`(?:^|[^\w])${SECRET_NAME}["']?\s*[:=]\s*(?:"(${SPACED})"|'(${SPACED})'|(${SPACED})\s*(?:#.*)?$)`, 'i');
const URL_CREDENTIALS = /\b[a-z][a-z0-9+.-]*:\/\/[^\s:/@]+:([^\s@/]{3,})@[^\s/]+/i;
const PRIVATE_KEY = /-----BEGIN (?:[A-Z0-9]+ )*PRIVATE KEY-----/;
// Exact non-personal address from the mandatory commit-attribution trailer; no domain or wildcard allowance.
const ALLOWED_ADDRESSES = new Set(['noreply@anthropic.com']);
const EMAIL = /[\w.%+-]+@((?:[a-z0-9-]+\.)+[a-z]{2,}|localhost)\b/gi;
// Concrete user-profile paths: C:\Users\name, C:/Users/name, /c/Users/name, /mnt/c/Users/name, /Users/name, /home/name.
const PROFILE_PATHS = [
  /(?:^|[^\w.-])(?:[a-z]:[\\/]+|\/(?:mnt\/)?[a-z]\/)users[\\/]+([^\\/\s"'`,;)]+)/i,
  /(?:^|[^\w.-])\/Users\/([^\\/\s"'`,;)]+)/,
  /(?:^|[^\w.-])\/home\/([^\\/\s"'`,;)]+)/,
];
// Placeholders and shared system accounts are not personal: <user>, %USERNAME%, $USER, ${USER}, {user}, ~, user, public ...
const PROFILE_PLACEHOLDER = /^(?:[<%$[{~*]|(?:user|username|name|you|your[_-]?name|me|public|default|runner|node|app)$)/i;

const RULES = ['env-file', 'data-dir', 'database', 'private-media', 'key-file', 'spreadsheet', 'oversized',
  'private-key', 'secret-assignment', 'url-credentials', 'email', 'profile-path'];

/** Unquoted YAML values need a digit, a symbol or length 12 so that type names and prose are not secrets. */
const looksSecret = (value) => /[\d!@#$%^&*+=/~]/.test(value) || value.length >= 12;

const mask = (value) => `${value.slice(0, 2)}***(${value.length} chars)`;
const finding = (level, rule, detail) => ({ level, rule, detail });
const inside = (lowerPath, prefixes) => prefixes.some((prefix) => lowerPath.startsWith(prefix));

/** Path-level rules; `size` is the staged blob size in bytes. */
function checkPath(path, size) {
  const lower = path.toLowerCase();
  const name = lower.slice(lower.lastIndexOf('/') + 1);
  const block = (rule, detail) => finding('block', rule, detail);
  const found = [];
  if (name.startsWith('.env') && name !== '.env.example') found.push(block('env-file', 'environment file'));
  if (lower.startsWith('data/')) found.push(block('data-dir', 'runtime data directory'));
  if (/\.(?:db|sqlite\d*)(?:-wal|-shm)?$|-wal$|-shm$/.test(name) || name.includes('.sqlite'))
    found.push(block('database', 'database file'));
  const media = /\.(?:pdf|png|jpe?g|gif|webp|bmp|tiff?|heic)$/.test(name) ||
    (lower.includes('signature') && !SOURCE_EXTENSIONS.test(name));
  if (media && !name.includes('synthetic') && !inside(lower, SYNTHETIC_MEDIA))
    found.push(block('private-media', 'PDF, image or signature file (basename must contain "synthetic")'));
  if (/\.(?:pem|key|p12|pfx)$/.test(name)) found.push(block('key-file', 'key or certificate file'));
  if (/\.(?:xls\w*|csv)$/.test(name) && lower !== TEMPLATE.toLowerCase() && !inside(lower, SYNTHETIC_SHEETS))
    found.push(block('spreadsheet', 'spreadsheet or CSV outside the template and synthetic fixtures'));
  if (size > MAX_BYTES) found.push(block('oversized', `${size} bytes exceeds ${MAX_BYTES}`));
  return found;
}

/** Content rules for one added line; secret values are masked in the detail. */
function checkLine(line) {
  const found = [];
  if (PRIVATE_KEY.test(line)) found.push(finding('block', 'private-key', 'private key header'));
  const yamlValue = SECRET_YAML.exec(line)?.[1];
  const spaced = SECRET_SPACED.exec(line);
  const spacedValue = spaced?.[1] ?? spaced?.[2] ?? spaced?.[3];
  // A spaced placeholder such as `xxxx xxxx xxxx xxxx` is judged on its compact form.
  const quoted = SECRET_QUOTED.exec(line)?.[2] ?? SECRET_ENV.exec(line)?.[1] ??
    (yamlValue !== undefined && looksSecret(yamlValue) ? yamlValue : undefined) ??
    (spacedValue !== undefined && !PLACEHOLDER.test(spacedValue.replaceAll(' ', '')) ? spacedValue : undefined);
  if (quoted !== undefined && !PLACEHOLDER.test(quoted))
    found.push(finding('block', 'secret-assignment', `literal secret value ${mask(quoted)}`));
  const urlSecret = URL_CREDENTIALS.exec(line)?.[1];
  if (urlSecret !== undefined && !PLACEHOLDER.test(urlSecret))
    found.push(finding('block', 'url-credentials', `credentials in URL ${mask(urlSecret)}`));
  for (const match of line.matchAll(EMAIL)) {
    if (!ALLOWED_DOMAINS.test(match[1] ?? '') && !ALLOWED_ADDRESSES.has(match[0].toLowerCase())) found.push(finding('block', 'email', `email address ${mask(match[0])}`));
  }
  const account = PROFILE_PATHS.map((pattern) => pattern.exec(line)?.[1]?.replace(/[.:]+$/, '')).find((value) => value !== undefined && !PROFILE_PLACEHOLDER.test(value));
  if (account !== undefined)
    found.push(finding('block', 'profile-path', `concrete user-profile path (account ${mask(account)}); replace it with <user>`));
  return found;
}

function git(root, args) {
  return execFileSync('git', args, { cwd: root, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
}

function stagedFiles(root) {
  const parts = git(root, ['diff', '--cached', '--name-status', '-z', '--no-renames']).split('\0');
  const files = [];
  for (let index = 0; index + 1 < parts.length; index += 2) files.push({ status: parts[index] ?? '', path: parts[index + 1] ?? '' });
  return files;
}

function stagedSize(root, path) {
  try {
    return execFileSync('git', ['show', `:${path}`], { cwd: root, maxBuffer: MAX_BYTES + 1 }).length;
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOBUFS') return MAX_BYTES + 1;
    throw error;
  }
}

function addedLines(root, path) {
  const diff = git(root, ['--literal-pathspecs', 'diff', '--cached', '-U0', '--no-color', '--no-ext-diff', '--no-renames', '--', path]);
  const start = diff.indexOf('\n@@');
  if (start < 0) return [];
  return diff.slice(start + 1).split('\n').filter((line) => line.startsWith('+')).map((line) => line.slice(1).replace(/\r$/, ''));
}

function inspectStaged() {
  const root = git('.', ['rev-parse', '--show-toplevel']).trim();
  const results = [];
  const files = stagedFiles(root);
  for (const { status, path } of files) {
    if (status.startsWith('D')) continue;
    results.push(...checkPath(path, stagedSize(root, path)).map((item) => ({ path, ...item })));
    addedLines(root, path).forEach((line, index) => {
      results.push(...checkLine(line).map((item) => ({ path: `${path}:+${index + 1}`, ...item })));
    });
  }
  return { count: files.length, results };
}

function selfTest() {
  const key = '-----BEGIN ' + 'RSA PRIVATE KEY-----';
  const LEAK = 'k9Xq27' + 'MzVb41';
  const SEP = String.fromCharCode(92);
  const ACCOUNT = 'jsmith' + '42';
  // Spaced app-password samples are joined at run time so that this source does not contain the layout.
  const groups = (...parts) => parts.join(' ');
  const SPACED_LEAK = groups('qwer', 'tyui', 'opas', 'dfgh');
  const SPACED_MIXED = groups('Ab12', 'cd34', 'EF56', 'gh78');
  const SPACED_X = groups('xxxx', 'xxxx', 'xxxx', 'xxxx');
  const assign = (name, value) => `${name} = "${value}"`;
  const mail = (user, domain) => `contact ${user}@${domain}`;
  const pathCases = [
    ['.env', 1, 'env-file'], ['config/.env.local', 1, 'env-file'], ['.env.example', 1, null],
    ['data/timesheet.sqlite', 1, 'data-dir'], ['app.db', 1, 'database'], ['x.sqlite3', 1, 'database'],
    ['x.db-wal', 1, 'database'], ['x.sqlite-shm', 1, 'database'],
    ['scan.pdf', 1, 'private-media'], ['photo.PNG', 1, 'private-media'], ['assets/signature.png', 1, 'private-media'],
    ['reference/fixtures/sample.pdf', 1, null], ['reference/examples/sample.png', 1, null],
    ['handoff/delivery/evidence/WP1/ui.jpg', 1, 'private-media'],
    ['handoff/delivery/evidence/WP3/employee-signature.png', 1, 'private-media'],
    ['handoff/delivery/evidence/WP3/timesheet.pdf', 1, 'private-media'],
    ['handoff/delivery/evidence/WP3/Signature.SVG', 1, 'private-media'],
    ['handoff/delivery/evidence/WP1/ui-timesheet-synthetic.jpg', 1, null],
    ['handoff/delivery/evidence/WP3/synthetic-timesheet.pdf', 1, null],
    ['handoff/delivery/evidence/WP3/Synthetic-signature.png', 1, null],
    ['handoff/delivery/evidence/synthetic/employee.pdf', 1, 'private-media'],
    ['src/server/signatureService.ts', 1, null],
    ['cert.pem', 1, 'key-file'], ['id.key', 1, 'key-file'], ['a.p12', 1, 'key-file'], ['a.pfx', 1, 'key-file'],
    ['personal.xlsx', 1, 'spreadsheet'], ['export.csv', 1, 'spreadsheet'], ['old.xls', 1, 'spreadsheet'],
    [TEMPLATE, 1, null], ['reference/fixtures/cases.csv', 1, null], ['reference/examples/x.xlsx', 1, null],
    ['docs/big.txt', MAX_BYTES + 1, 'oversized'], ['docs/ok.txt', MAX_BYTES, null], ['src/index.ts', 10, null],
  ];
  const lineCases = [
    [key, 'private-key'],
    [assign('password', LEAK), 'secret-assignment'], [assign('apiKey', 'abcd1234efgh'), 'secret-assignment'],
    ['{"auth_token": "' + LEAK + '"}', 'secret-assignment'], [`SMTP_PASS=${'s3cr3t' + 'Value9'}`, 'secret-assignment'],
    [assign('smtp_user', 'mailer12345'), 'secret-assignment'],
    ['SMTP_PASSWORD: ' + 'Zq81probe' + 'Kx', 'secret-assignment'], ['api_token: ' + 'Zq81probe' + 'Kx', 'secret-assignment'],
    ['  - smtp_user: mailer12345', 'secret-assignment'], ['smtp_password: ' + 'k9Xq27' + 'MzVb41' + ' # prod', 'secret-assignment'],
    ['db_password=' + 'hunter2' + 'hunter', 'secret-assignment'], ['client_secret: abcdefghijklmnopqrst', 'secret-assignment'],
    ['SMTP_PASSWORD: ${SMTP_PASSWORD}', null], ['password: changeme', null], ['password: string', null],
    ['token: string;', null], ['password: required', null], ['api_key: your_api_key_here', null],
    ['smtp_user: <smtp-user>', null], ['password: abc', null], ['# secret: see the vault', null],
    [assign('password', 'changeme'), null], [assign('token', '<token>'), null], ['SMTP_PASS=${SMTP_PASS}', null],
    ['const token = generateToken();', null], [assign('password', 'two words here'), null],
    ['smtp_password: ' + SPACED_LEAK, 'secret-assignment'], ['  - app_password: ' + SPACED_MIXED + ' # prod', 'secret-assignment'],
    [`SMTP_PASSWORD: "${SPACED_LEAK}"`, 'secret-assignment'], [`smtp_password = '${SPACED_LEAK}'`, 'secret-assignment'],
    [`SMTP_PASS="${SPACED_LEAK}"`, 'secret-assignment'], [`SMTP_PASS=${SPACED_MIXED}`, 'secret-assignment'],
    [`export SMTP_PASSWORD="${SPACED_LEAK}"`, 'secret-assignment'], [`{"smtp_password": "${SPACED_LEAK}"}`, 'secret-assignment'],
    ['smtp_password: see the vault entry', null], ['token: "use the one from the vault"', null],
    [assign('password', 'four word long phrase'), null], [`SMTP_PASSWORD="${SPACED_X}"`, null],
    [assign('password', groups(SPACED_LEAK, 'more')), null], ['smtp_password: ' + SPACED_LEAK + ' and more words', null],
    ['note: ' + SPACED_LEAK, null],
    [`url = "smtps://${'mailer'}:${'p4ssw0rd'}@smtp.provider.net/"`, 'url-credentials'],
    ['url = "smtps://mailer:<password>@smtp.provider.net/"', null],
    [mail('jane.doe', 'gmail.com'), 'email'], [mail('boss', 'company.biz'), 'email'],
    ['Co-Authored-By: Claude Sonnet 5.5 <noreply@' + 'anthropic.com>', null], [mail('noreply', 'anthropic.com') + '.evil', 'email'],
    [mail('someone', 'anthropic.com'), 'email'], [mail('noreply', 'other.com'), 'email'],
    [mail('a', 'example.com'), null], [mail('a', 'mail.example.net'), null], [mail('a', 'corp.test'), null],
    [mail('a', 'host.invalid'), null], [mail('a', 'x.example'), null], [mail('a', 'localhost'), null], ['react@19.3.0', null],
    ['path C:' + SEP + 'Users' + SEP + ACCOUNT, 'profile-path'], ['path C:/Users/' + ACCOUNT + '/x', 'profile-path'],
    ['/c/Users/' + ACCOUNT + '/x', 'profile-path'], ['cd /mnt/c/Users/' + ACCOUNT + '/work', 'profile-path'],
    ['"/Users/' + ACCOUNT + '/Library"', 'profile-path'], ['cache=/home/' + ACCOUNT + '/.cache', 'profile-path'],
    ['C:' + SEP + 'Users' + SEP + '<user>' + SEP + 'x', null], ['C:' + SEP + 'Users' + SEP + '%USERNAME%' + SEP + 'x', null],
    ['/c/Users/<user>/x', null], ['/home/$USER/x', null], ['/Users/{user}/x', null], ['/home/${USER}/x', null],
    ['/home/user/x', null], ['C:' + SEP + 'Users' + SEP + 'Public', null], ['fetch(`/users/${id}`)', null],
    ['https://host.test/home/page', null], ['ends a sentence with /home/name.', null], ['const clean = 1;', null],
  ];
  const failures = [];
  const seen = new Set();
  for (const [path, size, expected] of pathCases) {
    const rules = checkPath(path, size).map((item) => item.rule);
    rules.forEach((rule) => seen.add(rule));
    if (expected === null ? rules.length > 0 : !rules.includes(expected)) failures.push(`path ${path}: ${rules}`);
  }
  for (const [line, expected] of lineCases) {
    const result = checkLine(line);
    result.forEach((item) => seen.add(item.rule));
    const rules = result.map((item) => item.rule);
    if (expected === null ? rules.length > 0 : !rules.includes(expected)) failures.push(`line ${mask(line)}: ${rules}`);
    if (result.some((item) => item.rule === 'profile-path' && item.level !== 'block')) failures.push('profile-path must block');
    if (result.some((item) => item.detail.includes(ACCOUNT))) failures.push(`unmasked account for ${mask(line)}`);
    if (result.some((item) => [LEAK, SPACED_LEAK, SPACED_MIXED].some((value) => item.detail.includes(value))))
      failures.push(`unmasked output for ${mask(line)}`);
  }
  for (const rule of RULES) if (!seen.has(rule)) failures.push(`rule not exercised: ${rule}`);
  console.log(failures.length === 0 ? `PASS self-test: ${pathCases.length} path and ${lineCases.length} line samples, ${RULES.length} rules` : `FAIL self-test\n${failures.join('\n')}`);
  return failures.length === 0 ? 0 : 1;
}

function main() {
  if (process.argv.includes('--self-test')) return selfTest();
  const { count, results } = inspectStaged();
  for (const item of results) console.log(`${item.level.toUpperCase()} ${item.rule} ${item.path} ${item.detail}`);
  const blocks = results.filter((item) => item.level === 'block').length;
  console.log(`${blocks === 0 ? 'PASS' : 'BLOCK'}: ${count} staged file(s), ${blocks} blocking finding(s), ${results.length - blocks} warning(s)`);
  return blocks === 0 ? 0 : 1;
}

process.exitCode = main();
