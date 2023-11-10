// Correponds to structs in dto.rs and model.rs

/**
 * @typedef {Object} FileLines
 * @property {string} file
 * @property {number} lines
 * @property {boolean} ignored
 */

/**
 * @typedef {Object} FileLineSummary
 * @property {number} files
 * @property {number} sum
 * @property {number} max
 * @property {number} min
 * @property {number} mean
 * @property {number} median
 */



/**
 * @typedef {"Dir"|"File"|"Missing"|"Unknown"} FsItemType
 */

/**
 * @typedef {Object} FsItemInfo
 * @property {string} name
 * @property {FsItemType} itemType
 */

