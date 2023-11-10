import { invoke } from "@tauri-apps/api";

/**
 * Meta data about the command that was executed
 * 
 * @typedef {Object} MetaData
 * @property {boolean} success - Whether command was successful or not
 * @property {number} responseMs - time to execute command in milliseconds
 * @property {String} command - name of command executed
 */

/**
 * Successful Response with generic data and metadata
 * 
 * @template T
 * @typedef {Object} SimpleResponse
 * @property {MetaData} meta - metadata of response
 * @property {T}  data - data in response
 * @property {undefined} msg - No error message in successful response
 */

/**
 * Error Response with an error message and meta data
 * 
 * @typedef {Object} ErrorResponse
 * @property {MetaData} meta - metadata of response
 * @property {undefined} data - No Data in Error Response
 * @property {String}  msg - Error message
 */

/**
 * Successful Response with just meta data
 * 
 * @typedef {Object} EmptyResponse
 * @property {MetaData} meta - metadata of response
 * @property {undefined} msg - No error message in successful response
 */

/**
 * Successful Response with FilesLines and Summary as well as meta data
 * 
 * @typedef {Object} ScanDirResponse
 * @property {MetaData} meta
 * @property {FileLines[]} files
 * @property {FileLineSummary} summary
 */

/**
 * Always successful
 * 
 * @param {String} path 
 * @return {Promise<SimpleResponse<FsItemType>>}
 */
export const getItemTypeCommand = (path) => {
    const request = {
        path: path
    }
    return invoke("get_item_type_command", request ); 
}

/**
 * Always successful
 * 
 * @param {String} directory 
 * @param {String | null} extension 
 * @return {Promise<ScanDirResponse>}
 */
export const scanDirCommand = (directory, extension) => {
    let request = {
        dir: directory,
        ext: extension
    }
    return invoke("scan_dir_command", request);
}

/**
 * 
 * @returns {Promise<SimpleResponse<string> | ErrorResponse>}
 */
export const getCwdCommand = () => {
    return invoke("get_cwd_command");
}

/**
 * 
 * @return {Promise<EmptyResponse | ErrorResponse>}
 */
export const writeCsvCommand = () => {
    return invoke("write_csv_command");
}

/**
 * 
 * @param {string} directory
 * @param {boolean} includeFiles
 * @returns {Promise<SimpleResponse<FsItemInfo[]> | ErrorResponse>}
 */
export const getChildItemsCommand = (directory, includeFiles) => {
    const request = {
        dir: directory,
        includeFiles: includeFiles
    }
    return invoke("get_child_items_command", request);
}

/**
 * 
 * @param {string} parentPath 
 * @param {string} childName 
 * @returns {Promise<SimpleResponse<String> | ErrorResponse>}
 */
export const getNormalPathCommand = (parentPath, childName) => {
    const request = {
        parentPath: parentPath,
        childName: childName
    }
    return invoke("get_normal_path_command", request)
}