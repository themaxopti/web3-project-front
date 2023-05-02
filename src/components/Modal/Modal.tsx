import React from 'react'
import Modal from '@mui/material/Modal';
import { Box, Typography, Container, Grid } from '@mui/material';

interface Props {
    open: boolean
    setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>
    text: string,
    image?: any
}

export const ModalWindow: React.FC<Props> = ({ open, setIsModalOpen, text, image }) => {
    return (
        <Modal
            open={open}
            onClose={() => setIsModalOpen(false)}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
            <Box
                sx={{
                    maxWidth: 600,
                    width: "100%",
                    height: 500,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: 'white',
                }}
            >
                {
                    image &&
                    <div
                        style={{ maxWidth: '300px', height: '300px', width: '100%' }}
                        className='image-div'
                    >
                        <img src={image} alt="" />
                    </div>
                }
                <div>
                    <Typography>{text}</Typography>
                </div>
            </Box>


            {/* </Grid> */}
        </Modal>
    )
}
