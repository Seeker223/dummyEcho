const fs = require('fs');
const file = 'c:/Users/user/Desktop/EMERGENCY_ECHO/frontend/src/features/workflow/screens/DoctorSessionScreen.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/const bcRef = useRef\(null\)\n/g, '');
content = content.replace(/const pcRef = useRef\(null\)\n/g, '');
content = content.replace(/const makingOfferRef = useRef\(false\)\n/g, '');
content = content.replace(/const ignoreOfferRef = useRef\(false\)\n/g, '');
content = content.replace(/const callContainerRef = useRef\(null\)\n/g, '');
content = content.replace(/const callFrameRef = useRef\(null\)\n/g, '');
content = content.replace(/roomName=\{\`EmergencyEcho_\$\{requestId \|\| 'Demo'\}\`\}/g, "roomName={`EmergencyEcho_${sessionKey || 'Demo'}`}");

const useEffectToMoveRegex = /  useEffect\(\(\) => \{\n    if \(secondsLeft === 0 && mode === 'paid'\) \{\n      endCall\(\)\n    \}\n  \}, \[secondsLeft, mode\]\)\n\n/g;

content = content.replace(useEffectToMoveRegex, '');

const endCallRegex = /(  const endCall = useCallback\(async \(\) => \{[\s\S]*?  \}, \[sessionKey, isClinician, paidMins, currentUser\?\.id\]\))/;

content = content.replace(endCallRegex, `$1\n\n  useEffect(() => {\n    if (secondsLeft === 0 && mode === 'paid') {\n      endCall()\n    }\n  }, [secondsLeft, mode, endCall])\n\n`);

fs.writeFileSync(file, content);
console.log('Fixed linting order 2');
