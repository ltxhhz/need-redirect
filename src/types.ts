import * as t from 'io-ts'

export const filterType = t.union([t.literal('hostWildcard'), t.literal('urlWildcard'), t.literal('regexp')])
export type FilterType = t.TypeOf<typeof filterType>

export const preProcessMethod = t.union([t.literal('addEventToA'), t.literal('replaceHref')])
export type PreProcessMethod = t.TypeOf<typeof preProcessMethod>

export const preProcess = t.type({
  // id: number
  preProcessType: filterType,
  preProcessDetail: t.string,
  preProcessMethod: preProcessMethod
})
export interface PreProcess extends t.TypeOf<typeof preProcess> {}

export const preProcessArray = t.type({
  preProcess: t.array(preProcess)
})

export interface preProcessArray extends t.TypeOf<typeof preProcessArray> {}

export const filterBase = t.type({
  id: t.number,
  type: filterType,
  detail: t.string
})
export interface FilterBase extends t.TypeOf<typeof filterBase> {}

export const filter = t.intersection([filterBase, preProcessArray])
export type Filter = t.TypeOf<typeof filter>

export const filterTableRow = t.intersection([filter, preProcess])
export type FilterTableRow = t.TypeOf<typeof filterTableRow>

export const profileType = t.intersection([
  t.type({
    name: t.string,
    filters: t.array(filter),
    count: t.number
  }),
  t.type({
    type: t.literal('searchParams'),
    key: t.string,
    base64: t.boolean
  })
])
export type Profile = t.TypeOf<typeof profileType>

export const profilesType = t.array(profileType)

export type Profiles = t.TypeOf<typeof profilesType>