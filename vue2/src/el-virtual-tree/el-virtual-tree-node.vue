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
    :draggable="tree.draggable"
    @dragstart.stop="handleDragStart"
    @dragover.stop="handleDragOver"
    @dragend.stop="handleDragEnd"
    @drop.stop="handleDrop"
    ref="node"
  >
    <div
      class="el-tree-node__content"
      :style="{'padding-left': (node.level - 1) * tree.indent + 'px'}"
    >
      <span
        @click.stop="handleExpandIconClick"
        :class="[
          {'is-leaf': node.isLeaf, expanded: !node.isLeaf && expanded},
          'el-tree-node__expand-icon',
          tree.iconClass ? tree.iconClass : 'el-icon-caret-right',
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
export default {
  name: "ElVirtualTreeNode",
  props: {
    node: {
      default() {
        return {};
      },
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
  },

  components: {
    NodeContent: {
      props: {
        node: {
          required: true,
        },
      },
      render(h) {
        const parent = this.$parent;
        const tree = parent.tree;
        const node = this.node;
        const {data, store} = node;
        return parent.renderContent ? (
          parent.renderContent.call(parent._renderProxy, h, {
            _self: tree.$vnode.context,
            node,
            data,
            store,
          })
        ) : tree.$scopedSlots.default ? (
          tree.$scopedSlots.default({node, data})
        ) : (
          <span class="el-tree-node__label">{node.label}</span>
        );
      },
    },
  },
  data() {
    return {
      tree: null,
      expanded: false,
      childNodeRendered: false,
      oldChecked: null,
      oldIndeterminate: null,
    };
  },
  methods: {
    handleDragStart(event) {
      this.$emit("handleDragStart", event);
    },
    handleDragOver(event) {
      this.$emit("handleDragOver", event);
    },
    handleDragEnd(event) {
      if (!this.tree.draggable) return;
      this.$emit("handleDragEnd", event);
    },
    handleDrop(event) {
      this.$emit("handleDrop", event);
    },
    handleExpandIconClick() {
      if (this.node.isLeaf) return;

      this.$emit("handleExpandIconClick", this.expanded);
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
  created() {
    const parent = this.$parent;

    if (parent.isTree) {
      this.tree = parent;
    } else {
      this.tree = parent.tree;
    }

    const tree = this.tree;
    if (!tree) {
      console.warn("Can not find node's tree.");
    }

    const props = tree.props || {};
    const childrenKey = props["children"] || "children";

    this.$watch(`node.data.${childrenKey}`, () => {
      this.node.updateChildren();
    });

    if (this.node.expanded) {
      this.expanded = true;
      this.childNodeRendered = true;
    }

    if (this.tree.accordion) {
      this.$on("tree-node-expand", (node) => {
        if (this.node !== node) {
          this.node.collapse();
        }
      });
    }
  },
};
</script>
