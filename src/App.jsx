// src/App.jsx
import React, { useState } from "react";
import { generateNLCILPresentation } from "./nlcPptEngine";
import { NLCIL_THEME } from "./nlcBrandTheme";

const PRESET_TEMPLATES = {
  executiveSummary: {
    name: "Executive Summary",
    text: `NLC India Limited Overview\nCreating Wealth for Wellbeing\n\nCorporate Vision & Mission\nEmerge as a leading Mining and Power Company.\nAccelerate national growth with social responsiveness.\nSustain expertise in power generation and lignite mining.\nMaintain focus on corporate growth and financial strength.\n\nOperational Principles\nIntegrity, accountability, and total operational transparency.\nPrioritize employee wellness, environmental safety, and sustainability.`,
  },
  kpiDashboard: {
    name: "KPI Performance Dashboard",
    text: `Key Operational Highlights\nQ3 Operational & Performance Metrics\n\nMining & Power Targets\n7.00 MTPA - Lignite Production Achieved at Mine-IA.\n15.00 MTPA - Peak Operational Output Maintained at Mine-II.\n100% - Safety Compliance Recorded Across Units.\n\nFinancial Directives\nSustain long-term corporate growth and capital stability.\nExpand renewable energy transition projects.`,
  },
};

export default function App() {
  const [rawText, setRawText] = useState(PRESET_TEMPLATES.executiveSummary.text);
  const [globalAlign, setGlobalAlign] = useState("justified");
  const [slides, setSlides] = useState([
    {
      title: "NLC INDIA LIMITED",
      subtitle: "Creating Wealth for Wellbeing",
      align: "justified",
    },
    {
      title: "Corporate Vision & Mission",
      align: "justified",
      bullets: [
        "Emerge as a leading Mining and Power Company.",
        "Accelerate national growth with social responsiveness.",
        "Sustain expertise in power generation and lignite mining.",
        "Maintain focus on corporate growth and financial strength.",
      ],
    },
  ]);

  const handleAutoFormat = (textToProcess = rawText) => {
    if (!textToProcess.trim()) return;

    const blocks = textToProcess.split("\n\n").filter(Boolean);
    const formatted = blocks.map((block, idx) => {
      const lines = block.split("\n").filter(Boolean);
      const title = lines[0] || `Slide ${idx + 1}`;

      if (idx === 0 && lines.length <= 2) {
        return {
          title: lines[0],
          subtitle: lines[1] || "",
          align: globalAlign,
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

      return { title, bullets, align: globalAlign };
    });

    setSlides(formatted);
  };

  const handleGlobalAlignChange = (newAlign) => {
    setGlobalAlign(newAlign);
    setSlides(slides.map((s) => ({ ...s, align: newAlign })));
  };

  const handleSlideAlignChange = (index, newAlign) => {
    const updated = [...slides];
    updated[index].align = newAlign;
    setSlides(updated);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans flex flex-col">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-8 py-4 flex flex-wrap justify-between items-center sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-[#2E3092] rounded-lg flex items-center justify-center font-bold text-white">
            NLC
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">
              {NLCIL_THEME.companyName} Studio
            </h1>
            <p className="text-xs text-amber-400">{NLCIL_THEME.tagline}</p>
          </div>
        </div>

        <button
          onClick={() => generateNLCILPresentation(slides)}
          className="bg-[#2E3092] hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-lg shadow-lg transition flex items-center space-x-2 border border-blue-500/30"
        >
          <span>Export NLCIL PPTX</span>
        </button>
      </header>

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Control Panel */}
        <div className="lg:col-span-5 flex flex-col space-y-6">
          {/* Alignment Control Toolbar */}
          <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 space-y-3">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Global Alignment Options
            </h2>
            <div className="grid grid-cols-3 gap-2">
              {["justified", "left", "center"].map((align) => (
                <button
                  key={align}
                  onClick={() => handleGlobalAlignChange(align)}
                  className={`py-2 text-xs font-semibold rounded-md border capitalize transition ${
                    globalAlign === align
                      ? "bg-[#2E3092] text-white border-blue-500"
                      : "bg-slate-700 text-slate-300 border-slate-600 hover:bg-slate-600"
                  }`}
                >
                  {align}
                </button>
              ))}
            </div>
          </div>

          {/* Preset Selection */}
          <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 space-y-3">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Quick Templates
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {Object.keys(PRESET_TEMPLATES).map((key) => (
                <button
                  key={key}
                  onClick={() => {
                    setRawText(PRESET_TEMPLATES[key].text);
                    handleAutoFormat(PRESET_TEMPLATES[key].text);
                  }}
                  className="bg-slate-700 hover:bg-slate-600 text-xs text-slate-200 font-medium py-2 px-3 rounded-md transition border border-slate-600 text-left"
                >
                  {PRESET_TEMPLATES[key].name}
                </button>
              ))}
            </div>
          </div>

          {/* Raw Text Box */}
          <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 flex-1 flex flex-col space-y-3">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Content Editor
            </h2>
            <textarea
              rows={10}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              className="w-full flex-1 p-4 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 font-mono text-sm focus:ring-2 focus:ring-[#2E3092] outline-none resize-none"
            />
            <button
              onClick={() => handleAutoFormat()}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 rounded-lg transition"
            >
              Re-Format Slides
            </button>
          </div>
        </div>

        {/* Right Slide Deck Preview */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          <h2 className="text-lg font-bold text-white">
            Live Slide Structure ({slides.length} Slides)
          </h2>

          <div className="space-y-4 max-h-[calc(100vh-220px)] overflow-y-auto pr-2">
            {slides.map((s, idx) => (
              <div
                key={idx}
                className="bg-slate-800 rounded-xl border-l-4 border-[#2E3092] p-5 border border-slate-700 space-y-3"
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-400">
                    SLIDE {idx + 1}
                  </span>

                  {/* Per-Slide Alignment Selector */}
                  <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded border border-slate-700">
                    {["justified", "left", "center"].map((align) => (
                      <button
                        key={align}
                        onClick={() => handleSlideAlignChange(idx, align)}
                        className={`px-2 py-0.5 text-[10px] uppercase font-semibold rounded capitalize ${
                          (s.align || "justified") === align
                            ? "bg-[#2E3092] text-white"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        {align.slice(0, 4)}
                      </button>
                    ))}
                  </div>
                </div>

                <input
                  type="text"
                  value={s.title}
                  onChange={(e) => {
                    const updated = [...slides];
                    updated[idx].title = e.target.value;
                    setSlides(updated);
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-blue-300 font-bold text-sm focus:outline-none"
                />

                {s.bullets && (
                  <div className="space-y-2">
                    {s.bullets.map((b, bi) => (
                      <input
                        key={bi}
                        type="text"
                        value={b}
                        onChange={(e) => {
                          const updated = [...slides];
                          updated[idx].bullets[bi] = e.target.value;
                          setSlides(updated);
                        }}
                        className="w-full bg-slate-900/60 border border-slate-700/60 rounded px-3 py-1 text-slate-200 text-xs focus:outline-none"
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}