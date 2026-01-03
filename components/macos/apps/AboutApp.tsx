"use client";

import { useState, useEffect, useRef, useId } from "react";
import { AppComponentProps } from "@/types/macos";
import { motion, AnimatePresence } from "framer-motion";
import { useDragHandler } from "../Window";

const timeline = [
  {
    startDate: "2020",
    endDate: "2021",
    company: "Remote Roofing",
    role: "Machine Learning Lead",
    type: "Work",
    description:
      "Led development of AI-powered computer vision roof inspection systems, reducing manual assessment time by 80% and reducing user costs by $3000.",
    link: "https://roofer.io",
  },
  {
    startDate: "2021",
    endDate: "2025",
    company: "University of Rochester",
    role: "B.S. Neuroscience",
    type: "Education",
    description:
      "Major in Neuroscience with minors in Computer Science and Psychology. Explored the intersection of brain science, technology, and human behavior.",
    link: "https://rochester.edu",
  },
  {
    startDate: "2021",
    endDate: "2025",
    company: "Livv",
    role: "Co-Founder",
    type: "Company",
    description:
      "Co-founded emergency medical services platform, streamlining ambulance dispatch and patient care coordination for faster response times.",
    link: "https://livve.us",
  },
  {
    startDate: "2021",
    endDate: "2025",
    company: "RocLab",
    role: "Co-Founder",
    type: "Club",
    description:
      "Taking 20 exceptional students each semester to solve real-world campus problems at the University of Rochester using technology.",
    link: "https://www.instagram.com/roclab_/",
  },
  {
    startDate: "2025",
    endDate: "Present",
    company: "Sidney Kimmel Medical College",
    role: "MS1",
    type: "Education",
    description:
      "Exploring new frontiers in healthcare and health technology, looking to augment medicine with tech.",
    link: "https://www.jefferson.edu/academics/colleges-schools-institutes/skmc.html",
  },
  {
    startDate: "2025",
    endDate: "Present",
    company: "Magi",
    role: "Founder",
    type: "Company",
    description:
      "Shopping reimagined. Magi is a semantic fashion product editor that lets users modify and generate clothing designs using natural-language like 'make this shirt cropped'. It understands garments at a conceptual level (fit, fabric, silhouette, details) and applies edits directly to products, personalized, consumer fashion transformations.",
    link: "https://usemagi.com",
  },
  {
    startDate: "2025",
    endDate: "Present",
    company: "Meural",
    role: "Founder",
    type: "Company",
    description:
      "Making general robotics a modern reality.",
    link: "https://meural.com",
  },
];

const projects = [
  {
    title: "Magi",
    tagline: "Semantic Fashion Product Editor",
    description:
      "Shopping reimagined. A semantic fashion product editor that lets users modify and generate clothing designs using natural language.",
    tech: ["AI/ML", "Computer Vision", "React", "Python"],
    link: "https://usemagi.com",
  },
  {
    title: "Queue",
    tagline: "On-Device AI Assistant",
    description:
      "An intelligent, on-device assistant natively integrated into the user's device. Instantly understands user intent and relevant context, enabling automation of tasks including replying to emails, debugging, managing meetings, and more.",
    tech: ["TypeScript", "AI/ML", "Node.js", "On-Device"],
    link: "https://queue.com",
  },
  {
    title: "Livv",
    tagline: "Emergency Medical Services Platform",
    description:
      "Platform streamlining ambulance dispatch and patient care coordination for faster emergency response times.",
    tech: ["React", "Node.js", "Real-time", "Healthcare"],
    link: "https://livve.us",
  },
  {
    title: "Meural",
    tagline: "General Robotics Platform",
    description:
      "Making general robotics a modern reality.",
    tech: ["Robotics", "AI/ML", "Python", "Computer Vision"],
    link: "https://meural.com",
  },
  {
    title: "RocLab",
    tagline: "Campus Innovation Lab",
    description:
      "Taking 20 exceptional students each semester to solve real-world campus problems at the University of Rochester using technology.",
    tech: ["Full Stack", "React", "Various"],
    link: "https://www.instagram.com/roclab_/",
  },
];

const skills = [
  {
    category: "Languages",
    items: ["TypeScript", "Python", "JavaScript", "Rust", "Go"],
  },
  {
    category: "Frontend",
    items: ["React", "Next.js", "Vue", "Tailwind CSS", "Framer Motion"],
  },
  {
    category: "Backend",
    items: ["Node.js", "GraphQL", "PostgreSQL", "MongoDB", "Redis"],
  },
  {
    category: "AI/ML",
    items: ["TensorFlow", "PyTorch", "Computer Vision", "NLP", "LLMs"],
  },
  { category: "Tools", items: ["Docker", "Kubernetes", "AWS", "Git", "CI/CD"] },
];

type FileType = "folder" | "document" | "link";
type FileItem = {
  name: string;
  type: FileType;
  dateModified: string;
  size: string;
  kind: string;
  icon?: string;
  content?: any;
  link?: string;
};

type PathSegment = string;

// SVG Filter for glass distortion
const GlassDistortionFilter = () => (
  <svg
    style={{ position: "absolute", width: 0, height: 0, pointerEvents: "none" }}
  >
    <filter
      id="finder-glass-distortion"
      x="0%"
      y="0%"
      width="100%"
      height="100%"
      filterUnits="objectBoundingBox"
    >
      <feTurbulence
        type="fractalNoise"
        baseFrequency="0.008 0.008"
        numOctaves="2"
        seed="3"
        result="turbulence"
      />
      <feGaussianBlur in="turbulence" stdDeviation="2" result="softMap" />
      <feDisplacementMap
        in="SourceGraphic"
        in2="softMap"
        scale="15"
        xChannelSelector="R"
        yChannelSelector="G"
      />
    </filter>
  </svg>
);

// Icon components
const FolderIcon = ({ className = "w-4 h-4" }: { className?: string }) => {
  const gradientId = useId();
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none">
      <path
        d="M2.5 7.5C2.5 5.84315 3.84315 4.5 5.5 4.5H12L14.5 7.5H26.5C28.1569 7.5 29.5 8.84315 29.5 10.5V24.5C29.5 26.1569 28.1569 27.5 26.5 27.5H5.5C3.84315 27.5 2.5 26.1569 2.5 24.5V7.5Z"
        fill={`url(#${gradientId})`}
      />
      <defs>
        <linearGradient
          id={gradientId}
          x1="16"
          y1="4.5"
          x2="16"
          y2="27.5"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#5DADE2" />
          <stop offset="1" stopColor="#3498DB" />
        </linearGradient>
      </defs>
    </svg>
  );
};

const DocumentIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 32 32" fill="none">
    <path
      d="M8 2C6.89543 2 6 2.89543 6 4V28C6 29.1046 6.89543 30 8 30H24C25.1046 30 26 29.1046 26 28V10L18 2H8Z"
      fill="white"
      fillOpacity="0.9"
    />
    <path d="M18 2V10H26" fill="#E0E0E0" />
    <path
      d="M10 14H22M10 18H22M10 22H18"
      stroke="#999"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

const LinkIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 32 32" fill="none">
    <rect
      x="6"
      y="6"
      width="20"
      height="20"
      rx="2"
      fill="white"
      fillOpacity="0.9"
    />
    <path
      d="M12 16H20M16 12V20"
      stroke="#0066CC"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <circle
      cx="16"
      cy="16"
      r="3"
      fill="none"
      stroke="#0066CC"
      strokeWidth="1.5"
    />
  </svg>
);

const SidebarIcon = ({ type }: { type: string }) => {
  const baseClass = "w-4 h-4";

  switch (type) {
    case "recents":
      return (
        <svg className={baseClass} viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
          <path
            d="M12 7V12L15 15"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      );
    case "shared":
      return (
        <svg className={baseClass} viewBox="0 0 24 24" fill="none">
          <path
            d="M18 8C18 6.34315 16.6569 5 15 5H9C7.34315 5 6 6.34315 6 8V20H18V8Z"
            stroke="currentColor"
            strokeWidth="2"
          />
          <circle cx="12" cy="10" r="2" stroke="currentColor" strokeWidth="2" />
          <path
            d="M9 16C9 14.8954 9.89543 14 11 14H13C14.1046 14 15 14.8954 15 16V20H9V16Z"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      );
    case "applications":
      return (
        <svg className={baseClass} viewBox="0 0 24 24" fill="none">
          <rect x="3" y="3" width="8" height="8" rx="1.5" fill="currentColor" />
          <rect
            x="13"
            y="3"
            width="8"
            height="8"
            rx="1.5"
            fill="currentColor"
          />
          <rect
            x="3"
            y="13"
            width="8"
            height="8"
            rx="1.5"
            fill="currentColor"
          />
          <rect
            x="13"
            y="13"
            width="8"
            height="8"
            rx="1.5"
            fill="currentColor"
          />
        </svg>
      );
    case "documents":
      return (
        <svg className={baseClass} viewBox="0 0 24 24" fill="none">
          <path
            d="M7 3C5.89543 3 5 3.89543 5 5V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V8L14 3H7Z"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path d="M14 3V8H19" stroke="currentColor" strokeWidth="2" />
        </svg>
      );
    case "downloads":
      return (
        <svg className={baseClass} viewBox="0 0 24 24" fill="none">
          <path
            d="M12 3V15M12 15L8 11M12 15L16 11"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M3 15V18C3 19.6569 4.34315 21 6 21H18C19.6569 21 21 19.6569 21 18V15"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      );
    case "desktop":
      return (
        <svg className={baseClass} viewBox="0 0 24 24" fill="none">
          <rect
            x="2"
            y="3"
            width="20"
            height="14"
            rx="2"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M8 21H16M12 17V21"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      );
    case "cloud":
      return (
        <svg className={baseClass} viewBox="0 0 24 24" fill="none">
          <path
            d="M7 18C4.79086 18 3 16.2091 3 14C3 12.0929 4.33457 10.4976 6.12071 10.0991C6.04169 9.74566 6 9.37726 6 9C6 6.23858 8.23858 4 11 4C13.4193 4 15.4373 5.71825 15.9002 8.00189C18.2263 8.0645 20 9.87653 20 12C20 14.2091 18.2091 16 16 16H7Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
      );
    default:
      return (
        <svg className={baseClass} viewBox="0 0 24 24" fill="none">
          <path
            d="M4 6C4 4.89543 4.89543 4 6 4H9L11 6H18C19.1046 6 20 6.89543 20 8V18C20 19.1046 19.1046 20 18 20H6C4.89543 20 4 19.1046 4 18V6Z"
            fill="currentColor"
          />
        </svg>
      );
  }
};

export default function AboutApp({
  windowId,
  isActive,
  windowControls,
}: AppComponentProps) {
  const [currentPath, setCurrentPath] = useState<PathSegment[]>(["About Me"]);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set()
  );
  const listRef = useRef<HTMLDivElement>(null);
  const dragHandler = useDragHandler();

  // Helper function to calculate file sizes
  const calculateSize = (content: any, type: string): string => {
    if (typeof content === "string") {
      // Simple text files
      if (content === "about") return "1.3 KB";
      if (content === "contact") return "924 bytes";
    }
    
    if (content && typeof content === "object") {
      // Timeline items - vary by description length
      if ("company" in content) {
        const baseSize = 800 + (content.description?.length || 0) * 5;
        if (baseSize < 1024) return `${baseSize} bytes`;
        return `${(baseSize / 1024).toFixed(1)} KB`;
      }
      
      // Project items - vary by tech stack size
      if ("title" in content && "tagline" in content) {
        const techCount = content.tech?.length || 0;
        const baseSize = 1200 + techCount * 150;
        return `${(baseSize / 1024).toFixed(1)} KB`;
      }
      
      // Skill items - vary by number of items
      if ("category" in content && "items" in content) {
        const itemCount = content.items?.length || 0;
        const baseSize = 600 + itemCount * 80;
        if (baseSize < 1024) return `${baseSize} bytes`;
        return `${(baseSize / 1024).toFixed(1)} KB`;
      }
    }
    
    return "1.0 KB";
  };

  // Helper to calculate folder size
  const calculateFolderSize = (items: any[]): string => {
    let totalBytes = 0;
    items.forEach((item) => {
      const size = calculateSize(item, "document");
      const match = size.match(/^([\d.]+)\s*(bytes|KB)$/);
      if (match) {
        const value = parseFloat(match[1]);
        const unit = match[2];
        totalBytes += unit === "KB" ? value * 1024 : value;
      }
    });
    
    if (totalBytes < 1024) return `${Math.round(totalBytes)} bytes`;
    return `${(totalBytes / 1024).toFixed(1)} KB`;
  };

  const getCurrentItems = (): FileItem[] => {
    const path = currentPath.join("/");

    if (path === "About Me") {
      return [
        {
          name: "About.txt",
          type: "document",
          dateModified: "Today",
          size: "1.3 KB",
          kind: "Plain Text",
          content: "about",
        },
        {
          name: "Timeline",
          type: "folder",
          dateModified: "Today",
          size: calculateFolderSize(timeline),
          kind: "Folder",
          content: timeline,
        },
        {
          name: "Projects",
          type: "folder",
          dateModified: "Today",
          size: calculateFolderSize(projects),
          kind: "Folder",
          content: projects,
        },
        {
          name: "Skills",
          type: "folder",
          dateModified: "Today",
          size: calculateFolderSize(skills),
          kind: "Folder",
          content: skills,
        },
        {
          name: "Contact.txt",
          type: "document",
          dateModified: "Today",
          size: "924 bytes",
          kind: "Plain Text",
          content: "contact",
        },
      ];
    } else if (path === "About Me/Timeline") {
      return timeline.map((item) => ({
        name: `${item.company}.txt`,
        type: "document" as FileType,
        dateModified: item.endDate === "Present" ? "Today" : item.endDate,
        size: calculateSize(item, "document"),
        kind: item.type || "Plain Text",
        content: item,
        link: item.link || undefined,
      }));
    } else if (path === "About Me/Projects") {
      return projects.map((project) => ({
        name: `${project.title}.txt`,
        type: "link" as FileType,
        dateModified: "Today",
        size: calculateSize(project, "link"),
        kind: "Project",
        content: project,
        link: project.link,
      }));
    } else if (path === "About Me/Skills") {
      return skills.map((skill) => ({
        name: `${skill.category}.txt`,
        type: "document" as FileType,
        dateModified: "Today",
        size: calculateSize(skill, "document"),
        kind: "Skill",
        content: skill,
      }));
    }

    return [];
  };

  const items = getCurrentItems();

  // Keyboard navigation
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(items.length - 1, prev + 1));
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const item = items[selectedIndex];
        if (item) {
          handleItemClick(item);
        }
      } else if (e.key === "ArrowLeft" && currentPath.length > 1) {
        e.preventDefault();
        goBack();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isActive, selectedIndex, items, currentPath]);

  // Update selected item when index changes
  useEffect(() => {
    if (items[selectedIndex]) {
      setSelectedItem(items[selectedIndex].name);
    }
  }, [selectedIndex, items]);

  const handleItemClick = (item: FileItem) => {
    setSelectedItem(item.name);

    if (item.type === "folder") {
      setCurrentPath([...currentPath, item.name]);
      setSelectedIndex(0);
      setExpandedFolders(new Set([...expandedFolders, item.name]));
    } else if (item.link) {
      window.open(item.link, "_blank");
    }
  };

  const goBack = () => {
    if (currentPath.length > 1) {
      setCurrentPath(currentPath.slice(0, -1));
      setSelectedIndex(0);
    }
  };

  const renderContent = () => {
    const selectedItemData = items.find((item) => item.name === selectedItem);
    if (!selectedItemData) return null;

    const content = selectedItemData.content;

    if (selectedItemData.name === "About.txt") {
      return (
        <div className="p-4 space-y-3 text-white/80 text-sm">
          <h3 className="font-semibold text-white">About Me</h3>
          <p className="leading-relaxed text-xs">
            My goal is to build world changing products that meaningfully change how people live, work, and is also incredibly interesting to me. 
          </p>
          <div className="text-xs">
            <p className="text-white/70 mb-1.5">Have a couple long term goals atm:</p>
            <ul className="space-y-1 ml-4">
              <li className="flex items-start gap-2">
                <span className="text-white/40 mt-0.5">•</span>
                <span>Solve / Reduce aging?</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-white/40 mt-0.5">•</span>
                <span>Silicon Photonics</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-white/40 mt-0.5">•</span>
                <span>Intelligence / Robotics</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-white/40 mt-0.5">•</span>
                <span>High Bandwidth Neural Interfaces</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-white/40 mt-0.5">•</span>
                <span>Consumer Fashion Apps</span>
              </li>
            </ul>
          </div>
        </div>
      );
    }

    if (selectedItemData.name === "Contact.txt") {
      // Obfuscated contact info
      const emailParts = ['sbae', '703', '@', 'gmail', '.', 'com'];
      const linkedinParts = ['https://', 'www.', 'linkedin', '.com/', 'in/', 'sungjae', 'bae'];
      const githubParts = ['https://', 'github', '.com/', 'hydral', '8'];
      
      const email = emailParts.join('');
      const linkedin = linkedinParts.join('');
      const github = githubParts.join('');
      
      return (
        <div className="p-4 space-y-3 text-white/80 text-sm">
          <h3 className="font-semibold text-white">Contact</h3>
          <div className="space-y-1 text-xs">
            <div>Email: <a href={`mailto:${email}`} target="_blank" rel="noopener noreferrer" className="text-accent-cyan hover:underline">{email}</a></div>
            {/* all links should be clickable */}
            <div>LinkedIn: <a href={linkedin} target="_blank" rel="noopener noreferrer" className="text-accent-cyan hover:underline">{linkedin}</a></div>
            <div>GitHub: <a href={github} target="_blank" rel="noopener noreferrer" className="text-accent-cyan hover:underline">{github}</a></div>
          </div>
        </div>
      );
    }

    // Handle single object content (when inside a folder viewing individual files)
    if (content && typeof content === "object" && !Array.isArray(content)) {
      // Timeline item
      if ("company" in content) {
        return (
          <div className="p-4 space-y-2 text-white/80 text-sm">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-white">{content.company}</h3>
              {content.type && (
                <span
                  className="px-2 py-0.5 text-[10px] rounded"
                  style={{
                    background:
                      content.type === "Education"
                        ? "rgba(59, 130, 246, 0.2)"
                        : content.type === "Work"
                        ? "rgba(34, 197, 94, 0.2)"
                        : content.type === "Company"
                        ? "rgba(168, 85, 247, 0.2)"
                        : content.type === "Club"
                        ? "rgba(236, 72, 153, 0.2)"
                        : "rgba(148, 163, 184, 0.2)",
                    color:
                      content.type === "Education"
                        ? "#93C5FD"
                        : content.type === "Work"
                        ? "#86EFAC"
                        : content.type === "Company"
                        ? "#C4B5FD"
                        : content.type === "Club"
                        ? "#F472B6"
                        : "#CBD5E1",
                  }}
                >
                  {content.type}
                </span>
              )}
            </div>
            <div className="text-xs text-white/60">{content.role}</div>
            <div className="text-xs text-white/60">
              {content.startDate} - {content.endDate}
            </div>
            <p className="text-xs leading-relaxed">{content.description}</p>
            {content.link && (
              <a
                href={content.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-400 hover:underline"
              >
                Visit Website →
              </a>
            )}
          </div>
        );
      }
      // Project item
      if ("title" in content && "tagline" in content) {
        return (
          <div className="p-4 space-y-2 text-white/80 text-sm">
            <h3 className="font-semibold text-white">{content.title}</h3>
            <div className="text-xs text-white/60">{content.tagline}</div>
            <p className="text-xs leading-relaxed">{content.description}</p>
            <div className="flex flex-wrap gap-1 pt-1">
              {content.tech?.map((tech: string, i: number) => (
                <span
                  key={i}
                  className="px-1.5 py-0.5 text-[10px] bg-white/10 rounded"
                >
                  {tech}
                </span>
              ))}
            </div>
            {content.link && (
              <a
                href={content.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-400 hover:underline block pt-1"
              >
                Visit Project →
              </a>
            )}
          </div>
        );
      }
      // Skill item
      if ("category" in content && "items" in content) {
        return (
          <div className="p-4 space-y-2 text-white/80 text-sm">
            <h3 className="font-semibold text-white">{content.category}</h3>
            <div className="flex flex-wrap gap-1">
              {content.items?.map((item: string, i: number) => (
                <span
                  key={i}
                  className="px-1.5 py-0.5 text-[10px] bg-white/10 rounded"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        );
      }
    }

    // Handle array content (for folder items in root) - show list of all items
    if (Array.isArray(content) && selectedItemData.type === "folder") {
      // Timeline folder
      if (content.length > 0 && "company" in content[0]) {
        return (
          <div className="p-4 space-y-1.5 text-white/80 text-sm">
            <h3 className="font-semibold text-white mb-2">{selectedItemData.name}</h3>
            <div className="space-y-1">
              {content.map((item: any, index: number) => (
                <div key={index} className="flex items-center gap-2 py-1">
                  <div className="w-1 h-1 rounded-full bg-white/40 flex-shrink-0" />
                  <div className="flex-1 text-xs">
                    <span className="text-white/90">{item.company}</span>
                    {item.type && (
                      <span className="ml-2 text-[10px] text-white/50">({item.type})</span>
                    )}
                  </div>
                  <span className="text-[10px] text-white/40">
                    {item.startDate} - {item.endDate}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      }
      // Projects folder
      else if (content.length > 0 && "title" in content[0]) {
        return (
          <div className="p-4 space-y-1.5 text-white/80 text-sm">
            <h3 className="font-semibold text-white mb-2">{selectedItemData.name}</h3>
            <div className="space-y-1">
              {content.map((project: any, index: number) => (
                <div key={index} className="flex items-center gap-2 py-1">
                  <div className="w-1 h-1 rounded-full bg-white/40 flex-shrink-0" />
                  <div className="flex-1 text-xs">
                    <span className="text-white/90">{project.title}</span>
                    <span className="ml-2 text-[10px] text-white/50">— {project.tagline}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }
      // Skills folder
      else if (content.length > 0 && "category" in content[0]) {
        return (
          <div className="p-4 space-y-1.5 text-white/80 text-sm">
            <h3 className="font-semibold text-white mb-2">{selectedItemData.name}</h3>
            <div className="space-y-1">
              {content.map((skill: any, index: number) => (
                <div key={index} className="flex items-center gap-2 py-1">
                  <div className="w-1 h-1 rounded-full bg-white/40 flex-shrink-0" />
                  <div className="flex-1 text-xs">
                    <span className="text-white/90">{skill.category}</span>
                    <span className="ml-2 text-[10px] text-white/50">
                      ({skill.items?.length || 0} {skill.items?.length === 1 ? 'skill' : 'skills'})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }
    }

    return null;
  };

  return (
    <div
      className="h-full flex flex-col"
      style={{
        background: "rgba(30, 30, 30, 0.5)",
        backdropFilter: "blur(40px) saturate(180%)",
        WebkitBackdropFilter: "blur(40px) saturate(180%)",
      }}
    >
      <div className="flex flex-1">
        {/* Sidebar */}
        <div
          className="w-56 flex-shrink-0 text-xs relative flex flex-col"
        >
          <div
            className="absolute inset-0 -z-10"
            style={{
              background: "rgba(44, 44, 46, 0.4)",
              backdropFilter: "blur(30px) saturate(150%)",
              WebkitBackdropFilter: "blur(30px) saturate(150%)",
            }}
          />

          {/* Rounded container with blue border containing traffic lights and sidebar content */}
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
              {/* Frosted blue background effect for traffic lights */}
              {windowControls && (
                <>
                  <button
                    onClick={(e) => {
                      console.log("close");
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
              className="flex-1 overflow-y-auto relative"
              style={{ zIndex: 10, paddingTop: "50px", paddingBottom: "8px" }}
            >
              {/* Recents */}
              <div className="px-3 py-1.5 flex items-center gap-2 text-white/70 hover:bg-white/10 rounded-md mx-1 transition-all">
                <SidebarIcon type="recents" />
                <span>Recents</span>
              </div>

              {/* Shared */}
              <div className="px-3 py-1.5 flex items-center gap-2 text-white/70 hover:bg-white/10 rounded-md mx-1 transition-all">
                <SidebarIcon type="shared" />
                <span>Shared</span>
              </div>

              {/* Favorites */}
              <div className="mt-3 mb-1 px-3">
                <div className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">
                  Favorites
                </div>
              </div>

              <div className="px-3 py-1.5 flex items-center gap-2 text-white/70 hover:bg-white/10 rounded-md mx-1 transition-all">
                <SidebarIcon type="applications" />
                <span>Applications</span>
              </div>

              <div className="px-3 py-1.5 flex items-center gap-2 text-white/70 hover:bg-white/10 rounded-md mx-1 transition-all">
                <SidebarIcon type="documents" />
                <span>Documents</span>
              </div>

              <div className="px-3 py-1.5 flex items-center gap-2 text-white/70 hover:bg-white/10 rounded-md mx-1 transition-all">
                <SidebarIcon type="downloads" />
                <span>Downloads</span>
              </div>

              <div className="px-3 py-1.5 flex items-center gap-2 text-white/70 hover:bg-white/10 rounded-md mx-1 transition-all">
                <SidebarIcon type="desktop" />
                <span>Desktop</span>
              </div>

              {/* Locations */}
              <div className="mt-3 mb-1 px-3">
                <div className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">
                  Locations
                </div>
              </div>

              <div className="px-3 py-1.5 flex items-center gap-2 text-white/70 hover:bg-white/10 rounded-md mx-1 transition-all">
                <SidebarIcon type="cloud" />
                <span>iCloud Drive</span>
              </div>
            </div>

            {/* Tags Section */}
            <div className="mt-4 px-3 pb-2 relative" style={{ zIndex: 10 }}>
              <div className="text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-2">
                Tags
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 py-1 text-white/70 hover:bg-white/10 rounded-md px-2 transition-all">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <span>Red</span>
                </div>
                <div className="flex items-center gap-2 py-1 text-white/70 hover:bg-white/10 rounded-md px-2 transition-all">
                  <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                  <span>Orange</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Combined Header - Toolbar + Column Headers */}
          <div
            className="flex flex-col relative"
          >

            {/* Toolbar Row - Back/Forward + Breadcrumbs */}
            <div
              className="flex items-center gap-2 px-3 relative py-3.5"
              onMouseDown={(e) => {
                // Only trigger drag on empty areas, not on buttons
                if (
                  e.target === e.currentTarget ||
                  (e.target as HTMLElement).tagName === "SPAN" ||
                  (e.target as HTMLElement).classList.contains("draggable-area")
                ) {
                  dragHandler?.(e);
                }
              }}
            >
              {/* Unified Back/Forward Buttons Container */}
              <div
                className="flex items-center relative overflow-hidden px-1.5 py-1.5"
                style={{
                  borderRadius: "20px",
                  backdropFilter: "blur(20px) saturate(150%)",
                  WebkitBackdropFilter: "blur(20px) saturate(150%)",
                  border: "0.5px solid rgba(70, 130, 220, 0.3)",
                }}
              >
                {/* Frosted glass background layers */}
                <div
                  className="absolute inset-0"
                  style={{
                    zIndex: 0,
                    overflow: "hidden",
                    borderRadius: "20px",
                    pointerEvents: "none",
                  }}
                >
                  {/* Blue tint gradient layer */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(30, 45, 55, 0.65) 0%, rgba(20, 35, 45, 0.7) 50%, rgba(15, 25, 35, 0.75) 100%)",
                    }}
                  />
                  {/* Subtle blue frost overlay */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "radial-gradient(circle at 30% 30%, rgba(70, 130, 220, 0.15) 0%, transparent 40%)",
                    }}
                  />
                  {/* Shine/gloss layer */}
                  <div className="liquid-glass-weak-shine" />
                </div>
                {/* Back button */}
                <button
                  onClick={goBack}
                  disabled={currentPath.length <= 1}
                  className="w-9 h-7 disabled:opacity-30 disabled:cursor-not-allowed transition-all relative group flex items-center justify-center"
                  onMouseDown={(e) => e.stopPropagation()}
                  style={{
                    borderRadius: "18px",
                    zIndex: 10,
                  }}
                >
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{
                      background: "rgba(255, 255, 255, 0.1)",
                      borderRadius: "18px",
                    }}
                  />
                  <svg width="24" height="24" viewBox="0 0 16 16" fill="none" className="relative z-10">
                    <path
                      d="M10 12L6 8L10 4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-white/70"
                    />
                  </svg>
                </button>

                {/* Vertical divider */}
                <div
                  style={{
                    width: "0.5px",
                    height: "18px",
                    background: "rgba(255, 255, 255, 0.15)",
                    zIndex: 10,
                  }}
                />

                {/* Forward button */}
                <button
                  disabled
                  className="w-9 h-7 disabled:opacity-30 disabled:cursor-not-allowed transition-all relative group flex items-center justify-center"
                  onMouseDown={(e) => e.stopPropagation()}
                  style={{
                    borderRadius: "18px",
                    zIndex: 10,
                  }}
                >
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{
                      background: "rgba(255, 255, 255, 0.1)",
                      borderRadius: "18px",
                    }}
                  />
                  <svg width="24" height="24" viewBox="0 0 16 16" fill="none" className="relative z-10">
                    <path
                      d="M6 12L10 8L6 4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-white/70"
                    />
                  </svg>
                </button>
              </div>

              {/* Breadcrumbs */}
              <div
                className="flex-1 px-3 py-1 rounded text-xs font-medium relative overflow-hidden draggable-area"
                onMouseDown={(e) => {
                  dragHandler?.(e);
                }}
              >
                <div
                  className="absolute inset-0 -z-10"
                  style={{
                    background: "rgba(0, 0, 0, 0.3)",
                  }}
                />
                <span style={{ color: "rgba(255, 255, 255, 0.7)" }}>
                  {currentPath.join(" › ")}
                </span>
              </div>
            </div>

            {/* Column Headers Row */}
            <table className="w-full" style={{ borderCollapse: "collapse", tableLayout: "fixed" }}>
              <colgroup>
                <col style={{ width: "40%" }} />
                <col style={{ width: "25%" }} />
                <col style={{ width: "15%" }} />
                <col style={{ width: "20%" }} />
              </colgroup>
              <thead>
                <tr>
                  <th
                    className="text-left px-4 py-2 text-[11px] font-medium uppercase tracking-wider"
                    style={{
                      color: "rgba(255, 255, 255, 0.5)",
                    }}
                  >
                    Name
                  </th>
                  <th
                    className="text-left px-4 py-2 text-[11px] font-medium uppercase tracking-wider"
                    style={{
                      color: "rgba(255, 255, 255, 0.5)",
                    }}
                  >
                    Date Modified
                  </th>
                  <th
                    className="text-right px-4 py-2 text-[11px] font-medium uppercase tracking-wider"
                    style={{
                      color: "rgba(255, 255, 255, 0.5)",
                    }}
                  >
                    Size
                  </th>
                  <th
                    className="text-left px-4 py-2 text-[11px] font-medium uppercase tracking-wider"
                    style={{
                      color: "rgba(255, 255, 255, 0.5)",
                    }}
                  >
                    Kind
                  </th>
                </tr>
              </thead>
            </table>
          </div>

          {/* List View */}
          <div ref={listRef} className="flex-1 overflow-y-auto">
            <table className="w-full" style={{ borderCollapse: "collapse", tableLayout: "fixed" }}>
              <colgroup>
                <col style={{ width: "40%" }} />
                <col style={{ width: "25%" }} />
                <col style={{ width: "15%" }} />
                <col style={{ width: "20%" }} />
              </colgroup>
              <thead className="sr-only">
                <tr>
                  <th>Name</th>
                  <th>Date Modified</th>
                  <th>Size</th>
                  <th>Kind</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr
                    key={item.name}
                    onClick={() => {
                      setSelectedIndex(index);
                      setSelectedItem(item.name);
                    }}
                    onDoubleClick={() => handleItemClick(item)}
                    style={{
                      background:
                        selectedIndex === index
                          ? "rgba(30, 30, 32, 0.25)"
                          : "transparent",
                    }}
                  >
                    <td className="px-4 py-1">
                      <div className="flex items-center gap-2">
                        {item.type === "folder" ? (
                          <FolderIcon className="w-4 h-4 flex-shrink-0" />
                        ) : item.type === "link" ? (
                          <LinkIcon className="w-4 h-4 flex-shrink-0" />
                        ) : (
                          <DocumentIcon className="w-4 h-4 flex-shrink-0" />
                        )}
                        <span
                          className="text-[13px]"
                          style={{ color: "rgba(255, 255, 255, 0.85)" }}
                        >
                          {item.name}
                        </span>
                      </div>
                    </td>
                    <td
                      className="px-4 py-1 text-[13px]"
                      style={{
                        color: "rgba(255, 255, 255, 0.6)",
                      }}
                    >
                      {item.dateModified}
                    </td>
                    <td
                      className="px-4 py-1 text-right text-[13px]"
                      style={{
                        color: "rgba(255, 255, 255, 0.6)",
                      }}
                    >
                      {item.size}
                    </td>
                    <td
                      className="px-4 py-1 text-[13px]"
                      style={{
                        color: "rgba(255, 255, 255, 0.6)",
                      }}
                    >
                      {item.kind}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Preview/Detail Panel */}
          {selectedItem && (
            <div
              className="border-t h-56 overflow-y-auto relative"
              style={{
                borderColor: "rgba(255, 255, 255, 0.1)",
                background: "rgba(44, 44, 46, 0.5)",
                backdropFilter: "blur(30px) saturate(140%)",
                WebkitBackdropFilter: "blur(30px) saturate(140%)",
                boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.05)",
              }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedItem}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  {renderContent()}
                </motion.div>
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
