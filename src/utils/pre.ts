/**
 * @Author: maxizhang
 * @Date: 2022-01-17 16:15:25
 * @FilePath: /vite-plugin-uniapp-generics/src/utils/pre.ts
 * @Description: 
 */
import {
    TEST_IS_COMBINE_GENERIC,
    TEST_IS_FATHER_GENERIC,
} from './../constant';

import {
    getCombineGenericKey,
    getCombineFatherUUID,
    getCombineChildTempComp,
    getCombineFatherUnqpropStr,
    getFatherGeneticPropStr,
    getGenericNodeBypRrops,
} from './index';

import {
    addCombineCache,
} from './combine-component-cache';


// 父: <child generic :index="index" :name="'maxi'+val" />
export function rewriteFcompGenericSym(templateAst, codeObj){
    getGenericNodeBypRrops(templateAst, {
        rule: TEST_IS_FATHER_GENERIC,
        cb: ({ targetProps }) => {
            // 转换 generic => uniapp中白名单的props，防止编译过程中被uniapp转换
            const propSymidStr = getFatherGeneticPropStr();
            const targetProp = targetProps[0];  // 只需匹配首个就好，重复key无需理会
            codeObj.overwrite(
                targetProp.prop.loc.start.offset,
                targetProp.prop.loc.end.offset,
                propSymidStr
            );
        },
    });
}

// 组合：<ceshiGenetic generic:child="ceshiGeneticCom">
export function rewriteCcompGeneric(id, templateAst, codeObj) {
    getGenericNodeBypRrops(templateAst, {
        rule: TEST_IS_COMBINE_GENERIC,
        cb: ({ node, targetProps }) => {
            // console.log('maxi transform id', id);
            const fatherCompID = getCombineFatherUUID();
            const genericInfos: Object[] = [];  // 记录调用父node中的genric key和对应component入参
            
            // 处理一个node中的所有generic props
            targetProps.forEach((targetProp) => {
                // 获取generic:key="componentName"中的 key
                const genericKey = getCombineGenericKey(targetProp.prop.name); 
                // 获取generic:key="componentName"中的 componentName
                const componentChildName = targetProp.prop.value.content;
                // 记录引用关系，
                genericInfos.push({
                    genericKey,
                    sonCompName: componentChildName,
                });
                // 因为genric:"compoentName"这种方式所引用的组件并不会被认可为实际引用（如果其他文件也没用到这个引用的组件 此组件不会生成编译出对应的wxcomponent文件），所以通过实际创建真实compoents的方式去处理。
                // 并且此临时创建的文件会被删除
                const endChild = templateAst.children.length - 1;
                codeObj.appendRight(
                    templateAst.children[endChild].loc.end.offset,
                    getCombineChildTempComp(componentChildName)
                );
            });

            // 给父组件添加唯一id
            codeObj.appendRight(
                node.loc.start.offset + node.tag.length + 2,
                `${getCombineFatherUnqpropStr(fatherCompID)} `
            );

            // 用父组件唯一id为key，记录其props入参等
            addCombineCache(fatherCompID, {
                fullFilePath: id,
                fatherCompName: node.tag,
                genericInfos,
            });

        },
    });
}