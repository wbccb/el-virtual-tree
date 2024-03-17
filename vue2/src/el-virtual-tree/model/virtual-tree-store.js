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

    const nodeKey = node.key;
    if (nodeKey !== undefined) this.nodesMap[node.key] = node;
  }
}
export default VirtualTreeStore;
