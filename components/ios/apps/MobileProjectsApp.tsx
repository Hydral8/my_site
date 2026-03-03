'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

const projects = [
  {
    title: 'Magi',
    tagline: 'Semantic Fashion Product Editor',
    description: 'Shopping reimagined. A semantic fashion product editor that lets users modify and generate clothing designs using natural language.',
    tech: ['AI/ML', 'Computer Vision', 'React', 'Python'],
    link: 'https://usemagi.com',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    icon: '/icons/magi.png',
    year: '2025',
  },
  {
    title: 'Queue',
    tagline: 'On-Device AI Assistant',
    description: 'An intelligent, on-device assistant natively integrated into the user\'s device. Instantly understands user intent and relevant context, enabling automation of tasks.',
    tech: ['TypeScript', 'AI/ML', 'Node.js', 'On-Device'],
    link: 'https://queue.com',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    year: '2025',
  },
  {
    title: 'Livv',
    tagline: 'Emergency Medical Services Platform',
    description: 'Platform streamlining ambulance dispatch and patient care coordination for faster emergency response times.',
    tech: ['React', 'Node.js', 'Real-time', 'Healthcare'],
    link: 'https://livve.us',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    icon: '/icons/livve.png',
    year: '2021',
  },
  {
    title: 'Meural',
    tagline: 'General Robotics Platform',
    description: 'Making general robotics a modern reality.',
    tech: ['Robotics', 'AI/ML', 'Python', 'Computer Vision'],
    link: 'https://meural.ai',
    gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    background: 'linear-gradient(135deg, #667eea 0%, #4facfe 100%)',
    icon: '/icons/meural.png',
    year: '2025',
  },
  {
    title: 'RocLab',
    tagline: 'Campus Innovation Lab',
    description: 'Taking 20 exceptional students each semester to solve real-world campus problems at the University of Rochester using technology.',
    tech: ['Full Stack', 'React', 'Various'],
    link: 'https://www.instagram.com/roclab_/',
    gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    background: 'linear-gradient(135deg, #FFD93D 0%, #FFA900 100%)',
    icon: '/icons/roclab.png',
    year: '2021',
  },
]

export default function MobileProjectsApp() {
  const [selectedProject, setSelectedProject] = useState<typeof projects[0] | null>(null)

  return (
    <div className="h-full flex flex-col bg-[#000000]">
      {/* Projects Grid */}
      <div className="flex-1 overflow-y-auto px-4 pt-2 pb-4">
        <div className="grid grid-cols-2 gap-3">
          {projects.map((project, i) => (
            <motion.div
              key={project.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedProject(project)}
              className="aspect-square rounded-2xl overflow-hidden cursor-default relative"
              style={{
                background: project.background || project.gradient,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
              }}
            >
              {project.icon ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                  <Image
                    src={project.icon}
                    alt={project.title}
                    width={project.title === 'RocLab' ? 72 : 48}
                    height={project.title === 'RocLab' ? 72 : 48}
                    className="mb-2 object-contain"
                    priority
                  />
                  {project.title !== 'RocLab' && (
                    <>
                      <h3 className={`text-sm font-semibold ${project.title === 'Livv' ? 'text-gray-900' : 'text-white'}`}>
                        {project.title}
                      </h3>
                      <p className={`text-[10px] text-center font-medium mt-0.5 ${project.title === 'Livv' ? 'text-gray-700' : 'text-white/80'}`}>
                        {project.tagline}
                      </p>
                    </>
                  )}
                </div>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                  <h3 className="text-white text-lg font-bold mb-1 drop-shadow-lg">{project.title}</h3>
                  <p className="text-white/80 text-[10px] font-medium drop-shadow">{project.tagline}</p>
                </div>
              )}
              <div className="absolute top-2 right-2 bg-black/30 backdrop-blur-sm px-1.5 py-0.5 rounded text-white/80 text-[9px] font-medium">
                {project.year}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/95 z-50 flex flex-col"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <button
                onClick={() => setSelectedProject(null)}
                className="text-[#0a84ff] text-[17px]"
              >
                Done
              </button>
              <span className="text-white font-semibold text-[17px]">{selectedProject.title}</span>
              <div className="w-10" />
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Hero */}
              <div
                className="aspect-video rounded-2xl flex flex-col items-center justify-center p-6"
                style={{ background: selectedProject.background || selectedProject.gradient }}
              >
                {selectedProject.icon ? (
                  <Image
                    src={selectedProject.icon}
                    alt={selectedProject.title}
                    width={80}
                    height={80}
                    className="object-contain"
                    priority
                  />
                ) : (
                  <h2 className="text-white text-3xl font-bold drop-shadow-lg">{selectedProject.title}</h2>
                )}
              </div>

              {/* Description */}
              <div>
                <h3 className="text-white/40 text-xs uppercase tracking-wider mb-2">Description</h3>
                <p className="text-white/80 text-[15px] leading-relaxed">{selectedProject.description}</p>
              </div>

              {/* Tech */}
              <div>
                <h3 className="text-white/40 text-xs uppercase tracking-wider mb-2">Technologies</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedProject.tech.map((tech) => (
                    <span key={tech} className="px-3 py-1.5 bg-white/10 text-white/80 rounded-full text-[13px]">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Link */}
              {selectedProject.link && (
                <a
                  href={selectedProject.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 bg-[#0a84ff] text-white rounded-xl text-[15px] font-medium"
                >
                  Visit Project
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 13V19C18 20.1 17.1 21 16 21H5C3.9 21 3 20.1 3 19V8C3 6.9 3.9 6 5 6H11" />
                    <path d="M15 3H21V9" />
                    <path d="M10 14L21 3" />
                  </svg>
                </a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
