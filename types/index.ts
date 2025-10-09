export interface Position {
  x: number
  y: number
}

export interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
}

export interface TimelineItem {
  year: string
  company: string
  role: string
  description: string
}

export interface Project {
  title: string
  tagline: string
  description: string
  tech: string[]
  link?: string
}

export interface Social {
  name: string
  icon: string
  link: string
  handle: string
}
