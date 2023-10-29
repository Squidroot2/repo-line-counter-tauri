import { invoke } from "@tauri-apps/api";
import Modal from "./Modal";
import { useEffect, useState } from "react";

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

    /**
     *
     * @param {SimpleResponse<FsItemInfo[]>} response
     */
    const updateItems = (response) => {
        if (response.meta.success) {
            setLocalItems(response.data);
        }
    };

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

    useEffect(() => {
        async function setDefaultDirectoryToCwd() {
            /** @type {SimpleResponse<String>} */
            let response = await invoke("get_cwd");
            if (response.meta.success) {
                setCurrentDir(response.data);
            }
        }
        setDefaultDirectoryToCwd().then(() => startGetItems());
    });

    /** @param {FsItemInfo} item */
    const handleItemSelected = (item) => {
        //TODO
        console.log("Item clicked: ", item);
        setSelectedItem(item.name);
    };

    return (
        <Modal
            title="File System"
            footerButtons={[
                { label: "Select", onClick: () => onClose(selectedItem) },
            ]}
            hidden={hidden}
        >
            <input type="text" defaultValue={currentDir} />
            <table>
                <thead>
                    <tr>
                        <th>Type</th>
                        <th>Name</th>
                    </tr>
                </thead>
                <tbody>
                    {localItems.map((item, index) => (
                        <tr
                            key={index}
                            onClick={() => handleItemSelected(item)}
                        >
                            <th>{item.itemType}</th>
                            <th>{item.name}</th>
                        </tr>
                    ))}
                </tbody>
            </table>
        </Modal>
    );
};

export default FileBrowserModal;
