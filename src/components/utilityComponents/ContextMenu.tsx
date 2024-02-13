import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useAtom, useSetAtom } from 'jotai';
import { closeContextMenuAtom, contextMenuAtom } from './contextMenuStore';
import { useCallback } from 'react';
import {
    selectedProteinsAtom,
    selectedProteinsStoreAtom
} from '../selectionTable/tableStore';
import {
    getEgoNetworkAndRadar,
    getEgoNetworkNetworkAtom,
    getRadarAtom
} from '../../apiCalls';
import { updateDecollapseIdsAtom,isNodeCollapsedAtom, decollapseNodeAtom } from '../egoNetworkNetwork/egoNetworkNetworkStore';

export default function ContextMenu() {
    const [contextMenu] = useAtom(contextMenuAtom);
    const closeContext = useSetAtom(closeContextMenuAtom);
    const [_tarNode, setRadarNode] = useAtom(getRadarAtom);
    const [selectedProteins] = useAtom(selectedProteinsAtom);
    const setSelectedProteins = useSetAtom(selectedProteinsStoreAtom);
    const getEgoNetworkNetwork = useSetAtom(getEgoNetworkNetworkAtom);
    const updateDecollapseIds = useSetAtom(updateDecollapseIdsAtom);
    const [isCollapsed] = useAtom(isNodeCollapsedAtom)
    const setDecollapseID = useSetAtom(decollapseNodeAtom);


    const setRadar = () => {
        setRadarNode(contextMenu.triggeredId);
        closeContext();
    };

    const updatedProteins = selectedProteins.slice();
    const egoGraphSubnetworkString = contextMenu
        ? updatedProteins.includes(contextMenu.triggeredId)
            ? 'Remove from'
            : 'Add to'
        : '';

    const changeCollapseString = contextMenu.triggerType === 'subnetwork' ? isCollapsed(contextMenu.triggeredId) ? 'Collapse' : 'Expand' : '';
    
    const setSubnetwork = useCallback(() => {
        // Remove duplicates from the incoming `ids` array
        // Calculate proteins to delete and proteins to add
        const id = contextMenu ? contextMenu.triggeredId : '';
        if (updatedProteins.includes(id)) {
            updatedProteins.splice(updatedProteins.indexOf(id), 1);
            setSelectedProteins(updatedProteins);
            updateDecollapseIds(updatedProteins);
            getEgoNetworkNetwork(updatedProteins);
        } else {
            updatedProteins.push(id);
            setSelectedProteins(updatedProteins);
            getEgoNetworkNetwork(updatedProteins);
        }
        closeContext();
    }, [
        closeContext,
        contextMenu,
        getEgoNetworkNetwork,
        setSelectedProteins,
        updateDecollapseIds,
        updatedProteins
    ]);
    return (
        <Menu
            open={contextMenu.triggeredId !== ''}
            onClose={closeContext}
            anchorReference="anchorPosition"
            anchorPosition={
                contextMenu.triggeredId !== ''
                    ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
                    : undefined
            }
        >
            <MenuItem onClick={setRadar}>Set Radar Center</MenuItem>
            <MenuItem
                onClick={setSubnetwork}
            >{`${egoGraphSubnetworkString} Ego-graph subnetwork`}</MenuItem>
            {contextMenu.triggerType === "subnetwork" && (
            <MenuItem onClick={() =>{setDecollapseID(contextMenu.triggeredId);closeContext()}}>{`${changeCollapseString} Ego-graph`}</MenuItem>)}        
        </Menu>
    );
}
