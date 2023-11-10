/**
 * Component that displays the summary information
 */
const SummaryTable = (props) => {
    /** @type FileLinesSummary */
    const summary = props.summary;

    return (
        <table hidden={!summary}>
            <tbody>
                <tr>
                    <td>Number of Files</td>
                    <td>{summary.files}</td>
                </tr>
                <tr>
                    <td>Total Lines</td>
                    <td>{summary.sum}</td>
                </tr>
                <tr>
                    <td>Highest Lines</td>
                    <td>{summary.max}</td>
                </tr>
                <tr>
                    <td>Lowest Lines</td>
                    <td>{summary.min}</td>
                </tr>
                <tr>
                    <td>Mean Lines</td>
                    <td>{summary.mean}</td>
                </tr>
                <tr>
                    <td>Median Lines</td>
                    <td>{summary.median}</td>
                </tr>
            </tbody>
        </table>
    );
};

export default SummaryTable;
