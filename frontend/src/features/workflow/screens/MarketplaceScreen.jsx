import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { Screen, Button, Card, TextField, SelectField } from './ScreenPrimitives'

const Header = styled.div`display:flex;align-items:flex-start;justify-content:space-between;gap:14px;margin-bottom:18px;@media(max-width:720px){flex-direction:column;}`
const Eyebrow = styled.div`color:${({theme})=>theme.colors.primary};font-weight:900;font-size:.78rem;text-transform:uppercase;letter-spacing:.08em;`
const Title = styled.h1`margin:4px 0 5px;font-size:clamp(1.55rem,4vw,2.25rem);line-height:1.05;letter-spacing:-.035em;`
const Sub = styled.p`margin:0;color:${({theme})=>theme.colors.muted};line-height:1.5;max-width:760px;`
const Actions = styled.div`display:flex;gap:8px;flex-wrap:wrap;`
const Ghost = styled.button`border:1px solid ${({theme})=>theme.colors.border};background:${({theme})=>theme.colors.surface};color:${({theme})=>theme.colors.text};border-radius:12px;padding:10px 13px;font-weight:800;cursor:pointer;`
const Grid = styled.div`display:grid;gap:14px;grid-template-columns:repeat(12,minmax(0,1fr));`
const Panel = styled(Card)`grid-column:span 12;margin:0;cursor:default;`
const Half = styled(Panel)`@media(min-width:900px){grid-column:span 6;}`
const Third = styled(Panel)`@media(min-width:1000px){grid-column:span 4;}`
const SearchRow = styled.div`display:flex;gap:8px;margin-bottom:12px;@media(max-width:600px){flex-direction:column;}`
const Chips = styled.div`display:flex;gap:7px;overflow:auto;padding-bottom:4px;margin-bottom:14px;`
const Chip = styled.button`border:1px solid ${({$active,theme})=>$active?theme.colors.primary:theme.colors.border};background:${({$active,theme})=>$active?theme.colors.primary:theme.colors.surface};color:${({$active,theme})=>$active?'#fff':theme.colors.text};padding:8px 11px;border-radius:999px;font-weight:800;white-space:nowrap;cursor:pointer;`
const Products = styled.div`display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:12px;`
const Product = styled.article`border:1px solid ${({theme})=>theme.colors.border};border-radius:14px;overflow:hidden;background:${({theme})=>theme.colors.surface};`
const ProductVisual = styled.div`height:125px;display:grid;place-items:center;background:linear-gradient(135deg,rgba(220,38,38,.1),rgba(59,130,246,.05));font-size:3rem;`
const ProductBody = styled.div`padding:13px;`
const Kicker = styled.div`font-size:.7rem;color:${({theme})=>theme.colors.primary};font-weight:900;text-transform:uppercase;letter-spacing:.06em;`
const ProductName = styled.h3`font-size:.95rem;margin:5px 0;`
const ProductDesc = styled.p`font-size:.78rem;line-height:1.4;color:${({theme})=>theme.colors.muted};margin:0 0 10px;`
const ProductFoot = styled.div`display:flex;justify-content:space-between;align-items:center;gap:8px;border-top:1px solid ${({theme})=>theme.colors.border};padding-top:10px;`
const Price = styled.div`font-weight:950;color:${({theme})=>theme.colors.primary};`
const Rating = styled.div`font-size:.75rem;color:#b45309;font-weight:800;`
const Hero = styled.div`padding:22px;border-radius:18px;background:linear-gradient(135deg,#171c27,#303848);color:#fff;min-height:185px;display:flex;align-items:flex-end;justify-content:space-between;gap:20px;overflow:hidden;`
const HeroTitle = styled.div`font-size:clamp(1.4rem,4vw,2rem);font-weight:950;line-height:1.05;max-width:420px;`
const HeroText = styled.div`color:rgba(255,255,255,.75);font-size:.82rem;margin:8px 0 14px;`
const CategoryGrid = styled.div`display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;@media(max-width:720px){grid-template-columns:repeat(2,minmax(0,1fr));}`
const Category = styled.button`text-align:left;border:1px solid ${({theme})=>theme.colors.border};background:${({theme})=>theme.colors.surface};border-radius:14px;padding:14px;cursor:pointer;color:${({theme})=>theme.colors.text};font-weight:900;`
const CatIcon = styled.div`font-size:1.55rem;margin-bottom:8px;`
const List = styled.div`display:grid;gap:9px;`
const Row = styled.div`display:flex;justify-content:space-between;align-items:center;gap:10px;border:1px solid ${({theme})=>theme.colors.border};border-radius:12px;padding:10px 11px;`
const RowTitle = styled.div`font-weight:850;font-size:.86rem;`
const RowSub = styled.div`font-size:.75rem;color:${({theme})=>theme.colors.muted};margin-top:2px;`
const Badge = styled.span`padding:5px 8px;border-radius:999px;background:${({$good})=>$good?'#dcfce7':'rgba(59,130,246,.1)'};color:${({$good})=>'#166534'};font-size:.68rem;font-weight:900;white-space:nowrap;`
const ProductDetail = styled.div`display:grid;gap:18px;grid-template-columns:1fr 1fr;@media(max-width:800px){grid-template-columns:1fr;}`
const DetailVisual = styled.div`min-height:300px;border:1px solid ${({theme})=>theme.colors.border};border-radius:18px;background:linear-gradient(135deg,rgba(220,38,38,.08),rgba(59,130,246,.08));display:grid;place-items:center;font-size:7rem;`
const DetailTitle = styled.h2`margin:0;font-size:1.7rem;`
const DetailPrice = styled.div`font-size:1.45rem;font-weight:950;color:${({theme})=>theme.colors.primary};margin:8px 0;`
const Bullet = styled.li`margin:7px 0;color:${({theme})=>theme.colors.muted};font-size:.88rem;`
const Qty = styled.div`display:flex;align-items:center;gap:10px;margin:14px 0;`
const QtyButton = styled.button`width:36px;height:36px;border-radius:10px;border:1px solid ${({theme})=>theme.colors.border};background:${({theme})=>theme.colors.surface};font-weight:900;cursor:pointer;`

const products = [
  {id:1,name:'Portable Oxygen Concentrator',category:'Medical Equipment',price:'₦450,000',rating:'4.8',emoji:'🫁',vendor:'MedEquip Solutions',desc:'Portable oxygen support for emergency and home-care use.'},
  {id:2,name:'Automatic Defibrillator (AED)',category:'Emergency Supplies',price:'₦950,000',rating:'4.9',emoji:'🫀',vendor:'MedEquip Solutions',desc:'Portable AED designed for rapid emergency response.'},
  {id:3,name:'Digital Blood Pressure Monitor',category:'Medical Equipment',price:'₦25,000',rating:'4.7',emoji:'🩺',vendor:'CareTech Nigeria',desc:'Simple digital monitoring for home and clinic use.'},
  {id:4,name:'Glucometer with Strips',category:'Medical Equipment',price:'₦15,000',rating:'4.6',emoji:'🩸',vendor:'HealthStore Africa',desc:'Compact glucose monitoring kit with starter strips.'},
  {id:5,name:'First Aid Response Kit',category:'Emergency Supplies',price:'₦35,000',rating:'4.8',emoji:'🧰',vendor:'Safety Systems',desc:'Essential supplies for immediate first response.'},
  {id:6,name:'Emergency Response Training',category:'Training & Courses',price:'₦50,000',rating:'4.9',emoji:'🎓',vendor:'Emergency Echo Academy',desc:'Practical training for emergency preparedness and response.'},
]
const categories = [
  ['Medical Equipment','🩺','126 products'],['Emergency Supplies','🧰','84 products'],['Medicines','💊','243 products'],['First Aid','⛑️','76 products'],['Personal Care','🧴','64 products'],['Training & Courses','🎓','52 courses'],['Ambulance Services','🚑','24 providers'],
]

export default function MarketplaceScreen({ activePage='marketplace' }) {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [qty, setQty] = useState(1)
  const [cart, setCart] = useState(0)
  const filtered = useMemo(()=>products.filter(p=>(category==='All'||p.category===category)&&`${p.name} ${p.vendor} ${p.desc}`.toLowerCase().includes(search.toLowerCase())),[search,category])
  const selected = products[1]

  const titleMap = {
    marketplace:['Marketplace','Everything you need for emergency care — products, services, and trusted vendors.'],
    'marketplace-categories':['Product Categories','Browse emergency-care products and services by category.'],
    'marketplace-products':['Product Listing','Compare verified products, ratings, vendors, and prices.'],
    'marketplace-product':['Product Details','Review the selected product and add it to your cart.'],
    'marketplace-vendor':['Vendor Store','Explore products from a verified Emergency Echo marketplace vendor.'],
    'marketplace-checkout':['Checkout','Review delivery, payment, and order details before placing your order.'],
    'marketplace-sell':['Become a Vendor','Apply to sell verified healthcare products and services on Emergency Echo.'],
  }
  const [title, subtitle] = titleMap[activePage] || titleMap.marketplace

  const addCart = () => { setCart(c=>c+qty); navigate('/app/marketplace-checkout') }

  return <Screen>
    <Header><div><Eyebrow>Emergency Echo · Marketplace</Eyebrow><Title>{title}</Title><Sub>{subtitle}</Sub></div><Actions><Ghost onClick={()=>navigate('/app/marketplace-products')}>Browse products</Ghost><Button style={{width:'auto'}} onClick={()=>navigate('/app/marketplace-sell')}>Become a vendor</Button></Actions></Header>

    {activePage==='marketplace' && <Grid>
      <Panel><Hero><div><HeroTitle>Everything You Need For Emergency Care</HeroTitle><HeroText>Quality products. Trusted vendors. Faster access to emergency-care resources.</HeroText><Button style={{width:'auto'}} onClick={()=>navigate('/app/marketplace-products')}>Shop now</Button></div><div style={{fontSize:'5rem'}}>🧰</div></Hero></Panel>
      <Panel><div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}><b>Shop by category</b><Ghost onClick={()=>navigate('/app/marketplace-categories')}>View all</Ghost></div><CategoryGrid>{categories.slice(0,6).map(([n,ic,count])=><Category key={n} onClick={()=>navigate('/app/marketplace-products')}><CatIcon>{ic}</CatIcon>{n}<div style={{fontSize:'.72rem',fontWeight:600,color:'#6b7280',marginTop:4}}>{count}</div></Category>)}</CategoryGrid></Panel>
      <Half><b>Featured products</b><Products style={{marginTop:10}}>{products.slice(0,4).map(p=><Product key={p.id} onClick={()=>navigate('/app/marketplace-product')}><ProductVisual>{p.emoji}</ProductVisual><ProductBody><Kicker>{p.category}</Kicker><ProductName>{p.name}</ProductName><ProductDesc>{p.desc}</ProductDesc><ProductFoot><Price>{p.price}</Price><Rating>★ {p.rating}</Rating></ProductFoot></ProductBody></Product>)}</Products></Half>
      <Half><b>Marketplace benefits</b><List style={{marginTop:10}}>{['Quality assured','Trusted vendors','Secure payments','Fast delivery','Best prices'].map(x=><Row key={x}><div><RowTitle>{x}</RowTitle><RowSub>Designed for a safer healthcare marketplace.</RowSub></div><Badge $good>✓</Badge></Row>)}</List></Half>
    </Grid>}

    {activePage==='marketplace-categories' && <Grid><Panel><CategoryGrid>{categories.map(([n,ic,count])=><Category key={n} onClick={()=>navigate('/app/marketplace-products')}><CatIcon>{ic}</CatIcon>{n}<div style={{fontSize:'.72rem',fontWeight:600,color:'#6b7280',marginTop:4}}>{count}</div></Category>)}</CategoryGrid></Panel></Grid>}

    {activePage==='marketplace-products' && <Grid><Panel><SearchRow><TextField placeholder="Search products, vendors..." value={search} onChange={e=>setSearch(e.target.value)} /><SelectField value={category} onChange={e=>setCategory(e.target.value)} style={{maxWidth:240}}><option>All</option>{categories.map(([n])=><option key={n}>{n}</option>)}</SelectField></SearchRow><Chips>{['All',...categories.map(x=>x[0])].map(c=><Chip key={c} $active={category===c} onClick={()=>setCategory(c)}>{c}</Chip>)}</Chips><Products>{filtered.map(p=><Product key={p.id} onClick={()=>navigate('/app/marketplace-product')}><ProductVisual>{p.emoji}</ProductVisual><ProductBody><Kicker>{p.category}</Kicker><ProductName>{p.name}</ProductName><ProductDesc>{p.desc}</ProductDesc><ProductFoot><Price>{p.price}</Price><Rating>★ {p.rating}</Rating></ProductFoot></ProductBody></Product>)}</Products></Panel></Grid>}

    {activePage==='marketplace-product' && <Grid><Panel><ProductDetail><DetailVisual>{selected.emoji}</DetailVisual><div><Kicker>{selected.category}</Kicker><DetailTitle>{selected.name}</DetailTitle><DetailPrice>{selected.price}</DetailPrice><Rating>★ {selected.rating} · 18 reviews</Rating><p style={{color:'#6b7280',lineHeight:1.5}}>{selected.desc}</p><ul><Bullet>Portable and lightweight</Bullet><Bullet>Emergency-ready design</Bullet><Bullet>Verified marketplace vendor</Bullet><Bullet>Delivery available in supported locations</Bullet></ul><Qty><QtyButton onClick={()=>setQty(Math.max(1,qty-1))}>−</QtyButton><b>{qty}</b><QtyButton onClick={()=>setQty(q=>q+1)}>+</QtyButton></Qty><div style={{display:'flex',gap:8}}><Button style={{width:'auto'}} onClick={addCart}>Add to cart</Button><Ghost onClick={addCart}>Buy now</Ghost></div></div></ProductDetail></Panel></Grid>}

    {activePage==='marketplace-vendor' && <Grid><Panel><PanelHead><div><b style={{fontSize:'1.1rem'}}>MedEquip Solutions</b><div style={{color:'#6b7280',fontSize:'.8rem'}}>Medical equipment · Lagos</div></div><Badge $good>Verified vendor</Badge></PanelHead><div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:14}}>{[['45','Products'],['124','Reviews'],['98%','Positive']].map(([v,l])=><div key={l} style={{padding:12,border:'1px solid #e5e7eb',borderRadius:12}}><b>{v}</b><div style={{fontSize:'.72rem',color:'#6b7280'}}>{l}</div></div>)}</div><Products>{products.slice(0,4).map(p=><Product key={p.id} onClick={()=>navigate('/app/marketplace-product')}><ProductVisual>{p.emoji}</ProductVisual><ProductBody><ProductName>{p.name}</ProductName><ProductFoot><Price>{p.price}</Price><Rating>★ {p.rating}</Rating></ProductFoot></ProductBody></Product>)}</Products></Panel></Grid>}

    {activePage==='marketplace-checkout' && <Grid><Half><PanelHead><b>Delivery information</b><Badge $good>Secure</Badge></PanelHead><List><Row><div><RowTitle>John Doe</RowTitle><RowSub>0800 123 4567 · 12 Adeola Street, Lagos</RowSub></div><Ghost>Change</Ghost></Row></List><div style={{marginTop:14}}><b>Payment method</b><SelectField defaultValue="wallet" style={{marginTop:8}}><option value="wallet">EchoWallet</option><option value="transfer">Bank transfer</option><option value="card">Card</option></SelectField></div></Half><Half><PanelHead><b>Order summary</b><Badge>{cart || 1} item{(cart||1)>1?'s':''}</Badge></PanelHead><List><Row><div><RowTitle>Automatic Defibrillator (AED)</RowTitle><RowSub>Qty {cart || 1}</RowSub></div><b>₦{((cart||1)*950000).toLocaleString()}</b></Row><Row><div><RowTitle>Delivery fee</RowTitle></div><b>₦5,000</b></Row><Row><div><RowTitle>Total</RowTitle></div><Price>₦{((cart||1)*950000+5000).toLocaleString()}</Price></Row></List><Button style={{marginTop:14}}>Place order</Button></Half></Grid>}

    {activePage==='marketplace-sell' && <Grid><Panel><div style={{display:'grid',gap:12,maxWidth:780}}><div><b>Vendor application</b><div style={{fontSize:'.8rem',color:'#6b7280',marginTop:3}}>Tell us about your organization and what you want to sell.</div></div><TextField placeholder="Business / organization name" /><TextField placeholder="Business category" /><TextField placeholder="Contact email" /><TextField placeholder="Phone number" /><TextField placeholder="Products or services you plan to list" /><Button style={{width:'auto'}}>Submit vendor application</Button></div></Panel></Grid>}
  </Screen>
}

const PanelHead = styled.div`display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:12px;`
