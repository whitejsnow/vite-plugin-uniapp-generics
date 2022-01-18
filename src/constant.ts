/**
 * @Author: maxizhang
 * @Date: 2022-01-10 11:46:06
 * @FilePath: /vite-plugin-uniapp-generics/src/constant.js
 * @Description:
 */
import { v4 as uuidv4 } from 'uuid';

export const GENERIC_SLOT_KEY = 'generic';
export const GENERIC_COMBINE_KEY = 'generic:';
export const TEST_IS_PURE_VUE = /.\.vue$/i;
export const TEST_IS_COMBINE_GENERIC = /generic:[A-Za-z0-9]+$/; // 匹配 generic:xxx
export const TEST_IS_FATHER_GENERIC = /^generic$/; // 匹配 generic
export const TEST_IS_WXML = /(.wxml)$/i;
export const SPEC_COMP_ID_KEY = 'u-i';
export const COMP_ID_COMB_TEMP_SON = `generic-comb-temp-cid-${uuidv4()}`;  // 组合组件里新增临时的子component标识
export const COMP_PRE_COMB_FATHERCOMP = 'generic-comb-temp-fid-'; // 组合组件里新增临时的子component标识
export const COMP_ID_FATHER_GENERICCOMP = `generic-father-temp-gid-${uuidv4()}`; // 父组件里笔记插入genric组件的id
export const MID_PROPS_REG_STR = '[A-Za-z0-9\\s:\\-_={}."]'; // 数字、字母。空格、-、_、=、{、}、."
