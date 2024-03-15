import VirtualNode from "@/el-virtual-tree/model/virtual-node";

class VirtualTreeStore {
  constructor(options) {
    for (let option in options) {
      if (Object.prototype.hasOwnProperty.call(options, option)) {
        this[option] = options[option];
      }
    }

    this.root = new VirtualNode({
      data: this.data,
      store: this,
    });
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

  _initDefaultCheckedNodes() {}
}
export default VirtualTreeStore;
