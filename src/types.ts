import * as t from 'io-ts'

export const filterType = t.union([t.literal('hostWildcard'), t.literal('urlWildcard'), t.literal('regexp')])
export type FilterType = t.TypeOf<typeof filterType>

export const getUrl = t.union([
  t.type({
    type: t.literal('searchParams'),
    base64: t.boolean,
    key: t.string
  }),
  t.type({
    type: t.literal('path'),
    base64: t.boolean,
    key: t.string
  })
])
export type GetUrl = t.TypeOf<typeof getUrl>

export const getUrlType = getUrl.types.map(e => e.props.type)
export type GetUrlType = GetUrl['type']

export const preProcessMethod = t.union([t.literal('addEventToA'), t.literal('replaceHref')])
export type PreProcessMethod = t.TypeOf<typeof preProcessMethod>

export const preProcess = t.intersection([
  t.type({
    // id: number
    preProcessType: filterType,
    preProcessDetail: t.string,
    preProcessMethod: preProcessMethod,
  }),
  t.partial({
    preProcessSelector: t.string
  })
])
export interface PreProcess extends t.TypeOf<typeof preProcess> {}

export const preProcessArray = t.type({
  preProcess: t.array(preProcess)
})

export interface preProcessArray extends t.TypeOf<typeof preProcessArray> {}

export const filterBase = t.type({
  id: t.number,
  type: filterType,
  detail: t.string,
  getUrl,
  count: t.number
})
export interface FilterBase extends t.TypeOf<typeof filterBase> {}

export const filter = t.intersection([filterBase, preProcessArray])
export type Filter = t.TypeOf<typeof filter>

export const filterTableRow = t.intersection([filter, preProcess])
export type FilterTableRow = t.TypeOf<typeof filterTableRow>

export const profileType = t.type({
  name: t.string,
  filters: t.array(filter)
})
export type Profile = t.TypeOf<typeof profileType>

export const profilesType = t.array(profileType)

export type Profiles = t.TypeOf<typeof profilesType>
