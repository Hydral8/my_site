'use client'

import { motion } from 'framer-motion'
import ScrollDecodedText from '@/components/ScrollDecodedText'

const timeline = [
  {
    startDate: '2020',
    endDate: '2021',
    company: 'Remote Roofing',
    role: 'Machine Learning Lead',
    description: 'Led development of AI-powered computer vision roof inspection systems, reducing manual assessment time by 80% and reducing user costs by $3000.',
    link: 'https://remoteroofing.com'
  },
  {
    startDate: '2021',
    endDate: '2025',
    company: 'Livv',
    role: 'Co-Founder',
    description: 'Co-founded emergency medical services platform, streamlining ambulance dispatch and patient care coordination for faster response times.',
    link: 'https://livv.us'
  },
  {
    startDate: '2021',
    endDate: 'Present',
    company: 'RocLab',
    role: 'Co-Founder',
    description: 'Building collaborative development tools and platforms that enable distributed teams to work more efficiently across time zones.',
    link: 'https://roclab.com'
  },
  {
    startDate: '2025',
    endDate: 'Present',
    company: 'Magi',
    role: 'Co-Founder & CTO',
    description: 'Revolutionizing knowledge work with AI-powered assistants that understand context, learn from interactions, and accelerate human productivity.',
    link: 'https://magi.com'
  },
  {
    startDate: '2025',
    endDate: 'Present',
    company: 'SKMC',
    role: 'MS1',
    description: 'Exploring new frontiers in healthcare and health technology, combining medical education with innovative tech solutions.',
    link: null
  },
  {
    startDate: '2025',
    endDate: 'Present',
    company: 'Queue',
    role: 'Founder',
    description: 'Building intelligent queue management systems that optimize wait times and improve customer experience across various industries.',
    link: 'https://queue.com'
  },
  {
    startDate: '2025',
    endDate: 'Present',
    company: 'Meural',
    role: 'Founder',
    description: 'Creating intuitive visual editing tools that democratize design and make creative expression accessible to everyone.',
    link: 'https://meural.com'
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5 },
  },
}

interface AboutProps {
  isUnlocked: boolean
}

export default function About({ isUnlocked }: AboutProps) {
  return (
    <section id="about" className="min-h-screen py-20">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        variants={containerVariants}
      >
        <motion.div variants={itemVariants}>
          <ScrollDecodedText 
            isUnlocked={isUnlocked} 
            className="text-4xl md:text-5xl font-bold mb-12 text-accent-cyan glow-cyan"
            decodeSpeed={15}
          >
            Journey
          </ScrollDecodedText>
        </motion.div>

        <div className="space-y-8 max-w-4xl">
          {timeline.map((item, index) => {
            const TimelineContent = () => (
              <motion.div
                key={index}
                variants={itemVariants}
                className={`relative pl-8 border-l-2 border-accent-purple/30 hover:border-accent-purple transition-colors ${
                  item.link ? 'cursor-pointer hover:bg-accent-purple/5 rounded-lg p-4 -ml-4' : ''
                }`}
              >
                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-accent-purple shadow-lg shadow-accent-purple/50" />

                <div className="mb-1">
                  <ScrollDecodedText 
                    isUnlocked={isUnlocked} 
                    className="text-accent-cyan font-mono text-sm"
                    decodeSpeed={5}
                  >
                    {item.startDate} - {item.endDate}
                  </ScrollDecodedText>
                </div>

                <ScrollDecodedText 
                  isUnlocked={isUnlocked} 
                  className="text-2xl font-bold text-accent-white mb-1"
                  decodeSpeed={12}
                >
                  {item.company}
                </ScrollDecodedText>

                <ScrollDecodedText 
                  isUnlocked={isUnlocked} 
                  className="text-accent-purple mb-2"
                  decodeSpeed={14}
                >
                  {item.role}
                </ScrollDecodedText>

                <ScrollDecodedText 
                  isUnlocked={isUnlocked} 
                  className="text-accent-white/70"
                  decodeSpeed={10}
                >
                  {item.description}
                </ScrollDecodedText>

                {item.link && (
                  <div className="mt-2">
                    <ScrollDecodedText 
                      isUnlocked={isUnlocked} 
                      className="text-accent-cyan text-xs font-mono opacity-70 hover:opacity-100 transition-opacity"
                      decodeSpeed={12}
                    >
                      Visit {item.company} →
                    </ScrollDecodedText>
                  </div>
                )}
              </motion.div>
            )

            return item.link ? (
              <a
                key={index}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <TimelineContent />
              </a>
            ) : (
              <TimelineContent />
            )
          })}
        </div>
      </motion.div>
    </section>
  )
}
