import { useState, useEffect, useRef } from 'react'
import styles from './App.module.css'

const GROQ_API_KEY = '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'
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'

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
    keywords: ['mdm', 'mobile device', 'enrollment', 'enroll', 'profile', 'policy', 'ios', 'android', 'remote wipe', 'byod', 'kiosk', 'device management'],
  },
  dc: {
    label: 'Desktop Central Help',
    url: 'https://www.manageengine.com/products/desktop-central/help/',
    logsLabel: 'Desktop Central Logs Guide',
    logsUrl: 'https://www.manageengine.com/products/desktop-central/logs-how-to.html',
    keywords: ['desktop central', 'patch', 'software deployment', 'remote control', 'inventory', 'windows', 'mac', 'linux', 'endpoint', 'agent', 'configuration'],
  },
}

function detectDocs(text) {
  const lower = text.toLowerCase()
  return Object.entries(ME_DOCS)
    .filter(([, doc]) => doc.keywords.some(k => lower.includes(k)))
    .map(([key, doc]) => ({ key, ...doc }))
}

function buildSystemPrompt(docs) {
  let docSection = ''
  if (docs.length > 0) {
    docSection = `\n\nThis email relates to ManageEngine products. Where genuinely helpful, embed these documentation links naturally in the email body as markdown [link text](URL):\n`
    docs.forEach(doc => {
      docSection += `- [${doc.label}](${doc.url})\n`
      docSection += `- [${doc.logsLabel}](${doc.logsUrl})\n`
    })
    docSection += `Only include links where they truly help the customer — never force them in.`
  }

  return `You are an expert professional email writer for a ManageEngine support team. Transform a support agent's rough notes or scenario into a polished, complete, customer-facing email.

Rules:
- Output ONLY the email body. Start directly with the greeting (e.g. "Dear [Customer Name],").
- Do NOT include a subject line, meta labels, or any commentary outside the email.
- Write naturally and fluently — never robotic or template-like.
- Match the tone requested exactly.
- Adapt length to complexity — simple issues get short emails, complex ones get detailed emails.
- Always close with a professional sign-off: "Best regards,\n[Your Name]\nManageEngine Support Team"
- Format documentation links as markdown: [anchor text](URL)${docSection}`
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
  const [scenario, setScenario]     = useState('')
  const [replyTo, setReplyTo]       = useState('')
  const [showReply, setShowReply]   = useState(false)
  const [tone, setTone]             = useState('formal')
  const [email, setEmail]           = useState('')
  const [loading, setLoading]       = useState(false)
  const [copied, setCopied]         = useState(false)
  const [error, setError]           = useState('')

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

  const generate = async () => {
    if (!scenario.trim()) return
    setLoading(true); setError(''); setEmail('')

    const docs = detectDocs(scenario + ' ' + replyTo)
    const systemPrompt = buildSystemPrompt(docs)
    const userMessage = `Write a ${tone} professional customer email for this situation:\n\n${scenario}${replyTo ? `\n\nCustomer's original email to reply to:\n"""\n${replyTo}\n"""` : ''}`

    try {
      const res = await fetch(GROQ_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage },
          ],
          temperature: 0.7,
          max_tokens: 1024,
        }),
      })

      const data = await res.json()

      if (data?.choices?.[0]?.message?.content) {
        setEmail(data.choices[0].message.content.trim())
        setTimeout(() => outputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150)
      } else if (data?.error?.message) {
        setError(`Error: ${data.error.message}`)
      } else {
        setError('Something went wrong. Please try again.')
      }
    } catch (e) {
      setError('Network error. Please try again.')
    }

    setLoading(false)
  }

  const copy = () => {
    const plain = email.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 ($2)')
    navigator.clipboard.writeText(plain).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2500)
    })
  }

  const hasDocs    = detectDocs(scenario + ' ' + replyTo).length > 0
  const activeTone = TONES.find(t => t.id === tone)

  return (
    <>
      <canvas ref={canvasRef} className={styles.bg} />
      <div className={styles.wrap}>

        <header className={styles.header}>
          <div className={styles.badge}>
            <span className={styles.badgeDot} />
            AI Email Composer
          </div>
          <h1 className={styles.h1}>
            Write <em className={styles.em}>better emails</em>,<br />effortlessly.
          </h1>
          <p className={styles.sub}>
            Describe your situation in plain words — AI writes a polished,
            professional customer email instantly.
          </p>
        </header>

        <main className={styles.main}>

          {/* Step 1 */}
          <section className={styles.card}>
            <div className={styles.label}>
              <span className={styles.stepNum}>1</span>
              Describe your situation or paste raw content
            </div>
            <textarea
              className={styles.textarea}
              rows={6}
              placeholder={"Paste your raw notes, scenario, or bullet points here. For example:\n\n• Customer's MDM enrollment is failing — profile not accepted on iPhone. Need to ask them to re-enroll and check logs.\n\n• Following up on ticket #4521. Issue resolved after patch. Thank them for patience.\n\n• Customer upset about downtime. Apologise and explain the maintenance window."}
              value={scenario}
              onChange={e => setScenario(e.target.value)}
            />
            <div className={styles.charCount}>{scenario.length} characters</div>

            <button className={styles.toggleBtn} onClick={() => setShowReply(p => !p)}>
              {showReply ? '✕ Remove' : '+ Add'} the customer email you&apos;re replying to
            </button>

            {showReply && (
              <div className={styles.replySection}>
                <div className={styles.replyLabel}>📧 Customer's Original Email</div>
                <textarea
                  className={`${styles.textarea} ${styles.textareaAlt}`}
                  rows={5}
                  placeholder="Paste the customer's email here. The AI will read it and write a proper reply..."
                  value={replyTo}
                  onChange={e => setReplyTo(e.target.value)}
                />
              </div>
            )}
          </section>

          {/* Step 2 */}
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

          {error && (
            <div className={styles.errorBox}>
              <span>⚠️</span> {error}
            </div>
          )}

          <button
            className={styles.generateBtn}
            onClick={generate}
            disabled={loading || !scenario.trim()}
          >
            {loading ? (
              <><span className={styles.spinner} /> AI is writing your email…</>
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
                  {copied ? (
                    <><span>✓</span> Copied!</>
                  ) : (
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
              Powered by Groq AI &nbsp;·&nbsp; ManageEngine resources:&nbsp;
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
