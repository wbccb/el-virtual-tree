<template>
  <div
    class="el-tree-node"
    @click.stop="handleClick"
    @contextmenu="($event) => this.handleContextMenu($event)"
    v-show="node.visible"
    :class="{
      'is-expanded': expanded,
      'is-current': node.isCurrent,
      'is-hidden': !node.visible,
      'is-focusable': !node.disabled,
      'is-checked': !node.disabled && node.checked,
    }"
    role="treeitem"
    tabindex="-1"
    :aria-expanded="expanded"
    :aria-disabled="node.disabled"
    :aria-checked="node.checked"
    :draggable="draggable"
    @dragstart.stop="handleDragStart"
    @dragover.stop="handleDragOver"
    @dragend.stop="handleDragEnd"
    @drop.stop="handleDrop"
    ref="node"
  >
    <div
      class="el-tree-node__content"
      :style="{'padding-left': (node.level - 1) * MARGIN_LEFT + 'px'}"
    >
      <span
        @click.stop="handleExpandIconClick"
        :class="[
          {'is-leaf': node.isLeaf, expanded: !node.isLeaf && expanded},
          'el-tree-node__expand-icon',
          iconClass ? iconClass : 'el-icon-caret-right',
        ]"
      ></span>
      <el-checkbox
        v-if="showCheckbox"
        :value="node.checked"
        :indeterminate="node.indeterminate"
        :disabled="!!node.disabled"
        @click.native.stop
        @change="handleCheckChange"
      ></el-checkbox>
      <span v-if="node.loading" class="el-tree-node__loading-icon el-icon-loading"></span>
      <node-content :node="node"></node-content>
    </div>
  </div>
</template>

<script>
import {MARGIN_LEFT} from "@/el-virtual-tree/js/config";
export default {
  name: "ElVirtualTreeNode",
  props: {
    node: {
      type: Object,
      required: true,
    },
    props: {},
    renderContent: Function,
    renderAfterExpand: {
      type: Boolean,
      default: true,
    },
    showCheckbox: {
      type: Boolean,
      default: false,
    },
    draggable: {
      type: Boolean,
      default: false,
    },
    iconClass: String,
  },

  components: {
    NodeContent: {
      props: {
        node: {
          required: true,
        },
      },
      render(h) {
        // TODO 这边有问题
        const data = this.node.data;
        const store = this.node.store;
        const node = this.node;
        return this.renderContent ? (
          this.renderContent.call(this._renderProxy, h, {
            _self: this.$vnode.context,
            node,
            data,
            store,
          })
        ) : this.$scopedSlots.default ? (
          this.$scopedSlots.default({node, data})
        ) : (
          <span class="el-tree-node__label">{node.label}</span>
        );
      },
    },
  },
  data() {
    return {
      tree: null,
      childNodeRendered: false,
      oldChecked: null,
      oldIndeterminate: null,
      MARGIN_LEFT: MARGIN_LEFT,
    };
  },
  computed: {
    expanded() {
      return this.node ? this.node.expanded : false;
    },
  },
  methods: {
    handleDragStart(event) {
      this.$emit("handleDragStart", event);
    },
    handleDragOver(event) {
      this.$emit("handleDragOver", event);
    },
    handleDragEnd(event) {
      if (!this.draggable) return;
      this.$emit("handleDragEnd", event);
    },
    handleDrop(event) {
      this.$emit("handleDrop", event);
    },
    handleExpandIconClick() {
      if (this.node.isLeaf) return;

      const currentExpanded = !this.node.expanded;

      this.$emit("handleExpandIconClick", currentExpanded);
    },
    handleCheckChange(value, ev) {
      this.$emit("handleCheckChange", value, ev);
    },
    handleClick() {
      this.$emit("handleClick");
    },
    handleContextMenu(event) {
      this.$emit("handleContextMenu");
    },
  },
  created() {},
};
</script>
