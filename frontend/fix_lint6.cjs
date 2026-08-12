const fs = require('fs');
const file = 'c:/Users/user/Desktop/EMERGENCY_ECHO/frontend/src/features/workflow/screens/DoctorSessionScreen.jsx';
let content = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');

// Unused refs to delete completely
const refsToDelete = [
  'const videoRef = useRef(null)',
  'const remoteVideoRef = useRef(null)',
  'const streamRef = useRef(null)',
  'const remoteStreamRef = useRef(null)',
  'const pcRef = useRef(null)',
  'const bcRef = useRef(null)',
  'const makingOfferRef = useRef(false)',
  'const ignoreOfferRef = useRef(false)',
  'const callContainerRef = useRef(null)',
  'const callFrameRef = useRef(null)'
];

let lines = content.split('\n');
lines = lines.filter(line => {
  for (const ref of refsToDelete) {
    if (line.includes(ref)) return false;
  }
  return true;
});

// Remove endCall and early useEffect, then append them correctly
let endCallStart = -1, endCallEnd = -1, useEffectStart = -1, useEffectEnd = -1;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('const endCall = useCallback(async () => {')) endCallStart = i;
  if (endCallStart !== -1 && lines[i].includes('}, [sessionKey, isClinician, paidMins, currentUser?.id])')) {
    endCallEnd = i;
    break;
  }
}

let endCallBlock = [];
if (endCallStart !== -1 && endCallEnd !== -1) {
  endCallBlock = lines.slice(endCallStart, endCallEnd + 1);
  lines.splice(endCallStart, endCallEnd - endCallStart + 1);
}

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('useEffect(() => {') && lines[i+1] && lines[i+1].includes("if (secondsLeft === 0 && mode === 'paid') {")) {
    useEffectStart = i;
    useEffectEnd = i + 4; // usually 5 lines total
    break;
  }
}

if (useEffectStart !== -1) {
  lines.splice(useEffectStart, useEffectEnd - useEffectStart + 1);
}

// Now insert endCallBlock right before `const buyMinutes = (mins) => {`
let buyMinutesIdx = lines.findIndex(l => l.includes('const buyMinutes = (mins) => {'));
if (buyMinutesIdx !== -1 && endCallBlock.length > 0) {
  lines.splice(buyMinutesIdx, 0, ...endCallBlock, '', '  useEffect(() => {', "    if (secondsLeft === 0 && mode === 'paid') {", '      endCall()', '    }', '  }, [secondsLeft, mode, endCall])', '');
}

// Fix requestId
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('requestId')) {
    lines[i] = lines[i].replace('requestId', 'sessionKey');
  }
}

fs.writeFileSync(file, lines.join('\r\n'));
console.log('Fixed linting using lines loop 6');
