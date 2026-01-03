'use client'

import { AppComponentProps } from '@/types/macos'
import { useState, useMemo } from 'react'
import { useDragHandler } from '../Window'
import Image from 'next/image'

interface Contact {
  id: number
  name: string
  company: string
  email: string
  phone: string
  website?: string
  initials: string
  color?: string
  notes?: string
  logo?: React.ReactNode
}

const initialContacts: Contact[] = [
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
    logo: (
      <Image src="/icons/github.png" alt="GitHub" width={32} height={32} className="object-contain" />
    ),
  },
  {
    id: 3,
    name: 'LinkedIn',
    company: 'Professional',
    email: '',
    phone: '',
    website: 'https://linkedin.com/in/sungjaebae',
    initials: 'LI',
    notes: 'Connect with me on LinkedIn',
    logo: (
      <Image src="/icons/linkedin.png" alt="LinkedIn" width={32} height={32} className="object-contain" />
    ),
  },
  {
    id: 4,
    name: 'X',
    company: 'Social',
    email: '',
    phone: '',
    website: 'https://x.com/sunjaebae',
    initials: '𝕏',
    color: 'bg-black',
    notes: 'Connect with me on X'
  },
]

const avatarColors = [
  'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 
  'bg-orange-500', 'bg-teal-500', 'bg-indigo-500', 'bg-red-500'
]

function getInitials(name: string): string {
  const parts = name.trim().split(' ')
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

export default function ContactApp({ windowId, isActive, windowControls }: AppComponentProps) {
  const [contacts, setContacts] = useState<Contact[]>(initialContacts)
  const [selectedContact, setSelectedContact] = useState<Contact>(contacts[0])
  const [searchQuery, setSearchQuery] = useState('')
  const [sidebarVisible, setSidebarVisible] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState<Contact | null>(null)
  const dragHandler = useDragHandler()

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleAddContact = () => {
    const newId = Math.max(...contacts.map(c => c.id)) + 1
    const newContact: Contact = {
      id: newId,
      name: 'New Contact',
      company: '',
      email: '',
      phone: '',
      initials: 'NC',
      color: avatarColors[newId % avatarColors.length],
      notes: '',
    }
    setContacts([...contacts, newContact])
    setSelectedContact(newContact)
    setIsEditing(true)
    setEditForm(newContact)
  }

  const handleEditClick = () => {
    if (isEditing) {
      // Save changes
      if (editForm) {
        const updatedForm = {
          ...editForm,
          initials: getInitials(editForm.name),
        }
        setContacts(contacts.map(c => c.id === updatedForm.id ? updatedForm : c))
        setSelectedContact(updatedForm)
      }
      setIsEditing(false)
      setEditForm(null)
    } else {
      // Start editing
      setIsEditing(true)
      setEditForm({ ...selectedContact })
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditForm(null)
  }

  // Group contacts by first letter
  const groupedContacts = useMemo(() => {
    const groups: { [key: string]: typeof contacts } = {}
    filteredContacts.forEach(contact => {
      const firstLetter = contact.name[0].toUpperCase()
      if (!groups[firstLetter]) {
        groups[firstLetter] = []
      }
      groups[firstLetter].push(contact)
    })
    return Object.keys(groups).sort().map(letter => ({
      letter,
      contacts: groups[letter]
    }))
  }, [filteredContacts])

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e]">
      {/* Unified Header Bar with Traffic Lights and Toolbar */}
      <div 
        className="h-12 bg-[#2a2a2a] border-b border-white/10 flex items-center justify-between px-3"
        onMouseDown={(e) => {
          // Only drag if clicking on empty area, not on buttons or inputs
          if (
            e.target === e.currentTarget ||
            (!(e.target as HTMLElement).closest('button') && 
             !(e.target as HTMLElement).closest('input'))
          ) {
            dragHandler?.(e)
          }
        }}
      >
        {/* Left side - Traffic lights + Layout toggle */}
        <div className="flex items-center gap-4">
          {/* Traffic Lights */}
          {windowControls && (
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  windowControls.close()
                }}
                className="w-3 h-3 rounded-full bg-[#FF5F57] hover:bg-[#FF5F57]/80 transition-colors relative group"
                aria-label="Close"
                style={{
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                }}
              >
                <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg width="6" height="6" viewBox="0 0 6 6" fill="none">
                    <path d="M1 1L5 5M5 1L1 5" stroke="#5A0000" strokeWidth="1.2" strokeLinecap="round"/>
                  </svg>
                </span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  windowControls.minimize()
                }}
                className="w-3 h-3 rounded-full bg-[#FFBD2E] hover:bg-[#FFBD2E]/80 transition-colors relative group"
                aria-label="Minimize"
                style={{
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                }}
              >
                <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg width="6" height="2" viewBox="0 0 6 2" fill="none">
                    <path d="M1 1H5" stroke="#5A4000" strokeWidth="1.2" strokeLinecap="round"/>
                  </svg>
                </span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  windowControls.maximize()
                }}
                className="w-3 h-3 rounded-full bg-[#28C840] hover:bg-[#28C840]/80 transition-colors relative group"
                aria-label="Maximize"
                style={{
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                }}
              >
                <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg width="6" height="6" viewBox="0 0 6 6" fill="none">
                    <path d="M1 1L2.5 1M1 1L1 2.5M5 5L3.5 5M5 5L5 3.5" stroke="#005A00" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              </button>
            </div>
          )}
          
          {/* Layout toggle */}
          <button 
            onClick={() => setSidebarVisible(!sidebarVisible)}
            className={`p-1.5 rounded hover:bg-white/10 transition-colors ${sidebarVisible ? 'text-white/70' : 'text-blue-400'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <rect x="3" y="3" width="7" height="18" rx="1" strokeWidth="1.5" />
              <rect x="14" y="3" width="7" height="18" rx="1" strokeWidth="1.5" />
            </svg>
          </button>
        </div>
        
        {/* Right side - Edit, Add, Search */}
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <button 
                onClick={handleCancelEdit}
                className="px-3 py-1 text-sm text-white/70 hover:text-white hover:bg-white/10 rounded transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleEditClick}
                className="px-3 py-1 text-sm text-blue-400 hover:text-blue-300 hover:bg-white/10 rounded transition-colors font-medium"
              >
                Done
              </button>
            </>
          ) : (
            <button 
              onClick={handleEditClick}
              className="px-3 py-1 text-sm text-white/70 hover:text-white hover:bg-white/10 rounded transition-colors"
            >
              Edit
            </button>
          )}
          <button 
            onClick={handleAddContact}
            className="p-1.5 rounded hover:bg-white/10 transition-colors text-white/70 hover:text-white"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
          </button>
          <div className="relative">
            <svg className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-40 pl-8 pr-3 py-1.5 rounded-lg bg-[#3a3a3a] border border-white/10 text-white text-sm placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:w-56 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        {sidebarVisible && (
        <div className="w-64 bg-[#2a2a2a] border-r border-white/10 flex flex-col">
          {/* Contacts List */}
          <div className="flex-1 overflow-y-auto p-2">
          {groupedContacts.map(group => (
            <div key={group.letter}>
              {/* Section Header */}
              <div className="px-3 py-1.5 text-xs font-semibold text-white/40 uppercase select-none">
                {group.letter}
              </div>
              {/* Divider below letter */}
              <div className="mx-3 h-px bg-white/10" />
              
              {/* Contacts in this section */}
              {group.contacts.map((contact, index) => (
                <div key={contact.id}>
                  <button
                    onClick={() => setSelectedContact(contact)}
                    className={`w-full px-3 py-2.5 flex items-center gap-3 transition-colors rounded-lg ${
                      selectedContact.id === contact.id 
                        ? 'bg-blue-600 hover:bg-blue-700' 
                        : 'hover:bg-white/5'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full ${contact.color} flex items-center justify-center text-white text-sm font-medium flex-shrink-0`}>
                      {contact.logo || contact.initials}
                    </div>
                    <div className="flex-1 text-left overflow-hidden">
                      <div className="text-white text-sm font-medium truncate">
                        {contact.name}
                      </div>
                      {contact.company && (
                        <div className="text-white/50 text-xs truncate">
                          {contact.company}
                        </div>
                      )}
                    </div>
                  </button>
                  {/* Divider below contact */}
                  {index < group.contacts.length - 1 && (
                    <div className="mx-3 h-px bg-white/10" />
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
        </div>
        )}

        {/* Contact Details */}
      <div className="flex-1 overflow-y-auto">
        {selectedContact && (
          <div className="p-8">
            {/* Contact Header */}
            <div className="flex flex-col items-center mb-8">
              <div className={`w-24 h-24 rounded-full ${isEditing && editForm ? editForm.color : selectedContact.color} flex items-center justify-center text-white text-3xl font-medium mb-4`}>
                {isEditing && editForm ? (
                  getInitials(editForm.name)
                ) : selectedContact.logo ? (
                  <div className="scale-150">{selectedContact.logo}</div>
                ) : (
                  selectedContact.initials
                )}
              </div>
              {isEditing && editForm ? (
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="text-2xl font-semibold text-white mb-1 bg-transparent border-b border-white/20 focus:border-blue-500 focus:outline-none text-center"
                  placeholder="Name"
                />
              ) : (
                <h1 className="text-2xl font-semibold text-white mb-1">
                  {selectedContact.name}
                </h1>
              )}
              {isEditing && editForm ? (
                <input
                  type="text"
                  value={editForm.company}
                  onChange={(e) => setEditForm({ ...editForm, company: e.target.value })}
                  className="text-white/60 text-sm bg-transparent border-b border-white/20 focus:border-blue-500 focus:outline-none text-center"
                  placeholder="Company / Title"
                />
              ) : (
                selectedContact.company && (
                  <p className="text-white/60 text-sm">{selectedContact.company}</p>
                )
              )}
            </div>

            {/* Contact Fields */}
            <div className="max-w-2xl mx-auto space-y-1">
              {/* Email Field */}
              <div className="grid grid-cols-[120px_1fr] gap-4 py-3 border-b border-white/5">
                <div className="text-white/50 text-sm text-right">email</div>
                {isEditing && editForm ? (
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="text-white text-sm bg-transparent border-b border-white/20 focus:border-blue-500 focus:outline-none"
                    placeholder="email@example.com"
                  />
                ) : selectedContact.email ? (
                  <a
                    href={`mailto:${selectedContact.email}`}
                    className="text-blue-400 hover:text-blue-300 text-sm"
                  >
                    {selectedContact.email}
                  </a>
                ) : (
                  <span className="text-white/30 text-sm">—</span>
                )}
              </div>

              {/* Phone Field */}
              <div className="grid grid-cols-[120px_1fr] gap-4 py-3 border-b border-white/5">
                <div className="text-white/50 text-sm text-right">phone</div>
                {isEditing && editForm ? (
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="text-white text-sm bg-transparent border-b border-white/20 focus:border-blue-500 focus:outline-none"
                    placeholder="+1 (555) 000-0000"
                  />
                ) : selectedContact.phone ? (
                  <a
                    href={`tel:${selectedContact.phone}`}
                    className="text-blue-400 hover:text-blue-300 text-sm"
                  >
                    {selectedContact.phone}
                  </a>
                ) : (
                  <span className="text-white/30 text-sm">—</span>
                )}
              </div>

              {/* Website Field */}
              <div className="grid grid-cols-[120px_1fr] gap-4 py-3 border-b border-white/5">
                <div className="text-white/50 text-sm text-right">website</div>
                {isEditing && editForm ? (
                  <input
                    type="url"
                    value={editForm.website || ''}
                    onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                    className="text-white text-sm bg-transparent border-b border-white/20 focus:border-blue-500 focus:outline-none"
                    placeholder="https://example.com"
                  />
                ) : selectedContact.website ? (
                  <a
                    href={selectedContact.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 text-sm break-all"
                  >
                    {selectedContact.website}
                  </a>
                ) : (
                  <span className="text-white/30 text-sm">—</span>
                )}
              </div>

              {/* Notes Section */}
              <div className="grid grid-cols-[120px_1fr] gap-4 py-3">
                <div className="text-white/50 text-sm text-right">notes</div>
                {isEditing && editForm ? (
                  <textarea
                    value={editForm.notes || ''}
                    onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                    className="text-white text-sm bg-transparent border border-white/20 focus:border-blue-500 focus:outline-none rounded p-2 min-h-[60px] resize-none"
                    placeholder="Add notes..."
                  />
                ) : (
                  <div className="text-white/70 text-sm">
                    {selectedContact.notes || '—'}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            {!isEditing && (
              <div className="flex gap-3 justify-center mt-8">
                {selectedContact.email && (
                  <a
                    href={`mailto:${selectedContact.email}`}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                  >
                    Send Message
                  </a>
                )}
                {selectedContact.website && (
                  <a
                    href={selectedContact.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg transition-colors"
                  >
                    Visit Profile
                  </a>
                )}
              </div>
            )}
          </div>
        )}
        </div>
      </div>
    </div>
  )
}
