const fs = require('fs');
const file = 'c:/Users/user/Desktop/EMERGENCY_ECHO/frontend/src/features/workflow/screens/DoctorSessionScreen.jsx';
let content = fs.readFileSync(file, 'utf8');

let lines = content.split('\n');

// Find endCall function block
let endCallStart = -1;
let endCallEnd = -1;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('const endCall = useCallback(async () => {')) {
    endCallStart = i;
  }
  if (endCallStart !== -1 && lines[i].includes('}, [sessionKey, isClinician, paidMins, currentUser?.id])')) {
    endCallEnd = i;
    break;
  }
}

if (endCallStart !== -1 && endCallEnd !== -1) {
  const endCallBlock = lines.slice(endCallStart, endCallEnd + 1);
  
  // Remove original endCall
  lines.splice(endCallStart, endCallEnd - endCallStart + 1);
  
  // Find where to insert it: before the first useEffect that uses it
  let insertIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('useEffect(() => {') && lines[i+1] && lines[i+1].includes('if (secondsLeft === 0 && mode === \\'paid\\')')) {
      insertIdx = i;
      break;
    }
  }
  
  if (insertIdx !== -1) {
    // Insert endCall block
    lines.splice(insertIdx, 0, ...endCallBlock, '');
    
    // Now fix the useEffect dependency
    let effectEndIdx = insertIdx + endCallBlock.length + 1; // It shifted down
    for (let i = effectEndIdx; i < effectEndIdx + 10; i++) {
      if (lines[i] && lines[i].includes('}, [secondsLeft, mode])')) {
        lines[i] = lines[i].replace('}, [secondsLeft, mode])', '}, [secondsLeft, mode, endCall])');
        break;
      }
    }
  }
}

// Remove unused refs
const varsToRemove = ['const pcRef', 'const bcRef', 'const makingOfferRef', 'const ignoreOfferRef', 'const callContainerRef', 'const callFrameRef', 'const videoRef', 'const remoteVideoRef', 'const streamRef', 'const remoteStreamRef'];
lines = lines.filter(line => {
  for (const v of varsToRemove) {
    if (line.includes(v)) return false;
  }
  return true;
});

// Fix requestId
lines = lines.map(line => {
  if (line.includes('requestId')) {
    return line.replace('requestId', 'sessionKey');
  }
  return line;
});

fs.writeFileSync(file, lines.join('\n'));
console.log('Fixed linting using lines loop');
