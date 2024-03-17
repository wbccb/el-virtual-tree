# vue2-虚拟树

可以理解为：将`<el-tree>`源码全部复制过来，然后加以改造，集成对应的虚拟Tree相关功能，对外的功能保持完全不变，可以快速移植替换`<el-tree>`，无须更改外部的逻辑代码

## 开发规划
### 项目目标
-[ ] 实现虚拟Tree的功能，能够在大数据下实现快速渲染和流畅交互
-[ ] 完全模仿el-tree的属性与事件，包括单选、多选、父子联动等
-[ ] 完全模仿el-tree的样式，尽可能复制使用el-tree的相关样式
-[ ] 考虑拖拽排序相关功能的集成

### 前期依赖
1. 依赖虚拟列表第三方库，后期进行自我实现
2. 依赖拖拽排序第三方库，后期进行自我实现


### 开发流程

1. 集成V1版本，在V1版本基础上参照`<el-tree>`进行内部数据结构的改造
2. 完成checkbox相关功能的集成
3. 完成异步加载相关功能的集成
4. 完成拖拽排序相关功能的集成
5. 完成`<el-tree>`单元测试的覆盖 
6. 集成vue2版本逻辑到vue3文件夹中


## 源码说明

### 文件介绍
- `el-virtual-tree.vue`: 虚拟Tree的最外层组件，持有this.store(VirtualTreeStore数据管理类)，负责对各种事件进行处理，包括对`el-virtual-tree-node.vue`所emit出来的事件进行处理
- `el-virtual-tree-node.vue`: 渲染UI，没有过多逻辑，直接单纯对每一个数据item进行渲染
- `virtual-tree-store.js`：数据管理类，持有this.root（哨兵节点），使用this.root对数据进行更新，也负责一些VirtualNode数据的直接更新
- `virtual-node.js`：每一个数据item就是一个VirtualNode数据，除了从后台拿到的data数据之外，还增加了一些属性，比如level等


## 集成说明

依赖第三方库虚拟列表库，需要手动安装

```shell
npm install --save vue-virtual-scroller@1.1.2
```



将整个`el-virtual-tree`复制到自己项目中，直接`import`相关组件进行使用