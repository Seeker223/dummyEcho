const fs = require('fs');
const file = 'c:/Users/user/Desktop/EMERGENCY_ECHO/frontend/src/features/workflow/screens/DoctorSessionScreen.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Remove unused refs
content = content.replace(/const bcRef = useRef\(null\)\n/g, '');
content = content.replace(/const makingOfferRef = useRef\(false\)\n/g, '');
content = content.replace(/const ignoreOfferRef = useRef\(false\)\n/g, '');
content = content.replace(/const callContainerRef = useRef\(null\)\n/g, '');
content = content.replace(/const callFrameRef = useRef\(null\)\n/g, '');

// 2. Fix endCall position: We need to define endCall before useEffect
const endCallDef = `  const endCall = useCallback(async () => {
    window.clearInterval(intervalRef.current)
    setMode('ended')

    if (sessionKey && sessionKey !== 'demo') {
      try {
        await supabaseAdmin.from('call_queue').update({ status: 'complete' }).eq('id', sessionKey)

        if (isClinician) {
          const payout = paidMins === 10 ? 950 : 450

          if (payout > 0) {
            // Update doctor's wallet
            const { data: walletData } = await supabaseAdmin.from('wallets').select('balance').eq('profile_id', currentUser.id).single()
            if (walletData) {
              await supabaseAdmin.from('wallets').update({ balance: walletData.balance + payout }).eq('profile_id', currentUser.id)
              await supabaseAdmin.from('wallet_transactions').insert({
                user_id: currentUser.id,
                amount: payout,
                type: 'topup',
                status: 'success',
                reference: \`consultation_\${sessionKey}\`,
                metadata: { title: \`Consultation Payout\` }
              })
            }
          }
        }
      } catch (err) {
        console.error('Error ending call', err)
      }
    }
  }, [sessionKey, isClinician, paidMins, currentUser?.id])`;

content = content.replace(endCallDef, '');
content = content.replace(/  useEffect\(\(\) => \{\n    if \(secondsLeft === 0/, endCallDef + '\n\n  useEffect(() => {\n    if (secondsLeft === 0');

content = content.replace(/\[secondsLeft, mode\]\)/, '[secondsLeft, mode, endCall])');

fs.writeFileSync(file, content);
console.log('Fixed linting order');
