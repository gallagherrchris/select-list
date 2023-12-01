import { start } from 'repl';
import { CheckedState, SelectFile, SelectListAction, SelectListFile, SelectListState } from '../../types';
import { reducer } from './SelectList';

// Default starting object
// Do not rely on these values as they will be overwritten
const startingState: SelectListState = {
    data: [
        { name: 'one', status: 'available', selected: false } as SelectListFile,
        { name: 'two', status: 'other', selected: false } as SelectListFile,
        { name: 'three', status: 'something', selected: false } as SelectListFile
    ],
    checkedState: CheckedState.UNCHECKED,
    selectedText: ''
};

describe('Unit tests for reducer', () => {
    describe('action INIT', () => {
        it('sets all files to selected:false', () => {
            const files: Array<SelectFile> = [{
                device: 'device',
                name: ' name',
                path: 'path',
                status: 'status'
            }];

            const result = reducer({} as SelectListState, { type: SelectListAction.INIT, payload: files });
            expect(result).toHaveProperty('data');
            expect(result.data.length).toBe(1);
            expect(result.data[0].selected).toBe(false);
        });

        it('sets selectedText', () => {
            const result = reducer({} as SelectListState, { type: SelectListAction.INIT, payload: [] });
            expect(result).toHaveProperty('selectedText');
            expect(result.selectedText).toEqual('None Selected');
        });
    });

    describe('action SELECTALL', () => {
        it('sets all files to unchecked when currently checked', () => {
            startingState.checkedState = CheckedState.CHECKED;
            startingState.data = startingState.data.map(d => ({ ...d, selected: true }));

            const result = reducer(startingState, { type: SelectListAction.SELECTALL });
            expect(result.checkedState).toBe(CheckedState.UNCHECKED);
            expect(result.data.filter(d => !d.selected).length).toBe(3);
        });

        it('sets all files to checked when currently unchecked', () => {
            startingState.checkedState = CheckedState.UNCHECKED;
            startingState.data = startingState.data.map(d => ({ ...d, selected: false }));

            const result = reducer(startingState, { type: SelectListAction.SELECTALL });
            expect(result.checkedState).toBe(CheckedState.CHECKED);
            expect(result.data.filter(d => d.selected).length).toBe(3);
        });

        it('sets all files to checked when current indeterminate', () => {
            startingState.checkedState = CheckedState.INDETERMINATE;
            startingState.data = startingState.data.map(d => ({ ...d, selected: false }));
            startingState.data[0].selected = true;

            const result = reducer(startingState, { type: SelectListAction.SELECTALL });
            expect(result.checkedState).toBe(CheckedState.CHECKED);
            expect(result.data.filter(d => d.selected).length).toBe(3);
        });

        it('sets selectedText to correct count', () => {
            startingState.checkedState = CheckedState.UNCHECKED;
            startingState.data = startingState.data.map(d => ({ ...d, selected: false }));

            const result = reducer(startingState, { type: SelectListAction.SELECTALL });
            expect(result.selectedText).toEqual('Selected 3');
        });

        it('sets selectedText to None Selected', () => {
            startingState.checkedState = CheckedState.CHECKED;
            startingState.data = startingState.data.map(d => ({ ...d, selected: true }));

            const result = reducer(startingState, { type: SelectListAction.SELECTALL });
            expect(result.selectedText).toEqual('None Selected');
        });
    });

    describe('action SELECT', () => {
        it('sets selected to true for correct item', () => {
            startingState.data[0] = { name: 'oneFalse', selected: false } as SelectListFile;
            const payload = { name: 'oneFalse', selected: false } as SelectListFile;

            const result = reducer(startingState, { type: SelectListAction.SELECT, payload });
            expect(result.data.find(d => d.name === 'oneFalse')?.selected).toBe(true);
        });

        it('sets selected to false for correct item', () => {
            startingState.data[0] = { name: 'oneTrue', selected: true } as SelectListFile;
            const payload = { name: 'oneTrue', selected: true } as SelectListFile;

            const result = reducer(startingState, { type: SelectListAction.SELECT, payload });
            expect(result.data.find(d => d.name === 'oneTrue')?.selected).toBe(false);
        });

        it('sets selectedText to correct count', () => {
            startingState.data = startingState.data.map(d => ({ ...d, selected: false }));
            startingState.selectedText = '';
            const payload = { name: startingState.data[0].name, selected: false } as SelectListFile;

            const result = reducer(startingState, { type: SelectListAction.SELECT, payload });
            expect(result.selectedText).toEqual('Selected 1');
        });

        it('sets selectedText to None Selected', () => {
            startingState.data = startingState.data.map(d => ({ ...d, selected: false }));
            startingState.selectedText = '';
            startingState.data[0].selected = true;
            const payload = { name: startingState.data[0].name, selected: true } as SelectListFile;

            const result = reducer(startingState, { type: SelectListAction.SELECT, payload });
            expect(result.selectedText).toEqual('None Selected');
        });

        it('sets checkState to CHECKED', () => {
            startingState.data = startingState.data.map(d => ({ ...d, selected: true }));
            startingState.data[0].selected = false;
            startingState.checkedState = CheckedState.INDETERMINATE;
            const payload = { name: startingState.data[0].name, selected: false } as SelectListFile;

            const result = reducer(startingState, { type: SelectListAction.SELECT, payload });
            expect(result.checkedState).toBe(CheckedState.CHECKED);
        });

        it('sets checkState to UNCHECKED', () => {
            startingState.data = startingState.data.map(d => ({ ...d, selected: false }));
            startingState.data[0].selected = true;
            startingState.checkedState = CheckedState.INDETERMINATE;
            const payload = { name: startingState.data[0].name, selected: true } as SelectListFile;

            const result = reducer(startingState, { type: SelectListAction.SELECT, payload });
            expect(result.checkedState).toBe(CheckedState.UNCHECKED);
        });

        it('sets checkState to INDETERMINATE', () => {
            startingState.data = startingState.data.map(d => ({ ...d, selected: false }));
            startingState.checkedState = CheckedState.UNCHECKED;
            const payload = { name: startingState.data[0].name, selected: false } as SelectListFile;

            const result = reducer(startingState, { type: SelectListAction.SELECT, payload });
            expect(result.checkedState).toBe(CheckedState.INDETERMINATE);
        });
    });

    describe('action DOWNLOAD', () => {
        jest.spyOn(window, 'alert').mockImplementation(() => { });

        it('does not alert when nothing is selected', () => {
            startingState.data = startingState.data.map(d => ({ ...d, selected: false }));

            reducer(startingState, { type: SelectListAction.DOWNLOAD });
            expect(window.alert).not.toBeCalled();
        });

        it('does not alert when no available file is selected', () => {
            startingState.data = startingState.data.map(d => ({ ...d, selected: true, status: 'not available' }));

            reducer(startingState, { type: SelectListAction.DOWNLOAD });
            expect(window.alert).not.toBeCalled();
        });

        it('alerts device and path when available file is selected', () => {
            startingState.data = startingState.data.map(d => ({ ...d, selected: false }));
            startingState.data[0] = { path: 'somePath', device: 'someDevice', selected: true, status: 'available' } as SelectListFile;

            reducer(startingState, { type: SelectListAction.DOWNLOAD });
            expect(window.alert).toBeCalledWith('Device: someDevice\nPath: somePath');
        });

        it('alerts device and path when multiple files are selected', () => {
            startingState.data = startingState.data.map(d => ({ ...d, selected: false }));
            startingState.data[0] = { path: 'somePath', device: 'someDevice', selected: true, status: 'available' } as SelectListFile;
            startingState.data[1] = { path: 'someOtherPath', device: 'someOtherDevice', selected: true, status: 'available' } as SelectListFile;

            reducer(startingState, { type: SelectListAction.DOWNLOAD });
            expect(window.alert).toBeCalledWith('Device: someDevice\nPath: somePath\n\nDevice: someOtherDevice\nPath: someOtherPath');
        });
    });
});
