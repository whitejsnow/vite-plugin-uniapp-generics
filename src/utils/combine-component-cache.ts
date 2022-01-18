/**
 * @Author: maxizhang
 * @Date: 2022-01-10 16:44:48
 * @FilePath: /vite-plugin-uniapp-generics/src/utils/combine-component-cache.ts
 * @Description: 
 */

import {formatComponentName} from './index'

let CACHE_GENERIC_COMBINE = {};

export function addCombineCache(fatherCompID: string, { fullFilePath, fatherCompName, genericInfos }) {
   const formatName = formatComponentName(fatherCompName);
   genericInfos.forEach((info) => {
     const { sonCompName, genericKey } = info;
     info.formatSonCompName = formatComponentName(sonCompName);
     info.formatGenricKey = formatComponentName(genericKey);
   });
 
   CACHE_GENERIC_COMBINE[fatherCompID] = {
     fullFilePath, name: fatherCompName, formatName, genericInfos,
   };
 }
 
export function clearCombineCache() {
   CACHE_GENERIC_COMBINE = {};
}

export function getCombineCache(){
    return CACHE_GENERIC_COMBINE
}
 