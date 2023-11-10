import "./dtoTypes.js"

/***
 * @type {{
 * DIR: FsItemType, 
 * FILE: FsItemType
 * MISSING: FsItemType
 * UNKNOWN: FsItemType
 * }}
 */
export const FS_ITEM_TYPE = {
    DIR: "Dir",
    FILE: "File",
    MISSING: "Missing",
    UNKNOWN: "Unknown"
}