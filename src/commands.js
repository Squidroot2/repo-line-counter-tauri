import { invoke } from "@tauri-apps/api";

/**
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