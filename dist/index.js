'use strict';

var uniCliShared = require('@dcloudio/uni-cli-shared');
var MagicString = require('magic-string');
var uuid = require('uuid');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var MagicString__default = /*#__PURE__*/_interopDefaultLegacy(MagicString);

const GENERIC_SLOT_KEY = 'generic';
const GENERIC_COMBINE_KEY = 'generic:';
const TEST_IS_PURE_VUE = /.\.vue$/i;
const TEST_IS_COMBINE_GENERIC = /generic:[A-Za-z0-9]+$/;
const TEST_IS_FATHER_GENERIC = /^generic$/;
const SPEC_COMP_ID_KEY = 'u-i';
const COMP_ID_COMB_TEMP_SON = `generic-comb-temp-cid-${uuid.v4()}`;
const COMP_PRE_COMB_FATHERCOMP = 'generic-comb-temp-fid-';
const COMP_ID_FATHER_GENERICCOMP = `generic-father-temp-gid-${uuid.v4()}`;
const MID_PROPS_REG_STR = '[A-Za-z0-9\\s:\\-_={}."]';
const TEMPLATE_EXTNAME = {
    'mp-weixin': '.wxml',
    'mp-qq': '.qml',
    'mp-baidu': '.swan',
    'mp-kuaishou': '.ksml',
};

function getCombineGenericKey(key) {
    return key.replace(GENERIC_COMBINE_KEY, '');
}
function getCombineFatherUUID() {
    return COMP_PRE_COMB_FATHERCOMP + uuid.v4();
}
function getTemplateFromBaseAst(ast) {
    if (ast === null || ast === void 0 ? void 0 : ast.children.length) {
        const resMap = ast.children.filter((node) => node.tag === 'template');
        return resMap[0];
    }
    return null;
}
function getCombineChildTempComp(componentChildName) {
    return `<${componentChildName} ${SPEC_COMP_ID_KEY}="${COMP_ID_COMB_TEMP_SON}" />`;
}
function getTemplateExtnameReg(platform) {
    const reg = new RegExp(`(${TEMPLATE_EXTNAME[platform]})$`, "i");
    return reg;
}
function getCombineChildReg() {
    const reg = new RegExp(`<[A-Za-z0-9\\s:\\-_=]+"${COMP_ID_COMB_TEMP_SON}"${MID_PROPS_REG_STR}*/>`, 'g');
    return reg;
}
function getFatherGenericComReg(str, opts) {
    const reg = new RegExp(`<([a-z0-9A-Z\\-_]+)\\s${MID_PROPS_REG_STR}*(${str})`, opts);
    return reg;
}
function getCombineFatherUnqpropStr(fatherCompID) {
    return `${SPEC_COMP_ID_KEY}="${fatherCompID}"`;
}
function getFatherGeneticPropStr() {
    return `${SPEC_COMP_ID_KEY}="${COMP_ID_FATHER_GENERICCOMP}"`;
}
function getGenericNodeBypRrops(node, filter) {
    var _a, _b;
    if ((_a = node.props) === null || _a === void 0 ? void 0 : _a.length) {
        const targetProps = [];
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
    if ((_b = node.children) === null || _b === void 0 ? void 0 : _b.length) {
        node.children.forEach((childNode) => {
            childNode && getGenericNodeBypRrops(childNode, filter);
        });
    }
}
function formatComponentName(name) {
    return name
        .replace(/([A-Z])/g, '-$1')
        .toLowerCase()
        .replace(/^-/, '');
}

let CACHE_GENERIC_COMBINE = {};
function addCombineCache(fatherCompID, { fullFilePath, fatherCompName, genericInfos }) {
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
function clearCombineCache() {
    CACHE_GENERIC_COMBINE = {};
}
function getCombineCache() {
    return CACHE_GENERIC_COMBINE;
}

const CACHE_BUNDLE = {};
function updateFatherJson({ jsonFileName, bundle, arrGenricRes, ctx }) {
    let jsonObj = {};
    const jsonChunkInfo = bundle[jsonFileName];
    if (jsonChunkInfo) {
        jsonObj = JSON.parse(jsonChunkInfo === null || jsonChunkInfo === void 0 ? void 0 : jsonChunkInfo.source);
    }
    else {
        jsonObj = JSON.parse(CACHE_BUNDLE[jsonFileName]);
    }
    if (!jsonObj.componentGenerics) {
        jsonObj.componentGenerics = {};
    }
    arrGenricRes.forEach((res) => {
        const genericKey = res[1];
        jsonObj.componentGenerics[genericKey] = true;
    });
    const jsonStr = JSON.stringify(jsonObj, null, 2);
    CACHE_BUNDLE[jsonFileName] = jsonStr;
    if (jsonChunkInfo) {
        jsonChunkInfo.source = jsonStr;
    }
    else {
        ctx.emitFile({
            fileName: jsonFileName,
            type: 'asset',
            source: jsonStr,
        });
    }
}
function cleanComponent(ctx, bundle, platform) {
    const CACHE_GENERIC_COMBINE = getCombineCache();
    const fatherGenericPropStr = getFatherGeneticPropStr();
    const extName = TEMPLATE_EXTNAME[platform];
    Object.keys(bundle).forEach((fileName) => {
        const chunkInfo = bundle[fileName];
        if (getTemplateExtnameReg(platform).test(fileName)) {
            Object.keys(CACHE_GENERIC_COMBINE).forEach((unqid) => {
                if (chunkInfo.source.indexOf(unqid) !== -1) {
                    const cacheObj = CACHE_GENERIC_COMBINE[unqid];
                    const reg = getCombineChildReg();
                    const res = chunkInfo.source.match(reg);
                    res.forEach(element => {
                        chunkInfo.source = chunkInfo.source.replace(element, '');
                    });
                    const fatherGenericSym = cacheObj.genericInfos
                        .map((info) => `${GENERIC_COMBINE_KEY}${info.formatGenricKey}="${info.formatSonCompName}"`)
                        .join(' ');
                    chunkInfo.source = chunkInfo.source.replace(getCombineFatherUnqpropStr(unqid), fatherGenericSym);
                }
            });
            if (chunkInfo.source.indexOf(fatherGenericPropStr) !== -1) {
                const reg = getFatherGenericComReg(fatherGenericPropStr, 'g');
                const arrGenricRes = [
                    ...chunkInfo.source.matchAll(reg),
                ];
                chunkInfo.source = chunkInfo.source.replace(new RegExp(fatherGenericPropStr, 'g'), '');
                const jsonFileName = fileName.replace(extName, '.json');
                updateFatherJson({ jsonFileName, bundle, arrGenricRes, ctx });
            }
        }
    });
}

function rewriteFcompGenericSym(templateAst, codeObj) {
    getGenericNodeBypRrops(templateAst, {
        rule: TEST_IS_FATHER_GENERIC,
        cb: ({ targetProps }) => {
            const propSymidStr = getFatherGeneticPropStr();
            const targetProp = targetProps[0];
            codeObj.overwrite(targetProp.prop.loc.start.offset, targetProp.prop.loc.end.offset, propSymidStr);
        },
    });
}
function rewriteCcompGeneric(id, templateAst, codeObj) {
    getGenericNodeBypRrops(templateAst, {
        rule: TEST_IS_COMBINE_GENERIC,
        cb: ({ node, targetProps }) => {
            const fatherCompID = getCombineFatherUUID();
            const genericInfos = [];
            targetProps.forEach((targetProp) => {
                const genericKey = getCombineGenericKey(targetProp.prop.name);
                const componentChildName = targetProp.prop.value.content;
                genericInfos.push({
                    genericKey,
                    sonCompName: componentChildName,
                });
                const endChild = templateAst.children.length - 1;
                codeObj.appendRight(templateAst.children[endChild].loc.end.offset, getCombineChildTempComp(componentChildName));
            });
            codeObj.appendRight(node.loc.start.offset + node.tag.length + 2, `${getCombineFatherUnqpropStr(fatherCompID)} `);
            addCombineCache(fatherCompID, {
                fullFilePath: id,
                fatherCompName: node.tag,
                genericInfos,
            });
        },
    });
}

const genericPlugin = () => {
    let platform = '';
    return [
        {
            name: 'vite-plugin-pre-generics',
            enforce: 'pre',
            configResolved(config) {
                platform = config.define['process.env.UNI_PLATFORM'].replace(/\"/g, '');
            },
            transform(code, id) {
                const errors = [];
                if (TEST_IS_PURE_VUE.test(id) &&
                    code.indexOf(GENERIC_SLOT_KEY) !== -1) {
                    const codeObj = new MagicString__default["default"](code);
                    const ast = uniCliShared.parseVue(code, errors);
                    const templateAst = getTemplateFromBaseAst(ast);
                    rewriteFcompGenericSym(templateAst, codeObj);
                    rewriteCcompGeneric(id, templateAst, codeObj);
                    return {
                        code: codeObj.toString(),
                    };
                }
            },
        },
        {
            name: 'vite-plugin-end-generics',
            enforce: 'post',
            generateBundle(outputOptions, bundle, isWrite) {
                cleanComponent(this, bundle, platform);
                clearCombineCache();
            },
        },
    ];
};

module.exports = genericPlugin;
//# sourceMappingURL=index.js.map
