import {markNodeData, objectAssign} from "@/el-virtual-tree/model/util";
import {WRAPPER_PARENT_DEEP} from "@/el-virtual-tree/js/config";

const getPropertyFromData = function (node, prop) {
  const props = node.store.props;
  const data = node.data || {};
  const config = props[prop];

  if (typeof config === "function") {
    return config(data, node);
  } else if (typeof config === "string") {
    return data[config];
  } else if (typeof config === "undefined") {
    const dataProp = data[prop];
    return dataProp === undefined ? "" : dataProp;
  }
};

class VirtualNode {
  constructor(options) {
    this.expanded = false;
    this.visible = true;

    for (let name in options) {
      if (Object.prototype.hasOwnProperty.call(options, name)) {
        this[name] = options[name];
      }
    }
  }

  setData(data) {
    if (!Array.isArray(data)) {
      markNodeData(this, data);
    }

    this.data = data;
    this.childNodes = [];

    let children;
    if (this.level === 0 && this.data instanceof Array) {
      children = this.data;
    } else {
      children = getPropertyFromData(this, "children") || [];
    }

    for (let i = 0, j = children.length; i < j; i++) {
      this.insertChild({data: children[i]});
    }
  }

  /**
   * el-tree的原始方法，根据tree.vue传入的props进行属性的children数据的获取
   */
  getChildren(forceInit = false) {
    // this is data
    if (this.level === WRAPPER_PARENT_DEEP) return this.data;
    const data = this.data;
    if (!data) return null;

    const props = this.store.props;
    let children = "children";
    if (props) {
      children = props.children || "children";
    }

    if (data[children] === undefined) {
      data[children] = null;
    }

    if (forceInit && !data[children]) {
      data[children] = [];
    }

    return data[children];
  }

  insertChild(child, index, batch) {
    if (!child) throw new Error("insertChild error: child is required.");

    if (!(child instanceof Node)) {
      if (!batch) {
        const children = this.getChildren(true) || [];
        if (children.indexOf(child.data) === -1) {
          if (typeof index === "undefined" || index < 0) {
            children.push(child.data);
          } else {
            children.splice(index, 0, child.data);
          }
        }
      }
      objectAssign(child, {
        parent: this,
        store: this.store,
      });
      child = new VirtualNode(child);
    }

    child.level = this.level + 1;

    if (typeof index === "undefined" || index < 0) {
      this.childNodes.push(child);
    } else {
      this.childNodes.splice(index, 0, child);
    }

    this.updateLeafState();
  }

  updateLeafState() {
    // TODO 更新leaf??
  }

  updateChildren() {}
}

export default VirtualNode;
