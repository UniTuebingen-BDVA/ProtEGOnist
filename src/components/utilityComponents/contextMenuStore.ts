import { atom } from 'jotai';

const contextMenuAtomStore = atom<{
    mouseX: number;
    mouseY: number;
    triggeredId: string;
}>({ mouseX: 0, mouseY: 0, triggeredId: '' });

export const contextMenuAtom = atom(
    (get) => {
        return get(contextMenuAtomStore);
    },
    (get, set, event: React.MouseEvent, id: string) => {
        event.preventDefault();
        get(contextMenuAtomStore).triggeredId === ''
            ? set(contextMenuAtomStore, {
                  mouseX: event.clientX + 2,
                  mouseY: event.clientY - 6,
                  triggeredId: id
              })
            : { mouseX: 0, mouseY: 0, triggeredId: '' };
    }
);
export const closeContextMenuAtom = atom(null, (_get, set) => {
    set(contextMenuAtomStore, { mouseX: 0, mouseY: 0, triggeredId: '' });
});
