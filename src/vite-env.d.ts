/// <reference types="vite/client" />
// declare interface IntrinsicAttributes {
//   title: string
// }
// declare global {
//   namespace JSX {
//     export interface IntrinsicAttributes {
//       title: string
//     }
//   }
// }
// declare namespace JSX {
//   interface IntrinsicAttributes {
//     title: string
//   }
// }

import { HTMLAttributes } from 'vue'

declare module 'vue' {
  export interface AllowedComponentProps extends HTMLAttributes {}
}


export {}