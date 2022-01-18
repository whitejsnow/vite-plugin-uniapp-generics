/**
 * @Author: maxizhang
 * @Date: 2022-01-16 17:40:33
 * @FilePath: /vite-plugin-uniapp-generics/src/types/index.d.ts
 * @Description: 
 */

export interface PropsFilter {
    rule: RegExp,
    cb: Function
}

export interface Node {
    
}

export interface WxComponentFileJson {
    usingComponents?: Record<string, string>,
    componentGenerics?: Record<string, boolean>,
}