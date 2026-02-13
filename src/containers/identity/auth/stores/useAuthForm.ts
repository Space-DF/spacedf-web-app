import { create } from 'zustand'
type AuthFormType =
  | 'signIn'
  | 'signUp'
  | 'otp'
  | 'forgotPassword'
  | 'createNewPassword'
  | 'resetPasswordSuccessful'

interface AuthFormState {
  formType: AuthFormType
  initialData: Record<string, string>
  setFormType: (type: AuthFormType) => void
}

const initialState = {
  formType: 'signIn' as AuthFormType,
  initialData: {},
}
export const useAuthForm = create<AuthFormState>((set) => ({
  ...initialState,
  setFormType: (type) => set({ formType: type }),
}))
