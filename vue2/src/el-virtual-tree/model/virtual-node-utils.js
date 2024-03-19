export const getChildState = (node) => {
  let all = true;
  let none = true;
  let allWithoutDisable = true;
  for (let i = 0, j = node.length; i < j; i++) {
    const n = node[i];
    if (n.checked !== true || n.indeterminate) {
      all = false;
      if (!n.disabled) {
        allWithoutDisable = false;
      }
    }
    if (n.checked !== false || n.indeterminate) {
      none = false;
    }
  }

  return {all, none, allWithoutDisable, half: !all && !none};
};
export const getPropertyFromData = function (node, prop) {
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

/**
 * 从当前node不断向上冒泡，不断调用getChildState()进行状态的检测，然后进行node.checked和node.indeterminate状态的更正
 * 然后检测checkStrictly是否为true
 */
export const reInitChecked = function (node) {
  if (node.childNodes.length === 0 || node.loading) return;

  const {all, none, half} = getChildState(node.childNodes);
  if (all) {
    node.checked = true;
    node.indeterminate = false;
  } else if (half) {
    node.checked = false;
    node.indeterminate = true;
  } else if (none) {
    node.checked = false;
    node.indeterminate = false;
  }

  const parent = node.parent;
  if (!parent || parent.level === 0) return;

  // 如果checkStrictly=true，说明父子不互相关联
  // 如果checkStrictly=false，说明父子互相关联
  // 下面逻辑在【父子互相关联】的前提下触发
  if (!node.store.checkStrictly) {
    reInitChecked(parent);
  }
};
