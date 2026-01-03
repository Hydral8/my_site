'use client'

import { useState, useRef, useEffect } from 'react'
import { AppComponentProps } from '@/types/macos'

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
  Shopping reimagined. A semantic fashion product editor that lets
  users modify and generate clothing designs using natural language.
  https://usemagi.com

• Queue - On-Device AI Assistant
  An intelligent, on-device assistant natively integrated into the
  user's device. Instantly understands user intent and relevant context.
  https://queue.com

• Livv - Emergency Medical Services Platform
  Platform streamlining ambulance dispatch and patient care coordination
  for faster emergency response times.
  https://livve.us

• Meural - General Robotics Platform
  Making general robotics a modern reality.
  https://meural.com

• RocLab - Campus Innovation Lab
  Taking 20 exceptional students each semester to solve real-world
  campus problems at the University of Rochester using technology.
  https://www.instagram.com/roclab_/`,
  contact: `Contact Information:

Email: sbae703@gmail.com
LinkedIn: https://www.linkedin.com/in/sungjaebae
GitHub: https://github.com/hydral8

Feel free to reach out!`,
}

interface HistoryItem {
  command: string
  output: string
}

// Get current date/time for last login message
const getLastLoginMessage = () => {
  const now = new Date()
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  
  const dayName = days[now.getDay()]
  const monthName = months[now.getMonth()]
  const date = now.getDate()
  const hours = now.getHours().toString().padStart(2, '0')
  const minutes = now.getMinutes().toString().padStart(2, '0')
  const seconds = now.getSeconds().toString().padStart(2, '0')
  
  return `Last login: ${dayName} ${monthName} ${date} ${hours}:${minutes}:${seconds} on console\nWelcome to Terminal. Type "help" for available commands.`
}

export default function TerminalApp({ windowId, isActive }: AppComponentProps) {
  const [history, setHistory] = useState<HistoryItem[]>([
    {
      command: '',
      output: getLastLoginMessage(),
    },
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
      className="p-4 h-full overflow-y-auto font-mono text-sm bg-[#1e1e1e] cursor-text"
      onClick={() => inputRef.current?.focus()}
      style={{ 
        fontFamily: 'SF Mono, Menlo, Monaco, Courier New, monospace',
        lineHeight: '1.5'
      }}
    >
      <div className="text-[#e5e5e5]">
        {history.map((item, index) => (
          <div key={index} className="mb-2">
            {item.command && (
              <div className="flex items-start">
                <span className="text-[#a8a8a8]">sbae703@MacBook-Pro ~ % </span>
                <span className="text-[#e5e5e5] ml-1">{item.command}</span>
              </div>
            )}
            <pre className={`${index === 0 && !item.command ? 'text-[#7ac47f]' : 'text-[#e5e5e5]'} whitespace-pre-wrap font-mono mt-1`}>{item.output}</pre>
          </div>
        ))}

        <div className="flex items-start">
          <span className="text-[#a8a8a8] whitespace-nowrap">sbae703@MacBook-Pro ~ % </span>
          <input
            ref={inputRef}
            type="text"
            value={currentCommand}
            onChange={(e) => setCurrentCommand(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent outline-none text-[#e5e5e5] ml-1 caret-[#e5e5e5]"
            autoFocus
          />
        </div>

        <div ref={bottomRef} />
      </div>
    </div>
  )
}
