import { create } from 'zustand'
type AuthFormType = 'login' | 'signup' | 'otp'

interface AuthFormState {
  formType: AuthFormType
  initialData: Record<string, string>
  setFormType: (type: AuthFormType) => void
}

const initialState = {
  formType: 'login' as AuthFormType,
  initialData: {},
}
export const useAuthForm = create<AuthFormState>((set) => ({
  ...initialState,
  setFormType: (type) => set({ formType: type }),
}))
