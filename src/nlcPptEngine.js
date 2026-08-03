// src/nlcPptEngine.js
import pptxgen from "pptxgenjs";
import { NLCIL_THEME } from "./nlcBrandTheme";

export function generateNLCILPresentation(slidesData) {
  try {
    const pptx = new pptxgen();

    pptx.layout = "LAYOUT_16x9";
    pptx.author = NLCIL_THEME.companyName;

    // Define NLCIL Master Layout with local logo
    pptx.defineSlideMaster({
      title: "NLCIL_MASTER",
      background: { color: "FFFFFF" },
      objects: [
        // Top-Left Local Logo
        {
          image: {
            x: 0.5,
            y: 0.2,
            w: 1.2,
            h: 0.6,
            path: NLCIL_THEME.logoUrl,
          },
        },
        // Bottom Navy Accent Bar
        {
          rect: {
            x: 0,
            y: 7.2,
            w: "100%",
            h: 0.3,
            fill: { color: NLCIL_THEME.colors.primaryBlue },
          },
        },
        // Slide Numbering
        {
          slideNumber: {
            x: 12.2,
            y: 7.25,
            color: NLCIL_THEME.colors.textLight,
            fontFace: NLCIL_THEME.fonts.body,
            fontSize: 10,
          },
        },
      ],
    });

    slidesData.forEach((slideItem, index) => {
      const slide = pptx.addSlide({ masterName: "NLCIL_MASTER" });

      if (index === 0) {
        // --- Title Slide ---
        slide.addText(slideItem.title, {
          x: 1.0,
          y: 2.5,
          w: 11.3,
          h: 1.2,
          fontSize: 32,
          bold: true,
          color: NLCIL_THEME.colors.primaryBlue,
          fontFace: NLCIL_THEME.fonts.title,
          align: "center",
        });

        if (slideItem.subtitle) {
          slide.addText(slideItem.subtitle, {
            x: 1.0,
            y: 3.8,
            w: 11.3,
            h: 0.8,
            fontSize: 28,
            color: NLCIL_THEME.colors.darkBrown,
            fontFace: NLCIL_THEME.fonts.title,
            align: "center",
          });
        }
      } else {
        // --- Content Slide ---
        slide.addText(slideItem.title, {
          x: 2.0,
          y: 0.3,
          w: 9.5,
          h: 0.6,
          fontSize: 32,
          bold: true,
          color: NLCIL_THEME.colors.primaryBlue,
          fontFace: NLCIL_THEME.fonts.title,
        });

        if (slideItem.bullets && slideItem.bullets.length > 0) {
          const formattedBullets = slideItem.bullets
            .slice(0, NLCIL_THEME.rules.maxBulletsPerSlide)
            .map((text) => ({
              text: text,
              options: {
                fontSize: 24,
                color: NLCIL_THEME.colors.textDark,
                fontFace: NLCIL_THEME.fonts.body,
                paraSpaceBefore: 4,
                paraSpaceAfter: 4,
              },
            }));

          slide.addText(formattedBullets, {
            x: 1.0,
            y: 1.5,
            w: 11.3,
            h: 5.2,
            bullet: true,
            align: "justify",
            lineSpacing: 28,
          });
        }
      }
    });

    pptx.writeFile({ fileName: `NLCIL_Presentation.pptx` });
  } catch (error) {
    console.error("Export error:", error);
    alert("PPT Export Failed: " + error.message);
  }
}