import * as React from 'react';
import { useEffect, useState } from 'react'
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { CircularProgress } from '@mui/material'
import { useForm } from 'react-hook-form';
import { useLazyQuery, useMutation } from '@apollo/client';
import { CREATE_USER, GET_NONCE, VERIFY_ACCOUNT } from '../../modules/User/queries';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../modules/Store/store';
import { setUserAcc } from '../../modules/User/state/user';
import { walletService } from '../../services/wallet.service';
import { useAccount } from 'wagmi';

export interface Props {
    open: boolean
    setOpen: React.Dispatch<React.SetStateAction<boolean>>
    setSelectedValue: React.Dispatch<React.SetStateAction<any>>
    setIsOpenSnackbar: React.Dispatch<React.SetStateAction<boolean>>
}

export interface Inputs {
    email: string
    userName: string
}

export const CreateAccountModal: React.FC<Props> = ({ open, setOpen, setSelectedValue, setIsOpenSnackbar }) => {

    const [isSigned, setIsSigned] = useState(true)
    const [createUser, { data, loading, error }] = useMutation(CREATE_USER);
    const { address, connector, isConnected } = useAccount()
    const [verifyAccount, { loading: lodaingVerify, error: errorVerify }] = useLazyQuery(VERIFY_ACCOUNT);
    const [getNonce, { loading: lodaingNonce, error: errorNonce }] = useLazyQuery(GET_NONCE);

    console.log('mount');

    const userWallet = useSelector((state: RootState) => state.user.wallet)
    const walletType = useSelector((state: RootState) => state.user.walletType)
    const dispatch = useDispatch()

    useEffect(() => {
        async function effect() {
            await walletService.walletConnectSignature(userWallet!, getNonce, verifyAccount).catch(e => {
                dispatch(setUserAcc({
                    email: null,
                    userName: null,
                    id: null,
                    wallet: null,
                    connected: false,
                    walletType: null
                }))
                // window.location.reload()
            })
            setIsSigned(true)
        }
        effect()
    }, [])

    useEffect(() => {
        async function effect() {
            if (walletType == null)
                return
            if (walletType == 'Wallet connect') {
                // setIsSigned(false)
                // setIsSigned(true)
                // setOpen(false);
            }
        }
        effect()
    }, [walletType])

    const handleClose = () => {
        dispatch(setUserAcc({
            email: null,
            userName: null,
            id: null,
            wallet: null,
            connected: false,
            walletType: null
        }))
        walletService.disconnectWalletConnect()
        window.location.reload()
        setSelectedValue(null)
        setOpen(false);
    };

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<Inputs>()

    const onSubmit = async (data: Inputs) => {
        // dispatch(makeUser(data))
        console.log(userWallet)
        const res = await createUser({
            variables: {
                user: {
                    email: data.email,
                    userName: data.userName,
                    wallet: userWallet
                }
            }
        })

        if (!res.errors) {
            console.log(res.data.createUser.wallet);
            setSelectedValue(null)

            try {
                console.log(walletType);

                if (walletType == 'Metamask') {
                    setIsSigned(false)
                    setIsOpenSnackbar(true)
                    const signatureData =
                        await walletService.getSignature(getNonce, verifyAccount, [res.data.createUser.wallet]).catch(e => {
                            window.location.reload()
                        })

                    dispatch(setUserAcc({
                        email: res.data.createUser.email,
                        userName: res.data.createUser.userName,
                        id: res.data.createUser.id,
                        wallet: res.data.createUser.wallet,
                        connected: true,
                        walletType: walletType
                    }))
                    setIsOpenSnackbar(false)
                    setIsSigned(false)
                    setOpen(false);
                }
                if (walletType == 'Wallet connect') {
                    setIsOpenSnackbar(true)

                    await walletService.walletConnectSignature(res.data.createUser.wallet, getNonce, verifyAccount).catch(e => {
                        window.location.reload()
                    })

                    dispatch(setUserAcc({
                        email: res.data.createUser.email,
                        userName: res.data.createUser.userName,
                        id: res.data.createUser.id,
                        wallet: res.data.createUser.wallet,
                        connected: true,
                        walletType: walletType
                    }))
                    setIsOpenSnackbar(false)

                    setOpen(false);
                }
            } catch (e) {
                window.location.reload()
            }
        }
        console.log(res.errors);
    }

    return (
        <div>
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Register an account</DialogTitle>
                <form onSubmit={handleSubmit(onSubmit)} >
                    <DialogContent>
                        <div>
                            <div style={{ marginBottom: '5px' }}> Set email and username</div>
                            <br />
                            <div style={{ marginBottom: '20px' }}>
                                {errors.email !== undefined && <div style={{ color: 'red', marginTop: '20px' }}>{errors.email.message}</div>}
                                {errors.userName !== undefined && <div style={{ color: 'red' }}>{errors.userName.message}</div>}
                                {error && <div style={{ color: 'red', marginBottom: '20px' }}>{error.message}</div>}
                            </div>
                        </div>
                        <TextField
                            {...register('email', {
                                required: 'Email is required', pattern: {
                                    value: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                                    message: 'Please enter a valid email',
                                },
                            })}
                            autoFocus
                            margin="dense"
                            id="name"
                            label={`Email Address`}
                            type="email"
                            fullWidth
                            variant="standard"
                        />
                        {/* {errors.email && <div>{errors.email.message}</div>} */}

                        <TextField
                            {...register('userName', { required: 'Username is required' })}
                            autoFocus
                            name='userName'
                            margin="dense"
                            id="name"
                            label={`Username`}
                            type="text"
                            fullWidth
                            variant="standard"
                        />
                        {/* {errors.username && <div>{errors.username.message}</div>} */}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose}>Cancel</Button>
                        <Button disabled={loading || !isSigned} type='submit'>Register</Button>
                        {/* {loading && <CircularProgress />} */}
                    </DialogActions>
                </form>
            </Dialog>
        </div >
    );
}
