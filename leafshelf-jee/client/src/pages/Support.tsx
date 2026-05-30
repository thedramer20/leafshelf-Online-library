import { useState } from 'react';

interface ContentBlock { type:'intro'|'steps'|'tip'|'note'; heading?:string; text?:string; items?:string[]; }
interface Article { id:number; title:string; desc:string; time:string; content:ContentBlock[]; }
interface Topic { emoji:string; title:string; desc:string; bg:string; text:string; border:string; articles:Article[]; }

const TOPICS: Topic[] = [
  { emoji:'📚', title:'Borrowing & Returns', desc:'How to borrow, renew, and return books', bg:'bg-blue-50', text:'text-blue-700', border:'border-blue-100',
    articles:[
      { id:1, title:'How to borrow a book', desc:'Step-by-step guide to borrowing your first book', time:'2 min', content:[
        { type:'intro', text:'Borrowing a book on LeafShelf is quick and simple. You need a free account and to be signed in.' },
        { type:'steps', heading:'Steps to borrow', items:['Browse or search for the book in Browse Books.','Click the cover to open the book detail page.','Click the green "Borrow Now" button.','The book is instantly added to My Library.','Visit My Library to start reading.'] },
        { type:'tip', text:'If "Borrow Now" is greyed out, all copies are checked out. Try again later or join the waitlist.' },
      ]},
      { id:2, title:'Loan periods and due dates', desc:'Understanding how long you can keep a borrowed book', time:'2 min', content:[
        { type:'intro', text:'Every borrowed book has a loan period — the time you can keep it before it must be returned or renewed.' },
        { type:'steps', heading:'Loan period details', items:['Standard loan period: 14 days from borrow date.','Due date is shown on every book in My Library.','You receive a reminder notification 2 days before the due date.','Overdue books are auto-returned after a 3-day grace period.'] },
        { type:'note', text:'Premium members enjoy a 21-day loan period instead of 14 days.' },
      ]},
      { id:3, title:'How to renew a borrowed book', desc:'Extend your loan without returning the book', time:'1 min', content:[
        { type:'intro', text:'Need more time? Renew any book to extend the loan period by another 14 days.' },
        { type:'steps', heading:'How to renew', items:['Go to My Library.','Find the book you want to renew.','Click the "Renew" button.','Your due date is extended by 14 days.'] },
        { type:'tip', text:'Renewal is unavailable if another user has placed a hold on the same book.' },
      ]},
      { id:4, title:'Returning a book early', desc:'Return a book before the due date', time:'1 min', content:[
        { type:'intro', text:'You can return any borrowed book at any time, even before the due date.' },
        { type:'steps', heading:'How to return', items:['Go to My Library.','Find the book you want to return.','Click "Return".','The book is immediately available for other readers.'] },
        { type:'note', text:'Early returns help other readers access popular books sooner.' },
      ]},
      { id:5, title:'Borrow limits per account', desc:'How many books you can have at once', time:'2 min', content:[
        { type:'intro', text:'LeafShelf enforces borrowing limits to ensure fair access for all readers.' },
        { type:'steps', heading:'Limits by plan', items:['Free accounts: up to 3 books at a time.','Premium accounts: up to 10 books at a time.','If you hit your limit, return a book before borrowing a new one.'] },
        { type:'tip', text:'Upgrade to Premium to increase your borrow limit and enjoy more perks.' },
      ]},
      { id:6, title:'Waitlists and holds', desc:'Queue for a book that is currently checked out', time:'2 min', content:[
        { type:'intro', text:'If a book is checked out, you can join the waitlist. You will be notified as soon as it becomes available.' },
        { type:'steps', heading:'How waitlists work', items:['Visit the detail page for a checked-out book.','Click "Join Waitlist" to hold your place.','You receive a notification when the book is free.','You have 48 hours to borrow it before it moves to the next person.'] },
      ]},
    ]
  },
  { emoji:'👤', title:'Account & Login', desc:'Sign in, registration, and account management', bg:'bg-purple-50', text:'text-purple-700', border:'border-purple-100',
    articles:[
      { id:1, title:'Creating a new account', desc:'Sign up for LeafShelf in under a minute', time:'1 min', content:[
        { type:'intro', text:'Creating a LeafShelf account is free and takes less than a minute.' },
        { type:'steps', heading:'How to register', items:['Click "Sign In" in the sidebar, then "Create an account".','Enter your full name, email, and a strong password.','Click "Create Account".','You are now signed in and ready to borrow.'] },
        { type:'tip', text:'Use a real email address — you will need it to reset your password.' },
      ]},
      { id:2, title:'Signing in to LeafShelf', desc:'How to log into your account', time:'1 min', content:[
        { type:'intro', text:'Sign in with your registered email and password to access your library and borrowed books.' },
        { type:'steps', heading:'How to sign in', items:['Click "Sign In" in the sidebar.','Enter your email and password.','Click "Sign In".','You will be taken to the Discover page.'] },
        { type:'note', text:'Sessions last 60 minutes of inactivity. After that, sign in again.' },
      ]},
      { id:3, title:'Resetting your password', desc:'What to do if you forget your password', time:'2 min', content:[
        { type:'intro', text:'Forgot your password? Reset it quickly through the sign-in page.' },
        { type:'steps', heading:'Password reset steps', items:['Go to the Sign In page.','Click "Forgot password?".','Enter your registered email.','Check your inbox for a reset link.','Click the link and enter a new password.'] },
        { type:'tip', text:'If you do not receive the email within 5 minutes, check your spam folder.' },
      ]},
      { id:4, title:'Updating your profile', desc:'Change your name, email, or bio', time:'1 min', content:[
        { type:'intro', text:'Update your profile information any time from the Settings page.' },
        { type:'steps', heading:'How to update your profile', items:['Go to Settings in the sidebar.','The Profile tab is open by default.','Edit your full name, email, phone, or bio.','Click "Save Changes".'] },
      ]},
      { id:5, title:'Deleting your account', desc:'Permanently remove your LeafShelf account', time:'2 min', content:[
        { type:'intro', text:'Account deletion is permanent and cannot be undone. All data, loans, and history are removed.' },
        { type:'steps', heading:'How to delete your account', items:['Go to Settings > Account tab.','Scroll to the Danger Zone section.','Click "Delete Account".','Confirm when prompted.'] },
        { type:'note', text:'Return all borrowed books before deleting your account.' },
      ]},
    ]
  },
  { emoji:'⬇️', title:'Downloads & Offline', desc:'Download books for offline reading', bg:'bg-green-50', text:'text-green-700', border:'border-green-100',
    articles:[
      { id:1, title:'How to download a book', desc:'Save books for offline reading', time:'1 min', content:[
        { type:'intro', text:'Download any book to read offline without an internet connection.' },
        { type:'steps', heading:'How to download', items:['Open a book detail page, or browse in Browse Books.','Click the Download button (arrow icon ⬇).','The book is saved and appears in your Downloads page.','Navigate to Downloads to manage your offline library.'] },
        { type:'tip', text:'Downloaded books are stored locally and available even without internet.' },
      ]},
      { id:2, title:'Managing your downloads', desc:'View, open, and delete downloaded books', time:'2 min', content:[
        { type:'intro', text:'The Downloads page lets you manage all books saved for offline reading.' },
        { type:'steps', heading:'Managing downloads', items:['Navigate to Downloads in the sidebar.','Use filter tabs to browse by format or status.','Click "Open" to open a book.','Click "Delete" to remove a download.'] },
      ]},
      { id:3, title:'Storage usage', desc:'Understanding and managing local storage', time:'2 min', content:[
        { type:'intro', text:'Each downloaded book uses a small amount of local storage. Monitor usage in the Downloads page.' },
        { type:'steps', heading:'Storage details', items:['The storage ring shows your current usage at a glance.','Each eBook is approximately 2–5 MB.','You have up to 10 GB of storage available.','Delete finished books to free up space.'] },
      ]},
      { id:4, title:'Download formats', desc:'Which file formats are available', time:'1 min', content:[
        { type:'intro', text:'LeafShelf books are available in the most widely compatible formats.' },
        { type:'steps', heading:'Available formats', items:['eBook (EPUB) — best for most e-readers and apps.','PDF — best for books with complex layouts.','Audiobook — MP3 format for audio versions.'] },
        { type:'tip', text:'EPUB is recommended for the best reading experience on any device.' },
      ]},
    ]
  },
  { emoji:'🎧', title:'Audiobooks', desc:'How to access and listen to audiobooks', bg:'bg-amber-50', text:'text-amber-700', border:'border-amber-100',
    articles:[
      { id:1, title:'Accessing audiobooks', desc:'How to find and open the audiobook library', time:'1 min', content:[
        { type:'intro', text:'LeafShelf includes a full audiobook section with all available titles.' },
        { type:'steps', heading:'How to access', items:['Click "Audio Books" in the left sidebar.','Browse all available audiobooks.','Use the filter tabs to browse by genre.','Click a cover to open the detail page.'] },
      ]},
      { id:2, title:'Listening to an audiobook', desc:'How to start listening', time:'1 min', content:[
        { type:'intro', text:'Start listening to any audiobook in two clicks.' },
        { type:'steps', heading:'How to listen', items:['Find an audiobook in Audio Books.','Click the "▶ Listen" button on the card.','Or open the detail page and click "Borrow Now".','The audiobook is added to your library.'] },
        { type:'tip', text:'Audiobook duration is estimated based on page count.' },
      ]},
      { id:3, title:'Audiobook availability', desc:'When audiobooks are available to borrow', time:'1 min', content:[
        { type:'intro', text:'Audiobook availability works the same way as regular books.' },
        { type:'steps', heading:'Availability indicators', items:['Green badge = Available to borrow immediately.','Red badge = Checked out by another user.','Join the waitlist for checked-out audiobooks.','You will be notified when it becomes available.'] },
      ]},
      { id:4, title:'Browsing audiobooks by genre', desc:'Filter audiobooks by category', time:'1 min', content:[
        { type:'intro', text:'Use genre filters to quickly find audiobooks in your favourite category.' },
        { type:'steps', heading:'How to filter by genre', items:['Open the Audio Books page.','Use the tabs at the top (Classic, Fiction, Fantasy) to filter.','Or click any genre in the Browse by Genre panel on the right.'] },
      ]},
    ]
  },
  { emoji:'⭐', title:'Membership Plans', desc:'Upgrade, cancel, and manage subscriptions', bg:'bg-pink-50', text:'text-pink-700', border:'border-pink-100',
    articles:[
      { id:1, title:'Free vs Premium plans', desc:'Compare what each plan includes', time:'3 min', content:[
        { type:'intro', text:'LeafShelf offers a free plan for casual readers and a Premium plan for unlimited access.' },
        { type:'steps', heading:'Free plan includes', items:['Access to the full book catalog.','Borrow up to 3 books at a time.','14-day loan period.','Online reading only.'] },
        { type:'steps', heading:'Premium plan includes', items:['Everything in Free, plus:','Borrow up to 10 books at a time.','21-day loan period.','Unlimited downloads for offline reading.','Full audiobook access.','Priority support.'] },
        { type:'tip', text:'Premium is $9.99/month, billed monthly. Cancel any time — no lock-in.' },
      ]},
      { id:2, title:'How to upgrade to Premium', desc:'Get unlimited access', time:'1 min', content:[
        { type:'intro', text:'Upgrading to Premium unlocks the full LeafShelf experience in seconds.' },
        { type:'steps', heading:'How to upgrade', items:['Click "Upgrade Now" at the bottom of the sidebar.','Or go to Settings > Account > Upgrade to Premium.','Choose monthly or annual billing.','Enter payment details and confirm.'] },
      ]},
      { id:3, title:'Managing your subscription', desc:'View billing details and plan status', time:'2 min', content:[
        { type:'intro', text:'View and manage your subscription at any time from Settings.' },
        { type:'steps', heading:'How to manage', items:['Go to Settings > Account tab.','Find the Subscription section.','View your plan, next billing date, and amount.','Click the billing date link to view invoices.'] },
      ]},
      { id:4, title:'Canceling Premium', desc:'How to cancel your subscription', time:'2 min', content:[
        { type:'intro', text:'You can cancel Premium at any time. Access continues until the end of the current billing period.' },
        { type:'steps', heading:'How to cancel', items:['Go to Settings > Account tab.','Find the Subscription section.','Click "Cancel Subscription".','Confirm the cancellation.','Premium access continues until your billing period ends.'] },
        { type:'note', text:'No refunds are issued for partial months, but you always keep access until your paid period ends.' },
      ]},
    ]
  },
  { emoji:'🔧', title:'Troubleshooting', desc:'Fix common issues and technical problems', bg:'bg-red-50', text:'text-red-700', border:'border-red-100',
    articles:[
      { id:1, title:"Book won't load or open", desc:'What to do if a book fails to load', time:'2 min', content:[
        { type:'intro', text:'If a book is not loading, try these steps in order before contacting support.' },
        { type:'steps', heading:'Try these fixes', items:['Refresh the page (F5 or Ctrl+R).','Clear your browser cache and cookies.','Try a different browser.','Check your internet connection.','Contact support if the issue persists.'] },
        { type:'tip', text:'Most loading issues are caused by a slow or unstable internet connection.' },
      ]},
      { id:2, title:'Cannot sign in', desc:'Troubleshoot login problems', time:'2 min', content:[
        { type:'intro', text:"Can't sign in? Here are the most common causes and how to fix them." },
        { type:'steps', heading:'Common sign-in issues', items:['Wrong password — reset it via "Forgot password?".','Wrong email — use the exact email you registered with.','Account does not exist — you may need to create one.','Too many attempts — wait 15 minutes and try again.'] },
      ]},
      { id:3, title:'Download not working', desc:'What to do if downloads fail', time:'2 min', content:[
        { type:'intro', text:'Having trouble downloading books? Check the following.' },
        { type:'steps', heading:'Download troubleshooting', items:['Check that you are connected to the internet.','Ensure your storage is not full (see Downloads page).','Refresh the page and click Download again.','Confirm you have a Premium account (required for downloads).'] },
        { type:'note', text:'If none of these work, contact support with your account email.' },
      ]},
      { id:4, title:'App is running slowly', desc:'Speed up LeafShelf on your device', time:'2 min', content:[
        { type:'intro', text:'If LeafShelf feels slow or unresponsive, try these performance fixes.' },
        { type:'steps', heading:'Performance fixes', items:['Close unnecessary browser tabs.','Clear your browser cache.','Disable browser extensions temporarily.','Check your internet speed.','Restart your browser.'] },
      ]},
      { id:5, title:'Reporting a bug', desc:'How to report technical issues to our team', time:'1 min', content:[
        { type:'intro', text:'Found a bug? We want to hear about it so we can fix it fast.' },
        { type:'steps', heading:'How to report', items:['Use Live Chat or Email Support (below).','Describe what you were doing when the issue occurred.','Include your browser name and version.','Attach a screenshot if possible.'] },
        { type:'tip', text:'The more detail you provide, the faster we can resolve the issue.' },
      ]},
    ]
  },
];

const FAQS = [
  { q:'How do I borrow a book?', a:'Navigate to any book page and click "Borrow Now". The book is instantly added to My Library if it is available. You must be signed in to borrow.' },
  { q:'How long can I keep a borrowed book?', a:'The standard loan period is 14 days. Premium members get 21 days. The due date is shown on every borrowed book in My Library.' },
  { q:'Can I renew a borrowed book?', a:'Yes — go to My Library, find the book, and click "Renew". This extends your loan by 14 days, as long as no one else is waiting for that title.' },
  { q:'How do I return a book?', a:'Go to My Library, find the book, and click "Return". It is returned immediately and made available for other readers.' },
  { q:"Why can't I download a book?", a:'Downloads require a LeafShelf Premium membership. Free accounts can read online only. Check your plan in Settings > Account.' },
];

const POPULAR = [
  'How to set up your reading preferences',
  'Using LeafShelf on multiple devices',
  'Understanding borrow limits and queues',
  'How to create and share reading lists',
  'Getting the most from Premium membership',
];

const TOPIC_META = [
  { iconBg:'linear-gradient(135deg,#1B4332,#2D6A4F)', badgeBg:'#D1FAE5', badgeColor:'#065F46' },
  { iconBg:'linear-gradient(135deg,#312e81,#4338ca)', badgeBg:'#EEF2FF', badgeColor:'#4338CA' },
  { iconBg:'linear-gradient(135deg,#064e3b,#059669)', badgeBg:'#ECFDF5', badgeColor:'#047857' },
  { iconBg:'linear-gradient(135deg,#78350f,#d97706)', badgeBg:'#FEF3C7', badgeColor:'#92400E' },
  { iconBg:'linear-gradient(135deg,#831843,#be185d)', badgeBg:'#FCE7F3', badgeColor:'#9D174D' },
  { iconBg:'linear-gradient(135deg,#7f1d1d,#dc2626)', badgeBg:'#FEE2E2', badgeColor:'#B91C1C' },
];

const SP_ANIMS = `
@keyframes spHeroGrad{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
@keyframes spLeafFloat{0%,100%{transform:translateY(0) rotate(0deg);opacity:0.15}50%{transform:translateY(-18px) rotate(15deg);opacity:0.28}}
@keyframes spCardIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
@keyframes spStatIn{from{opacity:0;transform:translateY(18px) scale(0.9)}to{opacity:1;transform:translateY(0) scale(1)}}
@keyframes spFadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes spSideIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}
@keyframes spPulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.6);opacity:0.4}}
@keyframes spBadgePop{0%{transform:scale(0.6)}70%{transform:scale(1.15)}100%{transform:scale(1)}}
@keyframes spShimmerBtn{0%{background-position:-300% 0}100%{background-position:300% 0}}
@keyframes spOverlayIn{from{opacity:0}to{opacity:1}}
@keyframes spModalIn{from{opacity:0;transform:translateY(28px) scale(0.96)}to{opacity:1;transform:translateY(0) scale(1)}}
@keyframes spCheckPop{0%{transform:scale(0) rotate(-15deg)}70%{transform:scale(1.2) rotate(3deg)}100%{transform:scale(1) rotate(0deg)}}
@keyframes spTicketSlide{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
.sp-search::placeholder{color:rgba(255,255,255,0.42);}
.sp-input:focus{border-color:#52B788 !important;box-shadow:0 0 0 3px rgba(82,183,136,0.15);}
.sp-select{appearance:none;-webkit-appearance:none;}
`;

/* ─── Small helper components ─── */

function FloatingLeaves() {
  const items = ['🌿','☘️','🍃','🌱','🌿','🍃','🌿'];
  return (
    <div style={{ position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none' }}>
      {items.map((leaf, i) => (
        <span key={i} style={{
          position:'absolute', left:`${6 + i * 13}%`, top:`${12 + (i % 3) * 26}%`,
          fontSize: i % 2 === 0 ? 15 : 10, opacity:0.15,
          animation:`spLeafFloat ${3.2 + i * 0.55}s ease-in-out infinite`,
          animationDelay:`${i * 0.42}s`,
        }}>{leaf}</span>
      ))}
    </div>
  );
}

function QuickPill({ topic, onClick, delay }: { topic: Topic; onClick: () => void; delay: number }) {
  const [hov, setHov] = useState(false);
  return (
    <button type="button" onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)',
        backdropFilter:'blur(8px)',
        border:`1px solid ${hov ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.15)'}`,
        borderRadius:30, padding:'6px 14px',
        color: hov ? 'white' : 'rgba(255,255,255,0.82)',
        fontSize:12, fontWeight:500, cursor:'pointer',
        transition:'all 0.2s ease',
        transform: hov ? 'scale(1.05)' : 'none',
        animation:`spStatIn 0.5s ease both`,
        animationDelay:`${delay}s`,
      }}
    >{topic.emoji} {topic.title}</button>
  );
}

function TopicCard({ topic, idx, onClick }: { topic: Topic; idx: number; onClick: () => void }) {
  const [hov, setHov] = useState(false);
  const meta = TOPIC_META[idx % TOPIC_META.length];
  return (
    <div onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background:'white', borderRadius:20,
        border: hov ? '1.5px solid #A7F3D0' : '1.5px solid #EEF7F2',
        padding:'22px', cursor:'pointer',
        boxShadow: hov ? '0 10px 32px rgba(27,67,50,0.13)' : '0 2px 10px rgba(27,67,50,0.06)',
        transform: hov ? 'translateY(-5px) scale(1.01)' : 'none',
        transition:'all 0.26s cubic-bezier(0.34,1.56,0.64,1)',
        animation:`spCardIn 0.55s cubic-bezier(0.34,1.56,0.64,1) both`,
        animationDelay:`${0.08 + idx * 0.07}s`,
      }}
    >
      <div style={{ display:'flex', alignItems:'flex-start', gap:16 }}>
        <div style={{
          width:52, height:52, borderRadius:16, flexShrink:0,
          background: meta.iconBg,
          display:'flex', alignItems:'center', justifyContent:'center', fontSize:24,
          boxShadow:'0 4px 14px rgba(0,0,0,0.22)',
          transform: hov ? 'scale(1.08) rotate(-3deg)' : 'none',
          transition:'transform 0.28s cubic-bezier(0.34,1.56,0.64,1)',
        }}>{topic.emoji}</div>
        <div style={{ flex:1, minWidth:0 }}>
          <p style={{ fontSize:15, fontWeight:700, color:'#1a2e22', margin:'0 0 5px', letterSpacing:'-0.01em' }}>{topic.title}</p>
          <p style={{ fontSize:12, color:'#6B7280', margin:'0 0 14px', lineHeight:1.5 }}>{topic.desc}</p>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <span style={{ fontSize:12, fontWeight:700, color: hov ? '#1B4332' : '#2D6A4F', transition:'color 0.2s', display:'flex', alignItems:'center', gap:4 }}>
              Browse articles
              <span style={{ transform: hov ? 'translateX(3px)' : 'none', transition:'transform 0.2s', display:'inline-block' }}>→</span>
            </span>
            <span style={{
              fontSize:10, fontWeight:700,
              background: meta.badgeBg, color: meta.badgeColor,
              padding:'3px 9px', borderRadius:20,
              animation:`spBadgePop 0.45s cubic-bezier(0.34,1.56,0.64,1) both`,
              animationDelay:`${0.15 + idx * 0.07}s`,
            }}>{topic.articles.length} articles</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ArticleRow({ article, idx, onClick }: { article: Article; idx: number; onClick: () => void }) {
  const [hov, setHov] = useState(false);
  return (
    <div onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        display:'flex', alignItems:'center', gap:16, padding:'16px 20px', borderRadius:16, cursor:'pointer',
        background: hov ? 'linear-gradient(90deg,#F0FDF4 0%,#FAFFFE 100%)' : 'white',
        border: hov ? '1.5px solid #A7F3D0' : '1.5px solid #F0F9F4',
        boxShadow: hov ? '0 6px 20px rgba(27,67,50,0.10)' : '0 1px 6px rgba(27,67,50,0.04)',
        transform: hov ? 'translateY(-2px)' : 'none',
        transition:'all 0.24s cubic-bezier(0.34,1.56,0.64,1)',
        animation:`spCardIn 0.5s ease both`,
        animationDelay:`${idx * 0.07}s`,
      }}
    >
      <div style={{
        width:36, height:36, borderRadius:10, flexShrink:0,
        background:'linear-gradient(135deg,#2D6A4F,#1B4332)',
        display:'flex', alignItems:'center', justifyContent:'center',
        fontSize:13, fontWeight:800, color:'white',
        boxShadow:'0 2px 8px rgba(27,67,50,0.28)',
        transform: hov ? 'scale(1.1)' : 'none',
        transition:'transform 0.28s cubic-bezier(0.34,1.56,0.64,1)',
      }}>{idx + 1}</div>
      <div style={{ flex:1, minWidth:0 }}>
        <p style={{ fontSize:14, fontWeight:700, color:'#1a2e22', margin:'0 0 3px' }}>{article.title}</p>
        <p style={{ fontSize:12, color:'#6B7280', margin:0 }}>{article.desc}</p>
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
        <span style={{ fontSize:11, color:'#9CA3AF', background:'#F6FAF8', padding:'4px 10px', borderRadius:20, border:'1px solid #E8F5E9' }}>
          📖 {article.time}
        </span>
        <div style={{
          width:28, height:28, borderRadius:'50%',
          background: hov ? '#1B4332' : '#F0F9F4',
          display:'flex', alignItems:'center', justifyContent:'center',
          transition:'all 0.24s ease',
        }}>
          <svg width="12" height="12" fill="none" stroke={hov ? 'white' : '#9CA3AF'} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function FaqItem({ faq, isOpen, onToggle, idx }: { faq:{q:string;a:string}; isOpen:boolean; onToggle:()=>void; idx:number }) {
  const [hov, setHov] = useState(false);
  return (
    <div style={{
      borderRadius:16, overflow:'hidden',
      border: isOpen ? '1.5px solid #A7F3D0' : '1.5px solid #EEF7F2',
      background:'white',
      boxShadow: isOpen ? '0 4px 16px rgba(27,67,50,0.09)' : '0 1px 6px rgba(27,67,50,0.04)',
      transition:'all 0.24s ease',
      animation:`spFadeUp 0.5s ease both`, animationDelay:`${idx * 0.06}s`,
    }}>
      <button type="button" onClick={onToggle}
        onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
        style={{
          width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between',
          padding:'16px 18px',
          background: hov && !isOpen ? '#F9FDFB' : 'transparent',
          border:'none', cursor:'pointer', textAlign:'left',
          transition:'background 0.2s',
        }}
      >
        <span style={{ fontSize:14, fontWeight:600, color:'#1a2e22', paddingRight:16, lineHeight:1.5 }}>{faq.q}</span>
        <div style={{
          width:28, height:28, borderRadius:'50%', flexShrink:0,
          background: isOpen ? '#1B4332' : '#F0F9F4',
          display:'flex', alignItems:'center', justifyContent:'center',
          transition:'all 0.26s cubic-bezier(0.34,1.56,0.64,1)',
          transform: isOpen ? 'rotate(180deg)' : 'none',
        }}>
          <svg width="14" height="14" fill="none" stroke={isOpen ? 'white' : '#1B4332'} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      <div style={{ maxHeight: isOpen ? '320px' : '0px', overflow:'hidden', transition:'max-height 0.36s cubic-bezier(0.34,1.56,0.64,1)' }}>
        <div style={{ padding:'0 18px 18px', borderTop:'1px solid #F0F9F4' }}>
          <p style={{ fontSize:13, color:'#4B5563', lineHeight:1.75, margin:'14px 0 0' }}>{faq.a}</p>
        </div>
      </div>
    </div>
  );
}

function ContentRenderer({ content }: { content: ContentBlock[] }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      {content.map((block, i) => {
        if (block.type === 'intro') return (
          <p key={i} style={{ fontSize:15, color:'#374151', lineHeight:1.75, margin:0 }}>{block.text}</p>
        );
        if (block.type === 'steps') return (
          <div key={i}>
            {block.heading && (
              <p style={{ fontSize:11, fontWeight:800, color:'#1B4332', margin:'0 0 12px', textTransform:'uppercase', letterSpacing:'0.08em' }}>{block.heading}</p>
            )}
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {block.items!.map((item, j) => (
                <div key={j} style={{ display:'flex', alignItems:'flex-start', gap:12 }}>
                  <div style={{
                    width:28, height:28, borderRadius:'50%', flexShrink:0,
                    background:'linear-gradient(135deg,#2D6A4F,#1B4332)',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:11, fontWeight:800, color:'white',
                    boxShadow:'0 2px 8px rgba(27,67,50,0.28)', marginTop:2,
                  }}>{j + 1}</div>
                  <p style={{ fontSize:14, color:'#374151', lineHeight:1.65, margin:0, paddingTop:5 }}>{item}</p>
                </div>
              ))}
            </div>
          </div>
        );
        if (block.type === 'tip') return (
          <div key={i} style={{ background:'linear-gradient(90deg,#F0FDF4,#ECFDF5)', border:'1.5px solid #A7F3D0', borderRadius:14, padding:'14px 16px', display:'flex', gap:12 }}>
            <span style={{ fontSize:18, flexShrink:0 }}>💡</span>
            <p style={{ fontSize:13, color:'#065F46', lineHeight:1.65, margin:0 }}>{block.text}</p>
          </div>
        );
        if (block.type === 'note') return (
          <div key={i} style={{ background:'linear-gradient(90deg,#FFFBEB,#FEF3C7)', border:'1.5px solid #FDE68A', borderRadius:14, padding:'14px 16px', display:'flex', gap:12 }}>
            <span style={{ fontSize:18, flexShrink:0 }}>⚠️</span>
            <p style={{ fontSize:13, color:'#92400E', lineHeight:1.65, margin:0 }}>{block.text}</p>
          </div>
        );
        return null;
      })}
    </div>
  );
}

function HelpfulBtn({ label, green }: { label:string; green?:boolean }) {
  const [clicked, setClicked] = useState(false);
  const [hov, setHov] = useState(false);
  const active = clicked || hov;
  return (
    <button type="button" onClick={() => setClicked(true)}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        padding:'7px 16px', borderRadius:10, cursor:'pointer', fontSize:12, fontWeight:700,
        background: active ? (green ? '#1B4332' : '#F0F9F4') : 'white',
        color: active ? (green ? 'white' : '#1B4332') : '#6B7280',
        border:`1.5px solid ${active ? (green ? '#1B4332' : '#A7F3D0') : '#E8F5E9'}`,
        transition:'all 0.2s ease',
        transform: clicked ? 'scale(0.95)' : 'none',
      }}
    >{clicked ? (green ? '✓ Thanks!' : '✓ Noted') : label}</button>
  );
}

function PopularLink({ article, idx, onClick }: { article:string; idx:number; onClick:()=>void }) {
  const [hov, setHov] = useState(false);
  return (
    <button type="button" onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        display:'flex', alignItems:'flex-start', gap:8, padding:'8px 10px',
        borderRadius:10, border:'none', background: hov ? '#F0FDF4' : 'transparent',
        cursor:'pointer', textAlign:'left', transition:'background 0.2s ease', width:'100%',
        animation:`spCardIn 0.45s ease both`, animationDelay:`${0.2 + idx * 0.05}s`,
      }}
    >
      <span style={{ fontSize:12, color:'#52B788', marginTop:1, flexShrink:0 }}>→</span>
      <span style={{ fontSize:12, fontWeight: hov ? 600 : 500, color: hov ? '#1B4332' : '#374151', lineHeight:1.45, transition:'all 0.2s' }}>{article}</span>
    </button>
  );
}

function StatusRow({ service, idx }: { service:string; idx:number }) {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', animation:`spCardIn 0.45s ease both`, animationDelay:`${0.25 + idx * 0.05}s` }}>
      <span style={{ fontSize:11, color:'#6B7280' }}>{service}</span>
      <div style={{ display:'flex', alignItems:'center', gap:5 }}>
        <span style={{ width:7, height:7, borderRadius:'50%', background:'#22C55E', display:'inline-block', animation: idx === 0 ? 'spPulse 2s ease infinite' : 'none' }} />
        <span style={{ fontSize:11, fontWeight:600, color:'#15803D' }}>Operational</span>
      </div>
    </div>
  );
}

function ContactCard({ icon, title, badge, badgeColor, badgeBg, desc, showBtn, pulseDot, idx }:
  { icon:string; title:string; badge:string; badgeColor:string; badgeBg:string; desc:string; showBtn?:boolean; pulseDot?:boolean; idx:number }) {
  const [hov, setHov] = useState(false);
  const [btnHov, setBtnHov] = useState(false);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{
      background:'white', borderRadius:16,
      border: hov ? '1.5px solid #A7F3D0' : '1.5px solid #EEF7F2',
      padding:'16px',
      boxShadow: hov ? '0 6px 20px rgba(27,67,50,0.10)' : '0 1px 6px rgba(27,67,50,0.04)',
      transition:'all 0.24s ease',
      animation:`spFadeUp 0.5s ease both`, animationDelay:`${0.1 + idx * 0.08}s`,
    }}>
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
        <span style={{ fontSize:22 }}>{icon}</span>
        <div style={{ flex:1 }}>
          <p style={{ fontSize:13, fontWeight:700, color:'#1a2e22', margin:'0 0 4px' }}>{title}</p>
          <div style={{ display:'flex', alignItems:'center', gap:5 }}>
            {pulseDot && <span style={{ width:7, height:7, borderRadius:'50%', background:'#22C55E', display:'inline-block', animation:'spPulse 1.8s ease infinite' }} />}
            <span style={{ fontSize:10, fontWeight:700, background:badgeBg, color:badgeColor, padding:'2px 8px', borderRadius:20 }}>{badge}</span>
          </div>
        </div>
      </div>
      <p style={{ fontSize:12, color:'#6B7280', margin: showBtn ? '0 0 12px' : 0 }}>{desc}</p>
      {showBtn && (
        <button type="button"
          onMouseEnter={() => setBtnHov(true)} onMouseLeave={() => setBtnHov(false)}
          style={{
            width:'100%', padding:'8px', borderRadius:10, border:'none', cursor:'pointer',
            background: btnHov
              ? 'linear-gradient(90deg,#1B4332 0%,#2D7A55 44%,#3A9E6E 50%,#2D7A55 56%,#1B4332 100%)'
              : '#1B4332',
            backgroundSize: btnHov ? '300% 100%' : '100%',
            color:'white', fontSize:12, fontWeight:700,
            transition:'box-shadow 0.2s ease',
            boxShadow: btnHov ? '0 4px 14px rgba(27,67,50,0.35)' : 'none',
            ...(btnHov ? { animation:'spShimmerBtn 2.8s linear infinite' } : {}),
          }}
        >Start Chat</button>
      )}
    </div>
  );
}

function SubmitTicketBtn({ onClick }: { onClick?: () => void }) {
  const [hov, setHov] = useState(false);
  return (
    <button type="button" onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        width:'100%', padding:'10px', borderRadius:12,
        border:'1.5px solid rgba(255,255,255,0.25)',
        background: hov ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.12)',
        backdropFilter:'blur(8px)',
        color:'white', fontSize:13, fontWeight:700, cursor:'pointer',
        transition:'all 0.22s ease',
        transform: hov ? 'scale(1.02)' : 'none',
      }}
    >🎫 Submit a Ticket</button>
  );
}

function MoreTopicBtn({ topic, idx, onClick }: { topic:Topic; idx:number; onClick:()=>void }) {
  const [hov, setHov] = useState(false);
  return (
    <button type="button" onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        display:'flex', alignItems:'center', gap:8, padding:'8px 10px',
        borderRadius:10, border:'none', background: hov ? '#F0FDF4' : 'transparent',
        cursor:'pointer', textAlign:'left', width:'100%',
        transition:'background 0.2s ease',
        animation:`spCardIn 0.4s ease both`, animationDelay:`${idx * 0.05}s`,
      }}
    >
      <span style={{ fontSize:16 }}>{topic.emoji}</span>
      <span style={{ fontSize:12, fontWeight:500, color: hov ? '#1B4332' : '#374151', transition:'color 0.2s' }}>{topic.title}</span>
    </button>
  );
}

/* ─── Ticket Modal ─── */

function TicketModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [category, setCategory] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [ticketId, setTicketId] = useState('');
  const [catFocus, setCatFocus] = useState(false);
  const [subFocus, setSubFocus] = useState(false);
  const [msgFocus, setMsgFocus] = useState(false);
  const [emailFocus, setEmailFocus] = useState(false);

  const canSubmit = category && subject.trim().length >= 3 && message.trim().length >= 10 && !submitting;

  function handleSubmit() {
    if (!canSubmit) return;
    setSubmitting(true);
    setTimeout(() => {
      const id = 'LF-' + (Math.floor(Math.random() * 90000) + 10000);
      setTicketId(id);
      setStep('success');
      setSubmitting(false);
    }, 1100);
  }

  function handleClose() {
    onClose();
    setTimeout(() => { setStep('form'); setCategory(''); setSubject(''); setMessage(''); setEmail(''); }, 320);
  }

  if (!isOpen) return null;

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) handleClose(); }}
      style={{
        position:'fixed', inset:0, zIndex:9999,
        background:'rgba(7,20,12,0.6)', backdropFilter:'blur(5px)',
        display:'flex', alignItems:'center', justifyContent:'center',
        padding:20, animation:'spOverlayIn 0.22s ease both',
      }}
    >
      <div style={{
        width:'100%', maxWidth:500, background:'white', borderRadius:26,
        boxShadow:'0 28px 70px rgba(0,0,0,0.32)',
        animation:'spModalIn 0.38s cubic-bezier(0.34,1.56,0.64,1) both',
        overflow:'hidden',
      }}>

        {step === 'form' ? (<>

          {/* Header */}
          <div style={{ background:'linear-gradient(135deg,#0d2318 0%,#1B4332 50%,#2D6A4F 100%)', padding:'24px 26px 20px', position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none' }}>
              {['🌿','🍃','☘️','🌱'].map((l,i) => (
                <span key={i} style={{ position:'absolute', left:`${10+i*24}%`, top:`${15+(i%2)*40}%`, fontSize:12, opacity:0.12, animation:`spLeafFloat ${3+i*0.6}s ease-in-out infinite`, animationDelay:`${i*0.4}s` }}>{l}</span>
              ))}
            </div>
            <div style={{ position:'relative', zIndex:1, display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12 }}>
              <div>
                <div style={{ fontSize:28, marginBottom:8 }}>🎫</div>
                <h2 style={{ margin:'0 0 5px', fontSize:20, fontWeight:700, color:'white', fontFamily:'Georgia,serif', letterSpacing:'-0.02em' }}>Submit a Support Ticket</h2>
                <p style={{ margin:0, fontSize:12, color:'rgba(255,255,255,0.52)' }}>We'll respond within 24 hours · No account required</p>
              </div>
              <button type="button" onClick={handleClose} style={{
                width:34, height:34, borderRadius:'50%', border:'1px solid rgba(255,255,255,0.18)',
                background:'rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.8)',
                cursor:'pointer', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:16, transition:'background 0.2s',
              }}>✕</button>
            </div>
          </div>

          {/* Body */}
          <div style={{ padding:'24px 26px 26px' }}>

            {/* Category */}
            <div style={{ marginBottom:16 }}>
              <label style={{ display:'block', fontSize:11, fontWeight:800, color:'#1B4332', marginBottom:7, textTransform:'uppercase', letterSpacing:'0.07em' }}>
                Topic / Category <span style={{ color:'#EF4444' }}>*</span>
              </label>
              <div style={{ position:'relative' }}>
                <select className="sp-select" title="Support topic category" value={category} onChange={e => setCategory(e.target.value)}
                  onFocus={() => setCatFocus(true)} onBlur={() => setCatFocus(false)}
                  style={{
                    width:'100%', padding:'11px 40px 11px 14px', borderRadius:12, fontSize:13,
                    border:`1.5px solid ${category ? '#52B788' : catFocus ? '#52B788' : '#E2EEE8'}`,
                    background:'#F6FAF8', color: category ? '#1a2e22' : '#9CA3AF', outline:'none',
                    cursor:'pointer', boxSizing:'border-box',
                    boxShadow: catFocus ? '0 0 0 3px rgba(82,183,136,0.15)' : 'none',
                    transition:'all 0.18s ease',
                  }}
                >
                  <option value="">Choose a category…</option>
                  {TOPICS.map(t => <option key={t.title} value={t.title}>{t.emoji} {t.title}</option>)}
                  <option value="Other">💬 Other / General</option>
                </select>
                <div style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }}>
                  <svg width="12" height="12" fill="none" stroke={category ? '#1B4332' : '#9CA3AF'} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Subject */}
            <div style={{ marginBottom:16 }}>
              <label style={{ display:'block', fontSize:11, fontWeight:800, color:'#1B4332', marginBottom:7, textTransform:'uppercase', letterSpacing:'0.07em' }}>
                Subject <span style={{ color:'#EF4444' }}>*</span>
              </label>
              <input value={subject} onChange={e => setSubject(e.target.value)}
                onFocus={() => setSubFocus(true)} onBlur={() => setSubFocus(false)}
                placeholder="Brief summary of your issue…"
                style={{
                  width:'100%', padding:'11px 14px', borderRadius:12, fontSize:13,
                  border:`1.5px solid ${subject.trim().length >= 3 ? '#52B788' : subFocus ? '#52B788' : '#E2EEE8'}`,
                  background:'#F6FAF8', color:'#1a2e22', outline:'none', boxSizing:'border-box',
                  boxShadow: subFocus ? '0 0 0 3px rgba(82,183,136,0.15)' : 'none',
                  transition:'all 0.18s ease', fontFamily:'inherit',
                }}
              />
            </div>

            {/* Message */}
            <div style={{ marginBottom:16 }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:7 }}>
                <label style={{ fontSize:11, fontWeight:800, color:'#1B4332', textTransform:'uppercase', letterSpacing:'0.07em' }}>
                  Describe Your Issue <span style={{ color:'#EF4444' }}>*</span>
                </label>
                <span style={{ fontSize:10, color: message.length > 10 ? '#52B788' : '#9CA3AF', fontWeight:600 }}>
                  {message.length} chars {message.trim().length >= 10 ? '✓' : '(min 10)'}
                </span>
              </div>
              <textarea value={message} onChange={e => setMessage(e.target.value)}
                onFocus={() => setMsgFocus(true)} onBlur={() => setMsgFocus(false)}
                placeholder="Describe the issue in detail. What happened? What did you expect? Any steps already tried?"
                rows={4}
                style={{
                  width:'100%', padding:'11px 14px', borderRadius:12, fontSize:13,
                  border:`1.5px solid ${message.trim().length >= 10 ? '#52B788' : msgFocus ? '#52B788' : '#E2EEE8'}`,
                  background:'#F6FAF8', color:'#1a2e22', outline:'none', resize:'vertical',
                  boxSizing:'border-box', fontFamily:'inherit', lineHeight:1.6,
                  boxShadow: msgFocus ? '0 0 0 3px rgba(82,183,136,0.15)' : 'none',
                  transition:'all 0.18s ease',
                }}
              />
            </div>

            {/* Email */}
            <div style={{ marginBottom:24 }}>
              <label style={{ display:'block', fontSize:11, fontWeight:800, color:'#1B4332', marginBottom:7, textTransform:'uppercase', letterSpacing:'0.07em' }}>
                Your Email <span style={{ color:'#9CA3AF', fontWeight:500, textTransform:'none', letterSpacing:'normal' }}>(optional — for updates)</span>
              </label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                onFocus={() => setEmailFocus(true)} onBlur={() => setEmailFocus(false)}
                placeholder="you@example.com"
                style={{
                  width:'100%', padding:'11px 14px', borderRadius:12, fontSize:13,
                  border:`1.5px solid ${emailFocus ? '#52B788' : '#E2EEE8'}`,
                  background:'#F6FAF8', color:'#1a2e22', outline:'none', boxSizing:'border-box',
                  boxShadow: emailFocus ? '0 0 0 3px rgba(82,183,136,0.15)' : 'none',
                  transition:'all 0.18s ease', fontFamily:'inherit',
                }}
              />
            </div>

            {/* Submit */}
            <button type="button" onClick={handleSubmit} disabled={!canSubmit}
              style={{
                width:'100%', padding:'13px', borderRadius:14, border:'none',
                background: canSubmit
                  ? 'linear-gradient(135deg,#1B4332 0%,#2D6A4F 60%,#52B788 100%)'
                  : '#EEF7F2',
                color: canSubmit ? 'white' : '#A7D3B8',
                fontSize:14, fontWeight:700, cursor: canSubmit ? 'pointer' : 'not-allowed',
                boxShadow: canSubmit ? '0 8px 24px rgba(27,67,50,0.30)' : 'none',
                transition:'all 0.24s ease',
                transform: canSubmit ? 'none' : 'none',
                display:'flex', alignItems:'center', justifyContent:'center', gap:8,
              }}
            >
              {submitting ? (
                <>
                  <span style={{ width:16, height:16, border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'white', borderRadius:'50%', display:'inline-block', animation:'spPulse 0.7s linear infinite' }} />
                  Submitting…
                </>
              ) : '🎫 Submit Ticket'}
            </button>

            <p style={{ fontSize:11, color:'#B0C9BB', textAlign:'center', margin:'10px 0 0' }}>
              Fields marked <span style={{ color:'#EF4444' }}>*</span> are required
            </p>
          </div>

        </>) : (

          /* Success state */
          <div style={{ padding:'44px 32px 40px', textAlign:'center', animation:'spFadeUp 0.4s ease both' }}>
            <div style={{
              width:76, height:76, borderRadius:'50%', margin:'0 auto 22px',
              background:'linear-gradient(135deg,#1B4332,#2D6A4F)',
              display:'flex', alignItems:'center', justifyContent:'center',
              boxShadow:'0 10px 30px rgba(27,67,50,0.30)',
              animation:'spCheckPop 0.5s cubic-bezier(0.34,1.56,0.64,1) both',
            }}>
              <svg width="34" height="34" fill="none" stroke="white" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 style={{ margin:'0 0 8px', fontSize:22, fontWeight:700, color:'#1B4332', fontFamily:'Georgia,serif' }}>
              Ticket Submitted!
            </h2>
            <p style={{ fontSize:13, color:'#6B7280', margin:'0 0 24px', lineHeight:1.7 }}>
              Your ticket has been received. Our support team will<br />get back to you within 24 hours.
            </p>
            <div style={{
              background:'linear-gradient(90deg,#F0FDF4,#ECFDF5)',
              border:'1.5px solid #A7F3D0', borderRadius:16,
              padding:'16px 24px', marginBottom:10, display:'inline-block',
              animation:'spTicketSlide 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.2s both',
            }}>
              <p style={{ fontSize:10, fontWeight:800, color:'#6B7280', margin:'0 0 5px', textTransform:'uppercase', letterSpacing:'0.1em' }}>Your Ticket ID</p>
              <p style={{ fontSize:24, fontWeight:900, color:'#1B4332', margin:0, fontFamily:'monospace', letterSpacing:'0.04em' }}>{ticketId}</p>
            </div>
            <p style={{ fontSize:11, color:'#9CA3AF', margin:'0 0 28px' }}>
              Save this ID for your records{email ? ` · Updates will be sent to ${email}` : ''}
            </p>
            <button type="button" onClick={handleClose} style={{
              padding:'11px 36px', borderRadius:12,
              border:'1.5px solid #1B4332', background:'transparent',
              color:'#1B4332', fontSize:13, fontWeight:700, cursor:'pointer',
              transition:'all 0.2s ease',
            }}>Done</button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Main component ─── */

export default function Support() {
  const [activeTopic, setActiveTopic] = useState<Topic | null>(null);
  const [activeArticle, setActiveArticle] = useState<Article | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [ticketOpen, setTicketOpen] = useState(false);

  const q = searchQuery.toLowerCase();
  const filteredTopics = q
    ? TOPICS.filter(t => t.title.toLowerCase().includes(q) || t.articles.some(a => a.title.toLowerCase().includes(q) || a.desc.toLowerCase().includes(q)))
    : TOPICS;
  const filteredFaqs = q
    ? FAQS.filter(f => f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q))
    : FAQS;

  function goHome() { setActiveTopic(null); setActiveArticle(null); }
  function goTopic() { setActiveArticle(null); }

  const isHome = !activeTopic && !activeArticle;
  const isTopicView = !!(activeTopic && !activeArticle);
  const isArticleView = !!(activeTopic && activeArticle);
  const topicIdx = activeTopic ? TOPICS.indexOf(activeTopic) : 0;
  const topicMeta = TOPIC_META[topicIdx % TOPIC_META.length];

  return (
    <>
      <style>{SP_ANIMS}</style>
      <TicketModal isOpen={ticketOpen} onClose={() => setTicketOpen(false)} />
      <div style={{ display:'flex', gap:24, padding:24, minHeight:'100%', background:'#F6FAF8' }}>

        {/* ── Main column ── */}
        <div style={{ flex:1, minWidth:0 }}>

          {/* Hero */}
          <div style={{
            background:'linear-gradient(135deg,#071a0f 0%,#0e2318 15%,#1B4332 38%,#2D6A4F 62%,#1B4332 82%,#071a0f 100%)',
            backgroundSize:'300% 300%', animation:'spHeroGrad 12s ease infinite',
            borderRadius:24, padding:'32px 36px',
            marginBottom: isHome ? 24 : 18,
            position:'relative', overflow:'hidden',
          }}>
            <FloatingLeaves />
            <div style={{ position:'absolute', top:-60, right:-60, width:240, height:240, borderRadius:'50%', background:'radial-gradient(circle,rgba(82,183,136,0.12),transparent 70%)', pointerEvents:'none' }} />
            <div style={{ position:'absolute', bottom:-40, left:160, width:180, height:180, borderRadius:'50%', background:'radial-gradient(circle,rgba(255,255,255,0.05),transparent 70%)', pointerEvents:'none' }} />

            <div style={{ position:'relative', zIndex:1 }}>
              {/* Breadcrumb */}
              <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:10, flexWrap:'wrap' }}>
                <button type="button" onClick={goHome} style={{ fontSize:12, fontWeight:500, color:'rgba(255,255,255,0.55)', background:'none', border:'none', cursor:'pointer', padding:0 }}>
                  Support Center
                </button>
                {activeTopic && <>
                  <span style={{ color:'rgba(255,255,255,0.3)', fontSize:12 }}>/</span>
                  <button type="button" onClick={goTopic} style={{ fontSize:12, fontWeight:500, color: activeArticle ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.9)', background:'none', border:'none', cursor:'pointer', padding:0 }}>
                    {activeTopic.title}
                  </button>
                </>}
                {activeArticle && <>
                  <span style={{ color:'rgba(255,255,255,0.3)', fontSize:12 }}>/</span>
                  <span style={{ fontSize:12, fontWeight:600, color:'rgba(255,255,255,0.9)' }}>{activeArticle.title}</span>
                </>}
              </div>

              <h1 style={{ margin:'0 0 6px', fontSize: isHome ? 30 : 24, fontFamily:'Georgia,serif', fontWeight:700, color:'white', letterSpacing:'-0.02em' }}>
                {isHome ? '💬 How can we help?' : isTopicView ? `${activeTopic!.emoji} ${activeTopic!.title}` : activeArticle?.title}
              </h1>
              <p style={{ margin: isHome ? '0 0 22px' : '0', fontSize:13, color:'rgba(255,255,255,0.55)' }}>
                {isHome ? 'Find answers, browse topics, or chat with our support team' : isTopicView ? activeTopic!.desc : activeArticle?.desc}
              </p>

              {/* Embedded search — home only */}
              {isHome && (
                <div style={{
                  display:'flex', alignItems:'center', gap:12,
                  background: searchFocused ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.12)',
                  backdropFilter:'blur(16px)',
                  border:`1.5px solid ${searchFocused ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.18)'}`,
                  borderRadius:50, padding:'12px 20px', marginBottom:18,
                  transition:'all 0.22s ease',
                  boxShadow: searchFocused ? '0 0 0 3px rgba(82,183,136,0.25)' : 'none',
                }}>
                  <svg width="18" height="18" fill="none" stroke="rgba(255,255,255,0.55)" viewBox="0 0 24 24" style={{ flexShrink:0 }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                  <input className="sp-search"
                    value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    onFocus={() => setSearchFocused(true)} onBlur={() => setSearchFocused(false)}
                    placeholder="Search help articles, topics, FAQs..."
                    style={{ flex:1, background:'transparent', border:'none', outline:'none', fontSize:14, color:'white', fontWeight:400 }}
                  />
                  {searchQuery && (
                    <button type="button" onClick={() => setSearchQuery('')} style={{
                      background:'rgba(255,255,255,0.15)', border:'none', borderRadius:'50%',
                      width:22, height:22, cursor:'pointer', display:'flex',
                      alignItems:'center', justifyContent:'center', color:'white', fontSize:14, flexShrink:0,
                    }}>✕</button>
                  )}
                </div>
              )}

              {/* Quick category pills — home only, no active search */}
              {isHome && !searchQuery && (
                <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                  {TOPICS.map((t, i) => (
                    <QuickPill key={t.title} topic={t} onClick={() => setActiveTopic(t)} delay={0.15 + i * 0.05} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── HOME VIEW ── */}
          {isHome && (
            <div>
              {/* Topic grid */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:32 }}>
                {filteredTopics.map((topic, i) => (
                  <TopicCard key={topic.title} topic={topic} idx={i} onClick={() => setActiveTopic(topic)} />
                ))}
                {filteredTopics.length === 0 && (
                  <div style={{ gridColumn:'1/-1', textAlign:'center', padding:'48px 20px', background:'white', borderRadius:20, border:'1.5px solid #F0F9F4', animation:'spFadeUp 0.4s ease both' }}>
                    <div style={{ fontSize:42, marginBottom:12 }}>🔍</div>
                    <p style={{ fontSize:15, fontWeight:700, color:'#1B4332', margin:'0 0 6px' }}>No results for "{searchQuery}"</p>
                    <p style={{ fontSize:13, color:'#9CA3AF', margin:0 }}>Try a different keyword or browse the topics above</p>
                  </div>
                )}
              </div>

              {/* FAQ + Contact */}
              <div style={{ display:'flex', gap:24 }}>
                {/* FAQ */}
                <div style={{ flex:1, minWidth:0 }}>
                  <h2 style={{ margin:'0 0 18px', fontSize:20, fontFamily:'Georgia,serif', fontWeight:700, color:'#1a2e22', letterSpacing:'-0.01em' }}>
                    Frequently Asked Questions
                  </h2>
                  {filteredFaqs.length === 0
                    ? <p style={{ fontSize:13, color:'#9CA3AF' }}>No FAQs match "{searchQuery}".</p>
                    : (
                      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                        {filteredFaqs.map((faq, idx) => (
                          <FaqItem key={idx} faq={faq} idx={idx}
                            isOpen={openFaq === idx}
                            onToggle={() => setOpenFaq(openFaq === idx ? null : idx)}
                          />
                        ))}
                      </div>
                    )
                  }
                </div>

                {/* Contact */}
                <div style={{ width:252, flexShrink:0 }}>
                  <h2 style={{ margin:'0 0 18px', fontSize:20, fontFamily:'Georgia,serif', fontWeight:700, color:'#1a2e22', letterSpacing:'-0.01em' }}>
                    Contact Support
                  </h2>
                  <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                    <ContactCard icon="💬" title="Live Chat" badge="Online" badgeColor="#065F46" badgeBg="#D1FAE5" desc="Usually replies in under 2 minutes." showBtn pulseDot idx={0} />
                    <ContactCard icon="✉️" title="Email Support" badge="Within 24h" badgeColor="#1D4ED8" badgeBg="#DBEAFE" desc="support@leafshelf.com" idx={1} />
                    <ContactCard icon="📞" title="Call Us" badge="Mon–Fri 9AM–6PM" badgeColor="#92400E" badgeBg="#FEF3C7" desc="+1 (555) 123-4567" idx={2} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── TOPIC VIEW ── */}
          {isTopicView && (
            <div style={{ animation:'spFadeUp 0.35s ease both' }}>
              <button type="button" onClick={goHome} style={{
                display:'flex', alignItems:'center', gap:6, fontSize:13, fontWeight:500,
                color:'#6B7280', background:'none', border:'none', cursor:'pointer', marginBottom:20, padding:0,
              }}>
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Support Center
              </button>

              <div style={{
                display:'flex', alignItems:'center', gap:16, padding:'20px 24px',
                background:'linear-gradient(90deg,#F0FDF4,#ECFDF5)',
                border:'1.5px solid #A7F3D0', borderRadius:20, marginBottom:20,
              }}>
                <div style={{ width:54, height:54, borderRadius:16, flexShrink:0, background:topicMeta.iconBg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, boxShadow:'0 4px 12px rgba(0,0,0,0.18)' }}>
                  {activeTopic!.emoji}
                </div>
                <div style={{ flex:1 }}>
                  <p style={{ fontSize:18, fontWeight:700, color:'#1B4332', margin:'0 0 3px', fontFamily:'Georgia,serif' }}>{activeTopic!.title}</p>
                  <p style={{ fontSize:13, color:'#2D6A4F', margin:0 }}>{activeTopic!.desc}</p>
                </div>
                <span style={{ fontSize:12, fontWeight:700, padding:'5px 14px', borderRadius:20, background:'white', color:'#1B4332', border:'1px solid #A7F3D0' }}>
                  {activeTopic!.articles.length} articles
                </span>
              </div>

              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {activeTopic!.articles.map((article, i) => (
                  <ArticleRow key={article.id} article={article} idx={i} onClick={() => setActiveArticle(article)} />
                ))}
              </div>
            </div>
          )}

          {/* ── ARTICLE VIEW ── */}
          {isArticleView && (
            <div style={{ animation:'spFadeUp 0.35s ease both' }}>
              <button type="button" onClick={goTopic} style={{
                display:'flex', alignItems:'center', gap:6, fontSize:13, fontWeight:500,
                color:'#6B7280', background:'none', border:'none', cursor:'pointer', marginBottom:20, padding:0,
              }}>
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to {activeTopic!.title}
              </button>

              <div style={{ background:'white', borderRadius:22, border:'1.5px solid #E8F5E9', boxShadow:'0 4px 20px rgba(27,67,50,0.07)', padding:'28px 32px' }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24, paddingBottom:20, borderBottom:'1.5px solid #F0F9F4' }}>
                  <span style={{ fontSize:11, fontWeight:700, padding:'4px 12px', borderRadius:20, background:topicMeta.badgeBg, color:topicMeta.badgeColor }}>
                    {activeTopic!.emoji} {activeTopic!.title}
                  </span>
                  <span style={{ fontSize:11, color:'#9CA3AF', background:'#F6FAF8', padding:'4px 12px', borderRadius:20, border:'1px solid #E8F5E9' }}>
                    📖 {activeArticle!.time} read
                  </span>
                </div>

                <ContentRenderer content={activeArticle!.content} />

                <div style={{ borderTop:'1.5px solid #F0F9F4', marginTop:28, paddingTop:20, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <p style={{ fontSize:13, color:'#9CA3AF', margin:0 }}>Was this article helpful?</p>
                  <div style={{ display:'flex', gap:8 }}>
                    <HelpfulBtn label="👍 Yes" green />
                    <HelpfulBtn label="👎 No" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Sidebar ── */}
        <aside style={{ width:248, flexShrink:0, display:'flex', flexDirection:'column', gap:16 }}>

          {/* Popular Articles */}
          <div style={{ background:'white', borderRadius:20, border:'1.5px solid #D1FAE5', boxShadow:'0 2px 14px rgba(27,67,50,0.07)', padding:'20px 18px', animation:'spSideIn 0.6s cubic-bezier(0.34,1.56,0.64,1) both', animationDelay:'0.1s' }}>
            <h3 style={{ margin:'0 0 12px', fontSize:13, fontWeight:700, color:'#1B4332' }}>Popular Articles</h3>
            <div style={{ display:'flex', flexDirection:'column', gap:2 }}>
              {POPULAR.map((article, i) => (
                <PopularLink key={article} article={article} idx={i} onClick={() => {
                  const match = TOPICS.flatMap(t => t.articles.map(a => ({ topic:t, article:a }))).find(x => x.article.title === article);
                  if (match) { setActiveTopic(match.topic); setActiveArticle(match.article); }
                }} />
              ))}
            </div>
          </div>

          {/* System Status */}
          <div style={{ background:'white', borderRadius:20, border:'1.5px solid #D1FAE5', boxShadow:'0 2px 14px rgba(27,67,50,0.07)', padding:'20px 18px', animation:'spSideIn 0.6s cubic-bezier(0.34,1.56,0.64,1) both', animationDelay:'0.18s' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
              <h3 style={{ margin:0, fontSize:13, fontWeight:700, color:'#1B4332' }}>System Status</h3>
              <span style={{ fontSize:10, fontWeight:700, padding:'3px 9px', borderRadius:20, background:'#D1FAE5', color:'#065F46', animation:`spBadgePop 0.5s ease both`, animationDelay:'0.5s' }}>
                All Operational
              </span>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:9 }}>
              {['Website','Borrowing Service','Downloads','Audiobooks','User Accounts'].map((s, i) => (
                <StatusRow key={s} service={s} idx={i} />
              ))}
            </div>
            <button type="button" style={{ marginTop:12, fontSize:11, fontWeight:600, color:'#2D6A4F', background:'none', border:'none', cursor:'pointer', padding:0 }}>
              View status page →
            </button>
          </div>

          {/* Need More Help */}
          <div style={{ background:'linear-gradient(135deg,#1B4332 0%,#2D6A4F 100%)', borderRadius:20, boxShadow:'0 4px 20px rgba(27,67,50,0.22)', padding:'20px 18px', animation:'spSideIn 0.6s cubic-bezier(0.34,1.56,0.64,1) both', animationDelay:'0.26s' }}>
            <div style={{ fontSize:28, marginBottom:10 }}>🎫</div>
            <h3 style={{ margin:'0 0 6px', fontSize:14, fontWeight:700, color:'white' }}>Need More Help?</h3>
            <p style={{ margin:'0 0 16px', fontSize:12, color:'rgba(255,255,255,0.62)', lineHeight:1.5 }}>
              Our team is here 24/7. Average response within 24 hours.
            </p>
            <SubmitTicketBtn onClick={() => setTicketOpen(true)} />
            <p style={{ fontSize:10, color:'rgba(255,255,255,0.4)', textAlign:'center', margin:'10px 0 0' }}>No account required</p>
          </div>

          {/* More Topics — only in topic/article view */}
          {activeTopic && (
            <div style={{ background:'white', borderRadius:20, border:'1.5px solid #D1FAE5', boxShadow:'0 2px 14px rgba(27,67,50,0.07)', padding:'20px 18px', animation:'spFadeUp 0.4s ease both' }}>
              <h3 style={{ margin:'0 0 10px', fontSize:13, fontWeight:700, color:'#1B4332' }}>More Topics</h3>
              <div style={{ display:'flex', flexDirection:'column', gap:2 }}>
                {TOPICS.filter(t => t.title !== activeTopic!.title).map((t, i) => (
                  <MoreTopicBtn key={t.title} topic={t} idx={i} onClick={() => { setActiveTopic(t); setActiveArticle(null); }} />
                ))}
              </div>
            </div>
          )}

        </aside>
      </div>
    </>
  );
}
