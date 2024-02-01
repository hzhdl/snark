/**
 *
 * 二叉默克尔树的构建与电路的输入input.json生成
 *
 * */

const fs = require("fs");
const MerkleTree = require('../utils/Sha256Merkle.js');
const {hash: Sha256} = require("../utils/sha256"); //sha256算法

// 获取用户输入
// var argv = process.argv.splice(2);
// var leafCount = argv[0];    //叶子结点数
// var depth = parseInt(Sha256Merkle.getDepthByLeafCount(leafCount)) //计算默克尔树的深度(不包括根节点)

let num=16
let data=[]
for (let i = 0; i < num; i++) {
    data.push(new Date().toString()+i.toString())
}

//
// for (let i = 1; i < 11; i++) {
//     console.time(`构造默克尔树${i}`);
//     var tree = new MerkleTree(2,Math.pow(2,i))
//     console.timeEnd(`构造默克尔树${i}`)
//     console.log('默克尔树深度：', tree._calheight());
// }

console.time('构造默克尔树');
var tree = new MerkleTree(2,Math.pow(2,13))

console.timeEnd('构造默克尔树')
console.log('默克尔树深度：', tree._calheight());
// console.log('叶子节点数：', tree.O);
// console.log('默克尔树深度：', tree._calheight());
// console.log('默克尔树root：', tree.getroot());
// let path=tree.getmerklepath(10)
// let path=tree.getmutilpath([3,5,15,20])
// console.log('path：', path);
// console.log("验证结果：",tree.vertify(path))
// console.log("验证结果：",tree.vertifymutlipath(path))


// console.log(tree.testsingle())

//保存的树结构
// const treeObject = {
//     "tree": tree
// }
//
// fs.writeFileSync(
//     "./tree.json",
//     JSON.stringify(treeObject),
//     "utf-8"
// );
