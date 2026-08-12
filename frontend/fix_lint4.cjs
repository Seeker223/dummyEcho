const fs = require('fs');
const file = 'c:/Users/user/Desktop/EMERGENCY_ECHO/frontend/src/features/workflow/screens/DoctorSessionScreen.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace("  const pcRef = useRef(null)\n", "");
content = content.replace("  const bcRef = useRef(null)\n", "");
content = content.replace("  const makingOfferRef = useRef(false)\n", "");
content = content.replace("  const ignoreOfferRef = useRef(false)\n", "");
content = content.replace("  const callContainerRef = useRef(null)\n", "");
content = content.replace("  const callFrameRef = useRef(null)\n", "");
content = content.replace("roomName={`EmergencyEcho_${requestId || 'Demo'}`}", "roomName={`EmergencyEcho_${sessionKey || 'Demo'}`}");

// Remove the first useEffect that uses endCall
const useEffectToRemove = `  useEffect(() => {
    if (secondsLeft === 0 && mode === 'paid') {
      endCall()
    }
  }, [secondsLeft, mode])`;

content = content.replace(useEffectToRemove, "");

// Add the useEffect AFTER the endCall declaration
const endCallBlockEnd = `  }, [sessionKey, isClinician, paidMins, currentUser?.id])`;
const useEffectToAdd = `  useEffect(() => {
    if (secondsLeft === 0 && mode === 'paid') {
      endCall()
    }
  }, [secondsLeft, mode, endCall])`;

content = content.replace(endCallBlockEnd, endCallBlockEnd + '\n\n' + useEffectToAdd);

fs.writeFileSync(file, content);
console.log('Fixed linting order 4');
