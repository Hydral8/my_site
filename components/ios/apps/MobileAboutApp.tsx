'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const timeline = [
  {
    startDate: '2020',
    endDate: '2021',
    company: 'Remote Roofing',
    role: 'Machine Learning Lead',
    type: 'Work',
    description: 'Led development of AI-powered computer vision roof inspection systems, reducing manual assessment time by 80% and reducing user costs by $3000.',
    link: 'https://roofer.io',
  },
  {
    startDate: '2021',
    endDate: '2025',
    company: 'University of Rochester',
    role: 'B.S. Neuroscience',
    type: 'Education',
    description: 'Major in Neuroscience with minors in Computer Science and Psychology. Explored the intersection of brain science, technology, and human behavior.',
    link: 'https://rochester.edu',
  },
  {
    startDate: '2021',
    endDate: '2025',
    company: 'Livv',
    role: 'Co-Founder',
    type: 'Company',
    description: 'Co-founded emergency medical services platform, streamlining ambulance dispatch and patient care coordination for faster response times.',
    link: 'https://livve.us',
  },
  {
    startDate: '2021',
    endDate: '2025',
    company: 'RocLab',
    role: 'Co-Founder',
    type: 'Club',
    description: 'Taking 20 exceptional students each semester to solve real-world campus problems at the University of Rochester using technology.',
    link: 'https://www.instagram.com/roclab_/',
  },
  {
    startDate: '2025',
    endDate: 'Present',
    company: 'Sidney Kimmel Medical College',
    role: 'MS1',
    type: 'Education',
    description: 'Exploring new frontiers in healthcare and health technology, looking to augment medicine with tech.',
    link: 'https://www.jefferson.edu/academics/colleges-schools-institutes/skmc.html',
  },
  {
    startDate: '2025',
    endDate: 'Present',
    company: 'Magi',
    role: 'Founder',
    type: 'Company',
    description: 'Shopping reimagined. Magi is a semantic fashion product editor that lets users modify and generate clothing designs using natural-language.',
    link: 'https://usemagi.com',
  },
  {
    startDate: '2025',
    endDate: 'Present',
    company: 'Meural',
    role: 'Founder',
    type: 'Company',
    description: 'Making general robotics a modern reality.',
    link: 'https://meural.com',
  },
]

const skills = [
  { category: 'Languages', items: ['TypeScript', 'Python', 'JavaScript', 'Rust', 'Go'] },
  { category: 'Frontend', items: ['React', 'Next.js', 'Vue', 'Tailwind CSS', 'Framer Motion'] },
  { category: 'Backend', items: ['Node.js', 'GraphQL', 'PostgreSQL', 'MongoDB', 'Redis'] },
  { category: 'AI/ML', items: ['TensorFlow', 'PyTorch', 'Computer Vision', 'NLP', 'LLMs'] },
  { category: 'Tools', items: ['Docker', 'Kubernetes', 'AWS', 'Git', 'CI/CD'] },
]

const typeColors: Record<string, string> = {
  Work: 'bg-blue-500/20 text-blue-400',
  Education: 'bg-green-500/20 text-green-400',
  Company: 'bg-purple-500/20 text-purple-400',
  Club: 'bg-orange-500/20 text-orange-400',
}

type Tab = 'about' | 'timeline' | 'skills'

export default function MobileAboutApp() {
  const [activeTab, setActiveTab] = useState<Tab>('about')
  const [expandedItem, setExpandedItem] = useState<number | null>(null)

  const tabs: { id: Tab; label: string }[] = [
    { id: 'about', label: 'About' },
    { id: 'timeline', label: 'Timeline' },
    { id: 'skills', label: 'Skills' },
  ]

  return (
    <div className="h-full flex flex-col bg-[#000000]">
      {/* Segmented Control */}
      <div className="px-4 pt-2 pb-3">
        <div className="flex bg-white/10 rounded-lg p-0.5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-1.5 text-[13px] font-medium rounded-md transition-all ${
                activeTab === tab.id
                  ? 'bg-white/20 text-white'
                  : 'text-white/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <AnimatePresence mode="wait">
          {activeTab === 'about' && (
            <motion.div
              key="about"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Profile Header */}
              <div className="text-center pt-4">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-3 flex items-center justify-center text-white text-2xl font-semibold">
                  SB
                </div>
                <h1 className="text-white text-xl font-semibold">Sung Jae Bae</h1>
                <p className="text-white/50 text-sm mt-1">Founder | Engineer | Medicine</p>
              </div>

              {/* Bio */}
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-white/80 text-sm leading-relaxed">
                  My goal is to build world changing products that meaningfully change how people live, work, and is also incredibly interesting to me.
                </p>
              </div>

              {/* Goals */}
              <div className="bg-white/5 rounded-xl p-4">
                <h3 className="text-white/40 text-xs uppercase tracking-wider mb-3">Long Term Goals</h3>
                <div className="space-y-2">
                  {['Solve / Reduce aging?', 'Silicon Photonics', 'Intelligence / Robotics', 'High Bandwidth Neural Interfaces', 'Consumer Fashion Apps'].map((goal) => (
                    <div key={goal} className="flex items-center gap-2 text-white/70 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                      {goal}
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Links */}
              <div className="bg-white/5 rounded-xl p-4">
                <h3 className="text-white/40 text-xs uppercase tracking-wider mb-3">Contact</h3>
                <div className="space-y-3">
                  <a href="mailto:sbae703@gmail.com" className="flex items-center gap-3 text-[#0a84ff] text-sm">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <path d="M22 7L12 13L2 7" />
                    </svg>
                    sbae703@gmail.com
                  </a>
                  <a href="https://github.com/hydral8" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-[#0a84ff] text-sm">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                    </svg>
                    GitHub
                  </a>
                  <a href="https://linkedin.com/in/sungjaebae" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-[#0a84ff] text-sm">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                    LinkedIn
                  </a>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'timeline' && (
            <motion.div
              key="timeline"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="space-y-3 pt-2"
            >
              {[...timeline].reverse().map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => setExpandedItem(expandedItem === i ? null : i)}
                  className="bg-white/5 rounded-xl p-4 active:bg-white/10 transition-colors cursor-default"
                >
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <h3 className="text-white font-medium text-[15px]">{item.company}</h3>
                      <p className="text-white/50 text-[13px]">{item.role}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${typeColors[item.type] || 'bg-gray-500/20 text-gray-400'}`}>
                      {item.type}
                    </span>
                  </div>
                  <p className="text-white/40 text-xs mb-2">
                    {item.startDate} — {item.endDate}
                  </p>
                  <AnimatePresence>
                    {expandedItem === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <p className="text-white/70 text-sm leading-relaxed pt-2 border-t border-white/10">
                          {item.description}
                        </p>
                        {item.link && (
                          <a
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-block mt-2 text-[#0a84ff] text-sm"
                          >
                            Visit →
                          </a>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </motion.div>
          )}

          {activeTab === 'skills' && (
            <motion.div
              key="skills"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="space-y-4 pt-2"
            >
              {skills.map((category, i) => (
                <motion.div
                  key={category.category}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white/5 rounded-xl p-4"
                >
                  <h3 className="text-white/40 text-xs uppercase tracking-wider mb-3">{category.category}</h3>
                  <div className="flex flex-wrap gap-2">
                    {category.items.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1.5 bg-white/10 text-white/80 rounded-full text-[13px]"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
