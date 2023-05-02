import React, { useCallback, useEffect, useState } from 'react'
import { Header } from './Header'
import Web3 from 'web3';
import { walletService } from '../../../services/wallet.service';
import { Mainnet, ChainId } from "@usedapp/core";
import { useEthers } from "@usedapp/core";
import { createPortal } from 'react-dom';
import { ModalWindow } from '../../../components/Modal/Modal';
import metamaskImage from '../../../assets/MetaMask_Fox.svg.png'
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../modules/Store/store';
import { setUserAcc, setUserWallet } from "../../../modules/User/state/user";
import { useLazyQuery } from '@apollo/client';
import { GET_NONCE, GET_USER_BY_WALLET, VERIFY_ACCOUNT } from '../../../modules/User/queries';

export const HeaderContainer = () => {
    const [isMetamaskInstalled, setIsMetamaskInstalled] = useState<boolean | null>(null)
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
    const [isSelectOptionModalOpen, setIsSelectOptionModalOpen] = useState<boolean>(false)
    const [isMakeAccountModal, setIsMakeAccountModal] = useState(false)
    const [isOpenSnackbar, setIsOpenSnackbar] = useState(false)

    const dispatch = useDispatch()

    const [getUser, { loading, error, data }] = useLazyQuery(GET_USER_BY_WALLET);
    const [getNonce, { loading: lodaingNonce, error: errorNonce }] = useLazyQuery(GET_NONCE);
    const [verifyAccount, { loading: lodaingVerify, error: errorVerify }] = useLazyQuery(VERIFY_ACCOUNT);


    const user = useSelector((state: RootState) => state.user)


    useEffect(() => {
        window.ethereum?.on('accountsChanged', async () => {
            console.log('acc changed');
            const accounts = await window.ethereum?.request({ method: "eth_accounts" });
            dispatch(setUserWallet(accounts[0]))
            const user = await getUser({
                variables: {
                    wallet: accounts[0]
                }
            })

            if (user.error && user.error.message == 'User is not exist') {
                if (accounts && accounts.length > 0) {
                    setIsMakeAccountModal(true)
                }
            }
            else if (user.error && user.error.message == 'Token is not valid') {
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
        });
    }, [])

    const connectMetaMask: any = async () => {
        try {
            const accounts = await walletService.connectMetaMask()

            return accounts
        } catch (e: any) {
            if (e.message == 'Metamask is not installed') {
                setIsModalOpen(true)
                setIsMetamaskInstalled(false)
            }
        }
    }

    const memorizedConnectWallet = useCallback(async () => {
        return await connectMetaMask()
    }, [])

    return (
        <>
            {
                isModalOpen === true ? createPortal(
                    <ModalWindow
                        image={metamaskImage}
                        text='Metamask is not installed'
                        setIsModalOpen={setIsModalOpen}
                        open={isModalOpen} />, document.body) : ''
            }
            <Header
                isMakeAccountModal={isMakeAccountModal}
                setIsMakeAccountModal={setIsMakeAccountModal}
                // isSelectOptionModalOpen={isSelectOptionModalOpen}
                // setIsSelectOptionModalOpen={setIsSelectOptionModalOpen}
                connectWallet={memorizedConnectWallet}
                isOpenSnackbar={isOpenSnackbar}
                setIsOpenSnackbar={setIsOpenSnackbar}
            />
        </>
    )
}
