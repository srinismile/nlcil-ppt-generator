import React, { useState } from "react";
import { generateNLCILPresentation } from "./nlcPptEngine";
import { NLCIL_THEME } from "./nlcBrandTheme";

export default function App() {
  const [rawText, setRawText] = useState("");
  const [slides, setSlides] = useState([
    {
      title: "NLC INDIA LIMITED",
      subtitle: "Creating Wealth for Wellbeing",
    },
    {
      title: "Corporate Objectives",
      bullets: [
        "Develop expertise in power and mining.",
        "Sustain high growth and financial strength.",
        "Achieve sustainable environmental development.",
        "Foster a collaborative corporate culture.",
      ],
    },
  ]);

  const handleAutoBeautify = () => {
    if (!rawText.trim()) return;

    const blocks = rawText.split("\n\n").filter(Boolean);
    const formatted = blocks.map((block, idx) => {
      const lines = block.split("\n").filter(Boolean);
      const title = lines[0] || `Slide ${idx + 1}`;
      
      const bullets = lines
        .slice(1, NLCIL_THEME.rules.maxBulletsPerSlide + 1)
        .map((line) => {
          const cleanLine = line.replace(/^[-*•\d.]+\s*/, "");
          const words = cleanLine.split(" ");
          if (words.length > NLCIL_THEME.rules.maxWordsPerBullet) {
            return words.slice(0, NLCIL_THEME.rules.maxWordsPerBullet).join(" ") + "...";
          }
          return cleanLine;
        });

      return { title, bullets };
    });

    setSlides(formatted);
  };

  return (
    
      
        
          {NLCIL_THEME.companyName}
          
            {NLCIL_THEME.tagline}
          
        
         generateNLCILPresentation(slides)}
          className="bg-[#2E3092] hover:bg-blue-900 text-white font-semibold px-6 py-2 rounded-md shadow transition"
        >
          Export NLCIL PPTX
        
      

      
        
          
            Paste Content Notes (Auto-formats to NLCIL Standards)
          
           setRawText(e.target.value)}
            placeholder="Slide Title
Bullet point 1 (Max 8 words)
Bullet point 2

Next Slide Title
Bullet point 1"
            className="w-full p-4 rounded-lg bg-white border border-slate-300 focus:ring-2 focus:ring-[#2E3092] outline-none"
          />
          <button
            onClick={handleAutoBeautify}
            className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-medium py-3 rounded-lg transition shadow"
          >
            Auto-Structure & Validate Rules
          </button>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-700">
            Slide Structure Preview ({slides.length} Slides)
          </h2>
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
            {slides.map((s, i) => (
              <div key={i} className="p-4 bg-white rounded-lg border-l-4 border-[#2E3092] shadow-sm space-y-2">
                <span className="text-xs font-bold text-slate-400">SLIDE {i + 1}</span>
                <h3 className="font-bold text-[#2E3092]">{s.title}</h3>
                {s.subtitle && <p className="text-sm font-medium text-amber-800">{s.subtitle}</p>}
                {s.bullets && (
                  <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                    {s.bullets.map((b, bi) => (
                      <li key={bi} className={b.endsWith("...") ? "text-amber-600 font-semibold" : ""}>
                        {b}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}