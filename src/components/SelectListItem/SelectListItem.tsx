import { FC, useMemo, useState } from 'react';
import { SelectListFile } from '../../types';
import './SelectListItem.css';

interface SelectListItemProps {
    item: SelectListFile;
    onClick: () => void;
}

export const SelectListItem: FC<SelectListItemProps> = ({ item, onClick }) => {
    const [isHovering, setHovering] = useState(false);

    const rowClass = useMemo(() => {
        const classes = ['table--row'];
        if (isHovering) {
            classes.push('table--row-hover');
        }
        if (item.selected) {
            classes.push('table--row-selected');
        }
        return classes.join(' ');
    }, [isHovering, item.selected]);

    const { statusDisplay, statusClass } = useMemo(() => {
        const statusDisplay = item.status.charAt(0).toUpperCase() + item.status.slice(1);
        const baseClass = 'table--status';
        return {
            statusDisplay,
            statusClass: item.status !== 'available'
                ? baseClass
                : baseClass + ' table--status-available'
        }
    }, [item.status]);

    return (
        <tr className={rowClass}
            onClick={onClick}
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}>
            <td><input type="checkbox" checked={item.selected} readOnly /></td>
            <td>{item.name}</td>
            <td>{item.device}</td>
            <td>{item.path}</td>
            <td className={statusClass}></td>
            <td>{statusDisplay}</td>
        </tr>
    );
};