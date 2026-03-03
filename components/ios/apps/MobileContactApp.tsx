'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

interface Contact {
  id: number
  name: string
  company: string
  email: string
  phone: string
  website?: string
  initials: string
  color: string
  notes?: string
  logo?: React.ReactNode
}

const contacts: Contact[] = [
  {
    id: 1,
    name: 'Sung Jae Bae',
    company: 'Founder | Engineer | Medicine',
    email: 'sbae703@gmail.com',
    phone: '',
    initials: 'SB',
    color: 'bg-blue-500',
    notes: 'hi',
  },
  {
    id: 2,
    name: 'GitHub',
    company: 'Social',
    email: '',
    phone: '',
    website: 'https://github.com/hydral8',
    initials: 'GH',
    color: 'bg-white',
    notes: 'Got some cool stuff here.',
    logo: <Image src="/icons/github.png" alt="GitHub" width={32} height={32} className="object-contain" priority />,
  },
  {
    id: 3,
    name: 'LinkedIn',
    company: 'Professional',
    email: '',
    phone: '',
    website: 'https://linkedin.com/in/sungjaebae',
    initials: 'LI',
    color: 'bg-blue-600',
    notes: 'Connect with me on LinkedIn',
    logo: <Image src="/icons/linkedin.png" alt="LinkedIn" width={32} height={32} className="object-contain" priority />,
  },
  {
    id: 4,
    name: 'X',
    company: 'Social',
    email: '',
    phone: '',
    website: 'https://x.com/sunjaebae',
    initials: '\u{1D54F}',
    color: 'bg-black',
    notes: 'Connect with me on X',
  },
]

export default function MobileContactApp() {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)

  return (
    <div className="h-full flex flex-col bg-[#000000]">
      <AnimatePresence mode="wait">
        {selectedContact ? (
          /* Contact Detail View */
          <motion.div
            key="detail"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="h-full flex flex-col"
          >
            {/* Back header */}
            <div className="flex items-center px-4 py-2">
              <button
                onClick={() => setSelectedContact(null)}
                className="flex items-center gap-1 text-[#0a84ff] text-[17px]"
              >
                <svg width="12" height="20" viewBox="0 0 12 20" fill="none">
                  <path d="M10 2L2 10L10 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Contacts
              </button>
            </div>

            {/* Contact Info */}
            <div className="flex-1 overflow-y-auto px-4 pb-4">
              {/* Avatar */}
              <div className="flex flex-col items-center py-6">
                <div className={`w-24 h-24 rounded-full ${selectedContact.color} flex items-center justify-center text-white text-3xl font-medium mb-3`}>
                  {selectedContact.logo ? (
                    <div className="scale-150">{selectedContact.logo}</div>
                  ) : (
                    selectedContact.initials
                  )}
                </div>
                <h1 className="text-white text-2xl font-semibold">{selectedContact.name}</h1>
                {selectedContact.company && (
                  <p className="text-white/50 text-sm mt-1">{selectedContact.company}</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mb-6">
                {selectedContact.email && (
                  <a
                    href={`mailto:${selectedContact.email}`}
                    className="flex-1 flex flex-col items-center gap-1 py-3 bg-white/10 rounded-xl"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0a84ff" strokeWidth="2">
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <path d="M22 7L12 13L2 7" />
                    </svg>
                    <span className="text-[#0a84ff] text-[11px]">mail</span>
                  </a>
                )}
                {selectedContact.website && (
                  <a
                    href={selectedContact.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex flex-col items-center gap-1 py-3 bg-white/10 rounded-xl"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0a84ff" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M2 12h20M12 2a15 15 0 014 10 15 15 0 01-4 10 15 15 0 01-4-10 15 15 0 014-10z" />
                    </svg>
                    <span className="text-[#0a84ff] text-[11px]">website</span>
                  </a>
                )}
              </div>

              {/* Fields */}
              <div className="bg-white/5 rounded-xl divide-y divide-white/10 overflow-hidden">
                {selectedContact.email && (
                  <div className="px-4 py-3">
                    <div className="text-white/40 text-xs mb-1">email</div>
                    <a href={`mailto:${selectedContact.email}`} className="text-[#0a84ff] text-[15px]">
                      {selectedContact.email}
                    </a>
                  </div>
                )}
                {selectedContact.phone && (
                  <div className="px-4 py-3">
                    <div className="text-white/40 text-xs mb-1">phone</div>
                    <a href={`tel:${selectedContact.phone}`} className="text-[#0a84ff] text-[15px]">
                      {selectedContact.phone}
                    </a>
                  </div>
                )}
                {selectedContact.website && (
                  <div className="px-4 py-3">
                    <div className="text-white/40 text-xs mb-1">website</div>
                    <a href={selectedContact.website} target="_blank" rel="noopener noreferrer" className="text-[#0a84ff] text-[15px]">
                      {selectedContact.website}
                    </a>
                  </div>
                )}
                {selectedContact.notes && (
                  <div className="px-4 py-3">
                    <div className="text-white/40 text-xs mb-1">notes</div>
                    <div className="text-white/70 text-[15px]">{selectedContact.notes}</div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ) : (
          /* Contact List */
          <motion.div
            key="list"
            initial={{ opacity: 1 }}
            className="h-full flex flex-col"
          >
            {/* Search */}
            <div className="px-4 pt-2 pb-2">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
                <input
                  type="text"
                  placeholder="Search"
                  className="w-full h-9 pl-10 pr-4 bg-white/10 rounded-xl text-white text-[15px] placeholder-white/30 outline-none"
                />
              </div>
            </div>

            {/* Contact List */}
            <div className="flex-1 overflow-y-auto">
              {contacts.map((contact, i) => (
                <motion.button
                  key={contact.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => setSelectedContact(contact)}
                  className="w-full flex items-center gap-3 px-4 py-3 active:bg-white/5 transition-colors"
                >
                  <div className={`w-10 h-10 rounded-full ${contact.color} flex items-center justify-center text-white text-sm font-medium flex-shrink-0`}>
                    {contact.logo || contact.initials}
                  </div>
                  <div className="flex-1 text-left border-b border-white/10 pb-3">
                    <div className="text-white text-[17px]">{contact.name}</div>
                    {contact.company && (
                      <div className="text-white/40 text-[13px]">{contact.company}</div>
                    )}
                  </div>
                  <svg width="8" height="14" viewBox="0 0 8 14" fill="none" className="text-white/30 flex-shrink-0">
                    <path d="M1 1L7 7L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
