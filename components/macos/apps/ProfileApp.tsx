"use client";

import { useState } from "react";
import { AppComponentProps } from "@/types/macos";
import { useDraggableHeader } from "../Window";
import TrafficLights from "../TrafficLights";
import Image from "next/image";

const navLinks = [
  { id: "about", label: "ABOUT" },
  { id: "projects", label: "PROJECTS" },
];

const socialLinks = [
  { label: "GITHUB", url: "https://github.com/hydral8", icon: "/icons/github.png" },
  { label: "LINKEDIN", url: "https://linkedin.com/in/sungjaebae", icon: "/icons/linkedin.png" },
  { label: "X", url: "https://x.com/sunjaebae", icon: "/icons/x.png" },
];

const currentRoles = [
  {
    title: "MS1",
    org: "Sidney Kimmel Medical College",
    link: "https://www.jefferson.edu/academics/colleges-schools-institutes/skmc.html",
  },
  {
    title: "Founder",
    org: "Magi",
    link: "https://usemagi.com",
  },
  {
    title: "Founder",
    org: "Meural",
    link: "https://meural.com",
  },
];

const recentProjects = [
  {
    title: "Magi",
    description: "Semantic fashion product editor — modify and generate clothing designs using natural language",
    link: "https://usemagi.com",
  },
  {
    title: "Queue",
    description: "On-device AI assistant natively integrated into your device for automation of everyday tasks",
    link: "https://queue.com",
  },
  {
    title: "Meural",
    description: "Making general robotics a modern reality",
    link: "https://meural.com",
  },
  {
    title: "Livv",
    description: "Emergency medical services platform for faster ambulance dispatch and patient care coordination",
    link: "https://livve.us",
  },
  {
    title: "RocLab",
    description: "Taking 20 exceptional students each semester to solve real-world campus problems with technology",
    link: "https://www.instagram.com/roclab_/",
  },
];

export default function ProfileApp({ windowControls }: AppComponentProps) {
  const headerDrag = useDraggableHeader();
  const [activeSection, setActiveSection] = useState("about");

  return (
    <div className="flex flex-col h-full bg-[#fafafa] rounded-xl overflow-hidden select-none">
      {/* Title bar — invisible, just for dragging + traffic lights */}
      <div
        className="flex items-center h-[52px] px-4 shrink-0 bg-[#fafafa]"
        onMouseDown={headerDrag}
        style={{
          borderBottom: "1px solid #e5e5e5",
        }}
      >
        {windowControls && (
          <div className="mr-4">
            <TrafficLights
              onClose={windowControls.close}
              onMinimize={windowControls.minimize}
              onMaximize={windowControls.maximize}
            />
          </div>
        )}
      </div>

      {/* Main layout: sidebar + content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar navigation */}
        <nav className="w-[140px] shrink-0 pt-6 pl-6 pr-4 border-r border-[#e5e5e5] flex flex-col gap-1">
          <h2
            className="text-[#111] text-base font-bold tracking-wide mb-4 cursor-default"
            style={{ fontFamily: "'Inter', 'Helvetica Neue', sans-serif", letterSpacing: "0.04em" }}
          >
            SUNG JAE BAE
          </h2>
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => setActiveSection(link.id)}
              className={`text-left text-xs font-semibold tracking-wider transition-colors py-0.5 ${
                activeSection === link.id
                  ? "text-[#c45a2d]"
                  : "text-[#444] hover:text-[#111]"
              }`}
              style={{ fontFamily: "'Inter', 'Helvetica Neue', sans-serif" }}
            >
              {link.label}
            </button>
          ))}
          {socialLinks.map((link) => (
            <a
              key={link.label}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-left text-xs font-semibold tracking-wider text-[#444] hover:text-[#111] transition-colors py-0.5"
              style={{ fontFamily: "'Inter', 'Helvetica Neue', sans-serif" }}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Content area */}
        <main className="flex-1 overflow-y-auto px-10 py-8">
          {activeSection === "about" ? <AboutSection /> : <ProjectsSection />}
        </main>
      </div>
    </div>
  );
}

function AboutSection() {
  return (
    <div
      className="max-w-[560px]"
      style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
    >
      {/* Profile Photo */}
      <div className="mb-8">
        <div className="w-[180px] h-[180px] rounded-full overflow-hidden">
          <Image
            src="/images/profile.jpg"
            alt="Sung Jae Bae"
            width={180}
            height={180}
            className="object-cover w-full h-full"
          />
        </div>
      </div>

      {/* Bio */}
      <div className="space-y-5 text-[#333] text-[15px] leading-[1.7]">
        <p>
          I&apos;m building products at the intersection of AI, healthcare, and consumer tech
          — tools I believe the world needs and that are deeply interesting to me.
        </p>

        <p>
          Currently a first-year medical student at{" "}
          <a
            href="https://www.jefferson.edu/academics/colleges-schools-institutes/skmc.html"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#c45a2d] hover:underline"
          >
            Sidney Kimmel Medical College
          </a>
          , while building{" "}
          <a
            href="https://usemagi.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#c45a2d] hover:underline"
          >
            Magi
          </a>{" "}
          (semantic fashion editor) and{" "}
          <a
            href="https://meural.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#c45a2d] hover:underline"
          >
            Meural
          </a>{" "}
          (general robotics).
        </p>

        <p>
          Previously studied Neuroscience at the University of Rochester with
          minors in Computer Science and Psychology. Co-founded{" "}
          <a
            href="https://livve.us"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#c45a2d] hover:underline"
          >
            Livv
          </a>{" "}
          (emergency medical services) and{" "}
          <a
            href="https://www.instagram.com/roclab_/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#c45a2d] hover:underline"
          >
            RocLab
          </a>{" "}
          (campus innovation lab).
        </p>

        <p>
          Long-term interests: solving aging, silicon photonics, intelligence &amp;
          robotics, high-bandwidth neural interfaces, and consumer fashion apps.
        </p>

        {/* Recent Projects */}
        <div className="pt-2">
          <p className="mb-3">
            Recent projects <em>(most recent first)</em>:
          </p>
          <ul className="space-y-2 ml-6">
            {recentProjects.map((project) => (
              <li key={project.title} className="flex items-start gap-2">
                <span className="text-[#999] mt-0.5 shrink-0">•</span>
                <span>
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#c45a2d] hover:underline font-medium"
                  >
                    {project.title}
                  </a>
                  {" — "}
                  {project.description}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Publications */}
      <div className="pt-6">
        <p className="mb-3">Publications:</p>
        <ul className="space-y-2 ml-6">
          <li className="flex items-start gap-2">
            <span className="text-[#999] mt-0.5 shrink-0">•</span>
            <span>
              <a
                href="https://doi.org/10.1101/2024.10.10.617645"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#c45a2d] hover:underline font-medium"
              >
                cGAS deficient mice display premature aging associated with de-repression of LINE1 elements and inflammation
              </a>
              {" — "}
              <span className="text-[#666] text-[13px]">
                Martinez JC, Morandini F, ..., <em>Bae SJ</em>, ..., Seluanov A, Gorbunova V. bioRxiv, 2024.
              </span>
            </span>
          </li>
        </ul>
      </div>

      {/* Contact */}
      <div className="mt-10 pt-6 border-t border-[#e5e5e5]">
        <p className="text-[#999] text-sm" style={{ fontFamily: "'Inter', 'Helvetica Neue', sans-serif" }}>
          Reach me at{" "}
          <a
            href="mailto:sbae703@gmail.com"
            className="text-[#c45a2d] hover:underline"
          >
            sbae703@gmail.com
          </a>
        </p>
      </div>
    </div>
  );
}

function ProjectsSection() {
  return (
    <div
      className="max-w-[560px]"
      style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
    >
      <h2
        className="text-[#111] text-lg font-bold mb-6"
        style={{ fontFamily: "'Inter', 'Helvetica Neue', sans-serif", letterSpacing: "0.02em" }}
      >
        Projects
      </h2>

      <div className="space-y-8">
        {recentProjects.map((project) => (
          <div key={project.title} className="group">
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <h3 className="text-[#c45a2d] text-[15px] font-semibold group-hover:underline mb-1">
                {project.title}
              </h3>
              <p className="text-[#555] text-[14px] leading-[1.6]">
                {project.description}
              </p>
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
