import styles from './SmartTable.module.css';

type Column<T> = {
    header: string;
    accessor: keyof T | string; // keyof T is ideal but string accessor support allows nested paths if handled
};

type SmartTableProps<T> = {
    columns: Column<T>[];
    data: T[];
};

export default function SmartTable<T extends Record<string, unknown>>({ columns, data }: SmartTableProps<T>) {
    return (
        <div className={styles.tableWrapper}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        {columns.map((col) => (
                            <th key={col.accessor as string}>{col.header}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                            {columns.map((col) => (
                                <td key={`${rowIndex}-${col.accessor as string}`} data-label={col.header}>
                                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                    {(row as any)[col.accessor]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
