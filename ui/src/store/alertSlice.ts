import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AlertUser, EnhanceAlert } from '../types';

const initialState: any = { }

const filterCurrentUser = (users: Partial<AlertUser>[], currentUserUUID: string) => {
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
    alertPending: (state, action: PayloadAction<AlertUser>) => {
      state.pending_users = [action.payload, ...filterCurrentUser([...(state.pending_users || [])], action.payload.uuid)];
      state.unsafe_users = filterCurrentUser([...(state.unsafe_users || [])], action.payload.uuid)
      state.safe_users = filterCurrentUser([...(state.safe_users || [])], action.payload.uuid)
    },
    alertNotSafe: (state, action: PayloadAction<AlertUser>) => {
      state.pending_users = filterCurrentUser([...(state.pending_users || [])], action.payload.uuid);
      state.unsafe_users = [action.payload, ...filterCurrentUser([...state.unsafe_users], action.payload.uuid)]
      state.safe_users = filterCurrentUser([...state.safe_users], action.payload.uuid)
    },
    alertSafe: (state, action: PayloadAction<AlertUser>) => {
      state.pending_users = filterCurrentUser([...(state.pending_users || [])], action.payload.uuid);
      state.unsafe_users = filterCurrentUser([...(state.unsafe_users || [])], action.payload.uuid)
      state.safe_users = [action.payload, ...filterCurrentUser([...(state.safe_users || [])], action.payload.uuid)]
    },
  },
})

export const { initAlert, alertPending, alertNotSafe, alertSafe } = alertSlice.actions

export default alertSlice.reducer
