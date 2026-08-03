// src/nlcPptEngine.js
import pptxgen from "pptxgenjs";
import { NLCIL_THEME } from "./nlcBrandTheme";

// Helper function to convert public/logo.png to Base64 for fail-safe embedding
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

    // Standard 16:9 Widescreen View
    pptx.layout = "LAYOUT_16x9";
    pptx.author = NLCIL_THEME.companyName;

    const logoBase64 = await getLogoBase64();

    // Define NLCIL Master Template Layout
    pptx.defineSlideMaster({
      title: "NLCIL_MASTER",
      background: { color: "F8FAFC" },
      objects: [
        // Top Primary Blue Accent Line
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
        // Tagline Footer
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
      if (index === 0) {
        // ==========================================
        // 1. EXECUTIVE TITLE / COVER SLIDE
        // ==========================================
        const slide = pptx.addSlide({ masterName: "NLCIL_MASTER" });

        // Outer Hero Container Card
        slide.addShape("rect", {
          x: 0.8,
          y: 1.5,
          w: 11.73,
          h: 4.8,
          fill: { color: "FFFFFF" },
          line: { color: "CBD5E1", width: 1 },
        });

        // Left Accent Ribbon
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
          fontSize: 32, // Primary Title Font Size
          bold: true,
          color: NLCIL_THEME.colors.primaryBlue,
          fontFace: NLCIL_THEME.fonts.title, // Arial
          align: "left",
          valign: "top",
          wrap: true,
          shrink: true,
          margin: [5, 5, 5, 5],
        });

        // Subtitle
        if (slideItem.subtitle) {
          slide.addText(slideItem.subtitle, {
            x: 1.4,
            y: 4.0,
            w: 10.6,
            h: 1.8,
            fontSize: 22, // Subtitle Font Size
            color: NLCIL_THEME.colors.darkBrown,
            fontFace: NLCIL_THEME.fonts.title,
            align: "left",
            valign: "top",
            wrap: true,
            shrink: true,
            margin: [5, 5, 5, 5],
          });
        }
      } else {
        // ==========================================
        // 2. DYNAMIC CONTENT SLIDES
        // ==========================================
        const rawBullets = slideItem.bullets || [];
        const slideTitleLower = (slideItem.title || "").toLowerCase();

        // --- PATTERN DETECTORS ---
        const isComparison =
          slideTitleLower.includes("vs") ||
          slideTitleLower.includes("comparison") ||
          slideTitleLower.includes("quarterly");

        const isMetricSlide = rawBullets.some((b) =>
          /\d+([\.,]\d+)?\s*(MTPA|MW|%|Cr|Crores|Lakhs|Percent|INR)/i.test(b)
        );

        const isSequential = rawBullets.some((b) =>
          /^(step|phase|stage|\d+[\.\)])/i.test(b.trim())
        );

        // Max bullets per slide for optimal spacing
        const MAX_PER_SLIDE = isMetricSlide || isSequential ? 4 : 5;

        // Auto-chunk text across multiple slides if content is long
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

          // Slide Title Header
          const pageTitle =
            chunkedBullets.length > 1
              ? `${slideItem.title} (${pageIdx + 1}/${chunkedBullets.length})`
              : slideItem.title;

          slide.addText(pageTitle, {
            x: 2.2,
            y: 0.2,
            w: 10.5,
            h: 0.7,
            fontSize: 26, // Title Size
            bold: true,
            color: NLCIL_THEME.colors.primaryBlue,
            fontFace: NLCIL_THEME.fonts.title, // Arial
            wrap: true,
            valign: "middle",
            margin: 0,
          });

          const count = bulletGroup.length;
          if (count === 0) return;

          const startY = 1.1;
          const availableH = 5.6;

          // LAYOUT A: KPI Metric Cards (Numbers + Description)
          if (isMetricSlide) {
            const gap = 0.15;
            const cardH = (availableH - gap * (count - 1)) / count;

            bulletGroup.forEach((bulletText, bIdx) => {
              const currentY = startY + bIdx * (cardH + gap);

              // Split key stat from description if hyphenated
              const parts = bulletText.split(/[-–:]/);
              const statPart = parts[0].trim();
              const descPart = parts.slice(1).join(" - ").trim() || statPart;

              // Left Stat Box (Primary Blue Background)
              slide.addShape("rect", {
                x: 0.8,
                y: currentY,
                w: 3.2,
                h: cardH,
                fill: { color: NLCIL_THEME.colors.primaryBlue },
              });

              slide.addText(statPart, {
                x: 0.8,
                y: currentY,
                w: 3.2,
                h: cardH,
                fontSize: 18,
                bold: true,
                color: "FFFFFF",
                fontFace: NLCIL_THEME.fonts.title,
                align: "center",
                valign: "middle",
                wrap: true,
                shrink: true,
                margin: [2, 5, 2, 5],
              });

              // Right Detail Container Card
              slide.addShape("rect", {
                x: 4.0,
                y: currentY,
                w: 8.53,
                h: cardH,
                fill: { color: "FFFFFF" },
                line: { color: "CBD5E1", width: 1 },
              });

              slide.addText(descPart, {
                x: 4.2,
                y: currentY,
                w: 8.13,
                h: cardH,
                fontSize: 15,
                color: NLCIL_THEME.colors.textDark,
                fontFace: NLCIL_THEME.fonts.body, // Calibri
                align: "justified", // Justified Alignment
                valign: "middle",
                wrap: true,
                shrink: true,
                margin: [4, 8, 4, 8],
              });
            });
          }
          // LAYOUT B: Side-by-Side 2-Column Comparison Layout
          else if (isComparison && count >= 2) {
            const halfCount = Math.ceil(count / 2);
            const col1 = bulletGroup.slice(0, halfCount);
            const col2 = bulletGroup.slice(halfCount);

            const renderColumn = (bullets, xPos) => {
              const cardW = 5.7;
              slide.addShape("rect", {
                x: xPos,
                y: startY,
                w: cardW,
                h: availableH,
                fill: { color: "FFFFFF" },
                line: { color: "CBD5E1", width: 1 },
              });

              slide.addShape("rect", {
                x: xPos,
                y: startY,
                w: cardW,
                h: 0.15,
                fill: { color: NLCIL_THEME.colors.primaryBlue },
              });

              const formattedText = bullets.map((text) => ({
                text: text + "\n\n",
                options: {
                  fontSize: 15,
                  color: NLCIL_THEME.colors.textDark,
                  fontFace: NLCIL_THEME.fonts.body, // Calibri
                },
              }));

              slide.addText(formattedText, {
                x: xPos + 0.3,
                y: startY + 0.3,
                w: cardW - 0.6,
                h: availableH - 0.5,
                bullet: true,
                align: "justified", // Justified Alignment
                valign: "top",
                wrap: true,
                shrink: true,
                margin: [5, 5, 5, 5],
              });
            };

            renderColumn(col1, 0.8);
            renderColumn(col2, 6.83);
          }
          // LAYOUT C: Standard Executive Alternating Cards
          else {
            const gap = 0.12;
            const cardH = (availableH - gap * (count - 1)) / count;

            bulletGroup.forEach((bulletText, bIdx) => {
              const currentY = startY + bIdx * (cardH + gap);
              const isHighlight = bIdx % 2 === 0;

              // Outer Card Container
              slide.addShape("rect", {
                x: 0.8,
                y: currentY,
                w: 11.73,
                h: cardH,
                fill: { color: isHighlight ? "FFFFFF" : "F8FAFC" },
                line: { color: isHighlight ? "CBD5E1" : "E2E8F0", width: 1 },
              });

              // Left Vertical Ribbon
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

              // Dynamic Font Calculation
              const len = bulletText.length;
              let fontSize = 17;
              if (count >= 5 || len > 120) fontSize = 14;
              else if (count >= 4 || len > 80) fontSize = 15;

              // Inner Text Container
              slide.addText(bulletText, {
                x: 1.1,
                y: currentY,
                w: 11.2,
                h: cardH,
                fontSize: fontSize,
                color: NLCIL_THEME.colors.textDark,
                fontFace: NLCIL_THEME.fonts.body, // Calibri
                align: "justified", // Justified Alignment
                valign: "middle",   // Vertically Centered
                wrap: true,
                shrink: true,
                margin: [4, 10, 4, 10], // Strict internal padding
              });
            });
          }
        });
      }
    });

    // Save and Trigger PowerPoint Download
    await pptx.writeFile({ fileName: `NLCIL_Corporate_Presentation.pptx` });
  } catch (error) {
    console.error("Export error:", error);
    alert("PPT Export Failed: " + error.message);
  }
}