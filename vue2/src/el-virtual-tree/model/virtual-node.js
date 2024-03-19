import {markNodeData, objectAssign} from "@/el-virtual-tree/model/util";
import {WRAPPER_PARENT_DEEP} from "@/el-virtual-tree/js/config";
import {getChildState, getPropertyFromData, reInitChecked} from "./virtual-node-utils";
let nodeIdSeed = 0;

class VirtualNode {
  constructor(options) {
    this.id = nodeIdSeed++;
    this.checked = false;
    this.indeterminate = false;
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
    this.loaded = false;

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

  collapse() {
    this.expanded = false;
  }

  expand() {
    this.expanded = true;
  }

  get label() {
    return getPropertyFromData(this, "label");
  }

  setChecked(value, deep, recursion, passValue) {
    this.indeterminate = value === "half";
    this.checked = value === true;

    // 在显示复选框的情况下，是否严格的遵循父子不互相关联的做法，默认为 false
    // 如果checkStrictly=true，说明父子不互相关联，下面的逻辑可以不执行
    if (this.store.checkStrictly) return;

    if (!(this.shouldLoadData() && !this.store.checkDescendants)) {
      let {all, allWithoutDisable} = getChildState(this.childNodes);

      if (!this.isLeaf && !all && allWithoutDisable) {
        // 不是叶子节点
        // 该node的children没有全选 + 该node的children存在disable=true
        this.checked = true;
        value = false;
      }

      const handleDescendants = () => {
        if (deep) {
          // 先进行childNodes的处理
          const childNodes = this.childNodes;
          for (let i = 0, j = childNodes.length; i < j; i++) {
            const child = childNodes[i];
            passValue = passValue || value !== false;
            const isCheck = child.disabled ? child.checked : passValue;
            // passValue可以理解为当前node的parent传递的value值，也就是说当前设置的值是value，父亲的值是passValue
            // 这是在父子存在关联的情况下才会触发的方法，因此本质就是判断child.disabled然后setChecked的方法
            child.setChecked(isCheck, deep, true, passValue);
          }
          // 然后获取当前node所有childNodes计算出来的状态，进行this.checked和this.indeterminate的赋值
          const {half, all} = getChildState(childNodes);
          if (!all) {
            this.checked = all;
            this.indeterminate = half;
          }
        }
      };

      if (this.shouldLoadData()) {
        // Only work on lazy load data.
        this.loadData(
          () => {
            handleDescendants();
            reInitChecked(this);
          },
          {
            checked: value !== false,
          },
        );
        return;
      } else {
        handleDescendants();
      }
    }
  }

  /**
   * 是否需要等待异步加载完成
   */
  shouldLoadData() {
    // lazy: 是否懒加载子节点，需与 load 方法结合使用
    // load: 加载子树数据的方法，仅当 lazy 属性为true 时生效
    // loaded: load()方法是否加载完成，加载完成则将它设置为true
    return this.store.lazy === true && this.store.load && !this.loaded;
  }

  doCreateChildren(array, defaultProps = {}) {
    array.forEach((item) => {
      this.insertChild(objectAssign({data: item}, defaultProps), undefined, true);
    });
  }

  loadData(callback, defaultProps = {}) {
    if (
      this.store.lazy === true &&
      this.store.load &&
      !this.loaded &&
      (!this.loading || Object.keys(defaultProps).length)
    ) {
      this.loading = true;

      const resolve = (children) => {
        this.childNodes = [];

        this.doCreateChildren(children, defaultProps);
        this.loaded = true;
        this.loading = false;
        this.updateLeafState();
        if (callback) {
          callback.call(this, children);
        }
      };

      this.store.load(this, resolve);
    } else {
      if (callback) {
        callback.call(this);
      }
    }
  }
}

export default VirtualNode;
