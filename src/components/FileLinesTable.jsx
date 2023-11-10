import { useState } from "react";
import "../dtoTypes";

/**
 * Filterable Table Header used in Table
 * @param {Object} props
 * @param {string} props.title
 * @param {function() : void} props.onFilterChanged
 * @returns
 */
const FilterableHeader = ({ title, onFilterChanged }) => (
    <th>
        <div>{title}</div>
        <div>
            <input
                type="text"
                placeholder="Filter..."
                onChange={onFilterChanged}
            />
        </div>
    </th>
);

/**
 * @param {Object} props
 * @param {FileLines} props.fileLine
 * @returns
 */
const FileLinesRow = ({ fileLine: fl }) => (
    <tr hidden={fl.ignored === true}>
        <td>{fl.file}</td>
        <td>{fl.lines}</td>
    </tr>
);

/**
 * Table that displays all the File line count information
 * @param {Object} props
 * @param {FileLines[]} props.filesLines
 * @returns
 */
const FileLinesTable = ({ filesLines }) => {
    const [fileFilterString, setFileFilterString] = useState("");
    const [lineCountFilterString, setLineCountFilterString] = useState("");
    const [pageIndex, setPageIndex] = useState(0);

    /**
     *
     * @param {React.ChangeEvent<HTMLInputElement>} event
     * @param {React.Dispatch<React.SetStateAction<string>} setProperty
     */
    const handleFilterStringUpdated = (setProperty, event) => {
        setProperty(event.target.value);
    };

    /**
     * Checks if a string contains a filter, unless filter is an empty string
     * @param {string} filter
     * @param {string} value
     */
    const matchesFilter = (filter, value) => {
        if (filter.length > 0) {
            return value.toUpperCase().includes(filter.toUpperCase());
        }
        return true;
    };

    const rowsPerPage = 1000;

    return (
        <div>
            <table>
                <thead>
                    <tr>
                        <FilterableHeader
                            onFilterChanged={handleFilterStringUpdated.bind(
                                null,
                                setFileFilterString,
                            )}
                            title="File Name"
                        />
                        <FilterableHeader
                            onFilterChanged={handleFilterStringUpdated.bind(
                                null,
                                setLineCountFilterString,
                            )}
                            title="Line Count"
                        />
                    </tr>
                </thead>
                <tbody>
                    {filesLines
                        .filter(
                            (fl) =>
                                !fl.ignored &&
                                matchesFilter(fileFilterString, fl.file) &&
                                matchesFilter(
                                    lineCountFilterString,
                                    fl.lines.toString(),
                                ),
                        )
                        .slice(
                            pageIndex * rowsPerPage,
                            (pageIndex + 1) * rowsPerPage,
                        ) // TODO implement pagination
                        .map((fl) => (
                            <FileLinesRow fileLine={fl} key={fl.file} />
                        ))}
                </tbody>
            </table>
        </div>
    );
};

export default FileLinesTable;
