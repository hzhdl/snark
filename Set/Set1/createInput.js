/**
 * 
 * 二叉默克尔树的构建与电路的输入input.json生成
 * 
 * */

const fs = require("fs");
const Sha256Merkle = require('./Sha256Merkle')

// 获取用户输入
var argv = process.argv.splice(2);
var address = argv[0];      //待证的叶子结点所在索引

const data = require('./tree.json');
var tree = data['tree'];
var depth = parseInt(tree.length - 1);

console.log('默克尔树深度：', depth);
console.log('代证叶子节点索引: ', address);


var path_bits = Sha256Merkle.addrToPathBits(address, depth); //获取待证叶子节点的默克尔路径索引


var path = Sha256Merkle.getMerklePath(tree, address, path_bits, depth); // 获取待证叶子结点的默克尔路径


//保存的输入input.json
const inputObject = {
    "root": tree[0][0],
    "leaf": tree[depth][address],
    "path": path,
    "path_bits": path_bits
}

console.log("input.json:\n", inputObject)

fs.writeFileSync(
    "./input.json",
    JSON.stringify(inputObject),
    "utf-8"
);
