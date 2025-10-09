'use client'

import { motion } from 'framer-motion'
import ScrollDecodedText from '@/components/ScrollDecodedText'

const socials = [
  {
    name: 'GitHub',
    icon: '💻',
    link: 'https://github.com',
    handle: '@sungjae',
  },
  {
    name: 'Twitter',
    icon: '𝕏',
    link: 'https://twitter.com',
    handle: '@sungjae',
  },
  {
    name: 'LinkedIn',
    icon: '💼',
    link: 'https://linkedin.com',
    handle: 'Sung Jae Bae',
  },
  {
    name: 'Magi',
    icon: '🔮',
    link: 'https://magi.com',
    handle: 'Magi Profile',
  },
  {
    name: 'Email',
    icon: '📧',
    link: 'mailto:hello@sungjae.dev',
    handle: 'hello@sungjae.dev',
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
}

interface ContactProps {
  isUnlocked: boolean
}

export default function Contact({ isUnlocked }: ContactProps) {
  return (
    <section id="contact" className="min-h-screen py-20 flex flex-col justify-center">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        variants={containerVariants}
        className="text-center"
      >
        <motion.div variants={itemVariants}>
          <ScrollDecodedText 
            isUnlocked={isUnlocked} 
            className="text-4xl md:text-5xl font-bold mb-8 text-accent-cyan glow-cyan"
            decodeSpeed={15}
          >
            Connect
          </ScrollDecodedText>
        </motion.div>

        <motion.div variants={itemVariants}>
          <ScrollDecodedText 
            isUnlocked={isUnlocked} 
            className="text-xl text-accent-white/70 mb-12 max-w-2xl mx-auto"
            decodeSpeed={18}
          >
            Let&apos;s build something extraordinary together
          </ScrollDecodedText>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-6 mb-16">
          {socials.map((social, index) => (
            <motion.a
              key={index}
              variants={itemVariants}
              href={social.link}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.1, y: -5 }}
              whileTap={{ scale: 0.95 }}
              className="group relative"
            >
              <div className="flex flex-col items-center justify-center w-32 h-32 bg-gradient-to-br from-bg-dark to-bg-darker border border-accent-purple/20 rounded-lg hover:border-accent-cyan/40 transition-all duration-300 shadow-lg hover:shadow-accent-cyan/20">
                <span className="text-4xl mb-2 group-hover:scale-110 transition-transform">
                  {social.icon}
                </span>
                <ScrollDecodedText 
                  isUnlocked={isUnlocked} 
                  className="text-accent-white text-sm font-bold"
                  decodeSpeed={12}
                >
                  {social.name}
                </ScrollDecodedText>
                <ScrollDecodedText 
                  isUnlocked={isUnlocked} 
                  className="text-accent-purple/70 text-xs font-mono mt-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  decodeSpeed={14}
                >
                  {social.handle}
                </ScrollDecodedText>

                {/* Glow effect on hover */}
                <div className="absolute inset-0 bg-accent-cyan/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" />
              </div>
            </motion.a>
          ))}
        </div>

        <motion.div
          variants={itemVariants}
          className="text-center text-accent-white/40 text-sm font-mono"
        >
          <ScrollDecodedText 
            isUnlocked={isUnlocked} 
            className="block"
            decodeSpeed={16}
          >
            © 2025 Sung Jae Bae
          </ScrollDecodedText>
          <ScrollDecodedText 
            isUnlocked={isUnlocked} 
            className="block mt-2"
            decodeSpeed={18}
          >
            Built with Next.js · Encrypted with curiosity
          </ScrollDecodedText>
        </motion.div>
      </motion.div>
    </section>
  )
}
