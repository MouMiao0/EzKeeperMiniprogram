import { IBillCategory } from "./billCategory";

export interface IBill{
  id: number
  userCustom?: boolean
  categoryId: number
  number?: number
  time?: string
  note?: string
  category?: IBillCategory
}