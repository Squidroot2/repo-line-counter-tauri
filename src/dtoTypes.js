// Correponds to structs in dto.rs and model.rs

/**
 * @template T
 * @typedef {Object} SimpleResponse
 * @property {MetaData} meta
 * @property {T}  data
 */

/**
 * @typedef {Object} ScanDirRequest
 * @property {string} dir
 * @property {string} ext
 */

/**
 * @typedef {Object} GetChildItemsRequest
 * @property {string} dir
 * @property {boolean} includeFiles
 */

/**
 * @typedef {Object} MetaData
 * @property {boolean} success
 * @property {number} responseMs
 */

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
 * @typedef {Object} ScanDirResponse
 * @property {MetaData} meta
 * @property {FileLines[]} files
 * @property {FileLineSummary} summary
 */

/**
 * @typedef {"Dir"|"File"} FsItemType
 */

/**
 * @typedef {Object} FsItemInfo
 * @property {string} name
 * @property {FsItemType} itemType
 */