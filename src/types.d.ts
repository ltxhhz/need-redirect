export type FilterType = 'hostWildcard' | 'urlWildcard' | 'regexp'
export interface Filter {
  id: number
  type: FilterType
  detail: string
  preProcessType?: FilterType
  preProcessDetail?: string
}

export type Profile = {
  name: string
  filters: Filter[]
  count: number
} & {
  type: 'searchParams'
  key: string
  base64: boolean
}
