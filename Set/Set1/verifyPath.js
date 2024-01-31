/**
 * ��֤���ɵ�input.json�Ƿ���ȷ
 * */

const data = require('./input.json')
const sha256 = require("../circomlib/src/Sha256");

console.log(data)

var path = data['path']
var root = data['root']
var path_bits = data['path_bits']
var leaf = data['leaf']
var depth = path.length

var temp = new Array(depth)

var left = ""
var right = ""

if(path_bits[0]==0){
	left = leaf
	right = path[0]
}else{
	left = path[0]
	right = leaf
}

var hash1 = sha256.hash(left);
var hash2 = sha256.hash(right);



temp[0] = sha256.hash(hash1.substring(0, hash1.length / 2) + hash2.substring(hash2.length / 2));

console.log(temp[0]);

for (v = 1; v < depth; v++){
	if(path_bits[v]==0){
		left = temp[v-1]
		right = path[v]
	}else{
		left = path[v]
		right = temp[v-1]
	}
	hash1 = sha256.hash(left)
	hash2 = sha256.hash(right)
	temp[v] = sha256.hash(hash1.substring(0, hash1.length / 2) + hash2.substring(hash2.length / 2));
}
var computeRoot = temp[depth - 1];
console.log("root:",root)
console.log("comr:", computeRoot)
if (root == computeRoot) {
	console.log("pass!");
} else {
	console.log("not pass!!");
}
