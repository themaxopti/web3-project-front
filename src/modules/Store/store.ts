import {
  PayloadAction,
  combineReducers,
  configureStore,
  createSlice,
} from "@reduxjs/toolkit";
import { userReducer } from "../../modules/User/state/user";

const slice = createSlice({
  name: "test",
  initialState: 0,
  reducers: {
    increment: (state, action: PayloadAction<number>) => state + action.payload,
  },
});

const rootReducer = combineReducers({
  test: slice.reducer,
  user: userReducer,
});

export const store = configureStore({
  reducer: rootReducer,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type StoreType = ReturnType<typeof configureStore>;
