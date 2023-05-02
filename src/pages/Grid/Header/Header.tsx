import { Grid, Button, Box, Typography, Modal, Snackbar } from '@mui/material'
import React, { useEffect, useState } from 'react'
import WalletIcon from '@mui/icons-material/Wallet';
import s from './styles.module.css'
import { ChooseOptionModal } from '../../../components/Modal/ChooseOptionModal';
import image from '../../../assets/MetaMask_Fox.svg.png'
import walletConnectImage from '../../../assets/wallet-connect-logo.png'
import { CreateAccountModal } from '../../../components/Modal/RegisterUserModal';
import { setUserAcc, setUserWallet, setWalletType } from '../../../modules/User/state/user';
import { useLazyQuery, useMutation } from '@apollo/client';
import { CREATE_USER, GET_NONCE, GET_USER_BY_WALLET, VERIFY_ACCOUNT } from '../../../modules/User/queries';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../modules/Store/store';
import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum'
import { Web3Modal, useWeb3Modal } from '@web3modal/react'
import { configureChains, createClient, WagmiConfig } from 'wagmi'
import { arbitrum, mainnet, polygon } from 'wagmi/chains'
import { walletService } from '../../../services/wallet.service';
import {
    useAccount,
    useConnect,
    useDisconnect,
    useEnsAvatar,
    useEnsName,
} from 'wagmi'
import Web3 from 'web3';
import WalletConnect from "@walletconnect/client";
import QRCodeModal from "@walletconnect/qrcode-modal";
import { convertUtf8ToHex } from "@walletconnect/utils";

export interface Props {
    connectWallet: () => Promise<string[]>
    // setIsSelectOptionModalOpen: React.Dispatch<React.SetStateAction<boolean>>
    // isSelectOptionModalOpen: boolean
    setIsMakeAccountModal: React.Dispatch<React.SetStateAction<boolean>>
    isMakeAccountModal: boolean
    setIsOpenSnackbar: React.Dispatch<React.SetStateAction<boolean>>
    isOpenSnackbar: boolean
}



export const Header: React.FC<Props> =
    ({ connectWallet, isMakeAccountModal, setIsMakeAccountModal, isOpenSnackbar, setIsOpenSnackbar }) => {

        const [isChoseOption, setIsChoseOption] = useState(false)
        // const [isOpenSnackbar, setIsOpenSnackbar] = useState(false)
        const [selectedValue, setSelectedValue] = useState(null)
        const userAccount = useSelector((state: RootState) => state.user.wallet)
        const walletType = useSelector((state: RootState) => state.user.walletType)
        const [getUser, { loading, error, data }] = useLazyQuery(GET_USER_BY_WALLET);
        const [getNonce, { loading: lodaingNonce, error: errorNonce }] = useLazyQuery(GET_NONCE);
        const [verifyAccount, { loading: lodaingVerify, error: errorVerify }] = useLazyQuery(VERIFY_ACCOUNT);
        const { isOpen, open, close, setDefaultChain } = useWeb3Modal();
        const { address, connector, isConnected } = useAccount()

        useEffect(() => {
            if (!isOpen && !address) {
                setSelectedValue(null)
            }
        }, [isOpen])

        useEffect(() => {
            if (address != undefined) {
                dispatch(setUserWallet(address))

                setTimeout(async () => {
                    await close()

                    const user = await getUser({
                        variables: {
                            wallet: address
                        },
                        context: {
                            headers: {
                                "Authorization": `Bearer ${localStorage.getItem('userToken')}`
                            }
                        }
                    })

                    if (user.error && user.error.message == 'User is not exist') {
                        if (address) {
                            let error = false
                            setIsMakeAccountModal(true)
                        }
                    }
                    else if (user.error && user.error.message == 'Token is not valid') {
                        try {
                            setIsOpenSnackbar(true)
                            const signature = await walletService.walletConnectSignature(address, getNonce, verifyAccount)
                            const user = await getUser({
                                variables: {
                                    wallet: address
                                },
                                context: {
                                    headers: {
                                        "Authorization": `Bearer ${localStorage.getItem('userToken')}`
                                    }
                                }
                            })
                            if (!user.error) {
                                dispatch(setUserAcc({
                                    email: user.data.getUserByWallet.email,
                                    userName: user.data.getUserByWallet.userName,
                                    id: user.data.getUserByWallet.id,
                                    wallet: user.data.getUserByWallet.wallet,
                                    connected: true,
                                    walletType: 'Wallet connect'
                                }))
                                setIsOpenSnackbar(false)

                            }
                        } catch (e) {
                            window.location.reload()
                        }
                    }
                    else {
                        dispatch(setUserAcc({
                            email: user.data.getUserByWallet.email,
                            userName: user.data.getUserByWallet.userName,
                            id: user.data.getUserByWallet.id,
                            wallet: user.data.getUserByWallet.wallet,
                            connected: true,
                            walletType: 'Wallet connect'
                        }))

                        setSelectedValue(null)
                    }
                }, 100)
            }
            console.log(address);
        }, [address])

        const dispatch = useDispatch()

        const emails: { title: string, image: any }[] = [
            { title: 'Metamask', image },
            { title: 'Wallet connect', image: walletConnectImage }
        ];

        useEffect(() => {
            if (selectedValue === 'Metamask') {
                setTimeout(async () => {
                    const accounts = await connectWallet()

                    dispatch(setUserWallet(accounts[0]))
                    dispatch(setWalletType('Metamask'))

                    const user = await getUser({
                        variables: {
                            wallet: accounts[0]
                        },
                        context: {
                            headers: {
                                "Authorization": `Bearer ${localStorage.getItem('userToken')}`
                            }
                        }
                    })
                    console.log(user);


                    if (user.error && user.error.message == 'User is not exist') {
                        if (accounts && accounts.length > 0) {
                            setIsMakeAccountModal(true)
                        }
                    } else if (user.error && user.error.message == 'Token is not valid') {
                        try {
                            setIsOpenSnackbar(true)
                            await walletService.getSignature(getNonce, verifyAccount, accounts)
                            const user = await getUser({
                                variables: {
                                    wallet: accounts[0]
                                },
                                context: {
                                    headers: {
                                        "Authorization": `Bearer ${localStorage.getItem('userToken')}`
                                    }
                                }
                            })
                            if (!user.error) {
                                dispatch(setUserAcc({
                                    email: user.data.getUserByWallet.email,
                                    userName: user.data.getUserByWallet.userName,
                                    id: user.data.getUserByWallet.id,
                                    wallet: user.data.getUserByWallet.wallet,
                                    connected: true,
                                    walletType: 'Metamask'
                                }))
                            }
                            setIsOpenSnackbar(false)
                        } catch (e) {
                            dispatch(setUserAcc({
                                email: null,
                                userName: null,
                                id: null,
                                wallet: null,
                                connected: false,
                                walletType: null
                            }))
                        }
                    }
                    else {
                        dispatch(setUserAcc({
                            email: user.data.getUserByWallet.email,
                            userName: user.data.getUserByWallet.userName,
                            id: user.data.getUserByWallet.id,
                            wallet: user.data.getUserByWallet.wallet,
                            connected: true,
                            walletType: 'Metamask'
                        }))
                    }
                    setSelectedValue(null)
                }, 700)
            }

            if (selectedValue === 'Wallet connect') {
                setTimeout(async () => {
                    dispatch(setWalletType('Wallet connect'))
                    await walletService.connectWalletConnect(open)
                }, 700)
            }
        }, [selectedValue])

        const disconectUser = () => {
            if (walletType == 'Wallet connect') {
                walletService.disconnectWalletConnect()
                window.location.reload()
            }

            dispatch(setUserAcc({
                email: null,
                userName: null,
                id: null,
                wallet: null,
                connected: false,
                walletType: null
            }))
            setSelectedValue(null)
        }

        return (
            <>
                <Snackbar
                    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                    open={isOpenSnackbar}
                    onClose={() => setIsOpenSnackbar(false)}
                    message="Please sign this"
                />

                <CreateAccountModal
                    setIsOpenSnackbar={setIsOpenSnackbar}
                    setSelectedValue={setSelectedValue}
                    open={isMakeAccountModal}
                    setOpen={setIsMakeAccountModal}
                />

                <ChooseOptionModal
                    title='Choose wallet'
                    setOpen={setIsChoseOption}
                    selectedValue={selectedValue}
                    open={isChoseOption}
                    options={emails}
                    setSelectedValue={setSelectedValue}
                />

                <Grid container alignItems={'center'} paddingLeft={3} paddingTop={2} paddingRight={3} spacing={5}>
                    <Grid item xs={4}>Web3 project</Grid>
                    {!userAccount &&
                        <Grid item xs={8} display={'flex'} justifyContent={'flex-end'} alignItems={'flex-end'}>
                            <Button onClick={async () => {
                                setIsChoseOption(true)
                                // await open()
                            }} className={s["coonnect-btn"]} variant='outlined'>
                                <WalletIcon />
                                <div>
                                    <Typography component={'span'}>Connect wallet</Typography>
                                </div>
                            </Button>

                        </Grid>
                    }
                    {
                        userAccount &&
                        <Grid justifyContent={'flex-end'} flexGrow={0} gap={2} alignItems={'center'} display={'flex'} item xs={8}>
                            <div className={'image-div' + ' ' + s['user-icon']}>
                                <img src={walletConnectImage} alt="" />
                            </div>
                            <Box sx={{
                                height: '40px',
                                display: 'flex',
                                alignItems: 'center',
                                bgcolor: (theme) =>
                                    theme.palette.mode === 'dark' ? '#101010' : 'grey.100',
                                color: (theme) =>
                                    theme.palette.mode === 'dark' ? 'grey.300' : 'grey.800',
                                border: '1px solid',
                                borderColor: (theme) =>
                                    theme.palette.mode === 'dark' ? 'grey.800' : 'grey.300',
                                borderRadius: 2,
                            }}>
                                <Box
                                    component="div"
                                    sx={{
                                        maxWidth: '300px',
                                        width: '100%',
                                        textOverflow: 'ellipsis',
                                        overflow: 'hidden',
                                        cursor: 'pointer',
                                        padding: '0 5px 0 5px',
                                        fontSize: '0.875rem',
                                        fontWeight: '700',
                                    }}
                                >
                                    <span style={{}}>{userAccount}</span>
                                </Box>
                            </Box>
                            <Button onClick={disconectUser} variant='outlined'>disconect</Button>
                        </Grid>
                    }
                </Grid >
            </>
        )
    }
