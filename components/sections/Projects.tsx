'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import ScrollDecodedText from '@/components/ScrollDecodedText'

const projects = [
  {
    title: 'Magi',
    tagline: 'AI-Powered Knowledge Assistant',
    description: 'Revolutionary platform transforming how people interact with information using advanced AI.',
    tech: ['AI/ML', 'NLP', 'React', 'Python'],
    link: 'https://magi.com',
  },
  {
    title: 'Queue',
    tagline: 'Workflow Automation Platform',
    description: 'Streamline team collaboration with intelligent task management and automation.',
    tech: ['TypeScript', 'Node.js', 'GraphQL', 'PostgreSQL'],
  },
  {
    title: 'Remote Roofing',
    tagline: 'Construction Tech Innovation',
    description: 'Bringing modern technology to the roofing industry with remote estimation tools.',
    tech: ['React Native', 'Computer Vision', 'Cloud'],
  },
  {
    title: 'Meural Canvas',
    tagline: 'Digital Art Display',
    description: 'Smart digital canvas bringing museum-quality art to your home.',
    tech: ['IoT', 'React', 'AWS', 'Image Processing'],
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.2 },
  },
}

interface ProjectsProps {
  isUnlocked: boolean
}

export default function Projects({ isUnlocked }: ProjectsProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

  return (
    <section id="projects" className="min-h-screen py-20">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        variants={containerVariants}
      >
        <motion.div variants={cardVariants}>
          <ScrollDecodedText 
            isUnlocked={isUnlocked} 
            className="text-4xl md:text-5xl font-bold mb-12 text-accent-cyan glow-cyan"
            decodeSpeed={15}
          >
            Projects
          </ScrollDecodedText>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl">
          {projects.map((project, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              whileHover={{ scale: 1.02, rotateY: 2 }}
              onClick={() =>
                setExpandedIndex(expandedIndex === index ? null : index)
              }
              className="relative group cursor-pointer"
            >
              <div className="bg-gradient-to-br from-bg-dark to-bg-darker border border-accent-purple/20 rounded-lg p-6 hover:border-accent-cyan/40 transition-all duration-300 shadow-lg hover:shadow-accent-cyan/20">
                {/* Glitch effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent-cyan/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />

                <ScrollDecodedText 
                  isUnlocked={isUnlocked} 
                  className="text-2xl font-bold text-accent-white mb-2 group-hover:text-accent-cyan transition-colors"
                  decodeSpeed={25}
                >
                  {project.title}
                </ScrollDecodedText>

                <ScrollDecodedText 
                  isUnlocked={isUnlocked} 
                  className="text-accent-purple mb-3 font-mono text-sm"
                  decodeSpeed={25}
                >
                  {project.tagline}
                </ScrollDecodedText>

                <motion.div
                  initial={false}
                  animate={{
                    height: expandedIndex === index ? 'auto' : 0,
                    opacity: expandedIndex === index ? 1 : 0,
                  }}
                  className="overflow-hidden"
                >
                  <ScrollDecodedText 
                    isUnlocked={isUnlocked} 
                    className="text-accent-white/70 mb-4"
                    decodeSpeed={25}
                  >
                    {project.description}
                  </ScrollDecodedText>
                </motion.div>

                <div className="flex flex-wrap gap-2 mt-4">
                  {project.tech.map((tech, i) => (
                    <ScrollDecodedText 
                      key={i}
                      isUnlocked={isUnlocked} 
                      className="px-3 py-1 text-xs font-mono bg-accent-purple/10 text-accent-purple border border-accent-purple/30 rounded-full"
                      decodeSpeed={25}
                    >
                      {tech}
                    </ScrollDecodedText>
                  ))}
                </div>

                {project.link && (
                  <ScrollDecodedText 
                    isUnlocked={isUnlocked} 
                    className="inline-block mt-4 text-accent-cyan hover:text-accent-white transition-colors text-sm font-mono"
                    decodeSpeed={25}
                  >
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      View Project →
                    </a>
                  </ScrollDecodedText>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  )
}
