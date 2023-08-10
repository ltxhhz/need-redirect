
export interface Filter {
  id: number
  type: 'wildcard' | 'regexp'
  detail: string
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
