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
      <el-virtual-tree-node :item="item"></el-virtual-tree-node>
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
import {ITEM_HEIGHT, WRAPPER_PARENT_DEEP} from "./js/config.js";
import {RecycleScroller} from "vue-virtual-scroller";
import "vue-virtual-scroller/dist/vue-virtual-scroller.css";
import VirtualTreeStore from "@/el-virtual-tree/model/virtual-tree-store";

export default {
  name: "ElVirtualTree",
  components: {
    ElVirtualTreeNode,
    RecycleScroller,
  },
  data() {
    return {
      store: null,
      root: null,
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
    // 将原始的树状数据转化为非响应式
    // 在原始树状基础上增加一些属性，包括level

    // 用TreeStore进行数据的管理
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

    // 每一个item包装成为一个Node.js，在原来的数据基础上增加新的属性，比如level等等，但是不改变原来的值
    this.root = this.store.root;
  },
  mounted() {
    this.initTabIndex();
    this.$el.addEventListener("keydown", this.handleKeydown);
    if (Array.isArray(this.data) && this.data.length > 0) {
      this.store.setData(this.data);
    }
  },
  beforeDestroy() {},
  methods: {
    initTabIndex() {
      // TODO 这个数据是用来干嘛的？？
    },
    handleKeydown(ev) {
      // TODO 这个数据是用来干嘛的？？
    },
    handleResize() {},
  },
};
</script>
