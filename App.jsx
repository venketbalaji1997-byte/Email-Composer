import { useState, useEffect, useRef } from 'react'
import styles from './App.module.css'

const TONES = [
  { id: 'formal',     label: 'Formal',     icon: '⚖️', desc: 'Professional & authoritative' },
  { id: 'warm',       label: 'Warm',       icon: '☀️', desc: 'Friendly & empathetic' },
  { id: 'concise',    label: 'Concise',    icon: '⚡', desc: 'Brief & to the point' },
  { id: 'technical',  label: 'Technical',  icon: '🔧', desc: 'Detailed & precise' },
  { id: 'apologetic', label: 'Apologetic', icon: '🤝', desc: 'Sincere & reassuring' },
  { id: 'proactive',  label: 'Proactive',  icon: '🚀', desc: 'Confident & solutions-focused' },
]

const ME_DOCS = {
  mdm: {
    label: 'MDM Help Center',
    url: 'https://www.manageengine.com/mobile-device-management/help/',
    logsLabel: 'MDM Logs Guide',
    logsUrl: 'https://www.manageengine.com/mobile-device-management/how-to/logs-how-to.html',
    keywords: ['mdm', 'mobile device', 'enrollment', 'enroll', 'profile', 'policy', 'app management', 'ios', 'android', 'remote wipe', 'byod', 'kiosk', 'device'],
  },
  dc: {
    label: 'Desktop Central Help',
    url: 'https://www.manageengine.com/products/desktop-central/help/',
    logsLabel: 'Desktop Central Logs Guide',
    logsUrl: 'https://www.manageengine.com/products/desktop-central/logs-how-to.html',
    keywords: ['desktop central', 'patch', 'software deployment', 'remote control', 'inventory', 'windows', 'mac', 'linux', 'endpoint', 'agent', 'configuration', 'desktop'],
  },
}

const TONE_CONFIG = {
  formal: {
    greeting: 'Dear Valued Customer,',
    signoff: 'Yours sincerely,\n[Your Name]\nManageEngine Support Team',
    openers: ['We are writing to inform you that', 'Please be advised that', 'We would like to bring to your attention that', 'This is to inform you that'],
    closers: ['Please do not hesitate to contact us should you require any further assistance.', 'We remain at your disposal for any additional queries.', 'Kindly reach out to us if you need further clarification.'],
    replyAck: 'Thank you for your email. We have carefully reviewed your message and are pleased to provide you with the following response.',
    troubleshootOpener: 'We acknowledge your report regarding the issue you have encountered and would like to provide you with the necessary guidance to resolve it.',
    docIntro: 'To assist you further, we would like to direct you to the following official resources:',
  },
  warm: {
    greeting: 'Hi there,',
    signoff: 'Warm regards,\n[Your Name]\nManageEngine Support Team',
    openers: ["Hope you're doing well!", "Thanks so much for getting in touch!", "We appreciate you reaching out!", "Hope this message finds you well!"],
    closers: ["We're always here if you need anything else — don't hesitate to ask!", "Feel free to reach out anytime, we're happy to help!", "Looking forward to hearing from you, and we're here every step of the way!"],
    replyAck: "Thanks so much for your email! We've had a good look at everything you shared and here's what we found.",
    troubleshootOpener: "We totally understand how frustrating technical issues can be, and we're right here to help you sort this out!",
    docIntro: 'To help you out, here are some handy resources that should point you in the right direction:',
  },
  concise: {
    greeting: 'Hi,',
    signoff: 'Best,\n[Your Name]',
    openers: ['Quick update:', 'Just to let you know —', 'Following up on your query:', 'Here is what you need:'],
    closers: ['Let us know if you need anything else.', 'Happy to help if you have questions.', 'Reach out if you need more info.'],
    replyAck: 'Thanks for your email. Here is our response:',
    troubleshootOpener: 'We have reviewed your issue. Here are the steps to resolve it:',
    docIntro: 'Helpful resources:',
  },
  technical: {
    greeting: 'Dear Customer,',
    signoff: 'Technical Regards,\n[Your Name]\nManageEngine Technical Support',
    openers: ['Following our analysis of your reported issue,', 'Upon reviewing your case,', 'Based on the technical details provided,', 'After investigating the root cause,'],
    closers: ['Please review the referenced documentation and log files to proceed with the recommended resolution steps. Contact us if the issue persists after following these steps.', 'Kindly follow the above steps sequentially and refer to the documentation provided. Do not hesitate to escalate if the issue remains unresolved after completing all steps.'],
    replyAck: 'Thank you for providing the details in your email. Upon reviewing your message, we have the following technical response.',
    troubleshootOpener: 'Following our analysis of the reported issue, we have identified the steps required to diagnose and resolve the problem.',
    docIntro: 'Please refer to the following technical documentation for detailed steps and log analysis procedures:',
  },
  apologetic: {
    greeting: 'Dear Valued Customer,',
    signoff: 'Sincerely,\n[Your Name]\nManageEngine Support Team',
    openers: ['We sincerely apologize for the inconvenience this has caused you.', 'We are truly sorry for the experience you have had.', 'Please accept our heartfelt apologies for the trouble this has caused.', 'We deeply regret any frustration this situation may have caused.'],
    closers: ['We truly value your patience and understanding, and we are committed to making this right for you.', 'Thank you for your continued patience — we are doing everything we can to resolve this as quickly as possible.', 'Your satisfaction is our top priority, and we sincerely apologize again for this experience.'],
    replyAck: 'Thank you for reaching out and bringing this to our attention. We sincerely apologize for the experience described in your email.',
    troubleshootOpener: 'We sincerely apologize for the inconvenience this issue has caused. We understand this has disrupted your workflow and we want to resolve it as quickly as possible.',
    docIntro: 'To help resolve this as quickly as possible, please refer to the following resources:',
  },
  proactive: {
    greeting: 'Hi,',
    signoff: 'Best regards,\n[Your Name]\nManageEngine Support Team',
    openers: ["Great news — we have a solution ready for you!", "We have identified the next steps to resolve your issue.", "We are ready to help you move forward quickly!", "We have everything you need to get this resolved today."],
    closers: ["Let us know when you are ready to proceed and we will guide you through every step!", "We are confident this will resolve your issue — reach out and we will get started right away!", "Take action on the above steps today and do not hesitate to contact us for real-time support!"],
    replyAck: "Thanks for your email — we reviewed it straight away and we are ready with a clear action plan!",
    troubleshootOpener: "We have proactively reviewed your issue and identified exactly what needs to be done to get you back on track.",
    docIntro: 'Here are the exact resources you need to resolve this quickly:',
  },
}

const pick = arr => arr[Math.floor(Math.random() * arr.length)]

function detectIntent(text) {
  const lower = text.toLowerCase()
  const intents = []
  if (lower.match(/fail|error|issue|problem|not working|broken|crash|trouble|cannot|can't|won't|doesn't/)) intents.push('troubleshoot')
  if (lower.match(/follow.?up|checking|update|status|progress|any news/)) intents.push('followup')
  if (lower.match(/thank|appreciate|grateful|great job|excellent/)) intents.push('gratitude')
  if (lower.match(/sorry|apologize|apology|regret|mistake|inconvenience/)) intents.push('apology')
  if (lower.match(/install|setup|configure|deploy|implement|how to/)) intents.push('guide')
  if (lower.match(/log|debug|trace|diagnose|investigate/)) intents.push('logs')
  if (lower.match(/enroll|register|add device|onboard/)) intents.push('enrollment')
  if (lower.match(/patch|update|upgrade|version/)) intents.push('patch')
  if (lower.match(/licen|subscription|renew|expire|billing/)) intents.push('license')
  return intents.length > 0 ? intents : ['general']
}

function detectDocs(text) {
  const lower = text.toLowerCase()
  return Object.entries(ME_DOCS)
    .filter(([, doc]) => doc.keywords.some(k => lower.includes(k)))
    .map(([key, doc]) => ({ key, ...doc }))
}

function cleanAndSplit(thoughts) {
  return thoughts
    .split(/[.\n!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 4)
    .map(s => s.charAt(0).toUpperCase() + s.slice(1))
}

function buildDocSection(docs, config, intents) {
  if (docs.length === 0) return ''
  const needsLogs = intents.includes('logs') || intents.includes('troubleshoot')
  let section = config.docIntro + '\n\n'
  docs.forEach(doc => {
    section += `• [${doc.label}](${doc.url})\n`
    if (needsLogs) section += `• [${doc.logsLabel}](${doc.logsUrl})\n`
  })
  return section.trim()
}

function generateEmail(thoughts, replyTo, tone) {
  const config  = TONE_CONFIG[tone]
  const intents = detectIntent(thoughts + ' ' + replyTo)
  const docs    = detectDocs(thoughts + ' ' + replyTo)
  const sentences = cleanAndSplit(thoughts)
  const isTroubleshoot = intents.includes('troubleshoot') || intents.includes('logs')

  let email = ''

  // Greeting
  email += config.greeting + '\n\n'

  // Reply acknowledgement or opener
  if (replyTo && replyTo.trim()) {
    email += config.replyAck + '\n\n'
  } else if (isTroubleshoot) {
    email += config.troubleshootOpener + '\n\n'
  } else {
    email += pick(config.openers) + ' '
    if (sentences.length > 0) {
      const first = sentences[0]
      email += (first.charAt(0).toLowerCase() + first.slice(1)) + '.\n\n'
    } else {
      email += '\n\n'
    }
  }

  // Body sentences
  const bodyStart = (replyTo || isTroubleshoot) ? 0 : 1
  const bodySentences = sentences.slice(bodyStart)

  if (bodySentences.length > 0) {
    if (tone === 'concise') {
      email += bodySentences.map(s => `• ${s}`).join('\n') + '\n\n'
    } else if (tone === 'technical') {
      email += 'Please follow the steps below:\n\n'
      email += bodySentences.map((s, i) => `${i + 1}. ${s}`).join('\n') + '\n\n'
    } else {
      // Natural paragraphs — 2 sentences per paragraph
      for (let i = 0; i < bodySentences.length; i += 2) {
        email += bodySentences.slice(i, i + 2).join(' ') + '\n\n'
      }
    }
  }

  // Doc references
  const docSection = buildDocSection(docs, config, intents)
  if (docSection) email += docSection + '\n\n'

  // Closing
  email += pick(config.closers) + '\n\n'

  // Sign-off
  email += config.signoff

  return email
}

function renderEmailWithLinks(text) {
  const result = []
  const regex = /\[([^\]]+)\]\(([^)]+)\)/g
  let lastIndex = 0, match
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex)
      result.push(<span key={`t${lastIndex}`}>{text.slice(lastIndex, match.index)}</span>)
    result.push(
      <a key={`l${match.index}`} href={match[2]} target="_blank" rel="noopener noreferrer" className={styles.emailLink}>
        {match[1]}
      </a>
    )
    lastIndex = match.index + match[0].length
  }
  if (lastIndex < text.length) result.push(<span key="tend">{text.slice(lastIndex)}</span>)
  return result
}

export default function App() {
  const [thoughts, setThoughts]     = useState('')
  const [replyTo, setReplyTo]       = useState('')
  const [showReply, setShowReply]   = useState(false)
  const [tone, setTone]             = useState('formal')
  const [email, setEmail]           = useState('')
  const [generating, setGenerating] = useState(false)
  const [copied, setCopied]         = useState(false)

  const canvasRef = useRef(null)
  const outputRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animId, t = 0
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    resize()
    window.addEventListener('resize', resize)
    const ORBS = [
      { x: 0.15, y: 0.20, r: 300, c: 'rgba(59,130,246,0.07)'  },
      { x: 0.85, y: 0.65, r: 360, c: 'rgba(99,155,255,0.05)'  },
      { x: 0.50, y: 0.90, r: 220, c: 'rgba(147,197,253,0.08)' },
      { x: 0.90, y: 0.10, r: 200, c: 'rgba(191,219,254,0.09)' },
      { x: 0.40, y: 0.45, r: 180, c: 'rgba(59,130,246,0.04)'  },
    ]
    const draw = () => {
      const { width: W, height: H } = canvas
      ctx.clearRect(0, 0, W, H)
      const bg = ctx.createLinearGradient(0, 0, W, H)
      bg.addColorStop(0, '#EBF4FF'); bg.addColorStop(0.5, '#F0F7FF'); bg.addColorStop(1, '#E8F0FE')
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H)
      ORBS.forEach((o, i) => {
        const ox = W * o.x + Math.sin(t * 0.0003 + i * 1.2) * 35
        const oy = H * o.y + Math.cos(t * 0.0004 + i * 0.9) * 25
        const g  = ctx.createRadialGradient(ox, oy, 0, ox, oy, o.r)
        g.addColorStop(0, o.c); g.addColorStop(1, 'transparent')
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(ox, oy, o.r, 0, Math.PI * 2); ctx.fill()
      })
      ctx.strokeStyle = 'rgba(59,130,246,0.035)'; ctx.lineWidth = 1
      for (let x = 0; x < W; x += 64) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke() }
      for (let y = 0; y < H; y += 64) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke() }
      t++; animId = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize) }
  }, [])

  const generate = () => {
    if (!thoughts.trim()) return
    setGenerating(true); setEmail('')
    setTimeout(() => {
      setEmail(generateEmail(thoughts, replyTo, tone))
      setGenerating(false)
      setTimeout(() => outputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
    }, 700)
  }

  const copy = () => {
    const plain = email.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 ($2)')
    navigator.clipboard.writeText(plain).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2500) })
  }

  const hasDocs    = detectDocs(thoughts + ' ' + replyTo).length > 0
  const activeTone = TONES.find(t => t.id === tone)

  return (
    <>
      <canvas ref={canvasRef} className={styles.bg} />
      <div className={styles.wrap}>

        <header className={styles.header}>
          <div className={styles.badge}>
            <span className={styles.badgeDot} />
            Smart Email Composer
          </div>
          <h1 className={styles.h1}>
            Write <em className={styles.em}>better emails</em>,<br />effortlessly.
          </h1>
          <p className={styles.sub}>
            Turn rough thoughts into polished professional emails — with smart ManageEngine
            documentation links included automatically.
          </p>
          <div className={styles.pills}>
            <span className={styles.pill}>✓ No API key</span>
            <span className={styles.pill}>✓ No limits</span>
            <span className={styles.pill}>✓ 100% free</span>
            <span className={styles.pill}>✓ Works instantly</span>
          </div>
        </header>

        <main className={styles.main}>

          <section className={styles.card}>
            <div className={styles.label}>
              <span className={styles.stepNum}>1</span>
              What do you want to say?
            </div>
            <textarea
              className={styles.textarea}
              rows={5}
              placeholder="e.g. tell the customer their device enrollment is failing because the MDM profile wasn't accepted, ask them to retry and check the agent logs..."
              value={thoughts}
              onChange={e => setThoughts(e.target.value)}
            />
            <div className={styles.charCount}>{thoughts.length} characters</div>
            <button className={styles.toggleBtn} onClick={() => setShowReply(p => !p)}>
              {showReply ? '✕ Remove' : '+ Add'} the email you&apos;re replying to
            </button>
            {showReply && (
              <div className={styles.replySection}>
                <div className={styles.replyLabel}>Original Email (optional context)</div>
                <textarea
                  className={`${styles.textarea} ${styles.textareaAlt}`}
                  rows={4}
                  placeholder="Paste the customer's email here for more contextual responses..."
                  value={replyTo}
                  onChange={e => setReplyTo(e.target.value)}
                />
              </div>
            )}
          </section>

          <section className={styles.card}>
            <div className={styles.label}>
              <span className={styles.stepNum}>2</span>
              Choose your tone
            </div>
            <div className={styles.toneGrid}>
              {TONES.map(t => (
                <button
                  key={t.id}
                  className={`${styles.toneCard} ${tone === t.id ? styles.toneActive : ''}`}
                  onClick={() => setTone(t.id)}
                >
                  <span className={styles.toneIcon}>{t.icon}</span>
                  <span className={styles.toneName}>{t.label}</span>
                  <span className={styles.toneDesc}>{t.desc}</span>
                </button>
              ))}
            </div>
          </section>

          <button className={styles.generateBtn} onClick={generate} disabled={generating || !thoughts.trim()}>
            {generating ? (
              <><span className={styles.spinner} /> Composing your email…</>
            ) : (
              <>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 2L11 13"/><path d="M22 2L15 22 11 13 2 9l20-7z"/>
                </svg>
                Generate Email — {activeTone?.label} Tone
              </>
            )}
          </button>

          {email && (
            <div ref={outputRef} className={styles.outputCard}>
              <div className={styles.outputHeader}>
                <div className={styles.outputTitle}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="1.5">
                    <path d="M20 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2z"/>
                    <polyline points="20,6 12,13 4,6"/>
                  </svg>
                  Your Polished Email
                </div>
                <button className={`${styles.copyBtn} ${copied ? styles.copyDone : ''}`} onClick={copy}>
                  {copied ? <><span>✓</span> Copied!</> : (
                    <>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="9" y="9" width="13" height="13" rx="2"/>
                        <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                      </svg>
                      Copy to clipboard
                    </>
                  )}
                </button>
              </div>
              <div className={styles.outputBody}>
                <p className={styles.emailText}>{renderEmailWithLinks(email)}</p>
                {hasDocs && (
                  <div className={styles.docNote}>
                    <span>📚</span>
                    <span>ManageEngine documentation links have been embedded based on your topic. Click any link to verify before sharing with your customer.</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <footer className={styles.footer}>
            <p>
              ManageEngine resources:&nbsp;
              <a href="https://www.manageengine.com/mobile-device-management/help/" target="_blank" rel="noopener noreferrer">MDM Help</a>
              &nbsp;·&nbsp;
              <a href="https://www.manageengine.com/mobile-device-management/how-to/logs-how-to.html" target="_blank" rel="noopener noreferrer">MDM Logs</a>
              &nbsp;·&nbsp;
              <a href="https://www.manageengine.com/products/desktop-central/help/" target="_blank" rel="noopener noreferrer">Desktop Central Help</a>
              &nbsp;·&nbsp;
              <a href="https://www.manageengine.com/products/desktop-central/logs-how-to.html" target="_blank" rel="noopener noreferrer">DC Logs</a>
            </p>
          </footer>
        </main>
      </div>
    </>
  )
}
