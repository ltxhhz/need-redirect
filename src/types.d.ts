export type FilterType = 'hostWildcard' | 'urlWildcard' | 'regexp'

export type PreProcessMethod = 'addEventToA' | 'replaceHref'
export interface PreProcess {
  preProcessType?: FilterType
  preProcessDetail?: string
  preProcessMethod: PreProcessMethod
}

export interface FilterBase {
  id: number
  type: FilterType
  detail: string
}

export type Filter = FilterBase & PreProcess

export type Profile = {
  name: string
  filters: Filter[]
  count: number
} & {
  type: 'searchParams'
  key: string
  base64: boolean
}
