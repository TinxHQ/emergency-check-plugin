import { configureStore } from '@reduxjs/toolkit'
import { alertSlice } from './alertSlice'

export default configureStore({
  reducer: {
    alert: alertSlice.reducer,
  },
})
