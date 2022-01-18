/**
 * @Description: vite plugin的配置说明
 * @Author: maxizhang
 * @FilePath: /vite-plugin-uniapp-generics/vite-plugin-doc.js
 */

import {
  parseVue,
} from '@dcloudio/uni-cli-shared';

// uniapp https://ask.dcloud.net.cn/article/35408
// vite https://cn.vitejs.dev/guide/api-plugin.html#simple-examples
// rollup https://chenshenhai.github.io/rollupjs-note/note/chapter05/01.html
//  文件输入钩子
//  https://rollupjs.org/guide/en/#build-hooks
//  文件输出钩子
//  https://rollupjs.org/guide/en/#output-generation-hooks
//  插件的一些方法
//  https://rollupjs.org/guide/en/#plugin-context

/*
  钩子调用顺序
  以下钩子在服务器启动时被调用：

  options
  buildStart
  以下钩子会在每个传入模块请求时被调用：

  resolveId
  load
  transform
  以下钩子在服务器关闭时被调用：

  buildEnd
  closeBundle
*/


const genericPlugin = () => {
  let config = '';
  // 注意，在开发环境下，command 的值为 serve（在 CLI 中，vite 和 vite dev 是 vite serve 的别名）。
  return {
    name: 'vite-plugin-generic',
    // apply: 'build', // 或 'serve' 默认情况下插件在开发（serve）和构建（build）模式中都会调用
    enforce: 'post',  // 可以改变调用顺序 pre post
    /* vite plugins 的执行顺序
      Alias
      带有 enforce: 'pre' 的用户插件
      Vite 核心插件
      没有 enforce 值的用户插件
      Vite 构建用的插件
      带有 enforce: 'post' 的用户插件
      Vite 后置构建插件（最小化，manifest，报告）
    */
    config(config, { command }) {
      // 在解析 Vite 配置前调用。钩子接收原始用户配置（命令行选项指定的会与配置文件合并）和一个描述配置环境的变量，包含正在使用的 mode 和 command。
      // 它可以返回一个将被深度合并到现有配置中的部分配置对象，或者直接改变配置（如果默认的合并不能达到预期的结果
      // console.log('maxi config', config);
      // if (command === 'build') {
      //   config.root = __dirname;
      // }
    },
    configResolved(resolvedConfig) {
      // 在解析 Vite 配置后调用。使用这个钩子读取和存储最终解析的配置。当插件需要根据运行的命令做一些不同的事情时，它也很有用。
      config = resolvedConfig;
    },
    // handleHotUpdate(ctx) {
    //   const { file } = ctx;
    // },
    // 在其他钩子中使用存储的配置
    transform(code, id, ...args) {
      // console.log('maxi code', code);
      // console.log('maxi id', id);
      // console.log('maxi args', args);

      if (config.command === 'serve') {
        // dev: 由开发服务器调用的插件
      } else {
        // build: 由 Rollup 调用的插件
      }
    },
    moduleParsed(node) {  // 可以拿到as结构，但是还是打包前的文件
      // console.log('maxi moduleParsed node', node.id);
      // debugger;
    },
    buildEnd(...args) {
      // console.log('maxi args', args);
    },
    renderStart(outputOptions, inputOptions) {
      // console.log('maxi outputOptions, inputOptions', outputOptions, inputOptions);
      // debugger;
    },
    augmentChunkHash(chunkInfo) {
      // console.log('maxi chunkInfo', chunkInfo.name);
    },
    renderChunk(code, chunk, outputOptions) {
      // console.log('maxi renderChunk', chunk.name);
      // debugger;
    },
    resolveFileUrl({ chunkId, fileName, format, moduleId, referenceId, relativePath }) {
      // Allows to customize how Rollup resolves URLs of files that were emitted by plugins via this.emitFile.
      // console.log('maxi resolveFileUrl', fileName);
    },
    generateBundle(outputOptions, bundle, isWrite) {
      // console.log('maxi args', Object.keys(bundle));
      // debugger;()
      // Object.keys(bundle).forEach((fileName) => {
      //   const chunkInfo = bundle[fileName];
      //   console.log('chunkInfo', chunkInfo);
      //   console.log('fileName', fileName);
      //   if (chunkInfo.modules) {
      //     Object.keys(chunkInfo.modules).forEach((modulesName) => {
      //       if (/.vue$/.test(modulesName)) {
      //         const modueInfo = this.getModuleInfo(modulesName);
      //         console.log(modueInfo);
      //       }
      //     });
      //   }
      //   debugger;
      // });
    },
    writeBundle(outputOptions, bundle) {
      // console.log('maxi writeBundle', Object.keys(bundle));
    },

  };
};

export const preloader = () => {
  const config = '';
  return {
    name: 'vite-plugin-pre-generic',
    enforce: 'pre',
    config(config, { command }) {
      // console.log('config', config);
      // debugger;
    },
    moduleParsed(node) {  // 可以拿到as结构，但是还是打包前的文件，并且拿不到template结构。
      // console.log('maxi moduleParsed node ast', JSON.stringify(node.ast));
      // console.log('maxi moduleParsed node id', node.id);
      // debugger;
    },
    load(id, code) {
      // console.log('maxi load id', id);
    },
    transform(code, id) { // 可以拿到最初始的code，并且没有经过其他加工
      // console.log('maxi transform code', code);
      console.log('maxi transform id', id);
      const errors = [];
      if (id.indexOf('.vue') !== -1) {
        // debugger;
        // const ast = this.parse(code);  //VUE文件无法解析
        // const ast = parseVue(code, errors);
        // console.log('maxi transform ast', ast);
      }

      // debugger;
    },
    renderChunk(code, chunk, outputOptions) {  // 只拿到了js文件a
      // console.log('maxi renderChunk code', code);
      // console.log('maxi renderChunk chunk.name', chunk.name, chunk.fileName);
      // debugger;
    },
  };
};

export default genericPlugin;

