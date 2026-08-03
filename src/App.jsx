// src/App.jsx
import React, { useState } from "react";
import { generateNLCILPresentation } from "./nlcPptEngine";
import { NLCIL_THEME } from "./nlcBrandTheme";

// Pre-built Executive Templates for Quick Start
const PRESET_TEMPLATES = {
  executiveSummary: {
    name: "Executive Overview",
    text: `NLC India Limited Overview\nCreating Wealth for Wellbeing\n\nCorporate Vision & Mission\nEmerge as a leading Mining and Power Company.\nAccelerate national growth with social responsiveness.\nSustain expertise in power generation and lignite mining.\nMaintain focus on corporate growth and financial strength.\n\nCore Operational Values\nNational orientation and commitment to operational excellence.\nInnovation, creativity, and customer-focused operations.\nIntegrity, accountability, and total transparency.\nPrioritize safety, sustainability, and employee wellness.`,
  },
  kpiReview: {
    name: "Quarterly KPI Dashboard",
    text: `Key Performance Indicators\nQ3 Operational & Financial Summary\n\nOperational Achievements\n7.00 MTPA - Lignite Production Achieved at Mine-IA.\n15.00 MTPA - Steady Peak Efficiency at Mine-II.\n100% - Safety Compliance Across All Power Units.\n80% - Financial Progress Recorded on Key Projects.\n\nStrategic Priorities\nTransition to renewable and green energy projects.\nOptimize Bucket Wheel Excavator operational timelines.\nEnsure strict compliance with environmental standards.\nEnhance digital monitoring across thermal power units.`,
  },
  projectMilestones: {
    name: "Project Progress Review",
    text: `Project Implementation Status\nReview of Key Mining & Capital Projects\n\nProject Alpha Status\nPhase 1: Initial site preparation completed on schedule.\nPhase 2: Equipment installation reaching 85 percent.\nPhase 3: Grid connectivity testing planned for next quarter.\n\nKey Strategic Directives\nSustain high growth and financial strength.\nAchieve sustainable environmental development.\nNurture talent and foster a collaborative work culture.`,
  },
};

export default function App() {
  const [rawText, setRawText] = useState(PRESET_TEMPLATES.executiveSummary.text);
  const [slides, setSlides] = useState([
    {
      title: "NLC INDIA LIMITED",
      subtitle: "Creating Wealth for Wellbeing",
    },
    {
      title: "Corporate Vision & Mission",
      bullets: [
        "Emerge as a leading Mining and Power Company.",
        "Accelerate national growth with social responsiveness.",
        "Sustain expertise in power generation and lignite mining.",
        "Maintain focus on corporate growth and financial strength.",
      ],
    },
  ]);

  const [activeTab, setActiveTab] = useState("editor");

  // Auto-Beautifier Engine: Cleans and formats raw text notes
  const handleAutoBeautify = (textToProcess = rawText) => {
    if (!textToProcess.trim()) return;

    const blocks = textToProcess.split("\n\n").filter(Boolean);
    const formatted = blocks.map((block, idx) => {
      const lines = block.split("\n").filter(Boolean);
      const title = lines[0] || `Slide ${idx + 1}`;

      if (idx === 0 && lines.length <= 2) {
        return {
          title: lines[0],
          subtitle: lines[1] || "",
        };
      }

      const bullets = lines
        .slice(1, NLCIL_THEME.rules.maxBulletsPerSlide + 1)
        .map((line) => {
          const cleanLine = line.replace(/^[-*•\d.]+\s*/, "").trim();
          const words = cleanLine.split(/\s+/);
          if (words.length > NLCIL_THEME.rules.maxWordsPerBullet) {
            return (
              words.slice(0, NLCIL_THEME.rules.maxWordsPerBullet).join(" ") + "..."
            );
          }
          return cleanLine;
        });

      return { title, bullets };
    });

    setSlides(formatted);
  };

  const handleTemplateSelect = (key) => {
    const template = PRESET_TEMPLATES[key];
    if (template) {
      setRawText(template.text);
      handleAutoBeautify(template.text);
    }
  };

  const handleUpdateSlideTitle = (index, newTitle) => {
    const updated = [...slides];
    updated[index].title = newTitle;
    setSlides(updated);
  };

  const handleUpdateBullet = (slideIdx, bulletIdx, newText) => {
    const updated = [...slides];
    updated[slideIdx].bullets[bulletIdx] = newText;
    setSlides(updated);
  };

  const handleDeleteSlide = (index) => {
    if (slides.length <= 1) return;
    setSlides(slides.filter((_, i) => i !== index));
  };

  const handleAddSlide = () => {
    setSlides([
      ...slides,
      {
        title: "New Executive Slide",
        bullets: ["Key takeaway point 1", "Key takeaway point 2"],
      },
    ]);
  };

  // Helper to identify dynamic layout type
  const detectLayoutType = (slide) => {
    if (!slide.bullets) return "Title / Cover";
    const text = slide.bullets.join(" ");
    if (/\d+\s*(MTPA|MW|%|Cr|Crores)/i.test(text)) return "KPI Metrics";
    if (slide.bullets.length > 4) return "Multi-Card Split";
    return "Executive Cards";
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans flex flex-col">
      {/* Top Header Bar */}
      <header className="bg-slate-800 border-b border-slate-700 px-8 py-4 flex flex-wrap justify-between items-center sticky top-0 z-50 shadow-md">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-[#2E3092] rounded-lg flex items-center justify-center font-bold text-white shadow-inner">
            NLC
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">
              {NLCIL_THEME.companyName} Presentation Studio
            </h1>
            <p className="text-xs text-amber-400 font-medium tracking-wider">
              {NLCIL_THEME.tagline}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <button
            onClick={() => generateNLCILPresentation(slides)}
            className="bg-[#2E3092] hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-lg shadow-lg hover:shadow-blue-900/50 transition flex items-center space-x-2 border border-blue-500/30"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            <span>Export NLCIL PPTX</span>
          </button>
        </div>
      </header>

      {/* Main Studio Content */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Control Panel */}
        <div className="lg:col-span-5 flex flex-col space-y-6">
          {/* Quick Start Templates */}
          <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 shadow-sm space-y-3">
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
              1. Load Executive Template
            </h2>
            <div className="grid grid-cols-3 gap-2">
              {Object.keys(PRESET_TEMPLATES).map((key) => (
                <button
                  key={key}
                  onClick={() => handleTemplateSelect(key)}
                  className="bg-slate-700 hover:bg-slate-600 text-xs text-slate-200 font-medium py-2 px-3 rounded-md transition text-center border border-slate-600"
                >
                  {PRESET_TEMPLATES[key].name}
                </button>
              ))}
            </div>
          </div>

          {/* Raw Text Input Box */}
          <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 shadow-sm space-y-3 flex-1 flex flex-col">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
                2. Paste Content Notes
              </h2>
              <span className="text-xs text-slate-400">Auto-Separates by Blank Lines</span>
            </div>

            <textarea
              rows={12}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Slide Title&#10;Bullet Point 1 (Max 8 Words)&#10;Bullet Point 2&#10;&#10;Next Slide Title&#10;Bullet Point 1"
              className="w-full flex-1 p-4 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 font-mono text-sm focus:ring-2 focus:ring-[#2E3092] focus:border-transparent outline-none resize-none"
            />

            <button
              onClick={() => handleAutoBeautify()}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 rounded-lg transition shadow-md flex items-center justify-center space-x-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              <span>Auto-Format & Structurize Slides</span>
            </button>
          </div>
        </div>

        {/* Right Slide Deck Preview & Editor */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <h2 className="text-lg font-bold text-white">
                Live Slide Deck Structure
              </h2>
              <span className="bg-blue-900/60 text-blue-300 text-xs px-2.5 py-1 rounded-full border border-blue-700 font-medium">
                {slides.length} Slides Generated
              </span>
            </div>

            <button
              onClick={handleAddSlide}
              className="bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold px-3 py-1.5 rounded-md border border-slate-600 transition"
            >
              + Add Blank Slide
            </button>
          </div>

          {/* Interactive Slide Cards List */}
          <div className="space-y-4 max-h-[calc(100vh-220px)] overflow-y-auto pr-2 custom-scrollbar">
            {slides.map((s, idx) => {
              const layoutType = detectLayoutType(s);
              return (
                <div
                  key={idx}
                  className="bg-slate-800 rounded-xl border-l-4 border-[#2E3092] p-5 shadow-sm border border-slate-700 space-y-3 relative group"
                >
                  {/* Card Header & Layout Detector Badge */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-slate-400">
                        SLIDE {idx + 1}
                      </span>
                      <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-slate-700 text-amber-400 border border-slate-600">
                        {layoutType}
                      </span>
                    </div>

                    <button
                      onClick={() => handleDeleteSlide(idx)}
                      className="text-slate-500 hover:text-red-400 text-xs transition"
                      title="Delete Slide"
                    >
                      Delete
                    </button>
                  </div>

                  {/* Slide Title Input */}
                  <input
                    type="text"
                    value={s.title}
                    onChange={(e) => handleUpdateSlideTitle(idx, e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-blue-300 font-bold text-sm focus:outline-none focus:border-blue-500"
                  />

                  {/* Subtitle / Bullets List */}
                  {s.subtitle !== undefined ? (
                    <input
                      type="text"
                      value={s.subtitle}
                      onChange={(e) => {
                        const updated = [...slides];
                        updated[idx].subtitle = e.target.value;
                        setSlides(updated);
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-amber-300 text-xs focus:outline-none"
                    />
                  ) : (
                    <div className="space-y-2">
                      {s.bullets &&
                        s.bullets.map((b, bi) => (
                          <div key={bi} className="flex items-center space-x-2">
                            <span className="w-1.5 h-1.5 bg-[#2E3092] rounded-full flex-shrink-0" />
                            <input
                              type="text"
                              value={b}
                              onChange={(e) =>
                                handleUpdateBullet(idx, bi, e.target.value)
                              }
                              className="w-full bg-slate-900/60 border border-slate-700/60 rounded px-3 py-1 text-slate-200 text-xs focus:outline-none focus:border-blue-500"
                            />
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}