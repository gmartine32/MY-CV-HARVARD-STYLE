import QRCode from "qrcode";

/**
 * Generates clean, crisp SVG string for QR code
 * @param {string} url - Target URL (default: https://gianmartinez.space)
 * @param {number} width - Size in pixels (default: 48)
 * @returns {Promise<string>}
 */
export async function generateQrSvg(url = "https://gianmartinez.space", width = 48) {
  const svgString = await QRCode.toString(url, {
    type: "svg",
    width,
    margin: 0,
    color: {
      dark: "#000000",
      light: "#ffffff00", // Transparent background
    },
  });

  return svgString;
}

/**
 * Generates the complete HTML component with styling and clickable link
 */
export async function getPortfolioQrHtmlComponent({
  url = "https://gianmartinez.space",
  label = "Portafolio / Demos",
  size = 46,
} = {}) {
  const svg = await generateQrSvg(url, size);

  return `
  <div class="header-qr-box" style="position: absolute; top: 0; right: 0; text-align: center; width: ${size + 8}px;">
    <a href="${url}" target="_blank" rel="noopener noreferrer" style="text-decoration: none; color: inherit; display: block;" title="Escanea o haz clic para ver mi portafolio">
      <div style="width: ${size}px; height: ${size}px; margin: 0 auto; display: flex; align-items: center; justify-content: center;">
        ${svg}
      </div>
      <span style="display: block; font-size: 6.8pt; font-family: 'Georgia', serif; color: #444; margin-top: 2px; line-height: 1.1; letter-spacing: 0.2px; font-weight: normal;">
        ${label}
      </span>
    </a>
  </div>
  `.trim();
}

/**
 * Injects or replaces the QR code in a Harvard CV HTML string
 */
export async function injectQrIntoCvHtml(html, { includeQr = true, label = "Portafolio / Demos" } = {}) {
  // Remove existing qr box if present
  let updated = html.replace(/<div class="header-qr-box"[\s\S]*?<\/div>\s*<\/div>/gi, "");

  if (!includeQr) {
    return updated;
  }

  const qrComponent = await getPortfolioQrHtmlComponent({ label });

  // Ensure header has position: relative if needed
  if (!updated.includes("header-container")) {
    // Look for <h1>Gian Franco Martinez Villa</h1> and wrap it in a relative container
    updated = updated.replace(
      /(<body[^>]*>\s*)([\s\S]*?)(<h1[^>]*>Gian Franco Martinez Villa<\/h1>)/i,
      `$1$2<div class="header-container" style="position: relative; margin-bottom: 2px;">\n    ${qrComponent}\n    $3`
    );
    // Close container after contact-info paragraph
    updated = updated.replace(
      /(<p class="contact-info[^>]*>[\s\S]*?<\/p>)/i,
      `$1\n  </div>`
    );
  } else {
    // If header-container already exists, inject qrComponent right after <div class="header-container"...>
    updated = updated.replace(
      /(<div class="header-container"[^>]*>)/i,
      `$1\n    ${qrComponent}`
    );
  }

  return updated;
}
