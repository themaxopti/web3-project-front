import { Avatar, Button, Dialog, DialogTitle, List, ListItem, ListItemAvatar, ListItemButton, ListItemText, Typography } from '@mui/material'
import React from 'react'
import { blue } from '@mui/material/colors'
import image from '../../assets/MetaMask_Fox.svg.png'
import s from './styles.module.css'
import { walletService } from '../../services/wallet.service'

export interface Props {
    selectedValue: any
    open: boolean
    title: string
    setSelectedValue: any
    setOpen: any
    options: { title: string, image: any }[]
}

export interface SimpleDialogProps {
    open: boolean;
    selectedValue: string;
    onClose: (value: string) => void;
    title: string
    options: { title: string, image: any }[]
}

function SimpleDialog(props: SimpleDialogProps) {
    const { onClose, selectedValue, open } = props;

    const handleClose = () => {
        onClose(selectedValue);
    };

    const handleListItemClick = (value: string) => {
        onClose(value);
    };

    return (
        <Dialog onClose={handleClose} open={open}>
            <DialogTitle>{props.title}</DialogTitle>
            <List sx={{ pt: 0 }}>
                {props.options.map((wallet, i) => (
                    <ListItem key={i} disableGutters>
                        <ListItemButton onClick={() => handleListItemClick(wallet.title)} key={i}>
                            <ListItemAvatar key={i}>
                                <div key={i} className={'image-div' + ' ' + s['chose-option']}>
                                    <img src={wallet.image} alt="" />
                                </div>
                            </ListItemAvatar>
                            <ListItemText primary={wallet.title} />
                        </ListItemButton>
                    </ListItem>
                ))}

            </List>
        </Dialog>
    );
}

export const ChooseOptionModal: React.FC<Props> =
    ({ open, selectedValue, setOpen, setSelectedValue, title, options }) => {



        const handleClose = (value: string) => {
            setOpen(false);
            setSelectedValue(value);
        };

        return (
            <>
                <SimpleDialog
                    options={options}
                    title={title}
                    selectedValue={selectedValue}
                    open={open}
                    onClose={handleClose}
                />
            </>
        )
    }
