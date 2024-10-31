import { SpaceUser } from '@/types/common'

const users: SpaceUser[] = [
  {
    email: 'kinh.bach@digitalfortress.dev',
    // firstName: "Kinh",
    // lastName: "Bach",
    id: 1,
  },
  {
    email: 'kinhdev24@gmail.com',
    // firstName: "Kinh",
    // lastName: "Bach",
    id: 2,
  },
]

export const getUserByEmail = (email?: string) =>
  users.find((user) => user.email === email)
