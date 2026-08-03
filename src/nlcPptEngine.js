// src/nlcPptEngine.js
import pptxgen from "pptxgenjs";
import { NLCIL_THEME } from "./nlcBrandTheme";

// Helper function to convert public/logo.png to Base64
async function getLogoBase64() {
  try {
    const logoPath = `${import.meta.env.BASE_URL}logo.png`;
    const response = await fetch(logoPath);
    if (!response.ok) return null;
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    console.warn("Could not load logo as base64:", err);
    return null;
  }
}

export async function generateNLCILPresentation(slidesData) {
  try {
    const pptx = new pptxgen();

    // 16:9 Widescreen View
    pptx.layout = "LAYOUT_16x9";
    pptx.author = NLCIL_THEME.companyName;

    const logoBase64 = await getLogoBase64();

    // Define NLCIL Master Layout
    pptx.defineSlideMaster({
      title: "NLCIL_MASTER",
      background: { color: "F8FAFC" },
      objects: [
        // Top Primary Blue Line
        {
          rect: {
            x: 0,
            y: 0,
            w: 13.33,
            h: 0.1,
            fill: { color: NLCIL_THEME.colors.primaryBlue },
          },
        },
        // Top-Left Branding Logo
        ...(logoBase64
          ? [
              {
                image: {
                  x: 0.6,
                  y: 0.2,
                  w: 1.4,
                  h: 0.65,
                  data: logoBase64,
                },
              },
            ]
          : [
              {
                text: {
                  text: NLCIL_THEME.companyName.toUpperCase(),
                  options: {
                    x: 0.6,
                    y: 0.25,
                    fontSize: 14,
                    bold: true,
                    color: NLCIL_THEME.colors.primaryBlue,
                    fontFace: NLCIL_THEME.fonts.title,
                  },
                },
              },
            ]),
        // Bottom Navy Accent Bar
        {
          rect: {
            x: 0,
            y: 7.0,
            w: 13.33,
            h: 0.5,
            fill: { color: NLCIL_THEME.colors.primaryBlue },
          },
        },
        // Footer Tagline
        {
          text: {
            text: `${NLCIL_THEME.companyName} | ${NLCIL_THEME.tagline}`,
            options: {
              x: 0.6,
              y: 7.12,
              w: 8.0,
              h: 0.3,
              fontFace: NLCIL_THEME.fonts.body,
              fontSize: 10,
              color: "FFFFFF",
            },
          },
        },
        // Slide Numbering
        {
          slideNumber: {
            x: 11.8,
            y: 7.12,
            w: 1.0,
            h: 0.3,
            color: NLCIL_THEME.colors.textLight,
            fontFace: NLCIL_THEME.fonts.body,
            fontSize: 10,
            align: "right",
          },
        },
      ],
    });

    slidesData.forEach((slideItem, index) => {
      // User-defined alignment option (default: justified)
      const userAlign = slideItem.align || "justified";

      if (index === 0) {
        // --- COVER SLIDE ---
        const slide = pptx.addSlide({ masterName: "NLCIL_MASTER" });

        // Hero Frame
        slide.addShape("rect", {
          x: 0.8,
          y: 1.5,
          w: 11.73,
          h: 4.8,
          fill: { color: "FFFFFF" },
          line: { color: "CBD5E1", width: 1 },
        });

        // Left Ribbon
        slide.addShape("rect", {
          x: 0.8,
          y: 1.5,
          w: 0.25,
          h: 4.8,
          fill: { color: NLCIL_THEME.colors.primaryBlue },
        });

        // Main Title
        slide.addText(slideItem.title, {
          x: 1.4,
          y: 1.8,
          w: 10.6,
          h: 2.0,
          fontSize: 32,
          bold: true,
          color: NLCIL_THEME.colors.primaryBlue,
          fontFace: NLCIL_THEME.fonts.title,
          align: userAlign === "justified" ? "left" : userAlign,
          valign: "top",
          wrap: true,
          shrink: true,
          margin: [5, 5, 5, 5],
        });

        if (slideItem.subtitle) {
          slide.addText(slideItem.subtitle, {
            x: 1.4,
            y: 4.0,
            w: 10.6,
            h: 1.8,
            fontSize: 22,
            color: NLCIL_THEME.colors.darkBrown,
            fontFace: NLCIL_THEME.fonts.title,
            align: userAlign === "justified" ? "left" : userAlign,
            valign: "top",
            wrap: true,
            shrink: true,
            margin: [5, 5, 5, 5],
          });
        }
      } else {
        // --- CONTENT SLIDE(S) ---
        const rawBullets = slideItem.bullets || [];
        const MAX_PER_SLIDE = 5;

        // Auto-chunk text across multiple slides if long
        const chunkedBullets = [];
        if (rawBullets.length === 0) {
          chunkedBullets.push([]);
        } else {
          for (let i = 0; i < rawBullets.length; i += MAX_PER_SLIDE) {
            chunkedBullets.push(rawBullets.slice(i, i + MAX_PER_SLIDE));
          }
        }

        chunkedBullets.forEach((bulletGroup, pageIdx) => {
          const slide = pptx.addSlide({ masterName: "NLCIL_MASTER" });

          const pageTitle =
            chunkedBullets.length > 1
              ? `${slideItem.title} (${pageIdx + 1}/${chunkedBullets.length})`
              : slideItem.title;

          // Header Title Box
          slide.addText(pageTitle, {
            x: 2.2,
            y: 0.2,
            w: 10.5,
            h: 0.7,
            fontSize: 26,
            bold: true,
            color: NLCIL_THEME.colors.primaryBlue,
            fontFace: NLCIL_THEME.fonts.title,
            wrap: true,
            valign: "middle",
            margin: 0,
          });

          const count = bulletGroup.length;
          if (count === 0) return;

          const startY = 1.1;
          const availableH = 5.6;
          const gap = 0.12;
          const cardH = (availableH - gap * (count - 1)) / count;

          bulletGroup.forEach((bulletText, bIdx) => {
            const currentY = startY + bIdx * (cardH + gap);
            const isHighlight = bIdx % 2 === 0;

            // Outer Container Card
            slide.addShape("rect", {
              x: 0.8,
              y: currentY,
              w: 11.73,
              h: cardH,
              fill: { color: isHighlight ? "FFFFFF" : "F8FAFC" },
              line: { color: isHighlight ? "CBD5E1" : "E2E8F0", width: 1 },
            });

            // Accent Bar
            slide.addShape("rect", {
              x: 0.8,
              y: currentY,
              w: 0.12,
              h: cardH,
              fill: {
                color: isHighlight
                  ? NLCIL_THEME.colors.primaryBlue
                  : NLCIL_THEME.colors.darkBrown,
              },
            });

            // Dynamic Font Sizing Calculation
            const len = bulletText.length;
            let fontSize = 16;
            if (count >= 5 || len > 120) fontSize = 13;
            else if (count >= 4 || len > 80) fontSize = 14;

            // Text Rendering with Strict Padding Bounds and Dynamic User Alignment
            slide.addText(bulletText, {
              x: 1.1,
              y: currentY,
              w: 11.2,
              h: cardH,
              fontSize: fontSize,
              color: NLCIL_THEME.colors.textDark,
              fontFace: NLCIL_THEME.fonts.body,
              align: userAlign, // User controlled: "justified", "left", "center", "right"
              valign: "middle", // Center vertically inside card
              wrap: true,       // Force wrap
              shrink: true,     // Shrink font if text exceeds container
              margin: [4, 10, 4, 10], // Strict internal zero-bleed padding
            });
          });
        });
      }
    });

    await pptx.writeFile({ fileName: `NLCIL_Presentation.pptx` });
  } catch (error) {
    console.error("Export error:", error);
    alert("PPT Export Failed: " + error.message);
  }
}