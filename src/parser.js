/**
 * Parser Module
 * Handles loading and validating JSON data files
 */

class DataParser {
  constructor() {
    this.elements = null;
    this.config = null;
  }

  /**
   * Load and parse JSON file
   * @param {string} filePath - Path to JSON file
   * @returns {Promise<Object>} Parsed JSON data
   */
  async loadJSON(filePath) {
    try {
      const response = await fetch(filePath);
      if (!response.ok) {
        throw new Error(`Failed to load ${filePath}: ${response.status} ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error loading JSON from ${filePath}:`, error);
      throw error;
    }
  }

  /**
   * Load elements data (data/elements.json)
   * @returns {Promise<Array>} Array of element objects
   */
  async loadElements() {
    if (!this.elements) {
      const data = await this.loadJSON('data/elements.json');
      if (!data || !Array.isArray(data.elements)) {
        throw new Error('Invalid elements.json format: expected { "elements": [...] }');
      }
      this.elements = data.elements;
      this.validateElements();
    }
    return this.elements;
  }

  /**
   * Load configuration (data/config.json)
   * @returns {Promise<Object>} Configuration object
   */
  async loadConfig() {
    if (!this.config) {
      this.config = await this.loadJSON('data/config.json');
      this.validateConfig();
    }
    return this.config;
  }

  /**
   * Validate elements data structure
   * @throws {Error} If validation fails
   */
  validateElements() {
    const requiredFields = ['number', 'symbol', 'name', 'period', 'group', 'category'];

    this.elements.forEach((element, index) => {
      // Check required fields
      requiredFields.forEach((field) => {
        if (!(field in element)) {
          throw new Error(`Element at index ${index} missing required field: ${field}`);
        }
      });

      // Basic type/range checks (kept simple on purpose)
      if (typeof element.number !== 'number' || element.number < 1) {
        throw new Error(`Element at index ${index} has invalid atomic number: ${element.number}`);
      }
      if (typeof element.symbol !== 'string' || element.symbol.length === 0) {
        throw new Error(`Element at index ${index} has invalid symbol: ${element.symbol}`);
      }
      if (typeof element.name !== 'string' || element.name.length === 0) {
        throw new Error(`Element at index ${index} has invalid name: ${element.name}`);
      }
      if (typeof element.period !== 'number' || element.period < 1 || element.period > 7) {
        throw new Error(`Element at index ${index} has invalid period: ${element.period}`);
      }
      if (typeof element.group !== 'number' || element.group < 1 || element.group > 18) {
        throw new Error(`Element at index ${index} has invalid group: ${element.group}`);
      }
      if (typeof element.category !== 'string' || element.category.length === 0) {
        throw new Error(`Element at index ${index} has invalid category: ${element.category}`);
      }
    });
  }

  /**
   * Validate configuration structure
   * @throws {Error} If validation fails
   */
  validateConfig() {
    const cfg = this.config;
    const requiredSections = ['layouts', 'themes', 'typography', 'svg'];

    requiredSections.forEach((section) => {
      if (!(section in cfg)) {
        throw new Error(`config.json missing section: ${section}`);
      }
    });

    // Validate layouts
    Object.entries(cfg.layouts).forEach(([name, layout]) => {
      ['boxWidth', 'boxHeight', 'gap', 'padding'].forEach((field) => {
        if (typeof layout[field] !== 'number' || layout[field] < 0) {
          throw new Error(`Layout "${name}" has invalid ${field}: ${layout[field]}`);
        }
      });
    });

    // Validate typography entries loosely (must exist, numeric)
    Object.entries(cfg.typography).forEach(([name, typo]) => {
      ['symbolSize', 'numberSize', 'nameSize'].forEach((field) => {
        if (typeof typo[field] !== 'number' || typo[field] <= 0) {
          throw new Error(`Typography "${name}" has invalid ${field}: ${typo[field]}`);
        }
      });
    });
  }

  /**
   * Get element by atomic number
   * @param {number} atomicNumber - Atomic number (1-118)
   * @returns {Object|null} Element object or null if not found
   */
  getElement(atomicNumber) {
    if (!this.elements) return null;
    return this.elements.find((el) => el.number === atomicNumber) || null;
  }

  /**
   * Get elements by category
   * @param {string} category - Element category
   * @returns {Array} Array of elements in category
   */
  getElementsByCategory(category) {
    if (!this.elements) return [];
    return this.elements.filter((el) => el.category === category);
  }

  /**
   * Get all unique categories
   * @returns {Array<string>} Array of category names
   */
  getCategories() {
    if (!this.elements) return [];
    return [...new Set(this.elements.map((el) => el.category))];
  }
}

// Singleton instance used by app.js and renderer.js
const parser = new DataParser();
