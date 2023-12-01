import React, { FC, useEffect, useRef } from 'react';
import { CheckedState } from '../../types';

interface SelectAllCheckboxProps {
    checkedState: CheckedState
    onChange: () => void
}

// Separate component to handle indeterminate logic
// Indeterminate is separate html attribute
export const SelectAllCheckbox: FC<SelectAllCheckboxProps> = ({ checkedState, onChange }) => {
    const checkboxRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        if (!checkboxRef.current)
            return;

        switch (checkedState) {
            case CheckedState.CHECKED:
                checkboxRef.current.checked = true;
                checkboxRef.current.indeterminate = false;
                break;
            case CheckedState.UNCHECKED:
                checkboxRef.current.checked = false;
                checkboxRef.current.indeterminate = false;
                break;
            case CheckedState.INDETERMINATE:
                checkboxRef.current.checked = false;
                checkboxRef.current.indeterminate = true;
                break;
        }
    }, [checkedState]);

    return (
        <input ref={checkboxRef} type="checkbox" onChange={onChange} />
    );
};