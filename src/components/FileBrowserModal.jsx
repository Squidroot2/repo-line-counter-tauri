import { invoke } from "@tauri-apps/api";
import { useEffect, useState } from "react";
import { FS_ITEM_TYPE } from "../enums";
import { getItemTypeCommand } from "../commands.js";
import Modal from "./Modal";
import "./FileBrowserModal.css";
import "../dtoTypes";

/**
 *
 * @param {Object} props
 * @param {function(string) : void} props.onClose
 * @param {boolean} props.hidden
 * @param {boolean} props.showFiles
 * @returns
 */

const FileBrowserModal = ({ onClose, hidden, showFiles }) => {
    /** @type {[FsItemInfo[], function(FsItemInfo[]): void]}*/
    const [localItems, setLocalItems] = useState([]);

    const [currentDir, setCurrentDir] = useState("");
    const [selectedItem, setSelectedItem] = useState("");
    const [isValidSelectedItem, setIsValidSelectedItem] = useState(false);

    /**
     *
     * @param {SimpleResponse<FsItemInfo[]>} response
     */
    const updateItems = (response) => {
        if (response.meta.success) {
            setLocalItems(response.data);
        }
    };

    /**
     * Checks if the newly selected item is valid
     */
    useEffect(() => {
        /** @type {SimpleResponse<FsItemType>} */
        const response = getItemTypeCommand(selectedItem).then(() => {
            if (response.meta.success) {
                const itemType = response.data;
                console.log("item type: ", itemType);
                if (itemType === FS_ITEM_TYPE.DIR) {
                    setIsValidSelectedItem(true);
                } else if (itemType === FS_ITEM_TYPE.FILE && showFiles) {
                    setIsValidSelectedItem(true);
                } else {
                    setIsValidSelectedItem(false);
                }
            }
        });
    }, [selectedItem, showFiles]);

    useEffect(() => {
        async function setDefaultDirectoryToCwd() {
            /** @type {SimpleResponse<String>} */
            let response = await invoke("get_cwd");
            if (response.meta.success) {
                setCurrentDir(response.data);
            }
        }
        setDefaultDirectoryToCwd();
    }, []);

    useEffect(() => {
        const startGetItems = () => {
            /** @type {GetChildItemsRequest} */
            let request = {
                dir: currentDir,
                includeFiles: showFiles,
            };
            console.log("sending request: ", request);
            invoke("get_child_items", { request }).then((response) =>
                updateItems(response),
            );
        };
        startGetItems();
    }, [currentDir, showFiles]);

    /** @param {FsItemInfo} item */
    const handleItemSelected = (item) => {
        if (item.itemType === FS_ITEM_TYPE.DIR) {
            /** @type {GetNormalPathRequest} */
            const request = {
                parentPath: currentDir,
                childName: item.name,
            };

            invoke("get_normal_path", { request }).then((response) => {
                setCurrentDir(response.data);
                setSelectedItem(response.data);
            });
        } else {
            // TODO handle case where we are not just selecting directory
        }
    };

    return (
        <Modal
            title="File System"
            footerButtons={[
                {
                    label: "Select",
                    onClick: () => onClose(selectedItem),
                    disabled: !isValidSelectedItem,
                },
            ]}
            hidden={hidden}
        >
            <div className="file-browser-table-container">
                <table className="file-browser-table">
                    <thead>
                        <tr>
                            <th>Type</th>
                            <th>Name</th>
                        </tr>
                    </thead>
                    <tbody>
                        {localItems.map((item, index) => (
                            <tr
                                className="file-browser-data-row"
                                key={index}
                                onClick={() => handleItemSelected(item)}
                            >
                                <td className="file-browser-item-type">
                                    {item.itemType}
                                </td>
                                <td className="file-browser-item-name">
                                    {item.name}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <input
                className="file-item-input"
                type="text"
                value={selectedItem}
                onChange={() => setSelectedItem(selectedItem)}
            />
        </Modal>
    );
};

export default FileBrowserModal;
