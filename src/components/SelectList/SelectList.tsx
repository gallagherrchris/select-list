import React, { FC, useEffect, useReducer } from 'react';

import './SelectList.css';
import { CheckedState, SelectFile, SelectListAction, SelectListFile, SelectListState } from '../../types';
import { SelectAllCheckbox } from '../SelectAllCheckbox';
import { SelectListItem } from '../SelectListItem';
import downloadIcon from '../../assets/downloadIcon.svg';
import { getSelectedText } from '../../util/utils';

interface SelectListProps {
  data: Array<SelectFile>;
};
const initialState: SelectListState = {
  data: [],
  checkedState: CheckedState.UNCHECKED,
  selectedText: ''
};

interface Action {
  type: SelectListAction;
  payload?: Array<SelectFile> | SelectListFile;
};

export const reducer = (state: SelectListState, action: Action): SelectListState => {
  switch (action.type) {
    case SelectListAction.INIT: {
      // Map SelectFile into SelectListFile
      const initData: Array<SelectListFile> = (action.payload as Array<SelectFile>)
        .map(file => ({ ...file, selected: false }));
      return { data: initData, selectedText: 'None Selected', checkedState: CheckedState.UNCHECKED };
    };
    case SelectListAction.SELECTALL: {
      let newState;
      switch (state.checkedState) {
        case CheckedState.CHECKED:
          // Set all files to unchecked
          newState = { ...state, checkedState: CheckedState.UNCHECKED, data: state.data.map(d => ({ ...d, selected: false })) };
          break;
        case CheckedState.UNCHECKED:
        case CheckedState.INDETERMINATE:
          // Set all files to checked
          newState = { ...state, checkedState: CheckedState.CHECKED, data: state.data.map(d => ({ ...d, selected: true })) };
          break;
        default:
          newState = state;
      }
      return { ...newState, selectedText: getSelectedText(newState.data) };
    }
    case SelectListAction.SELECT: {
      const affectedRow = action.payload as SelectListFile;
      const newData = state.data.map(d => {
        if (d.name !== affectedRow.name)
          return d;
        // Flip selected state of correct item
        return { ...d, selected: !affectedRow.selected };
      });
      const selectedCount = newData.filter(d => d.selected).length;

      let checkedState = state.checkedState;
      if (selectedCount === newData.length) {
        checkedState = CheckedState.CHECKED;
      } else if (selectedCount === 0) {
        checkedState = CheckedState.UNCHECKED;
      } else {
        checkedState = CheckedState.INDETERMINATE;
      }
      return { ...state, data: newData, selectedText: getSelectedText(newData, selectedCount), checkedState };
    }
    case SelectListAction.DOWNLOAD: {
      const alertText = state.data.reduce((msg, item) => {
        // Only download selected available items
        if (!item.selected || item.status !== 'available')
          return msg;
        return msg + 'Device: ' + item.device + '\nPath: ' + item.path + '\n\n';
      }, '');
      // Only alert if there are selected available items
      if (alertText) {
        alert(alertText.trimEnd());
      }
      return state;
    }
    default:
      return state;
  }
};

export const SelectList: FC<SelectListProps> = ({ data }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    // Initialize state with passed in data
    // TODO: New data will reset current state (future enhancement)
    dispatch({ type: SelectListAction.INIT, payload: data });
  }, [data]);

  return (
    <>
      <header className='list--header'>
        <label className='list--label'>
          <SelectAllCheckbox checkedState={state.checkedState}
            onChange={() => { dispatch({ type: SelectListAction.SELECTALL }) }} />
          <span className='list--text'>{state.selectedText}</span>
        </label>
        <button className='button--download'
          onClick={() => dispatch({ type: SelectListAction.DOWNLOAD })}>
          <img src={downloadIcon} alt="Download Icon" />
          Download Selected
        </button>
      </header>
      <table>
        <thead>
          {/* If the dataset were larger, consider making these clickable/sortable */}
          <tr>
            <th></th>
            <th>Name</th>
            <th>Device</th>
            <th>Path</th>
            <th></th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {state.data.map(row => <SelectListItem key={row.name} item={row}
            onClick={() => dispatch({ type: SelectListAction.SELECT, payload: row })} />)}
        </tbody>
      </table>
    </>
  );
}