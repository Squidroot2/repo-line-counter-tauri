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
 * @returns
 */

const FileBrowserModal = ({ onClose, hidden, showFiles }) => {
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
            } else if (itemType === FS_ITEM_TYPE.FILE && showFiles) {
                setIsValidSelectedItem(true);
            } else {
                setIsValidSelectedItem(false);
            }
        });
    }, [selectedItem, showFiles]);

    /**
     * On mount, sets current directory to current working directory
     */
    useEffect(() => {
        getCwdCommand().then((response) => {
            if (response.meta.success) {
                setCurrentDir(response.data);
                setSelectedItem(response.data);
            }
        });
    }, []);

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
                onChange={(event) => setSelectedItem(event.target.value)}
            />
        </Modal>
    );
};

export default FileBrowserModal;
