import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { Screen, Card, Button, TextField, SelectField } from './ScreenPrimitives'

const Header = styled.div`
  display:flex; align-items:flex-start; justify-content:space-between; gap:14px; margin-bottom:18px;
  @media (max-width:700px){ flex-direction:column; }
`
const Eyebrow = styled.div`
  color:${({theme})=>theme.colors.primary}; font-weight:900; font-size:.78rem; text-transform:uppercase; letter-spacing:.08em;
`
const Title = styled.h1`
  margin:4px 0 5px; font-size:clamp(1.55rem,4vw,2.25rem); line-height:1.05; letter-spacing:-.035em;
`
const Sub = styled.p`
  margin:0; color:${({theme})=>theme.colors.muted}; max-width:760px; line-height:1.5;
`
const TopActions = styled.div`display:flex; gap:8px; flex-wrap:wrap;`
const Ghost = styled.button`
  border:1px solid ${({theme})=>theme.colors.border}; background:${({theme})=>theme.colors.surface}; color:${({theme})=>theme.colors.text};
  border-radius:12px; padding:10px 13px; font-weight:800; cursor:pointer;
`
const Grid = styled.div`
  display:grid; gap:14px; grid-template-columns:repeat(12,minmax(0,1fr));
`
const Panel = styled(Card)`grid-column:span 12; margin:0; cursor:default;`
const Half = styled(Panel)`@media(min-width:900px){grid-column:span 6;}`
const Third = styled(Panel)`@media(min-width:1000px){grid-column:span 4;}`
const Stats = styled.div`display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;@media(max-width:680px){grid-template-columns:repeat(2,minmax(0,1fr));}`
const Stat = styled.div`padding:14px;border:1px solid ${({theme})=>theme.colors.border};border-radius:14px;background:${({theme})=>theme.colors.surfaceAlt};`
const StatValue = styled.div`font-weight:950;font-size:1.45rem;`
const StatLabel = styled.div`margin-top:3px;color:${({theme})=>theme.colors.muted};font-size:.8rem;font-weight:700;`
const PanelHead = styled.div`display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:12px;`
const PanelTitle = styled.h3`margin:0;font-size:1rem;font-weight:950;`
const PanelSub = styled.div`color:${({theme})=>theme.colors.muted};font-size:.82rem;font-weight:650;`
const List = styled.div`display:grid;gap:9px;`
const Row = styled.div`display:flex;align-items:center;justify-content:space-between;gap:12px;padding:11px 12px;border:1px solid ${({theme})=>theme.colors.border};border-radius:12px;background:${({theme})=>theme.colors.surface};`
const RowMain = styled.div`min-width:0;`
const RowTitle = styled.div`font-weight:850;font-size:.9rem;`
const RowSub = styled.div`color:${({theme})=>theme.colors.muted};font-size:.78rem;margin-top:2px;`
const Badge = styled.span`
  flex:0 0 auto; padding:5px 8px; border-radius:999px; font-size:.7rem; font-weight:900;
  background:${({$tone,theme})=>$tone==='green'?(theme.mode==='dark'?'rgba(34,197,94,.15)':'#dcfce7'):$tone==='red'?'rgba(220,38,38,.1)':'rgba(59,130,246,.1)'};
  color:${({$tone})=>$tone==='green'?'#15803d':$tone==='red'?'#b91c1c':'#2563eb'};
`
const Steps = styled.div`display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:14px;@media(max-width:700px){grid-template-columns:repeat(2,1fr);}`
const Step = styled.button`
  border:0;border-bottom:2px solid ${({$active,theme})=>$active?theme.colors.primary:theme.colors.border};background:transparent;padding:8px 4px;color:${({$active,theme})=>$active?theme.colors.primary:theme.colors.muted};font-weight:850;font-size:.76rem;cursor:pointer;
`
const FormGrid = styled.div`display:grid;gap:12px;grid-template-columns:repeat(2,minmax(0,1fr));@media(max-width:700px){grid-template-columns:1fr;}`
const Full = styled.div`grid-column:1/-1;`
const TextArea = styled.textarea`
  width:100%; min-height:110px; resize:vertical; border:1px solid ${({theme})=>theme.colors.border}; border-radius:12px; padding:11px 12px; font:inherit; color:${({theme})=>theme.colors.text}; background:${({theme})=>theme.colors.surface}; outline:none;
  &:focus{border-color:${({theme})=>theme.colors.primary};box-shadow:0 0 0 3px ${({theme})=>theme.colors.glowRed};}
`
const Analytics = styled.div`height:150px;display:flex;align-items:flex-end;gap:10px;padding:12px 4px 0;border-bottom:1px solid ${({theme})=>theme.colors.border};`
const Bar = styled.div`flex:1;min-width:10px;height:${({$h})=>$h}%;background:linear-gradient(180deg,${({theme})=>theme.colors.primary},${({theme})=>theme.colors.primaryDeep});border-radius:7px 7px 0 0;`
const Benefit = styled.div`display:flex;gap:10px;align-items:flex-start;padding:9px 0;border-bottom:1px solid ${({theme})=>theme.colors.border}; &:last-child{border-bottom:0;}`
const Dot = styled.span`width:9px;height:9px;border-radius:50%;background:${({theme})=>theme.colors.primary};margin-top:5px;flex:0 0 auto;`

const programs = [
  ['Emergency Response Network','Rapid-response coordination and referral pathways','Active'],
  ['Health Education Initiative','Community training and prevention programs','Active'],
  ['Maternal Care Support','Partner-supported maternal and newborn care','Upcoming'],
  ['Rural Health Outreach','Extending services to underserved communities','Completed'],
]
const partners = [
  ['HopeCare Hospitals','Healthcare provider · Lagos','Verified'],
  ['Red Cross Nigeria','NGO · Abuja','Verified'],
  ['LifeLine Ambulance','Emergency services · Lagos','Verified'],
  ['MedServe Solutions','Healthcare technology · Lagos','Verified'],
]

export default function PartnershipScreen({ activePage = 'partnership' }) {
  const navigate = useNavigate()
  const [proposalStep, setProposalStep] = useState(0)
  const [query, setQuery] = useState('')
  const filteredPartners = useMemo(() => partners.filter(([name,meta]) => `${name} ${meta}`.toLowerCase().includes(query.toLowerCase())), [query])

  const pageMeta = {
    partnership: ['Partnership Portal','Build trusted healthcare partnerships, programs, referrals, and resource-sharing workflows.'],
    'partnership-programs': ['Partnership Programs','Manage active, upcoming, and completed programs with partner organizations.'],
    'partnership-proposal': ['New Partnership','Create a structured proposal and define goals, resources, and expected impact.'],
    'partnership-directory': ['Partner Directory','Find verified healthcare, emergency-response, nonprofit, and technology partners.'],
    'partnership-analytics': ['Partnership Analytics','Track partners, people impacted, program performance, and growth.'],
    'partnership-agreement': ['Partnership Agreement','Review agreement status, dates, scope, and signed documents.'],
  }
  const [title, subtitle] = pageMeta[activePage] || pageMeta.partnership

  return (
    <Screen>
      <Header>
        <div><Eyebrow>Emergency Echo · Partnerships</Eyebrow><Title>{title}</Title><Sub>{subtitle}</Sub></div>
        <TopActions>
          <Ghost onClick={()=>navigate('/app/partnership-directory')}>Find partners</Ghost>
          <Button style={{width:'auto'}} onClick={()=>navigate('/app/partnership-proposal')}>Propose partnership</Button>
        </TopActions>
      </Header>

      {activePage === 'partnership' && <Grid>
        <Panel>
          <PanelHead><div><PanelTitle>Partner dashboard</PanelTitle><PanelSub>Overview of your partnership activity</PanelSub></div><Badge $tone="green">Verified portal</Badge></PanelHead>
          <Stats><Stat><StatValue>12,458</StatValue><StatLabel>Lives impacted</StatLabel></Stat><Stat><StatValue>24</StatValue><StatLabel>Active programs</StatLabel></Stat><Stat><StatValue>78</StatValue><StatLabel>Connected partners</StatLabel></Stat><Stat><StatValue>4.2 min</StatValue><StatLabel>Avg. response time</StatLabel></Stat></Stats>
        </Panel>
        <Half><PanelHead><div><PanelTitle>Partnership programs</PanelTitle><PanelSub>Current initiatives</PanelSub></div><Ghost onClick={()=>navigate('/app/partnership-programs')}>View all</Ghost></PanelHead><List>{programs.map(([n,s,b])=><Row key={n}><RowMain><RowTitle>{n}</RowTitle><RowSub>{s}</RowSub></RowMain><Badge $tone={b==='Active'?'green':'blue'}>{b}</Badge></Row>)}</List></Half>
        <Half><PanelHead><div><PanelTitle>Trusted partners</PanelTitle><PanelSub>Verified organizations</PanelSub></div><Ghost onClick={()=>navigate('/app/partnership-directory')}>Directory</Ghost></PanelHead><List>{partners.map(([n,s,b])=><Row key={n}><RowMain><RowTitle>{n}</RowTitle><RowSub>{s}</RowSub></RowMain><Badge $tone="green">{b}</Badge></Row>)}</List></Half>
        <Third><PanelHead><PanelTitle>Why partner with us?</PanelTitle></PanelHead>{['Expand impact','Trusted network','Resource sharing','Capacity building','Sustainable impact'].map(x=><Benefit key={x}><Dot/><RowMain><RowTitle>{x}</RowTitle><RowSub>Connect teams and resources around safer emergency care.</RowSub></RowMain></Benefit>)}</Third>
        <Third><PanelHead><PanelTitle>Partnership performance</PanelTitle><Badge $tone="green">This year</Badge></PanelHead><Analytics>{[42,55,48,67,58,79,92].map((h,i)=><Bar key={i} $h={h}/>)}</Analytics><RowSub style={{marginTop:10}}>Partner engagement and impact are trending upward.</RowSub></Third>
        <Third><PanelHead><PanelTitle>Partnership agreement</PanelTitle><Badge $tone="green">Active</Badge></PanelHead><List><Row><RowMain><RowTitle>Agreement ID</RowTitle><RowSub>EE-PPT-2024-001</RowSub></RowMain></Row><Row><RowMain><RowTitle>Start date</RowTitle><RowSub>Jan 15, 2024</RowSub></RowMain></Row><Row><RowMain><RowTitle>Scope</RowTitle><RowSub>Emergency response · Health education · Outreach</RowSub></RowMain></Row></List></Third>
      </Grid>}

      {activePage === 'partnership-programs' && <Grid><Panel><PanelHead><div><PanelTitle>Programs</PanelTitle><PanelSub>Collaborative programs making real impact</PanelSub></div><Button style={{width:'auto'}}>+ New program</Button></PanelHead><List>{programs.map(([n,s,b])=><Row key={n}><RowMain><RowTitle>{n}</RowTitle><RowSub>{s}</RowSub></RowMain><Badge $tone={b==='Active'?'green':'blue'}>{b}</Badge></Row>)}</List></Panel></Grid>}

      {activePage === 'partnership-proposal' && <Grid><Panel><Steps>{['1. Details','2. Goals','3. Resources','4. Review'].map((s,i)=><Step key={s} $active={proposalStep===i} onClick={()=>setProposalStep(i)}>{s}</Step>)}</Steps><FormGrid>{proposalStep===0 && <><label><b>Program name</b><TextField placeholder="Community First Responder Training" /></label><label><b>Program category</b><SelectField defaultValue="training"><option value="training">Training & Capacity Building</option><option value="outreach">Community Outreach</option><option value="response">Emergency Response</option></SelectField></label><label><b>Target community</b><TextField placeholder="Rural communities" /></label><label><b>Expected impact</b><TextField placeholder="5,000 people" /></label><Full><b>Program description</b><TextArea placeholder="Describe the proposed partnership and expected outcomes..." /></Full></>}{proposalStep===1 && <><Full><b>Primary goals</b><TextArea placeholder="Goal 1, goal 2, measurable outcomes..." /></Full></>}{proposalStep===2 && <><label><b>People</b><TextField placeholder="5000" /></label><label><b>Partner resources</b><TextField placeholder="Clinicians, training venues, transport" /></label></>}{proposalStep===3 && <Full><Row><RowMain><RowTitle>Proposal ready for review</RowTitle><RowSub>Check the details before sending it to the partner organization.</RowSub></RowMain><Badge $tone="green">Draft complete</Badge></Row></Full>}</FormGrid><div style={{display:'flex',justifyContent:'flex-end',gap:8,marginTop:14}}>{proposalStep>0&&<Ghost onClick={()=>setProposalStep(s=>s-1)}>Back</Ghost>} {proposalStep<3?<Button style={{width:'auto'}} onClick={()=>setProposalStep(s=>s+1)}>Next step →</Button>:<Button style={{width:'auto'}}>Send proposal</Button>}</div></Panel></Grid>}

      {activePage === 'partnership-directory' && <Grid><Panel><PanelHead><div><PanelTitle>Trusted partner directory</PanelTitle><PanelSub>Verified organizations for safer care</PanelSub></div><Badge $tone="green">48 partners</Badge></PanelHead><TextField placeholder="Search partners..." value={query} onChange={e=>setQuery(e.target.value)} /><div style={{marginTop:12}}><List>{filteredPartners.map(([n,s,b])=><Row key={n}><RowMain><RowTitle>{n}</RowTitle><RowSub>{s}</RowSub></RowMain><Badge $tone="green">{b}</Badge></Row>)}{!filteredPartners.length&&<RowSub style={{padding:'14px 0'}}>No partners match this search.</RowSub>}</List></div></Panel></Grid>}

      {activePage === 'partnership-analytics' && <Grid><Panel><PanelHead><div><PanelTitle>Partnership performance</PanelTitle><PanelSub>Impact and engagement over time</PanelSub></div><SelectField style={{width:'auto'}} defaultValue="year"><option value="year">This year</option><option value="quarter">This quarter</option></SelectField></PanelHead><Analytics>{[45,52,49,61,58,72,70,88,82,91,96,100].map((h,i)=><Bar key={i} $h={h}/>)}</Analytics><Stats style={{marginTop:14}}><Stat><StatValue>48</StatValue><StatLabel>Total partners</StatLabel></Stat><Stat><StatValue>24,856</StatValue><StatLabel>Lives impacted</StatLabel></Stat><Stat><StatValue>156</StatValue><StatLabel>Projects</StatLabel></Stat><Stat><StatValue>32</StatValue><StatLabel>Programs</StatLabel></Stat></Stats></Panel></Grid>}

      {activePage === 'partnership-agreement' && <Grid><Panel><PanelHead><div><PanelTitle>Partnership agreement</PanelTitle><PanelSub>Emergency Echo × HopeCare Hospitals</PanelSub></div><Badge $tone="green">Active</Badge></PanelHead><List><Row><RowMain><RowTitle>Agreement ID</RowTitle><RowSub>EE-PPT-2024-001</RowSub></RowMain></Row><Row><RowMain><RowTitle>Start date</RowTitle><RowSub>Jan 15, 2024</RowSub></RowMain></Row><Row><RowMain><RowTitle>End date</RowTitle><RowSub>Jan 14, 2026</RowSub></RowMain></Row><Row><RowMain><RowTitle>Scope of partnership</RowTitle><RowSub>Emergency response · Health education · Community outreach</RowSub></RowMain></Row><Row><RowMain><RowTitle>Signed document</RowTitle><RowSub>Partnership_Agreement.pdf · Signed Jan 15, 2024</RowSub></RowMain><Badge $tone="green">Signed</Badge></Row></List><div style={{display:'flex',gap:8,marginTop:14}}><Ghost>View agreement</Ghost><Button style={{width:'auto'}}>Renew partnership</Button></div></Panel></Grid>}
    </Screen>
  )
}
