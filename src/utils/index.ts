/**
 * @Author:
 * @Date: 2022-01-10 11:46:30
 * @FilePath: /vite-plugin-uniapp-generics/src/utils/index.ts
 * @Description:
 */
import { v4 as uuidv4 } from 'uuid';
import {PropsFilter} from '../types'

import {
    GENERIC_COMBINE_KEY,
    SPEC_COMP_ID_KEY,
    COMP_ID_COMB_TEMP_SON,
    COMP_PRE_COMB_FATHERCOMP,
    COMP_ID_FATHER_GENERICCOMP,
    MID_PROPS_REG_STR,
} from '../constant';

export function getCombineGenericKey(key: string): string {
    // 组合：<ceshiGenetic generic:child="ceshiGeneticCom">
    return key.replace(GENERIC_COMBINE_KEY, '');
}

// 生成并返回uuid里的名字
export function getCombineFatherUUID(): string {
    return COMP_PRE_COMB_FATHERCOMP + uuidv4();
}
// 基本的结构中过滤出template的ast，减少后面的渲染次数
export function getTemplateFromBaseAst(ast) {
    if (ast?.children.length) {
        const resMap = ast.children.filter((node) => node.tag === 'template');
        return resMap[0];
    }
    return null;
}

export function getCombineChildTempComp(componentChildName: string): string {
    return `<${componentChildName} ${SPEC_COMP_ID_KEY}="${COMP_ID_COMB_TEMP_SON}" />`;
}

export function getCombineChildReg(): RegExp {
    const reg = new RegExp(
        `<[A-Za-z0-9\\s:\\-_=]+"${COMP_ID_COMB_TEMP_SON}"${MID_PROPS_REG_STR}*/>`
    );
    return reg;
}
export function getFatherGenericComReg(str: string, opts: string) : RegExp {
    const reg = new RegExp(
        `<([a-z0-9A-Z\\-_]+)\\s${MID_PROPS_REG_STR}*(${str})`,
        opts
    );
    return reg;
}

export function getCombineFatherUnqpropStr(fatherCompID: string) {
    return `${SPEC_COMP_ID_KEY}="${fatherCompID}"`;
}

export function getFatherGeneticPropStr(): string {
    return `${SPEC_COMP_ID_KEY}="${COMP_ID_FATHER_GENERICCOMP}"`;
}

export function getGenericNodeBypRrops(node, filter: PropsFilter): void {
    if (node.props?.length) {
        const targetProps: Object[] = [];
        const { rule, cb } = filter;
        node.props.forEach((prop) => {
            const match = rule.exec(prop.name);
            if (match) {
                targetProps.push({ prop, match });
            }
        });
        if (targetProps.length) {
            cb({ node, targetProps });
        }
    }
    if (node.children?.length) {
        node.children.forEach((childNode) => {
            childNode && getGenericNodeBypRrops(childNode, filter);
        });
    }
}

// 驼峰转成中划线分割
export function formatComponentName(name: string): string {
    return name
        .replace(/([A-Z])/g, '-$1')
        .toLowerCase()
        .replace(/^-/, '');
}
