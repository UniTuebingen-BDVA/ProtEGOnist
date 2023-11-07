// from https://github.com/mui/material-ui/issues/18091#issuecomment-1019191094
// thus same license as MUI
import React, { forwardRef } from 'react';
import ToggleButton, { ToggleButtonProps } from '@mui/material/ToggleButton';
import Tooltip, { TooltipProps } from '@mui/material/Tooltip';

type TooltipToggleButtonProps = ToggleButtonProps & {
    TooltipProps: Omit<TooltipProps, 'children'>;
};

// Catch props and forward to ToggleButton
const TooltipToggleButton: React.FC<TooltipToggleButtonProps> = forwardRef(
    ({ TooltipProps, ...props }, ref) => {
        return (
            <Tooltip {...TooltipProps}>
                <ToggleButton ref={ref} {...props} />
            </Tooltip>
        );
    }
);

export default TooltipToggleButton;
