import { Avatar, Badge, CircularProgress, ListItemAvatar }  from '@material-ui/core';
import { green, red } from '@material-ui/core/colors';
import { withStyles } from '@material-ui/core/styles';
import { SvgIconProps } from '@material-ui/core/SvgIcon';
import { Close } from '@material-ui/icons';
import React from 'react';

type AvatarWithBadgeProps = {
    badge?: React.ReactNode;
    classes: { [className: string]: string };
    completed: boolean;
    icon: React.ComponentType<SvgIconProps>;
    isProductSelected: boolean;
    loading: boolean;
};

export const AvatarWithBadge = withStyles({
    green: {
        backgroundColor: green[500],
        color: '#fff',
    },
    red: {
        backgroundColor: red[500],
        color: '#fff',
    },
})
(({ badge, classes, completed, icon: Icon, isProductSelected, loading }: AvatarWithBadgeProps) => (
    <Badge
        color="secondary"
        badgeContent={badge}
        invisible={!Boolean(badge)}
    >
        <ListItemAvatar>
            <Avatar
                className={completed
                    ? isProductSelected ? classes.green : classes.red
                    : undefined
                }
            >
                {isProductSelected
                    ? loading ? <CircularProgress /> : <Icon />
                    : <Close />
                }
            </Avatar>
        </ListItemAvatar>
    </Badge>
));