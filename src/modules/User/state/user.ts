import { PayloadAction, createSlice } from "@reduxjs/toolkit";

export interface User {
  id: string | null;
  userName: string | null;
  email: string | null;
  wallet: string | null;
  connected: boolean;
  walletType: "Metamask" | "Wallet connect" | null;
}

export interface InitialUserState extends User {}

const initialState: InitialUserState = {
  email: null,
  id: null,
  userName: null,
  wallet: null,
  connected: false,
  walletType: null,
};

const user = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserAcc: (state, action: PayloadAction<User>) => {
      console.log(action.payload);
      state.email = action.payload.email;
      state.id = action.payload.id;
      state.wallet = action.payload.wallet;
      state.userName = action.payload.userName;
      state.connected = action.payload.connected;
      state.walletType = action.payload.walletType;
    },
    setUserWallet: (state, action: PayloadAction<string>) => {
      state.wallet = action.payload;
    },
    setWalletType: (
      state,
      action: PayloadAction<"Metamask" | "Wallet connect" | null>
    ) => {
      state.walletType = action.payload;
    },
  },
});

export const { setUserAcc, setUserWallet, setWalletType } = user.actions;
export const userReducer = user.reducer;
