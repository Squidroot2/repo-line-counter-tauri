import { useEffect, useState } from "react";
import { FS_ITEM_TYPE } from "../enums";
import {
    getChildItemsCommand,
    getCwdCommand,
    getItemTypeCommand,
    getNormalPathCommand,
} from "../commands.js";
import Modal from "./Modal";
import "./FileBrowserModal.css";
import "../dtoTypes";

/**
 *
 * @param {Object} props
 * @param {function(string) : void} props.onClose
 * @param {boolean} props.hidden
 * @param {boolean} props.showFiles
 * @param {string} props.startLocation
 * @returns
 */

const FileBrowserModal = ({ onClose, hidden, showFiles, startLocation }) => {
    /** @type {[FsItemInfo[], function(FsItemInfo[]): void]}*/
    const [localItems, setLocalItems] = useState([]);

    const [currentDir, setCurrentDir] = useState("");
    const [selectedItem, setSelectedItem] = useState("");
    const [isValidSelectedItem, setIsValidSelectedItem] = useState(false);

    /**
     * Checks if the newly selected item is valid
     */
    useEffect(() => {
        getItemTypeCommand(selectedItem).then((response) => {
            const itemType = response.data;
            if (itemType === FS_ITEM_TYPE.DIR) {
                setIsValidSelectedItem(true);
                setCurrentDir(selectedItem);
            } else if (itemType === FS_ITEM_TYPE.FILE && showFiles) {
                // Maybe this should be select files??
                setIsValidSelectedItem(true);
            } else {
                setIsValidSelectedItem(false);
            }
        });
    }, [selectedItem, showFiles]);

    /**
     * On mount, sets current directory to start location. Falls back to current working directory
     */
    useEffect(() => {
        getItemTypeCommand(startLocation).then((response) => {
            if (response.data === FS_ITEM_TYPE.DIR) {
                setCurrentDir(startLocation);
                setSelectedItem(startLocation);
            } else {
                // Given an invalid starting location; use cwd
                getCwdCommand().then((response) => {
                    if (response.meta.success) {
                        setCurrentDir(response.data);
                        setSelectedItem(response.data);
                    } else {
                        //TODO idek how to handle this case
                    }
                });
            }
        });
    }, [startLocation]);

    /**
     * Sets local items when current dir changes
     */
    useEffect(() => {
        if (currentDir) {
            getChildItemsCommand(currentDir, showFiles).then((response) => {
                if (response.meta.success) {
                    setLocalItems(response.data);
                }
            });
        }
    }, [currentDir, showFiles]);

    /** @param {FsItemInfo} item */
    const handleItemSelected = (item) => {
        if (item.itemType === FS_ITEM_TYPE.DIR) {
            getNormalPathCommand(currentDir, item.name).then((response) => {
                setCurrentDir(response.data);
                setSelectedItem(response.data);
            });
        } else {
            // TODO handle case where we are not just selecting directory
        }
    };

    /**
     * Normalizes the path if it is valid
     *
     * @type {React.FocusEventHandler<HTMLInputElement>} */
    const handleInputOnBlur = (event) => {
        if (isValidSelectedItem) {
            getNormalPathCommand(selectedItem, "").then((response) => {
                setSelectedItem(response.data);
            });
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
                onBlur={handleInputOnBlur}
                onChange={(event) => setSelectedItem(event.target.value)}
            />
        </Modal>
    );
};

export default FileBrowserModal;
