/*
 * @Author: wuxunyu
 * @Date: 2020-06-06 12:02:41
 * @LastEditTime: 2020-06-06 14:49:36
 */ 
/** 其实没必要
 * @description: 将值匹配一个对象叶子节点键名，传入 targetKey 则查找上一层对象键值；
 * targetKey 值需以 targetLeafNodeValue 对应
 * @param {object} obj 原始对象
 * @param {string} targetLeafNodeValue 叶子节点值
 * @param {Function} fn 查到父节点回调函数
 * @param {string} targetKey 目标叶子节点对象键
 * @param {string} key 对象键
 * @return {viod}
 */
function findFatherNodeKey(obj, targetLeafNodeValue, fn, targetKey = null, key = null) {
  if (Object.prototype.toString.call(obj) === '[object Object]') {
    for (let item in obj) {
      if (targetKey === item) {
        findFatherNodeKey(obj[item], targetLeafNodeValue, fn, targetKey, key)
      } else {
        findFatherNodeKey(obj[item], targetLeafNodeValue, fn, targetKey, item)
      }
    }
  }
  if (Object.prototype.toString.call(obj) === '[object String]' && targetLeafNodeValue == obj) {
    fn(key, obj)
  }
}


// 其实没必要
function findTargetChildren(obj, target, fn) {
  if (Object.prototype.toString.call(obj) === '[object Object]') {
    if (target in obj) {
      fn(target, obj[target])
    } else {
      for (let item in obj) {
        findTargetChildren(obj[item], target, fn)
      }
    }
  }
}

module.exports = {
findTargetChildren,
  findFatherNodeKey
};
