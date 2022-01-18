<!--
 * @Author: maxizhang
 * @Date: 2022-01-10 21:15:19
 * @FilePath: /github-vite-plugin-uniapp-generics/readme.md
 * @Description: 
-->
## how to use
### install
- 仅支持`uni-cli 3.0+`
```
$ npm i vite-plugin-uniapp-generics -D
```
- `vite.config.js` 添加插件
```
import uni from '@dcloudio/vite-plugin-uni';
import generic from 'vite-plugin-uniapp-generics';
export default defineConfig({
  ...
  plugins: [
    uni(),
    generic(),
  ],
});
```

### 父组件（定义抽象节点）
#### 说明
- 在自定义的component下添加`generic`标识即可
```
<自定义component名 generic />
```
#### demo
```
<!-- father-generic.vue -->
<template>
    <view class="content">
        <view>generic</view>
        <view v-for="(val, index) in list" :key="index">
            <beforeGeneric generic :index="index" :name="'myname-'+val" @tapInside="handleTap" />
        </view>

        <afterGeneric generic="true" :age="21" name="myname-after" />
        <!-- 仅会验证generic参数，后面添加任意参数都不影响-->
    </view>
</template>
```

### 组合组件（使用抽象节点）
#### 说明
- 在父组件中通过`generic:`传入对应的generic标识和需要传入的组件
- 遵循小程序中的写法限制，仅允许传入自定义组件。
```
<父组件名 
    generic:对应的generic组件名A="传入的子组件" 
    generic:对应的generic组件名B="传入的子组件" 
></父组件名>
```

#### demo
```
<!-- combine-generic.vue -->
<template>
	<view class="content">
        <view>***** generic ***** </view>
        <ceshiGenetic 
            generic:beforeGeneric="childComp1" 
            generic:afterGeneric="childComp2"
        ></ceshiGenetic>
        <view>***** end slot ***** </view>
	</view>
</template>

<script>
import childComp1 from '...';
import childComp2 from '...';

export default {
  components: {
    childComp1,
    childComp2,
  },
}
</script>
```
## why to use
### slot在小程序中的限制
1. `v-for`中使用`slot`会怎样？
- 仅会渲染出`v-for`中的首条内容，后面的子组件不会被渲染。

2. `slot`并不支持`v-for` [需求：更强大的slot](https://developers.weixin.qq.com/community/develop/doc/000ec0688e466071b858fed7f56c00)
> slot 本身应该是属于父组件的一部分，它能使用的数据是父组件数据而不是子组件数据。如果要定制子组件的“某些部分”的话，应该不是使用 slot，而是使用抽象节点吧：https://developers.weixin.qq.com/miniprogram/dev/framework/custom-component/generics.html

3. `slot`不支持父组件传递数据
- 这个目前`uniapp`和`taro`都是静态编译的时候劫持数据，并在运行时结合`vue3`的响应式更新机制解决。
### taro3为什么可以结合`v-for`用`slot`
- 推断`taro3`中是结合wxs动态的生成`wxml`文件，因此对`wxml`文件来说，`slot`结构可以平铺输出，处理遍历`slot`导致的问题（未看源码验证）
- 但这种设计可能会导致`wxml`需要频繁的重新生成，造成一定的性能问题和意料之外的`bug`。

## 插件实现原理
### 原理
1. 结合[抽象节点](https://developers.weixin.qq.com/miniprogram/dev/framework/custom-component/generics.html)的使用说明，抽象出适合`vue`的写法（参考上方使用说明）
2. `uniapp`里的节点属性，除了白名单中的组件和白名单的`props`，其余都会被劫持到`vue`的运行时数据处理中，导致属性失效，因此需要在编译前通过白名单`prop`添加标识，文件输出阶段结合标识重组成微信小程序所需结构即可。

### generic 入参限制

使用是相对遵循小程序原生写法，因此在组合组件的时候，`generic`入参仅支持传组件名，所以不能再组合组件的位置给`generic`组件入参。举个例子

- slot 可以在组合组件/父组件定义位置入参
```
    // compA.vue 定义 slot，并且传入参数
    <view>
        <slot name="header" height="180" />
    </view>

    // 组合组件 中 可以给 slot 入参
    <compA>
        <template #header="{ height }">
            <childComp age="10" :height="height" />
        </template>
    </compA>
```
- generic 只能在 定义组件的位置入参
```
    // compB.vue 定义 generic，并且传入参数
    <view>
        <genericB :age="21" name="myname-after" />
    </view>

    // 组合组件 中, 不能给传入 generic 的组件入参
    <compB 
        generic:genericB="childComp" 
    ></compB>
```


## todo
- 替换 `u-i` 为专用节点
- 其他小程序中的验证
- sourcemap https://rollupjs.org/guide/en/#source-code-transformations
- hbuilder 支持

