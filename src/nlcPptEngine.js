// src/nlcPptEngine.js
import pptxgen from "pptxgenjs";
import { NLCIL_THEME } from "./nlcBrandTheme";

// Helper function to fetch and convert public/logo.png to Base64
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

    // Widescreen 16:9 layout[cite: 1]
    pptx.layout = "LAYOUT_16x9";
    pptx.author = NLCIL_THEME.companyName;

    const logoBase64 = await getLogoBase64();

    // Define NLCIL Master Layout[cite: 1]
    pptx.defineSlideMaster({
      title: "NLCIL_MASTER",
      background: { color: "F8FAFC" },
      objects: [
        // Top Primary Accent Line[cite: 1]
        {
          rect: {
            x: 0,
            y: 0,
            w: 13.33,
            h: 0.1,
            fill: { color: NLCIL_THEME.colors.primaryBlue },
          },
        },
        // Top-Left Logo[cite: 1]
        ...(logoBase64
          ? [
              {
                image: {
                  x: 0.6,
                  y: 0.25,
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
                    y: 0.3,
                    fontSize: 14,
                    bold: true,
                    color: NLCIL_THEME.colors.primaryBlue,
                    fontFace: NLCIL_THEME.fonts.title,
                  },
                },
              },
            ]),
        // Bottom Navy Footer Bar[cite: 1]
        {
          rect: {
            x: 0,
            y: 7.0,
            w: 13.33,
            h: 0.5,
            fill: { color: NLCIL_THEME.colors.primaryBlue },
          },
        },
        // Footer Tagline Text
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
        // Slide Numbering[cite: 1]
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
      if (index === 0) {
        // --- COVER / TITLE SLIDE ---[cite: 1]
        const slide = pptx.addSlide({ masterName: "NLCIL_MASTER" });

        // Center Hero Card Container (uses string "rect")
        slide.addShape("rect", {
          x: 1.0,
          y: 1.6,
          w: 11.33,
          h: 4.6,
          fill: { color: "FFFFFF" },
          line: { color: "CBD5E1", width: 1 },
        });

        // Left Accent Bar on Title Card
        slide.addShape("rect", {
          x: 1.0,
          y: 1.6,
          w: 0.25,
          h: 4.6,
          fill: { color: NLCIL_THEME.colors.primaryBlue },
        });

        // Main Title[cite: 1]
        slide.addText(slideItem.title, {
          x: 1.6,
          y: 2.1,
          w: 10.2,
          h: 1.8,
          fontSize: 32, // Primary Title Size[cite: 1]
          bold: true,
          color: NLCIL_THEME.colors.primaryBlue,
          fontFace: NLCIL_THEME.fonts.title, // Arial[cite: 1]
          align: "left",
          wrap: true,
          shrink: true,
        });

        // Subtitle[cite: 1]
        if (slideItem.subtitle) {
          slide.addText(slideItem.subtitle, {
            x: 1.6,
            y: 4.1,
            w: 10.2,
            h: 1.4,
            fontSize: 24, // Subtitle Size[cite: 1]
            color: NLCIL_THEME.colors.darkBrown,
            fontFace: NLCIL_THEME.fonts.title,
            align: "left",
            wrap: true,
            shrink: true,
          });
        }
      } else {
        // --- CONTENT SLIDE(S) ---
        const rawBullets = slideItem.bullets || [];
        const MAX_PER_SLIDE = 6;

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

          slide.addText(pageTitle, {
            x: 2.2,
            y: 0.25,
            w: 10.5,
            h: 0.7,
            fontSize: 28, // Title Size[cite: 1]
            bold: true,
            color: NLCIL_THEME.colors.primaryBlue,
            fontFace: NLCIL_THEME.fonts.title, // Arial[cite: 1]
            wrap: true,
            valign: "middle",
          });

          const cardCount = bulletGroup.length;
          if (cardCount > 0) {
            const startY = 1.2;
            const availableHeight = 5.4;
            const gap = 0.15;
            const cardHeight = (availableHeight - gap * (cardCount - 1)) / cardCount;

            bulletGroup.forEach((bulletText, bIdx) => {
              const currentY = startY + bIdx * (cardHeight + gap);
              const isHighlight = bIdx % 2 === 0;

              // Outer Container Card (uses string "rect")
              slide.addShape("rect", {
                x: 0.8,
                y: currentY,
                w: 11.73,
                h: cardHeight,
                fill: { color: isHighlight ? "FFFFFF" : "F1F5F9" },
                line: { color: isHighlight ? "CBD5E1" : "E2E8F0", width: 1 },
              });

              // Left Accent Ribbon (uses string "rect")
              slide.addShape("rect", {
                x: 0.8,
                y: currentY,
                w: 0.1,
                h: cardHeight,
                fill: {
                  color: isHighlight
                    ? NLCIL_THEME.colors.primaryBlue
                    : NLCIL_THEME.colors.darkBrown,
                },
              });

              // Card Text Content
              slide.addText(bulletText, {
                x: 1.1,
                y: currentY + 0.05,
                w: 11.2,
                h: cardHeight - 0.1,
                fontSize: Math.min(20, Math.max(14, Math.floor(160 / cardCount))),
                color: NLCIL_THEME.colors.textDark,
                fontFace: NLCIL_THEME.fonts.body, // Calibri[cite: 1]
                align: "justified", // Justified Alignment[cite: 1]
                valign: "middle",
                wrap: true,
                shrink: true,
              });
            });
          }
        });
      }
    });

    await pptx.writeFile({ fileName: `NLCIL_Corporate_Presentation.pptx` });
  } catch (error) {
    console.error("Export error:", error);
    alert("PPT Export Failed: " + error.message);
  }
}