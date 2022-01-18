/**
 * @Author: maxizhang
 * @Date: 2022-01-17 16:16:30
 * @FilePath: /vite-plugin-uniapp-generics/src/utils/post.ts
 * @Description: 
 */

import {WxComponentFileJson} from './../types'
import {
    GENERIC_COMBINE_KEY,
    TEST_IS_WXML,
} from './../constant';

import {
    getCombineChildReg,
    getFatherGenericComReg,
    getCombineFatherUnqpropStr,
    getFatherGeneticPropStr,
} from './index';

import {
    getCombineCache,
} from './combine-component-cache';

const CACHE_BUNDLE = {};
 // 给父json文件添加 componentGenerics依赖，并且重新生成json文件 
function updateFatherJson({jsonFileName, bundle, arrGenricRes, ctx}){
    let jsonObj: WxComponentFileJson = {};
    const jsonChunkInfo = bundle[jsonFileName];
    if (jsonChunkInfo) {
        jsonObj = JSON.parse(jsonChunkInfo?.source);
    } else {
        // 热更新的时候，可能没有 jsonChunkInfo 的信息，因此要读取上一次的缓存数据处理
        jsonObj = JSON.parse(
            CACHE_BUNDLE[jsonFileName]
        );
    }
    if (!jsonObj.componentGenerics) {
        jsonObj.componentGenerics = {};
    }
    arrGenricRes.forEach((res) => {
        const genericKey: string = res[1];
        // 热更新的时候 json文件里的 componentGenerics会存在老的数据，一键直接清componentGenerics可能会有其他隐患，暂时先不处理
        jsonObj.componentGenerics[genericKey] = true;
    });

    const jsonStr = JSON.stringify(jsonObj, null, 2);
    CACHE_BUNDLE[jsonFileName] = jsonStr; // 更新缓存
    if (jsonChunkInfo) {
        jsonChunkInfo.source = jsonStr;
    } else {
        // 无jsonChunkInfo的时候，需要重新创建json文件
        ctx.emitFile({
            fileName: jsonFileName,
            type: 'asset',
            source: jsonStr,
        });
    }
}
 

export function cleanComponent(ctx, bundle){
    const CACHE_GENERIC_COMBINE = getCombineCache();
    const fatherGenericPropStr = getFatherGeneticPropStr();
    Object.keys(bundle).forEach((fileName) => {
        const chunkInfo = bundle[fileName];
        // console.log('chunkInfo', chunkInfo);
        // console.log('fileName', fileName);
        if (TEST_IS_WXML.test(fileName)) {
            // 处理组合组件
            Object.keys(CACHE_GENERIC_COMBINE).forEach((unqid) => {
                if (chunkInfo.source.indexOf(unqid) !== -1) {
                    // 通过 unqid 匹配
                    const cacheObj = CACHE_GENERIC_COMBINE[unqid];
                    // 去掉组合组件中新增的临时节点
                    const reg = getCombineChildReg();
                    const res = chunkInfo.source.match(reg);
                    chunkInfo.source = chunkInfo.source.replace(res[0],'');
                    // 去掉组合组件里父节点的unqid，并且增加 generic:child="ceshiGeneticCom" ，切 ceshiGeneticCom 要从驼峰转成中划线
                    const fatherGenericSym = cacheObj.genericInfos
                        .map(
                            (info) => `${GENERIC_COMBINE_KEY}${info.formatGenricKey}="${info.formatSonCompName}"`
                        )
                        .join(' ');
                    chunkInfo.source = chunkInfo.source.replace(
                        getCombineFatherUnqpropStr(unqid),
                        fatherGenericSym
                    );
                }
            });
            
            if ( chunkInfo.source.indexOf(fatherGenericPropStr) !== -1) {
                // 处理父组件里的generic组件
                //  <mmGeneric generic u-i="com-generic-id"  /> => <mmGeneric  />
                const reg = getFatherGenericComReg(fatherGenericPropStr,'g');
                const arrGenricRes:Array<Array<string>> = [
                    ...chunkInfo.source.matchAll(reg),
                ];
                
                // 去掉临时记录的generic key
                chunkInfo.source = chunkInfo.source.replace(new RegExp(fatherGenericPropStr, 'g'),'');
                const jsonFileName = fileName.replace('.wxml','.json');
                
                // 找到father的json文件，新增generic的依赖
                updateFatherJson({jsonFileName, bundle, arrGenricRes, ctx})
            }
        }
    });
}