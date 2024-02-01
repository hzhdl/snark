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
            // console.time(`第${depth-i}层构建`)
            for (let j = 0; j < this.Tree[i-1].length/this.K;j++) {
                this.Tree[i].push(this._gethashByij(i-1,j))
            }
            // console.timeEnd(`第${depth-i}层构建`)
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
            j=i%this.K
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
            //计算每层的数据
            s=""
            path[i].splice(pathindex[i],0,pdata)
            for (let j = 0; j < path[i].length; j++) {
                s=s+path[i][j]
            }
            // console.log(s)
            pdata=Sha256(s)
        }
        // console.log("root: ",pdata)
        return pdata===this.getroot()
    }

    testsingle(){
        let res=[]
        let bad=0
        for (let i = 0; i < this.O; i++) {
            var b = this.vertify(this.getmerklepath(i));
            res.push(b)
            if(!b)bad++;
        }
        return [(this.O-bad)/this.O,res]
    }

    getmutilpath(indexs){
        //首先排序
        indexs.sort((a,b)=>a-b)
        let pindex=indexs
        let pdata=pindex.map((res)=>this.Tree[0][res])
        let indextong={}
        let iter={}

        //检查是否合法
        if (this.O<=indexs[indexs.length-1]||indexs[0]<0) return "非法索引"
        //初始化数据
        let data= []
        let iters=[]
        //装桶
        for (let k = 0; k <indexs.length; k++) {
            if(indextong[Math.floor(indexs[k]/this.K)]===undefined){
                indextong[Math.floor(indexs[k]/this.K)]=[]
            }
            if(iter[Math.floor(indexs[k]/this.K)]===undefined){
                iter[Math.floor(indexs[k]/this.K)]=[]
            }
            indextong[Math.floor(indexs[k]/this.K)].push(indexs[k])
            if(!iter[Math.floor(indexs[k]/this.K)].includes(indexs[k]%this.K)){
                iter[Math.floor(indexs[k]/this.K)].push(indexs[k]%this.K)
                // iter[Math.floor(indexs[k]/this.K)].sort()
            }

        }

        let depth=this._calheight()

        for (let k = 0; k < depth ; k++) {
            //计算每层的数据并计算其位置。
            iters[k]=iter
            data[k]={}

            for (const l in indextong) {
                var map = indextong[l].map((index)=>index%this.K);
                for (let m = 0; m < this.K; m++) {
                    if(!map.includes(m)) {
                        if (data[k][l]===undefined)data[k][l]=[]
                        data[k][l].push(this.Tree[k][l*this.K+m])
                    }
                }
            }

            //重新装桶
            indextong={}
            iter={}
            indexs=indexs.map((res)=>Math.floor(res/this.K))
            for (let k = 0; k <indexs.length; k++) {
                if(indextong[Math.floor(indexs[k]/this.K)]===undefined){indextong[Math.floor(indexs[k]/this.K)]=[]}
                if(iter[Math.floor(indexs[k]/this.K)]===undefined){
                    iter[Math.floor(indexs[k]/this.K)]=[]
                }
                indextong[Math.floor(indexs[k]/this.K)].push(indexs[k])
                if(!iter[Math.floor(indexs[k]/this.K)].includes(indexs[k]%this.K)){
                    iter[Math.floor(indexs[k]/this.K)].push(indexs[k]%this.K)
                    // iter[Math.floor(indexs[k]/this.K)].sort()
                }
            }
        }
        // console.log("dsf")
        // return data
        return {index:pindex,pdata:pdata,path:data,pathindex:iters}


    }

    vertifymutlipath(vdata){
        let path=vdata.path
        let pathindex=vdata.pathindex
        let pdata=vdata.pdata
        let s=""

        //计算每层的数据
        for (let i = 0; i <path.length; i++) {
            //计算每层的数据

            let count=0
            let newdata=[]
            for(let l in pathindex[i]){
                // console.log(pathindex[i][l]);
                for (let j = 0; j < pathindex[i][l].length; j++) {
                    if (path[i][l]===undefined) path[i][l]=[]
                    // console.log(pathindex[i][l])
                    path[i][l].splice(pathindex[i][l][j],0,pdata[count++])
                }
            }
            for (let l in path[i]) {
                s=""
                for (let j = 0; j < path[i][l].length; j++) {
                    s=s+path[i][l][j]
                }
                newdata.push(Sha256(s))
            }
            pdata=newdata

        }
        return pdata[0]===this.getroot()

    }


}

module.exports= MerkleTree
