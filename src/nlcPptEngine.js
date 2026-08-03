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

    // Widescreen 16:9 layout requirement[cite: 1]
    pptx.layout = "LAYOUT_16x9";
    pptx.author = NLCIL_THEME.companyName;

    const logoBase64 = await getLogoBase64();

    // Define NLCIL Master Layout[cite: 1]
    pptx.defineSlideMaster({
      title: "NLCIL_MASTER",
      background: { color: "F8FAFC" }, // Clean light gray/off-white corporate backdrop
      objects: [
        // Top Banner Accent Bar
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
        // Footer Confidentiality Text
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
        // Slide Numbering at Bottom-Right[cite: 1]
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
      const slide = pptx.addSlide({ masterName: "NLCIL_MASTER" });

      if (index === 0) {
        // --- Cover / Title Slide ---[cite: 1]
        // Center Visual Hero Card
        slide.addShape(pptx.Shapes.RECTANGLE, {
          x: 1.0,
          y: 1.8,
          w: 11.33,
          h: 4.2,
          fill: { color: "FFFFFF" },
          line: { color: "CBD5E1", width: 1 },
        });

        // Title Slide Left Blue Accent Border
        slide.addShape(pptx.Shapes.RECTANGLE, {
          x: 1.0,
          y: 1.8,
          w: 0.2,
          h: 4.2,
          fill: { color: NLCIL_THEME.colors.primaryBlue },
        });

        // Main Title[cite: 1]
        slide.addText(slideItem.title, {
          x: 1.5,
          y: 2.3,
          w: 10.3,
          h: 1.6,
          fontSize: 32, // Primary Title Size[cite: 1]
          bold: true,
          color: NLCIL_THEME.colors.primaryBlue,
          fontFace: NLCIL_THEME.fonts.title, // Arial[cite: 1]
          align: "left",
          wrap: true,
          autoFit: true, // Auto-shrink font if text is extremely long
        });

        // Subtitle[cite: 1]
        if (slideItem.subtitle) {
          slide.addText(slideItem.subtitle, {
            x: 1.5,
            y: 4.0,
            w: 10.3,
            h: 1.2,
            fontSize: 24, // Subtitle Size[cite: 1]
            color: NLCIL_THEME.colors.darkBrown,
            fontFace: NLCIL_THEME.fonts.title,
            align: "left",
            wrap: true,
            autoFit: true,
          });
        }
      } else {
        // --- Content Slide ---[cite: 1]
        // Header Title[cite: 1]
        slide.addText(slideItem.title, {
          x: 2.2, // Offset to make room for logo
          y: 0.25,
          w: 10.5,
          h: 0.7,
          fontSize: 28, // Title size[cite: 1]
          bold: true,
          color: NLCIL_THEME.colors.primaryBlue,
          fontFace: NLCIL_THEME.fonts.title, // Arial[cite: 1]
          wrap: true,
          valign: "middle",
        });

        const rawBullets = slideItem.bullets || [];
        const totalBullets = Math.min(rawBullets.length, NLCIL_THEME.rules.maxBulletsPerSlide); // Cap at 8 bullets[cite: 1]

        if (totalBullets > 0) {
          // Dynamic Multi-Column Flow: Split into 2 columns if > 4 bullets
          const isTwoColumn = totalBullets > 4;

          if (isTwoColumn) {
            const col1Bullets = rawBullets.slice(0, Math.ceil(totalBullets / 2));
            const col2Bullets = rawBullets.slice(Math.ceil(totalBullets / 2), totalBullets);

            const createColumnCard = (bullets, xPos, width) => {
              // Background Card Container
              slide.addShape(pptx.Shapes.RECTANGLE, {
                x: xPos,
                y: 1.2,
                w: width,
                h: 5.4,
                fill: { color: "FFFFFF" },
                line: { color: "E2E8F0", width: 1 },
              });

              // Left Accent Line on Card
              slide.addShape(pptx.Shapes.RECTANGLE, {
                x: xPos,
                y: 1.2,
                w: 0.08,
                h: 5.4,
                fill: { color: NLCIL_THEME.colors.primaryBlue },
              });

              const formatted = bullets.map((b) => ({
                text: b,
                options: {
                  fontSize: 18,
                  color: NLCIL_THEME.colors.textDark,
                  fontFace: NLCIL_THEME.fonts.body, // Calibri[cite: 1]
                  paraSpaceBefore: 6,
                  paraSpaceAfter: 6,
                },
              }));

              slide.addText(formatted, {
                x: xPos + 0.3,
                y: 1.4,
                w: width - 0.5,
                h: 5.0,
                bullet: true,
                align: "justified", // Justified Alignment[cite: 1]
                wrap: true,
                autoFit: true, // Prevents vertical overflow
                valign: "top",
              });
            };

            createColumnCard(col1Bullets, 0.6, 5.8);
            createColumnCard(col2Bullets, 6.8, 5.8);
          } else {
            // Single Card Layout for 1 to 4 Bullets
            slide.addShape(pptx.Shapes.RECTANGLE, {
              x: 0.6,
              y: 1.2,
              w: 12.13,
              h: 5.4,
              fill: { color: "FFFFFF" },
              line: { color: "E2E8F0", width: 1 },
            });

            slide.addShape(pptx.Shapes.RECTANGLE, {
              x: 0.6,
              y: 1.2,
              w: 0.1,
              h: 5.4,
              fill: { color: NLCIL_THEME.colors.primaryBlue },
            });

            const formatted = rawBullets.slice(0, totalBullets).map((b) => ({
              text: b,
              options: {
                fontSize: 22,
                color: NLCIL_THEME.colors.textDark,
                fontFace: NLCIL_THEME.fonts.body, // Calibri[cite: 1]
                paraSpaceBefore: 8,
                paraSpaceAfter: 8,
              },
            }));

            slide.addText(formatted, {
              x: 1.0,
              y: 1.4,
              w: 11.4,
              h: 5.0,
              bullet: true,
              align: "justified", // Justified Alignment[cite: 1]
              wrap: true,
              autoFit: true, // Prevents vertical overflow
              valign: "top",
            });
          }
        }
      }
    });

    await pptx.writeFile({ fileName: `NLCIL_Corporate_Presentation.pptx` });
  } catch (error) {
    console.error("Export error:", error);
    alert("PPT Export Failed: " + error.message);
  }
}