import VirtualNode from "@/el-virtual-tree/model/virtual-node";
import {WRAPPER_PARENT_DEEP} from "@/el-virtual-tree/js/config";

class VirtualTreeStore {
  constructor(options) {
    for (let option in options) {
      if (Object.prototype.hasOwnProperty.call(options, option)) {
        this[option] = options[option];
      }
    }

    this.nodesMap = {};

    // TODO 测试expand
    this.defaultExpandAll = true;

    // this.root的data才是整个数据，因此level为0
    this.root = new VirtualNode({
      data: options.data,
      store: this,
    });
    this.root.level = WRAPPER_PARENT_DEEP;
    this.root.setData(options.data);
    this._initDefaultCheckedNodes();
  }

  setData(newVal) {
    // 传入树状结构数据data，然后这里进行解析
    const instanceChanged = newVal !== this.root.data;
    if (instanceChanged) {
      this.root.setData(newVal);
      this._initDefaultCheckedNodes();
    } else {
      this.root.updateChildren();
    }
  }

  /**
   * 从目前的this.root（Node.js数据结构）中得到虚拟列表的数据
   */
  getVirtualListFromTreeData() {
    const dfs = (currentNode, currentResultArray) => {
      // 深度优先遍历
      if (!currentNode.visible) {
        return;
      }
      currentResultArray.push(currentNode);

      if (!currentNode.expanded) {
        // 如果目前节点不展开，则不进行children的遍历
        return;
      }
      const children = currentNode.childNodes;
      for (const child of children) {
        dfs(child, currentResultArray);
      }
    };

    const result = [];

    // this.root是自己捏造的哨兵节点，真实数据在this.root.data中，this.root本身无意义
    const rootArray = this.root.childNodes;
    for (let child of rootArray) {
      dfs(child, result);
    }
    return result;
  }

  _initDefaultCheckedNodes() {}

  registerNode(node) {
    const key = this.key;
    if (!key || !node || !node.data) return;

    const nodeKey = node[key];
    if (nodeKey !== undefined) this.nodesMap[nodeKey] = node;
  }

  updateNodeExpanded(node, currentExpanded) {
    // const rootArray = this.root.childNodes;
    // const key = this.key;
    // const nodeKey = node[key];
    // const storeNode = this.nodesMap[nodeKey];
    if (currentExpanded) {
      node.expand();
    } else {
      node.collapse();
    }
  }

  filter(value) {
    // 保持与el-tree相同的代码逻辑，无须更改
    const filterNodeMethod = this.filterNodeMethod;
    const lazy = this.lazy;

    const traverse = function (node) {
      // 如果node是最先触发的this，则node为VirtualTreeStore，持有node.root
      // 如果是node是VirtualNode，则不持有node.root
      // VirtualTreeStore.root是哨兵节点，不具备数据（element-ui的模式）
      const childNodes = node.root ? node.root.childNodes : node.childNodes;

      childNodes.forEach((child) => {
        child.visible = filterNodeMethod.call(child, value, child.data, child);

        traverse(child);
      });

      if (!node.visible && childNodes.length) {
        let allHidden = true;
        allHidden = !childNodes.some((child) => child.visible);

        if (node.root) {
          node.root.visible = allHidden === false;
        } else {
          node.visible = allHidden === false;
        }
      }
      if (!value) return;

      if (node.visible && !node.isLeaf && !lazy) node.expand();
    };

    traverse(this);
  }
}
export default VirtualTreeStore;
