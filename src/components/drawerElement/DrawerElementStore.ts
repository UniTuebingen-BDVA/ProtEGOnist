import { atom } from 'jotai';
import { tableFilterModelAtom } from '../selectionTable/tableStore.tsx';

export const drawerShownAtom = atom(false);
export const isFullWidthAtom = atom(true);
export const closeDrawerAtom = atom(null, (_get, set) => {
    set(drawerShownAtom, false);
    set(isFullWidthAtom, true);
});
export const openDrawerAtom = atom(null, (_get, set, isFullWidth) => {
    set(drawerShownAtom, true);
    set(isFullWidthAtom, isFullWidth);
    if(!isFullWidth){
        set(tableFilterModelAtom,{items: [
            { id: 1, field: 'In Intersection?', operator: 'equals', value: 'Yes' }
        ]})
    } else{
        set(tableFilterModelAtom,{items: [
            { id: 1, field: 'with_metadata', operator: 'equals', value: 'true' }
        ]})
    }
    // TODO: filter table by selected if not full width

});
