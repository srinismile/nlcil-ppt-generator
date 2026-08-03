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
      reader.onloadend = () => resolve(reader.result); // Returns "data:image/png;base64,..."
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

    // Custom Widescreen 16:9 view[cite: 1]
    pptx.layout = "LAYOUT_16x9";
    pptx.author = NLCIL_THEME.companyName;

    // Load logo as Base64 string to guarantee it prints
    const logoBase64 = await getLogoBase64();

    // Define Master Layout with bounds and base64 logo
    pptx.defineSlideMaster({
      title: "NLCIL_MASTER",
      background: { color: "FFFFFF" },
      objects: [
        // Top-Left Logo (If loaded successfully)
        ...(logoBase64
          ? [
              {
                image: {
                  x: 0.5,
                  y: 0.2,
                  w: 1.2,
                  h: 0.6,
                  data: logoBase64, // Uses Base64 data directly
                },
              },
            ]
          : [
              // Fallback text if logo.png is missing in /public
              {
                text: {
                  text: "NLC INDIA LIMITED",
                  options: {
                    x: 0.5,
                    y: 0.3,
                    fontSize: 12,
                    bold: true,
                    color: NLCIL_THEME.colors.primaryBlue,
                    fontFace: NLCIL_THEME.fonts.title,
                  },
                },
              },
            ]),
        // Bottom Navy Accent Bar[cite: 1]
        {
          rect: {
            x: 0,
            y: 7.0,
            w: 13.33,
            h: 0.5,
            fill: { color: NLCIL_THEME.colors.primaryBlue },
          },
        },
        // Slide Numbering at Bottom-Right[cite: 1]
        {
          slideNumber: {
            x: 12.0,
            y: 7.1,
            color: NLCIL_THEME.colors.textLight,
            fontFace: NLCIL_THEME.fonts.body,
            fontSize: 11,
          },
        },
      ],
    });

    slidesData.forEach((slideItem, index) => {
      const slide = pptx.addSlide({ masterName: "NLCIL_MASTER" });

      if (index === 0) {
        // --- Title Slide Layout ---[cite: 1]
        slide.addText(slideItem.title, {
          x: 0.8,
          y: 2.2,
          w: 11.7, // Contained width inside 13.33" widescreen
          h: 1.5,
          fontSize: 32, // Primary Title Font Size[cite: 1]
          bold: true,
          color: NLCIL_THEME.colors.primaryBlue,
          fontFace: NLCIL_THEME.fonts.title, // Arial[cite: 1]
          align: "center",
          wrap: true, // Prevents text overflow
        });

        if (slideItem.subtitle) {
          slide.addText(slideItem.subtitle, {
            x: 0.8,
            y: 3.8,
            w: 11.7,
            h: 1.2,
            fontSize: 24, // Subtitle Font Size[cite: 1]
            color: NLCIL_THEME.colors.darkBrown,
            fontFace: NLCIL_THEME.fonts.title,
            align: "center",
            wrap: true,
          });
        }
      } else {
        // --- Content Slide Layout ---[cite: 1]
        // Header Title Box
        slide.addText(slideItem.title, {
          x: 2.0, // Leaves room for top-left logo
          y: 0.25,
          w: 10.5, // Constrained width prevents spilling over right edge
          h: 0.8,
          fontSize: 28, // Scaled slightly to ensure single/double line fit
          bold: true,
          color: NLCIL_THEME.colors.primaryBlue,
          fontFace: NLCIL_THEME.fonts.title, // Arial[cite: 1]
          wrap: true,
          valign: "middle",
        });

        if (slideItem.bullets && slideItem.bullets.length > 0) {
          // Format bullet text & enforce limits
          const formattedBullets = slideItem.bullets
            .slice(0, NLCIL_THEME.rules.maxBulletsPerSlide) // Max 8 bullets[cite: 1]
            .map((text) => ({
              text: text,
              options: {
                fontSize: 20, // 20pt fits comfortably without overflowing
                color: NLCIL_THEME.colors.textDark,
                fontFace: NLCIL_THEME.fonts.body, // Calibri[cite: 1]
                paraSpaceBefore: 6,
                paraSpaceAfter: 6,
              },
            }));

          // Bullet Body Box bounded to stay inside slide printable area
          slide.addText(formattedBullets, {
            x: 0.8,
            y: 1.3,
            w: 11.7,  // Strictly bounded width
            h: 5.3,   // Bounded height so text stays above bottom footer bar
            bullet: true,
            align: "justified", // Justified Alignment[cite: 1]
            wrap: true,         // Wrap lines cleanly
            valign: "top",
          });
        }
      }
    });

    // Trigger download
    await pptx.writeFile({ fileName: `NLCIL_Presentation.pptx` });
  } catch (error) {
    console.error("Export error:", error);
    alert("PPT Export Failed: " + error.message);
  }
}