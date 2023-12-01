import { SelectListFile } from '../types';

export const getSelectedText = (data: Array<SelectListFile>, count?: number) => {
    if (typeof count === 'undefined') {
        count = data.filter(d => d.selected).length;
    }
    return count ? 'Selected ' + count : 'None Selected';
}