import { ReactElement, useEffect, useMemo, useState } from 'react'
import { ArrowUpRight, Check, Command, LogOut, Minus, Play, UserRound } from 'lucide-react'
import brandMark from './assets/icon.png'

type RewriteStage = 'capturing' | 'requesting' | 'applying' | 'completed' | 'cancelled' | 'failed'

interface RewriteStatus {
  operationId: number
  stage: RewriteStage
  elapsedMs: number
  message?: string
}

interface User {
  id: string
  email: string
  name: string
  avatar?: string
}

const actions = [
  { id: 'clean-up', label: 'Clean up', key: '01', detail: 'Clarity, grammar, voice intact' },
  { id: 'shorter', label: 'Make shorter', key: '02', detail: 'Less repetition, same meaning' },
  { id: 'warmer', label: 'Make warmer', key: '03', detail: 'Considerate without sounding fake' },
  { id: 'more-direct', label: 'More direct', key: '04', detail: 'Lead with the point' },
  { id: 'fix-grammar', label: 'Grammar only', key: '05', detail: 'Mechanics, no stylistic rewrite' }
]

const stageCopy: Record<RewriteStage, string> = {
  capturing: 'Reading selection',
  requesting: 'Rewriting',
  applying: 'Replacing text',
  completed: 'Done',
  cancelled: 'Cancelled',
  failed: 'Could not rewrite'
}

function useRewriteStatus(): RewriteStatus | null {
  const [status, setStatus] = useState<RewriteStatus | null>(null)

  useEffect(() => {
    let mounted = true
    window.rerit.rewrite.getStatus().then((value) => mounted && setStatus(value))
    const unsubscribe = window.rerit.rewrite.onStatus(setStatus)
    return () => {
      mounted = false
      unsubscribe()
    }
  }, [])

  return status
}

function StatusSurface(): ReactElement {
  const status = useRewriteStatus()
  const stage = status?.stage || 'requesting'
  const failed = stage === 'failed'
  const completed = stage === 'completed'

  useEffect(() => {
    document.documentElement.dataset.surface = 'status'
    return () => {
      delete document.documentElement.dataset.surface
    }
  }, [])

  return (
    <div className="rewrite-capsule" data-stage={stage} role="status" aria-live="polite">
      <span className="capsule-signal" aria-hidden="true">
        {completed ? (
          <Check size={15} strokeWidth={2.4} />
        ) : failed ? (
          <Minus size={15} strokeWidth={2.4} />
        ) : (
          <span className="signal-track">
            <i />
            <i />
            <i />
          </span>
        )}
      </span>
      <span className="capsule-copy">
        <strong>{failed ? status?.message || stageCopy[stage] : stageCopy[stage]}</strong>
        {!failed && !completed && <small>working</small>}
      </span>
      <img className="capsule-wordmark" src={brandMark} alt="" />
    </div>
  )
}

function App(): ReactElement {
  const status = useRewriteStatus()
  const [user, setUser] = useState<User | null>(null)
  const [active, setActive] = useState(() => localStorage.getItem('rerit-active') !== 'false')
  const [action, setAction] = useState(
    () => localStorage.getItem('rerit-default-action') || 'clean-up'
  )
  const [note, setNote] = useState(
    'hey, just wanted to follow up on this — i think we should probably move the launch to thursday so the team has enough time to test everything properly.'
  )

  useEffect(() => {
    window.rerit.auth.getStatus().then((result) => setUser(result.user))
    return window.rerit.auth.onSuccess(() => {
      window.rerit.auth.getStatus().then((result) => setUser(result.user))
    })
  }, [])

  useEffect(() => {
    localStorage.setItem('rerit-active', String(active))
    window.rerit.preferences.setShortcutActive(active)
  }, [active])

  useEffect(() => {
    localStorage.setItem('rerit-default-action', action)
    window.rerit.preferences.setDefaultAction(action)
  }, [action])

  const selectedAction = useMemo(() => actions.find((item) => item.id === action)!, [action])
  const busy = !!status && ['capturing', 'requesting', 'applying'].includes(status.stage)

  return (
    <div className="studio-shell">
      <header className="studio-bar">
        <div className="brand-lockup">
          <img className="brand-cut" src={brandMark} alt="" />
          <span>Rerit</span>
          <em>writing instrument</em>
        </div>
        <div className="system-state" data-active={active}>
          <span />
          {busy ? stageCopy[status!.stage] : active ? 'Listening' : 'Paused'}
        </div>
        <button className="quiet-button" onClick={() => setActive((value) => !value)}>
          {active ? 'Pause' : 'Resume'}
        </button>
      </header>

      <main className="studio-main">
        <section className="writing-stage" aria-labelledby="stage-title">
          <div className="stage-heading">
            <div>
              <p className="kicker">Try the real workflow</p>
              <h1 id="stage-title">
                Write it rough.
                <br />
                Send it right.
              </h1>
            </div>
            <p className="stage-instruction">
              Select any sentence below, then press the shortcut. Rerit replaces it where it is.
            </p>
          </div>

          <div className="paper-frame">
            <div className="paper-meta">
              <span>Draft / unsent</span>
              <span>{note.length} characters</span>
            </div>
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              spellCheck={false}
              aria-label="Try Rerit on this draft"
            />
            <div className="paper-command">
              <span className="command-icon">
                <Command size={14} />
              </span>
              <span>
                <kbd>⌘</kbd>
                <kbd>⇧</kbd>
                <kbd>E</kbd>
              </span>
              <strong>{selectedAction.label}</strong>
              <ArrowUpRight size={15} />
            </div>
          </div>

          <div className="stage-footnote">
            <span>Works in Mail, Slack, Notion, Docs, and anywhere you can type.</span>
            <button onClick={() => window.rerit.app.runInBackground()}>
              Run in background <ArrowUpRight size={13} />
            </button>
          </div>
        </section>

        <aside className="control-deck" aria-label="Rewrite controls">
          <div className="deck-heading">
            <span>Default action</span>
            <small>one shortcut</small>
          </div>
          <div className="action-list">
            {actions.map((item) => (
              <button
                key={item.id}
                data-selected={item.id === action}
                onClick={() => setAction(item.id)}
              >
                <span className="action-index">{item.key}</span>
                <span className="action-copy">
                  <strong>{item.label}</strong>
                  <small>{item.detail}</small>
                </span>
                <span className="action-select">
                  {item.id === action ? <Check size={14} /> : null}
                </span>
              </button>
            ))}
          </div>

          <div className="shortcut-block">
            <span>Global shortcut</span>
            <div>
              <kbd>⌘</kbd>
              <kbd>⇧</kbd>
              <kbd>E</kbd>
            </div>
            <p>Press it again to replace the current request.</p>
          </div>

          <div className="account-strip">
            <span className="account-avatar">
              {user ? user.name.slice(0, 1).toUpperCase() : <UserRound size={15} />}
            </span>
            <span>
              <strong>{user?.name || 'Guest mode'}</strong>
              <small>{user?.email || 'Sign in to start rewriting'}</small>
            </span>
            {user ? (
              <button
                aria-label="Sign out"
                onClick={async () => {
                  await window.rerit.auth.signOut()
                  setUser(null)
                }}
              >
                <LogOut size={14} />
              </button>
            ) : (
              <button className="sign-in" onClick={() => window.rerit.auth.signIn()}>
                Sign in
              </button>
            )}
          </div>
        </aside>
      </main>

      <footer className="studio-footer">
        <span>Text is processed only when you press the shortcut.</span>
        <span>
          <Play size={11} fill="currentColor" /> Rerit stays ready in the menu bar
        </span>
      </footer>
    </div>
  )
}

export default function Root(): ReactElement {
  return new URLSearchParams(window.location.search).get('surface') === 'status' ? (
    <StatusSurface />
  ) : (
    <App />
  )
}
