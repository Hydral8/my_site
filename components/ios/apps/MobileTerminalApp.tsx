'use client'

import { useState, useRef, useEffect } from 'react'

const commands: Record<string, string> = {
  help: `Available commands:
  help     - Show this help message
  about    - Learn about Sung Jae Bae
  skills   - View technical skills
  projects - List recent projects
  contact  - Get contact information
  clear    - Clear the terminal`,
  about: `About Me

My goal is to build world changing products that meaningfully change
how people live, work, and is also incredibly interesting to me.

Have a couple long term goals atm:
• Solve / Reduce aging?
• Silicon Photonics
• Intelligence / Robotics
• High Bandwidth Neural Interfaces
• Consumer Fashion Apps`,
  skills: `Technical Skills:

• Languages: TypeScript, Python, JavaScript, Rust, Go
• Frontend: React, Next.js, Vue, Tailwind CSS, Framer Motion
• Backend: Node.js, GraphQL, PostgreSQL, MongoDB, Redis
• AI/ML: TensorFlow, PyTorch, Computer Vision, NLP, LLMs
• Tools: Docker, Kubernetes, AWS, Git, CI/CD`,
  projects: `Recent Projects:

• Magi - Semantic Fashion Product Editor
• Queue - On-Device AI Assistant
• Livv - Emergency Medical Services Platform
• Meural - General Robotics Platform
• RocLab - Campus Innovation Lab`,
  contact: `Contact Information:

Email: sbae703@gmail.com
LinkedIn: linkedin.com/in/sungjaebae
GitHub: github.com/hydral8

Feel free to reach out!`,
}

interface HistoryItem {
  command: string
  output: string
}

const getLastLoginMessage = () => {
  const now = new Date()
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `Last login: ${days[now.getDay()]} ${months[now.getMonth()]} ${now.getDate()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')} on console\nType "help" for available commands.`
}

export default function MobileTerminalApp() {
  const [history, setHistory] = useState<HistoryItem[]>([
    { command: '', output: getLastLoginMessage() },
  ])
  const [currentCommand, setCurrentCommand] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [history])

  const handleCommand = (cmd: string) => {
    const trimmedCmd = cmd.trim().toLowerCase()
    if (trimmedCmd === 'clear') {
      setHistory([])
      return
    }
    const output = commands[trimmedCmd] || `zsh: command not found: ${cmd}`
    setHistory((prev) => [...prev, { command: cmd, output }])
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCommand(currentCommand)
      setCurrentCommand('')
    }
  }

  return (
    <div
      className="p-4 h-full overflow-y-auto font-mono text-[13px] bg-[#1e1e1e] cursor-text"
      onClick={() => inputRef.current?.focus()}
      style={{ fontFamily: 'SF Mono, Menlo, Monaco, Courier New, monospace', lineHeight: '1.5' }}
    >
      <div className="text-[#e5e5e5]">
        {history.map((item, index) => (
          <div key={index} className="mb-2">
            {item.command && (
              <div className="flex items-start">
                <span className="text-[#a8a8a8]">~ % </span>
                <span className="text-[#e5e5e5] ml-1">{item.command}</span>
              </div>
            )}
            <pre className={`${index === 0 && !item.command ? 'text-[#7ac47f]' : 'text-[#e5e5e5]'} whitespace-pre-wrap font-mono mt-1`}>
              {item.output}
            </pre>
          </div>
        ))}

        <div className="flex items-start">
          <span className="text-[#a8a8a8] whitespace-nowrap">~ % </span>
          <input
            ref={inputRef}
            type="text"
            value={currentCommand}
            onChange={(e) => setCurrentCommand(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent outline-none text-[#e5e5e5] ml-1 caret-[#e5e5e5] text-[13px]"
            autoFocus
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
          />
        </div>
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
