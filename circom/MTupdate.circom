// 导入 circom 标准库
include "circomlib/circomlib.circom";

// 定义电路输入
template MerkleTreeUpdate() {
  signal leaf: 2;
  signal oldRoot: 256;
  signal newData: 2;
  signal newRoot: 256;
}

// 定义电路逻辑
component main(MerkleTreeUpdate) -> (output newRoot) {
  // 定义默克尔树的hash函数
  component hashFunc(left, right) -> (output hash) = sha256;

  // 计算新叶子节点的哈希
  component newLeafHash() -> (output hash) {
    return hashFunc(newData, 0);
  }

  // 计算新根哈希
  component computeNewRoot(left, right) -> (output newRoot) {
    return hashFunc(left, right);
  }

  // 计算默克尔树路径上的哈希值
  component merklePath(left, right, position, leaf) -> (output pathHash) {
    // 如果 position 的二进制表示的最高位是 0，则取 left，否则取 right
    pathHash = (position[255] == 0) ? left : right;

    // 从左到右遍历 position 的其余位
    for (var i = 254; i >= 0; i--) {
      // 如果当前位是 1，则取 right，否则取 left
      pathHash = (position[i] == 1) ? hashFunc(left, pathHash) : hashFunc(pathHash, right);
    }

    // 如果 position 是奇数，则再和 leaf 做一次 hash
    pathHash = (position[0] == 1) ? hashFunc(pathHash, leaf) : pathHash;
  }

  // 计算新树的根哈希
  newRoot = computeNewRoot(merklePath(oldRoot, 0, leaf, newData), newLeafHash());
}

// 导出电路
generateVerifier("mTreeUpdateVerifier", main);
