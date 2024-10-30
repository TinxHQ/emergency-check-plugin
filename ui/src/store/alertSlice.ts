import { createSlice, PayloadAction } from '@reduxjs/toolkit'

const initialState: any = { }

export const alertSlice = createSlice({
  name: 'alert',
  initialState,
  reducers: {
    initAlert: (state, action: PayloadAction) => {
      return {
        ...state,
        ...action.payload,
      }
    },
  },
})

export const { initAlert } = alertSlice.actions

export default alertSlice.reducer
