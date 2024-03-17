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

let nodeIdSeed = 0;

class VirtualNode {
  constructor(options) {
    this.id = nodeIdSeed++;
    this.expanded = false;
    this.visible = true;
    this.parent = null;

    for (let name in options) {
      if (Object.prototype.hasOwnProperty.call(options, name)) {
        this[name] = options[name];
      }
    }

    const store = this.store;
    this.level = WRAPPER_PARENT_DEEP;
    // 最外层是一个空的数据，level为0，为this.root
    // 然后就是第一个元素，level为1，从this.root之后的children开始，都会将parent传入
    if (this.parent) {
      this.level = this.parent.level + 1;
    }
    store.registerNode(this);

    if (store.lazy !== true && this.data) {
      this.setData(this.data);

      if (store.defaultExpandAll) {
        this.expanded = true;
      }
    } else if (this.level > WRAPPER_PARENT_DEEP && store.lazy && store.defaultExpandAll) {
      this.expand();
    }

    // this.label不会触发get()方法？
  }

  setData(data) {
    if (!Array.isArray(data)) {
      markNodeData(this, data);
    }

    this.data = data;
    this.childNodes = [];

    let children;
    if (this.level === WRAPPER_PARENT_DEEP && this.data instanceof Array) {
      children = this.data;
    } else {
      children = getPropertyFromData(this, "children") || [];
    }

    for (let i = 0, j = children.length; i < j; i++) {
      this.insertChild({data: children[i]});
    }
  }

  expand() {}

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

    if (!(child instanceof VirtualNode)) {
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

  get label() {
    return getPropertyFromData(this, "label");
  }
}

export default VirtualNode;
