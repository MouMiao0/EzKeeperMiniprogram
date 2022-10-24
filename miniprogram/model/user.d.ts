export interface IUser{
  userName: string
  emil?: string
  phone?: number
  time?: Date
}

export interface IUserToken{
  userName?: string
  emil?: string
  phone?: number
  pw?: string
  code?: string
  token?: string
}