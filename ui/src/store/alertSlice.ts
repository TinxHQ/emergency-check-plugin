import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AlertUser, EnhanceAlert } from '../types';

const initialState: any = { }

const filterCurrentUser = (users, currentUserUUID) => {
  return users.filter(user => user.uuid !== currentUserUUID)
}

export const alertSlice = createSlice({
  name: 'alert',
  initialState,
  reducers: {
    initAlert: (state, action: PayloadAction<EnhanceAlert>) => {
      return {
        ...state,
        ...action.payload,
      }
    },
    alertWaiting: (state, action: PayloadAction<AlertUser>) => {
      state.missing = [action.payload, ...filterCurrentUser([...state.missing], action.payload.uuid)];
      state.not_safe = filterCurrentUser([...state.not_safe], action.payload.uuid)
      state.safe = filterCurrentUser([...state.safe], action.payload.uuid)
    },
    alertNotSafe: (state, action: PayloadAction<AlertUser>) => {
      state.missing = filterCurrentUser([...state.missing], action.payload.uuid);
      state.not_safe = [action.payload, ...filterCurrentUser([...state.not_safe], action.payload.uuid)]
      state.safe = filterCurrentUser([...state.safe], action.payload.uuid)
    },
    alertSafe: (state, action: PayloadAction<AlertUser>) => {
      state.missing = filterCurrentUser([...state.missing], action.payload.uuid);
      state.not_safe = filterCurrentUser([...state.not_safe], action.payload.uuid)
      state.safe = [action.payload, ...filterCurrentUser([...state.safe], action.payload.uuid)]
    },
  },
})

export const { initAlert } = alertSlice.actions

export default alertSlice.reducer
