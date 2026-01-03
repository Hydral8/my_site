'use client'

import { useState } from 'react'
import { AppComponentProps } from '@/types/macos'
import { motion, AnimatePresence } from 'framer-motion'
import { useDragHandler } from '../Window'
import Image from 'next/image'

const projects = [
  {
    title: "Magi",
    tagline: "Semantic Fashion Product Editor",
    description:
      "Shopping reimagined. A semantic fashion product editor that lets users modify and generate clothing designs using natural language.",
    tech: ["AI/ML", "Computer Vision", "React", "Python"],
    link: "https://usemagi.com",
    website: "https://usemagi.com", // Optional: for iframe preview
    // screenshot: "/images/magi.png", // Optional: fallback screenshot
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    icon: "/icons/magi.png",
    year: "2025",
  },
  {
    title: "Queue",
    tagline: "On-Device AI Assistant",
    description:
      "An intelligent, on-device assistant natively integrated into the user's device. Instantly understands user intent and relevant context, enabling automation of tasks including replying to emails, debugging, managing meetings, and more.",
    tech: ["TypeScript", "AI/ML", "Node.js", "On-Device"],
    link: "https://queue.com",
    gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    year: "2025",
  },
  {
    title: "Livv",
    tagline: "Emergency Medical Services Platform",
    description:
      "Platform streamlining ambulance dispatch and patient care coordination for faster emergency response times.",
    tech: ["React", "Node.js", "Real-time", "Healthcare"],
    link: "https://livve.us",
    website: "https://livve.us", // Optional: for iframe preview
    gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
    icon: "/icons/livve.png",
    year: "2021",
  },
  {
    title: "Meural",
    tagline: "General Robotics Platform",
    description:
      "Making general robotics a modern reality.",
    tech: ["Robotics", "AI/ML", "Python", "Computer Vision"],
    link: "https://meural.ai",
    website: "https://meural.ai", // Optional: for iframe preview
    gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    background: "linear-gradient(135deg, #667eea 0%, #4facfe 100%)",
    icon: "/icons/meural.png",
    year: "2025",
  },
  {
    title: "RocLab",
    tagline: "Campus Innovation Lab",
    description:
      "Taking 20 exceptional students each semester to solve real-world campus problems at the University of Rochester using technology.",
    tech: ["Full Stack", "React", "Various"],
    link: "https://www.instagram.com/roclab_/",
    websites: ["https://melcourses.com", "https://joinaura.io"], // Multiple website previews
    gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    background: "linear-gradient(135deg, #FFD93D 0%, #FFA900 100%)",
    icon: "/icons/roclab.png",
    year: "2021",
    subprojects: [
      {
        name: "MelCourses",
        url: "https://melcourses.com",
        icon: "/icons/melcourses.png",
      },
      {
        name: "Aura",
        url: "https://joinaura.io",
        icon: "/icons/aura.png",
      },
    ],
  },
]

// RocLab photos
const roclabPhotos = [
  {
    id: 1,
    src: "/images/roclab/photo1.jpg",
    alt: "RocLab Photo 1",
  },
  {
    id: 2,
    src: "/images/roclab/photo2.png",
    alt: "RocLab Photo 2",
  },
  {
    id: 3,
    src: "/images/roclab/photo3.jpg",
    alt: "RocLab Photo 3",
  },
  {
    id: 4,
    src: "/images/roclab/photo4.png",
    alt: "RocLab Photo 4",
  },
  {
    id: 5,
    src: "/images/roclab/photo5.png",
    alt: "RocLab Photo 5",
  },
  {
    id: 6,
    src: "/images/roclab/photo6.png",
    alt: "RocLab Photo 6",
  },
  {
    id: 7,
    src: "/images/roclab/photo7.png",
    alt: "RocLab Photo 7",
  },
  {
    id: 8,
    src: "/images/roclab/photo8.png",
    alt: "RocLab Photo 8",
  },
  // Add more photos as needed
]

export default function ProjectsApp({ windowId, isActive, windowControls }: AppComponentProps) {
  const [selectedProject, setSelectedProject] = useState<typeof projects[0] | null>(null)
  const [selectedAlbum, setSelectedAlbum] = useState<'all' | 'present' | 'past' | 'roclab'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPhoto, setSelectedPhoto] = useState<typeof roclabPhotos[0] | null>(null)
  const dragHandler = useDragHandler()

  const filteredProjects = projects
    .filter(p => {
      // Album filter
      if (selectedAlbum === 'present' && p.year !== '2025') return false
      if (selectedAlbum === 'past' && p.year !== '2021') return false
      if (selectedAlbum === 'roclab') return false // Don't show projects in RocLab album
      return true
    })
    .filter(p => {
      // Search filter
      if (!searchQuery.trim()) return true
      const query = searchQuery.toLowerCase()
      return (
        p.title.toLowerCase().includes(query) ||
        p.tagline.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.tech.some(t => t.toLowerCase().includes(query))
      )
    })

  const filteredPhotos = roclabPhotos.filter(photo => {
    if (!searchQuery.trim()) return true
    const query = searchQuery.toLowerCase()
    return photo.alt.toLowerCase().includes(query)
  })

  const albumTitle = selectedAlbum === 'all' 
    ? 'All Projects' 
    : selectedAlbum === 'present'
    ? 'Present'
    : selectedAlbum === 'past'
    ? 'Past'
    : 'RocLab'

  return (
    <div className="h-full flex" style={{ background: "rgba(20, 20, 22, 0.95)" }}>
      {/* Sidebar */}
      <div className="w-56 flex-shrink-0 text-xs relative flex flex-col">
        <div
          className="absolute inset-0 -z-10"
          style={{
            background: "rgba(44, 44, 46, 0.4)",
            backdropFilter: "blur(30px) saturate(150%)",
            WebkitBackdropFilter: "blur(30px) saturate(150%)",
          }}
        />

        {/* Rounded container with blue border containing sidebar content */}
        <div
          className="relative z-10 flex-1 flex flex-col mx-2 my-2"
          style={{
            borderRadius: "10px",
            boxShadow:
              "0 4px 12px rgba(0, 0, 0, 0.3), 0 0 0 0.5px rgba(70, 130, 220, 0.3)",
            isolation: "isolate",
            overflow: "hidden",
          }}
        >
          {/* Enhanced Frosted glass layers */}
          <div
            className="absolute inset-0"
            style={{
              zIndex: 0,
              overflow: "hidden",
              borderRadius: "10px",
              pointerEvents: "none",
            }}
          >
            {/* Blue tint gradient layer */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(135deg, rgba(24, 37, 44, 0.85) 0%, rgba(15, 25, 35, 0.9) 50%, rgba(10, 20, 30, 0.95) 100%)",
              }}
            />
            {/* Subtle blue frost overlay */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(circle at 30% 30%, rgba(70, 130, 220, 0.15) 0%, transparent 60%)",
              }}
            />
            {/* Shine/gloss layer */}
            <div
              className="absolute inset-0"
              style={{
                boxShadow:
                  "inset 1px 1px 2px 0 rgba(255, 255, 255, 0.2), inset -1px -1px 2px 0 rgba(255, 255, 255, 0.1)",
              }}
            />
          </div>

          {/* Traffic Lights Header - Fixed at top */}
          <div
            className="flex items-center gap-2 px-3"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "42px",
              zIndex: 20,
            }}
            onMouseDown={(e) => {
              // Only drag if clicking on the empty area, not on buttons
              if (
                e.target === e.currentTarget ||
                !(e.target as HTMLElement).closest("button")
              ) {
                dragHandler?.(e);
              }
            }}
          >
            {windowControls && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    windowControls.close();
                  }}
                  className="w-3 h-3 rounded-full bg-[#FF5F57] hover:bg-[#FF5F57]/80 transition-colors relative group"
                  aria-label="Close"
                  style={{
                    boxShadow:
                      "0 1px 2px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.3)",
                  }}
                >
                  <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg width="6" height="6" viewBox="0 0 6 6" fill="none">
                      <path
                        d="M1 1L5 5M5 1L1 5"
                        stroke="#5A0000"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    windowControls.minimize();
                  }}
                  className="w-3 h-3 rounded-full bg-[#FFBD2E] hover:bg-[#FFBD2E]/80 transition-colors relative group"
                  aria-label="Minimize"
                  style={{
                    boxShadow:
                      "0 1px 2px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.3)",
                  }}
                >
                  <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg width="6" height="2" viewBox="0 0 6 2" fill="none">
                      <path
                        d="M1 1H5"
                        stroke="#5A4000"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    windowControls.maximize();
                  }}
                  className="w-3 h-3 rounded-full bg-[#28C840] hover:bg-[#28C840]/80 transition-colors relative group"
                  aria-label="Maximize"
                  style={{
                    boxShadow:
                      "0 1px 2px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.3)",
                  }}
                >
                  <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg width="6" height="6" viewBox="0 0 6 6" fill="none">
                      <path
                        d="M1 1L2.5 1M1 1L1 2.5M5 5L3.5 5M5 5L5 3.5"
                        stroke="#005A00"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </button>
              </>
            )}
          </div>

          <div
            className="flex-1 overflow-y-auto relative p-3 space-y-4"
            style={{ zIndex: 10, paddingTop: "50px", paddingBottom: "8px" }}
          >
            {/* Library Section */}
            <div>
              <div className="text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-2 px-2">
                Library
              </div>
              <button 
                onClick={() => setSelectedAlbum('all')}
                className={`w-full px-3 py-1.5 flex items-center justify-between rounded-md transition-all ${
                  selectedAlbum === 'all' 
                    ? 'bg-white/10 text-white' 
                    : 'text-white/70 hover:bg-white/5'
                }`}
              >
                <span>All Projects</span>
                <span className="text-[10px] text-white/40">{projects.length}</span>
              </button>
            </div>

            {/* Albums Section */}
            <div>
              <div className="text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-2 px-2">
                Albums
              </div>
              <button 
                onClick={() => setSelectedAlbum('present')}
                className={`w-full px-3 py-1.5 flex items-center justify-between rounded-md transition-all ${
                  selectedAlbum === 'present' 
                    ? 'bg-white/10 text-white' 
                    : 'text-white/70 hover:bg-white/5'
                }`}
              >
                <span>Present</span>
                <span className="text-[10px] text-white/40">
                  {projects.filter(p => p.year === '2025').length}
                </span>
              </button>
              <button 
                onClick={() => setSelectedAlbum('past')}
                className={`w-full px-3 py-1.5 flex items-center justify-between rounded-md transition-all ${
                  selectedAlbum === 'past' 
                    ? 'bg-white/10 text-white' 
                    : 'text-white/70 hover:bg-white/5'
                }`}
              >
                <span>Past</span>
                <span className="text-[10px] text-white/40">
                  {projects.filter(p => p.year === '2021').length}
                </span>
              </button>
              <button 
                onClick={() => setSelectedAlbum('roclab')}
                className={`w-full px-3 py-1.5 flex items-center justify-between rounded-md transition-all ${
                  selectedAlbum === 'roclab' 
                    ? 'bg-white/10 text-white' 
                    : 'text-white/70 hover:bg-white/5'
                }`}
              >
                <span>RocLab</span>
                <span className="text-[10px] text-white/40">
                  {roclabPhotos.length}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div 
          className="h-12 flex items-center justify-between px-4 relative"
          style={{
            background: "rgba(30, 30, 32, 0.7)",
            borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          }}
        >
          <div className="flex items-center gap-3">
            <h2 className="text-white font-medium text-sm">{albumTitle}</h2>
            <span className="text-white/40 text-xs">
              {selectedAlbum === 'roclab' ? filteredPhotos.length : filteredProjects.length} items
            </span>
          </div>
          
          {/* Search Bar */}
          <div className="relative">
            <svg 
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/40" 
              width="14" 
              height="14" 
              viewBox="0 0 24 24" 
              fill="none"
            >
              <path 
                d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={selectedAlbum === 'roclab' ? "Search photos..." : "Search projects..."}
              className="w-48 h-7 pl-8 pr-3 text-xs text-white placeholder-white/40 rounded-md outline-none transition-all focus:w-56 focus:ring-1 focus:ring-white/20"
              style={{
                background: "rgba(255, 255, 255, 0.08)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path 
                    d="M18 6L6 18M6 6L18 18" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Photo Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-3 gap-4">
            {selectedAlbum === 'roclab' ? (
              // Display photos for RocLab album
              filteredPhotos.map((photo, index) => (
                <motion.div
                  key={photo.id}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedPhoto(photo)}
                  className="aspect-square rounded-lg overflow-hidden cursor-pointer relative group"
                  style={{
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
                  }}
                >
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 33vw, 33vw"
                  />
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200" />
                </motion.div>
              ))
            ) : (
              // Display projects
              filteredProjects.map((project, index) => (
              <motion.div
                key={index}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => setSelectedProject(project)}
                className="aspect-square rounded-lg overflow-hidden cursor-pointer relative group"
                style={{
                  background: project.background || project.gradient,
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
                }}
              >
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200" />
                
                {project.icon ? (
                  // Icon-based display
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                    <Image
                      src={project.icon}
                      alt={project.title}
                      width={project.title === 'RocLab' ? 112 : 64}
                      height={project.title === 'RocLab' ? 112 : 64}
                      className={`${project.title === 'RocLab' ? 'mb-2' : 'mb-4'} object-contain`}
                    />
                    {project.title === 'RocLab' ? (
                      <p className="text-xs text-center text-gray-900 font-medium">
                        {project.tagline}
                      </p>
                    ) : (
                      <>
                        <h3 className={`text-lg font-semibold mb-1 ${
                          project.title === 'Livv' ? 'text-gray-900' : 'text-white'
                        }`}>
                          {project.title}
                        </h3>
                        <p className={`text-xs text-center font-medium ${
                          project.title === 'Livv' ? 'text-gray-900' : 'text-white'
                        }`}>
                          {project.tagline}
                        </p>
                      </>
                    )}
                  </div>
                ) : (
                  // Gradient-based display (for Queue)
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                    <h3 className="text-white text-2xl font-bold mb-2 drop-shadow-lg">
                      {project.title}
                    </h3>
                    <p className="text-white text-xs font-semibold drop-shadow-lg" style={{ textShadow: '0 2px 6px rgba(0, 0, 0, 0.4)' }}>
                      {project.tagline}
                    </p>
                  </div>
                )}

                {/* Year badge */}
                <div className="absolute top-2 right-2 bg-black/30 backdrop-blur-sm px-2 py-1 rounded text-white/80 text-[10px] font-medium">
                  {project.year}
                </div>
              </motion.div>
            ))
            )}
          </div>
        </div>
      </div>

      {/* Photo Viewer Modal */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPhoto(null)}
            className="absolute inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center z-50 p-8"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-4xl w-full max-h-[90vh] relative flex flex-col"
            >
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute -top-12 right-0 text-white/60 hover:text-white transition-colors z-10"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
              <div className="relative w-full max-h-[90vh] rounded-lg shadow-2xl overflow-hidden flex items-center justify-center bg-black/20">
                <Image
                  src={selectedPhoto.src}
                  alt={selectedPhoto.alt}
                  width={1920}
                  height={1080}
                  className="max-w-full max-h-[90vh] w-auto h-auto rounded-lg object-contain"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1024px"
                  priority
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detail View Modal */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedProject(null)}
            className="absolute inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-50 p-8"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-4xl w-full bg-[rgba(30,30,32,0.95)] rounded-xl overflow-hidden"
              style={{
                boxShadow: "0 25px 80px rgba(0, 0, 0, 0.5)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              {/* Modal Header */}
              <div 
                className="h-12 flex items-center justify-between px-4 border-b"
                style={{ borderColor: "rgba(255, 255, 255, 0.08)" }}
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedProject(null)}
                    className="w-3 h-3 rounded-full bg-[#FF5F57] hover:bg-[#FF5F57]/80 transition-colors"
                  />
                  <span className="text-white text-sm font-medium">{selectedProject.title}</span>
                </div>
              </div>

              <div className="p-8 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-8">
                  {/* Project "Photo" */}
                  <div 
                    className="aspect-square rounded-lg"
                    style={{ background: selectedProject.background || selectedProject.gradient }}
                  >
                    <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center">
                      {selectedProject.icon ? (
                        <>
                          <Image
                            src={selectedProject.icon}
                            alt={selectedProject.title}
                            width={selectedProject.title === 'RocLab' ? 192 : 128}
                            height={selectedProject.title === 'RocLab' ? 192 : 128}
                            className={`${selectedProject.title === 'RocLab' ? 'mb-4' : 'mb-6'} object-contain`}
                          />
                          {selectedProject.title === 'RocLab' ? (
                            <p className="text-sm font-medium text-gray-900">
                              {selectedProject.tagline}
                            </p>
                          ) : (
                            <>
                              <h3 className={`text-3xl font-bold mb-2 ${
                                selectedProject.title === 'Livv' ? 'text-gray-800' : 'text-white'
                              }`}>
                                {selectedProject.title}
                              </h3>
                              <p className={`text-sm font-medium ${
                                selectedProject.title === 'Livv' ? 'text-gray-600' : 'text-white/80'
                              }`}>
                                {selectedProject.tagline}
                              </p>
                            </>
                          )}
                        </>
                      ) : (
                        <>
                          <h3 className="text-white text-4xl font-bold mb-4 drop-shadow-lg">
                            {selectedProject.title}
                          </h3>
                          <p className="text-white/90 text-sm font-medium drop-shadow">
                            {selectedProject.tagline}
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Project Details */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-white/40 text-xs uppercase tracking-wider mb-2">Description</h4>
                      <p className="text-white/80 text-sm leading-relaxed">
                        {selectedProject.description}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-white/40 text-xs uppercase tracking-wider mb-2">Technologies</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedProject.tech.map((tech, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 text-xs bg-white/10 text-white/80 rounded border border-white/20"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-white/40 text-xs uppercase tracking-wider mb-2">Year</h4>
                      <p className="text-white/80 text-sm">{selectedProject.year}</p>
                    </div>

                    {selectedProject.link && (
                      <a
                        href={selectedProject.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all text-sm font-medium mt-4"
                      >
                        Visit Project
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M18 13V19C18 19.5304 17.7893 20.0391 17.4142 20.4142C17.0391 20.7893 16.5304 21 16 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V8C3 7.46957 3.21071 6.96086 3.58579 6.58579C3.96086 6.21071 4.46957 6 5 6H11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                          <path d="M15 3H21V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M10 14L21 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </a>
                    )}

                    {selectedProject.subprojects && selectedProject.subprojects.length > 0 && (
                      <div>
                        <h4 className="text-white/40 text-xs uppercase tracking-wider mb-3">Subprojects</h4>
                        <div className="flex flex-wrap gap-3">
                          {selectedProject.subprojects.map((subproject: any, i: number) => (
                            <a
                              key={i}
                              href={subproject.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-3 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg transition-all group"
                            >
                              {subproject.icon && (
                                <Image
                                  src={subproject.icon}
                                  alt={subproject.name}
                                  width={40}
                                  height={40}
                                  className="object-contain"
                                />
                              )}
                              <div className="flex flex-col">
                                <span className="text-white text-sm font-medium">{subproject.name}</span>
                                <span className="text-white/50 text-xs">{subproject.url.replace('https://', '')}</span>
                              </div>
                              <svg 
                                className="w-4 h-4 text-white/40 group-hover:text-white/60 transition-colors ml-auto" 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Website Preview - Iframe or Screenshot */}
                {((selectedProject as any).website || (selectedProject as any).websites || (selectedProject as any).screenshot) && (
                  <div className="mt-8 pt-8 border-t" style={{ borderColor: "rgba(255, 255, 255, 0.08)" }}>
                    <h4 className="text-white/40 text-xs uppercase tracking-wider mb-4">Live Preview</h4>
                    {(selectedProject as any).websites && Array.isArray((selectedProject as any).websites) ? (
                      // Multiple websites - display vertically
                      <div className="flex flex-col gap-4">
                        {(selectedProject as any).websites.map((url: string, index: number) => (
                          <div key={index} className="relative rounded-lg overflow-hidden border" style={{ borderColor: "rgba(255, 255, 255, 0.1)" }}>
                            <iframe
                              src={url}
                              className="w-full"
                              style={{ height: "500px" }}
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              loading="lazy"
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      // Single website or screenshot
                      <div className="relative rounded-lg overflow-hidden border" style={{ borderColor: "rgba(255, 255, 255, 0.1)" }}>
                        {(selectedProject as any).website ? (
                          <iframe
                            src={(selectedProject as any).website}
                            className="w-full"
                            style={{ height: "600px" }}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            loading="lazy"
                          />
                        ) : (selectedProject as any).screenshot ? (
                          <div className="relative w-full">
                            <Image
                              src={(selectedProject as any).screenshot}
                              alt={`${selectedProject.title} screenshot`}
                              width={1920}
                              height={1080}
                              className="w-full h-auto object-contain"
                              sizes="(max-width: 768px) 100vw, 80vw"
                            />
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
