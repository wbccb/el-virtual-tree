<template>
  <div id="app">
    <el-input v-model="filterName" placeholder="进行名称筛选" />
    <el-virtual-tree
      ref="tree"
      :data="mockData"
      :props="treeProps"
      :node-key="'id'"
      :filter-node-method="filterNode"
      :highlight-color="'#f43c3c'"
    ></el-virtual-tree>
  </div>
</template>

<script>
import {mockData} from "@/mock/originTreeData";
import ElVirtualTree from "@/el-virtual-tree/el-virtual-tree.vue";

export default {
  name: "App",
  props: {
    props: {
      type: Object,
      default() {
        return {
          children: "children",
          label: "name",
          nodeKey: "id",
        };
      },
    },
  },
  data() {
    return {
      mockData,
      filterName: "",
      treeProps: {
        nodeKey: "id",
        children: "children",
        label: "name",
      },
    };
  },
  components: {
    ElVirtualTree,
  },
  watch: {
    filterName(val) {
      // 1. 只显示筛选的文本，其它不可见
      // 2. 高亮筛选的文本，高亮匹配的文字
      // 3. 自动跳转到筛选的文本
      this.$refs.tree.filter(val);
    },
  },
  methods: {
    filterNode(value, data) {
      if (!value) return true;
      const labelName = this.treeProps.label;
      return data[labelName].indexOf(value) !== -1;
    },
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;

  position: fixed;
  top: 20px;
  left: 20px;
  right: 20px;
  bottom: 20px;

  border: 1px solid #999;
}
</style>
