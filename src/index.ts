import { parseVue } from '@dcloudio/uni-cli-shared';
import MagicString from 'magic-string';
import {cleanComponent} from './utils/post'
import {rewriteFcompGenericSym, rewriteCcompGeneric} from './utils/pre'
import {
    GENERIC_SLOT_KEY,
    TEST_IS_PURE_VUE,
} from './constant';

import {
    getTemplateFromBaseAst,
} from './utils';

import {
    clearCombineCache,
} from './utils/combine-component-cache';

const genericPlugin = () => {
    let platform = '';
    return [
        {
            name: 'vite-plugin-pre-generics',
            enforce: 'pre', // 需要在头部执行，才能获取到未被转义的原始文件
            configResolved(config) {
                platform = config.define['process.env.UNI_PLATFORM'].replace(/\"/g, '')
            },
            transform(code, id) {
                // 可以拿到最初始的code，并且没有经过其他加工
                const errors = [];
                if (
                    TEST_IS_PURE_VUE.test(id) &&
                    code.indexOf(GENERIC_SLOT_KEY) !== -1
                ) {
                    // 是VUE组件且code中包含了generic才处理

                    const codeObj = new MagicString(code);
                    const ast = parseVue(code, errors);
                    const templateAst = getTemplateFromBaseAst(ast);

                    // 处理父组件的 generic 标识
                    // 父: <child generic :index="index" :name="'maxi'+val" /> => <child u-i="generic-common-id" :index="index" :name="'maxi'+val" />
                    rewriteFcompGenericSym(templateAst, codeObj);

                    // 处理组合组件的 generic 
                    // 组合：<ceshiGenetic generic:child="ceshiGeneticCom">  => <ceshiGenetic u-i="generic-unq-id">
                    rewriteCcompGeneric(id, templateAst, codeObj)
                    return {
                        code: codeObj.toString(),
                    };
                }
            },
        },
        {
            name: 'vite-plugin-end-generics',
            enforce: 'post', // 需要在尾部执行，才能拿到完整的文件列表
            generateBundle(outputOptions, bundle, isWrite) {
                // purpose
                // 组合：<ceshiGenetic generic:child="ceshiGeneticCom" generic:after="ceshiGeneticCom"></ceshiGenetic>
                //  删掉添加的 comp
                //  添加 generic
                // 父：<child generic :index="index" :name="'maxi'+val" /><after generic/>
                //  添加json属性
                //  添加generic
                
                // 清理genric的组件，组合成最终输出的要求
                // TODO 在post的transform中修改？
                cleanComponent(this, bundle, platform)
                
                // 删除本次构建存储的genric组件map
                clearCombineCache();
            },
        },
    ];
};

export default genericPlugin;
