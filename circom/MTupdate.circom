pragma circom 2.0.5;

include "../circomlib/circuits/sha256/sha256_2.circom";

template verifyMerklePath(k){

	// public input
	signal input root; // Merkle root
	signal input leaf; // 叶子节点 哈希值

	// private input
	signal input path[k]; // merkle path
    signal input path_bits[k]; // merkle path index

    component computed_root = getMerkleRoot(k);
    computed_root.leaf <== leaf;

    for (var w = 0; w < k; w++){
        computed_root.path[w] <== path[w];
        computed_root.path_bits[w] <== path_bits[w];
    }
    root === computed_root.out;


}

template getMerkleRoot(k){    // k 是Merkle tree 的深度

    signal input leaf; // 叶子节点 哈希值
    signal input path[k]; // Merkle path
    signal input path_bits[k]; // Merkle 路径索引

    signal output out;

    // 对Merkle path中前两个元素进行hash运算
    component merkle_root[k];
    merkle_root[0] = SHA256_2();
    merkle_root[0].a <== leaf + path_bits[0]* (path[0] - leaf);
    merkle_root[0].b <== path[0] + path_bits[0]* (leaf - path[0]);

    // 对Merkle path中剩下的元素进行hash运算
    for (var v = 1; v < k; v++){
        merkle_root[v] = SHA256_2();
        merkle_root[v].a <== merkle_root[v-1].out + path_bits[v]* (path[v] - merkle_root[v-1].out);
        merkle_root[v].b <== path[v] + path_bits[v]* (merkle_root[v-1].out - path[v]);

    }

    // 输出计算完成的Merkle tree root
    out <== merkle_root[k-1].out;

}


component main {public [root,leaf]} = verifyMerklePath(3);
