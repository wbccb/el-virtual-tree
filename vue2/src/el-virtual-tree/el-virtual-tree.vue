<template>
  <div
    class="el-tree"
    :class="{
      'el-tree--highlight-current': highlightCurrent,
      'is-dragging': !!dragState.draggingNode,
      'is-drop-not-allow': !dragState.allowDrop,
      'is-drop-inner': dragState.dropType === 'inner',
    }"
    role="tree"
  >
    <RecycleScroller
      ref="recycleScroller"
      class="scroller"
      id="scroller"
      :items="virtualList"
      :item-size="ITEM_HEIGHT"
      :key-field="nodeKey"
      :style="{height: treeHeight + 'px'}"
      v-slot="{item}"
      @resize="handleResize"
    >
      <el-virtual-tree-node
        :node="item"
        :props="props"
        :render-after-expand="renderAfterExpand"
        :show-checkbox="showCheckbox"
        :key="getNodeKey(item)"
        :render-content="renderContent"
        @handleExpandIconClick="(expanded) => handleExpandIconClick(expanded, item)"
      ></el-virtual-tree-node>
    </RecycleScroller>
    <div class="el-tree__empty-block" v-if="!virtualList || virtualList.length === 0">
      <slot name="empty">
        <span class="el-tree__empty-text">{{ emptyText }}</span>
      </slot>
    </div>
    <div
      v-show="dragState.showDropIndicator"
      class="el-tree__drop-indicator"
      ref="dropIndicator"
    ></div>
  </div>
</template>

<script>
import ElVirtualTreeNode from "./el-virtual-tree-node.vue";
import {ITEM_HEIGHT} from "./js/config.js";
import {RecycleScroller} from "vue-virtual-scroller";
import "vue-virtual-scroller/dist/vue-virtual-scroller.css";
import VirtualTreeStore from "@/el-virtual-tree/model/virtual-tree-store";
import {getNodeKey} from "@/el-virtual-tree/model/util";

export default {
  name: "ElVirtualTree",
  components: {
    ElVirtualTreeNode,
    RecycleScroller,
  },
  data() {
    return {
      currentNode: null,
      treeItems: null,
      checkboxItems: [],
      dragState: {
        showDropIndicator: false,
        draggingNode: null,
        dropNode: null,
        allowDrop: true,
      },
      ITEM_HEIGHT: ITEM_HEIGHT,
      virtualList: [],
    };
  },
  props: {
    data: {
      type: Array,
    },
    emptyText: {
      type: String,
      default() {
        return "暂无数据";
      },
    },
    renderAfterExpand: {
      type: Boolean,
      default: true,
    },
    nodeKey: String,
    checkStrictly: Boolean,
    defaultExpandAll: Boolean,
    expandOnClickNode: {
      type: Boolean,
      default: true,
    },
    checkOnClickNode: Boolean,
    checkDescendants: {
      type: Boolean,
      default: false,
    },
    autoExpandParent: {
      type: Boolean,
      default: true,
    },
    defaultCheckedKeys: Array,
    defaultExpandedKeys: Array,
    currentNodeKey: [String, Number],
    renderContent: Function,
    showCheckbox: {
      type: Boolean,
      default: false,
    },
    draggable: {
      type: Boolean,
      default: false,
    },
    allowDrag: Function,
    allowDrop: Function,
    props: {
      default() {
        return {
          children: "children",
          label: "label",
          disabled: "disabled",
        };
      },
    },
    lazy: {
      type: Boolean,
      default: false,
    },
    highlightCurrent: Boolean,
    load: Function,
    filterNodeMethod: Function,
    accordion: Boolean,
    indent: {
      type: Number,
      default: 18,
    },
    iconClass: String,
    treeHeight: {
      type: Number,
      default: 300,
    },
  },
  watch: {
    data(newValue) {
      this.store.setData(newValue);
    },
  },
  created() {
    this.isTree = true;
    // 将原始的树状数据转化为非响应式
    // 在原始树状基础上增加一些属性，包括level

    // 用TreeStore进行数据的管理【非响应式数据】
    this.store = new VirtualTreeStore({
      key: this.nodeKey,
      data: this.data,
      lazy: this.lazy,
      props: this.props,
      load: this.load,
      currentNodeKey: this.currentNodeKey,
      checkStrictly: this.checkStrictly,
      checkDescendants: this.checkDescendants,
      defaultCheckedKeys: this.defaultCheckedKeys,
      defaultExpandedKeys: this.defaultExpandedKeys,
      autoExpandParent: this.autoExpandParent,
      defaultExpandAll: this.defaultExpandAll,
      filterNodeMethod: this.filterNodeMethod,
    });

    // 每一个item包装成为一个Node.js，在原来的数据基础上增加新的属性，比如level等等，但是不改变原来的值【非响应式数据】
    this.root = this.store.root;
  },
  mounted() {
    this.initTabIndex();
    this.$el.addEventListener("keydown", this.handleKeydown);
    // if (Array.isArray(this.data) && this.data.length > 0) {
    // debugger;
    // this.store.setData(this.data);
    // this.refreshVirtualList();
    // }

    // created()的this.store初始化时会进行this.root.setData()
    // 但是虚拟列表还需要一次数据的筛选，因此这里需要主动触发一次refreshVirtualList()
    this.refreshVirtualList();

    const currentNodesMap = this.store.nodesMap;
    console.error("nodesMap", currentNodesMap);
  },
  beforeDestroy() {},
  methods: {
    getNodeKey(node) {
      return getNodeKey(this.nodeKey, node.data);
    },
    refreshVirtualList() {
      this.virtualList = this.store.getVirtualListFromTreeData();
      console.warn("this.virtualList", this.virtualList);
    },
    initTabIndex() {
      // TODO 这个数据是用来干嘛的？？
    },
    handleKeydown(ev) {
      // TODO 这个数据是用来干嘛的？？
    },
    handleResize() {},

    handleExpandIconClick(currentExpanded, node) {
      // 从这个中改变传入的node数据===>
      // el-tree是使用Node去做响应式
      // 展开/折叠时改变Node对应的属性，然后根据它的children/parent去改变children/parent对应的属性值
      // 但是虚拟列表模式下，我们只能得到一个Node？直接操作这个Node??

      // 通过node找到this.store中对应的Node数据
      // 更新Node数据对应的属性值

      // el-tree是this.store持有的Node树状数据就是<template>的数据
      // 而虚拟Tree是this.store持有的Node树状数据每次筛选后=>列表数据=><template>数据
      // 所以每次得改变this.store持有的Node数据

      // 混淆点: this.store持有的数据 要不要跟 this.virtualList持有的数据 区分开来？
      // 因为目前是持有相同引用数据，因此可以this.store找到Node，然后node.expanded = xxx
      // 也可以直接node.expanded = xxx
      this.store.updateNodeExpanded(node, currentExpanded);

      this.refreshVirtualList();
    },
  },
};
</script>
