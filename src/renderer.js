/**
 * Renderer Module
 * Handles procedural SVG generation from element data
 */

class PeriodicTableRenderer {
  constructor() {
    this.svgString = '';
    this.viewBoxWidth = 0;
    this.viewBoxHeight = 0;
  }

  /**
   * Generate complete SVG for the periodic table
   * @param {Array} elements - Array of element objects
   * @param {Object} config  - Configuration object (layouts, themes, typography)
   * @param {string} theme   - Theme key (e.g. 'light', 'dark', 'colorful')
   * @param {string} layout  - Layout key (e.g. 'compact', 'normal', 'large')
   * @returns {string} SVG string
   */
  generate(elements, config, theme = 'light', layout = 'normal') {
    const layoutConfig = config.layouts[layout];
    const themeConfig = config.themes[theme];
    const typographyConfig = config.typography[layout];

    // Compute viewBox dimensions based on data + layout
    this.calculateViewBox(elements, layoutConfig);

    // Start SVG root element
    this.svgString =
      `<svg ` +
      `viewBox="0 0 ${this.viewBoxWidth} ${this.viewBoxHeight}" ` +
      `xmlns="http://www.w3.org/2000/svg" ` +
      `class="periodic-table" ` +
      `data-theme="${theme}" ` +
      `data-layout="${layout}">`;

    // Background
    this.svgString += this.createBackground(themeConfig);

    // Element boxes
    elements.forEach((element) => {
      this.svgString += this.createElementBox(
        element,
        layoutConfig,
        themeConfig,
        typographyConfig
      );
    });

    // Close SVG
    this.svgString += '</svg>';

    return this.svgString;
  }

  /**
   * Calculate SVG viewBox dimensions from layout and data
   */
  calculateViewBox(elements, layoutConfig) {
    const maxPeriod = Math.max(...elements.map((el) => el.period));
    const maxGroup = Math.max(...elements.map((el) => el.group));

    const contentWidth =
      maxGroup * layoutConfig.boxWidth +
      (maxGroup - 1) * layoutConfig.gap;
    const contentHeight =
      maxPeriod * layoutConfig.boxHeight +
      (maxPeriod - 1) * layoutConfig.gap;

    this.viewBoxWidth = contentWidth + layoutConfig.padding * 2;
    this.viewBoxHeight = contentHeight + layoutConfig.padding * 2;
  }

  /**
   * Create background rectangle
   */
  createBackground(themeConfig) {
    return `<rect width="100%" height="100%" fill="${themeConfig.background}"/>`;
  }
  
  /**
   * Create a single element box (group with rect + texts)
   */
  createElementBox(element, layoutConfig, themeConfig, typographyConfig) {
    const x =
      element.group * layoutConfig.boxWidth +
      (element.group - 1) * layoutConfig.gap +
      layoutConfig.padding;
    const y =
      element.period * layoutConfig.boxHeight +
      (element.period - 1) * layoutConfig.gap +
      layoutConfig.padding;

    const categoryColor =
      (themeConfig.categories &&
        themeConfig.categories[element.category]) ||
      '#CCCCCC';
    const textColor = themeConfig.text || '#000000';
    const strokeColor = themeConfig.stroke || '#333333';
    const strokeWidth =
      typeof themeConfig.strokeWidth === 'number'
        ? themeConfig.strokeWidth
        : 1;

    let svg = `<g class="element element-${element.number}" ` +
      `data-number="${element.number}" ` +
      `data-symbol="${element.symbol}" ` +
      `data-name="${element.name}" ` +
      `data-category="${element.category}">`;

    // Element background box
    /*
    svg +=
      `<rect class="element-box" ` +
      `x="${x}" y="${y}" ` +
      `width="${layoutConfig.boxWidth}" ` +
      `height="${layoutConfig.boxHeight}" ` +
      `rx="4" ` +
      `fill="${categoryColor}" ` +
      `stroke="${strokeColor}" ` +
      `stroke-width="${strokeWidth}"/>`;
      */
             
    svg +=
  `<defs>
    <linearGradient id="elemGradient-${element.number}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:white;stop-opacity:0.8" />
      <stop offset="100%" style="stop-color:${categoryColor};stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect class="element-box" ` +
  `x="${x}" y="${y}" ` +
  `width="${layoutConfig.boxWidth}" ` +
  `height="${layoutConfig.boxHeight}" ` +
  `rx="4" ` +
  `fill="url(#elemGradient-${element.number})" ` +
  `stroke="${strokeColor}" ` +
  `stroke-width="${strokeWidth}"/>`;


    // Atomic number (top-left)
    svg +=
      `<text class="element-number" ` +
      `x="${x + 4}" ` +
      `y="${y + typographyConfig.numberSize + 2}" ` +
      `font-size="${typographyConfig.numberSize}" ` +
      `font-weight="bold" ` +
      `fill="${textColor}" ` +
      `font-family="Arial, sans-serif">` +
      `${element.number}` +
      `</text>`;

    // Symbol (center)
    const symbolX = x + layoutConfig.boxWidth / 2;
    const symbolY =
      y +
      layoutConfig.boxHeight / 2 +
      typographyConfig.symbolSize / 3;

    svg +=
      `<text class="element-symbol" ` +
      `x="${symbolX}" ` +
      `y="${symbolY}" ` +
      `font-size="${typographyConfig.symbolSize}" ` +
      `font-weight="bold" ` +
      `fill="${textColor}" ` +
      `text-anchor="middle" ` +
      `font-family="Arial, sans-serif">` +
      `${element.symbol}` +
      `</text>`;

    // Atomic mass (bottom center)
    svg +=
      `<text class="element-mass" ` +
      `x="${symbolX}" ` +
      `y="${y + layoutConfig.boxHeight - 4}" ` +
      `font-size="${typographyConfig.numberSize}" ` +
      `fill="${textColor}" ` +
      `text-anchor="middle" ` +
      `font-family="Arial, sans-serif">` +
      `${element.atomic_mass}` +
      `</text>`;

    svg += '</g>';

    return svg;
  }

  /**
   * Return current SVG string
   */
  export() {
    return this.svgString;
  }

  /**
   * Get SVG as data URL (for download)
   */
  getDataURL() {
    // Note: this assumes svgString is valid XML
    const encoded = window.btoa(this.svgString);
    return 'data:image/svg+xml;base64,' + encoded;
  }

  /**
   * Trigger browser download of the current SVG
   * @param {string} filename
   */
  downloadSVG(filename = 'periodic-table.svg') {
    const dataUrl = this.getDataURL();
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

// Singleton instance
const renderer = new PeriodicTableRenderer();
