import styles from './SmartTable.module.css';

type Column = {
    header: string;
    accessor: string;
};

type SmartTableProps = {
    columns: Column[];
    data: any[];
};

export default function SmartTable({ columns, data }: SmartTableProps) {
    return (
        <div className={styles.tableWrapper}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        {columns.map((col) => (
                            <th key={col.accessor}>{col.header}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                            {columns.map((col) => (
                                <td key={`${rowIndex}-${col.accessor}`} data-label={col.header}>
                                    {row[col.accessor]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
