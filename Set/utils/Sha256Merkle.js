/**
 *
 * 生成二叉默克尔树tree.json和电路输入input.json的工具
 *
 * */
const path = require("path");

const Sha256 = require("../utils/sha256").hash;

class MerkleTree{
    K=2
    O=256
    Tree=[]

    constructor(k,o,leafdata=null) {
        if (k != null) this.K=k
        if (o != null) this.O=o
        if (Math.log(this.O)/Math.log(this.K)%1!==0) {leafdata=null;this.O=k}
        this._BuildTree(leafdata)
    }

    _calheight(){
        return Math.ceil(Math.log(this.Tree[0].length)/Math.log(this.K))
    }

    _BuildTree(leafdata){
        //生成叶子节点数据
        this._buildarray(leafdata)

    //    构建每层数据
        let depth=this._calheight()+1
        for (let i = 1; i < depth; i++) {
            this.Tree[i]=[]
            console.time(`第${depth-i}层构建`)
            for (let j = 0; j < this.Tree[i-1].length/this.K;j++) {
                this.Tree[i].push(this._gethashByij(i-1,j))
            }
            console.timeEnd(`第${depth-i}层构建`)
        }
    }

    //生成hash值
    _gethashByij(i,j){
        let s=""
        for (let k = 0; k < this.K; k++) {
            s=s+this.Tree[i][this.K*j+k]
        }
        return Sha256(s)
    }

    //生成叶子结点数据
    _buildarray(leafdata){
        if (leafdata==null){
            this.Tree[0]=[]
            for (let i = 0; i < this.O; i++) {
                this.Tree[0].push(Sha256(new Date().toString()+i.toString()))
            }
        }else{
            this.Tree[0]=leafdata
            this.O=this.Tree[0].length
            var number1 = Math.pow(this.K,this._calheight())-this.Tree[0].length;
            if(number1>0){
                while(this.Tree[0].length<Math.pow(this.K,this._calheight())){
                    this.Tree[0].push(new Date().toString()+number1.toString())
                    number1--;
                }
            }
            this.Tree[0].map((res)=>Sha256(res))
        }

    }

    getroot(){
        return this.Tree[this._calheight()][0]
    }

    getmerklepath(index){
        if (this.O<=index) return "非法索引"
        let data=[]
        let iter=[]
        let i=Math.floor(index/this.K)
        let j=index%this.K
        let depth=this._calheight()
        for (let k = 0; k < depth ; k++) {
            iter.push(j)
            data[k]=[]
            for (let l = 0; l < this.K; l++) {
                if (l!==j) data[k].push(this.Tree[k][i*this.K+l])
            }
            j=i
            i=Math.floor(i/this.K)
        }
        return {index:index,pdata:this.Tree[0][index],path:data,pathindex:iter}
    }

    vertify(vdata){
        let path=vdata.path
        let pathindex=vdata.pathindex
        let pdata=vdata.pdata
        let s=""
        let flag=true
        for (let i = 0; i <path.length; i++) {
            flag=true
            s=""
            for (let j = 0; j < path[i].length; ) {
                if(j===pathindex[j]&&flag){
                    s=s+pdata
                    flag=false
                }else {
                    s=s+path[i][j]
                    j++
                }
            }
            pdata=Sha256(s)
            console.log(pdata)
        }
        return pdata===this.getroot()
    }


}

module.exports= MerkleTree
