
const snarkjs = require("snarkjs");
const fs = require("fs");
const bfj = require("bfj")
const {getCurveFromR,getCurveFromName,getCurveFromQ} = require("../lib/curves.js")
const {utils} = require("ffjavascript");
const path = require("path")
const {compiler} = require("circom");
const Logger =require("logplease");
const circom = require("circom");
const {gen} = require("circom/src/gencode");
// const {setup} = require("snarkjs/src/plonk");
const logger = Logger.create("snarkJS", {showTimestamp: false});
Logger.setLogLevel("INFO");

//导出合约代码。
 async function exportSolidityVerifier(zkeyname,solname,logger) {

    const templates = {};
    templates.groth16 = await fs.promises.readFile(path.join(__dirname, "../templates", "verifier_groth16.sol.ejs"), "utf8");
    templates.plonk = await fs.promises.readFile(path.join(__dirname, "../templates", "verifier_plonk.sol.ejs"), "utf8");
    templates.fflonk = await fs.promises.readFile(path.join(__dirname, "../templates", "verifier_fflonk.sol.ejs"), "utf8");
    const verifierCode = await snarkjs.zKey.exportSolidityVerifier(zkeyname, templates, logger);

    fs.writeFileSync(solname, verifierCode, "utf-8");


    return templates;
}

//进行可信设置，贡献power,生成tau
async function poweroftau(taupath){

    var curve = await getCurveFromName("BN128")
    var newAccumulator =await snarkjs.powersOfTau.newAccumulator(curve,14,path.join(taupath,"test_init.ptau"));

    var contribute = await snarkjs.powersOfTau.contribute(path.join(taupath,"test_init.ptau"),path.join(taupath,"test_01.ptau"),"first","e");

    var preparePhase2 = await snarkjs.powersOfTau.preparePhase2(path.join(taupath,"test_01.ptau"),path.join(taupath,"test_final.ptau"));
}
// "BN128", "BN254", "ALTBN128"
//进行circom编译等操作。
 async function Setup(srcpath) {
     var basename = path.basename(srcpath).split(".")[0];
     var dirname = path.dirname(srcpath);
     var newdirname=path.join(dirname,"/"+basename)
     var wasmFileName=path.join(dirname,"/"+basename,"/"+basename+".wasm")
     var r1csFileName=path.join(dirname,"/"+basename,"/"+basename+".r1cs")
     var finalzkeyname=path.join(dirname,"/"+basename,"/"+basename+".zkey")
     var vkname=path.join(dirname,"/"+basename,"/"+basename+"_vk.json")
     var taupath=path.join(__dirname,"../Tau")
     if(!fs.existsSync(newdirname)){
         fs.mkdirSync(newdirname)
     }
     await circom.compiler(srcpath,{
         wasmFileName:wasmFileName,
         r1csFileName:r1csFileName,
         // symWriteStream:path.join("../circom/"+circomname+".sym"),
     })
    //
    var newZKey = await snarkjs.zKey.newZKey(r1csFileName,path.join(taupath,"test_final.ptau"),path.join(newdirname,"test_02.zkey"));
    var finalZKey = await snarkjs.zKey.contribute(path.join(newdirname,"test_02.zkey"),finalzkeyname,"lksadjlkfajsdkfjsad","e");

    const vKey = await snarkjs.zKey.exportVerificationKey(finalzkeyname);

    await exportSolidityVerifier(finalzkeyname,path.join(__dirname,"../contracts/"+basename+".sol"),logger)

    await bfj.write(vkname, utils.stringifyBigInts(vKey), {space: 1});

}

async function genproof(wasmname,input,zkeyname,vkname,pb){
    let time=new Date().getTime();
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(input, wasmname, zkeyname);

    console.log("生成证明时间：",new Date().getTime()-time);

    console.log("Proof: ");
    // console.log(JSON.stringify(proof, null, 1));
    console.log(publicSignals,pb)
    const vKey = JSON.parse(fs.readFileSync(vkname));
    let time1=new Date().getTime()
    let res = await snarkjs.groth16.verify(vKey, pb, proof);
    // await snarkjs.groth16.exportSolidityCallData()
    console.log("验证时间：",new Date().getTime()-time1);

    if (res === true) {
        console.log("Verification OK");
    } else {
        console.log("Invalid proof");
    }
}

async function gencalldata(wasmname,input,zkeyname,vkname){
    let time=new Date().getTime();
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(input, wasmname, zkeyname);


    const vKey = JSON.parse(fs.readFileSync(vkname));

    return await snarkjs.groth16.exportSolidityCallData(proof,publicSignals)

}

gencalldata("../circom/crcuit/crcuit.wasm",{a:2,b:4},"../circom/crcuit/crcuit.zkey","../circom/crcuit/crcuit_vk.json",[8]).then((res)=>{
    console.log(res)

})

gencalldata("../circom/crcuit/crcuit.wasm",{a:2,b:6},"../circom/crcuit/crcuit.zkey","../circom/crcuit/crcuit_vk.json",[12]).then((res)=>{
    console.log(res)
    process.exit()
})
// genproof("../circom/crcuit/crcuit.wasm",{a:2,b:4},"../circom/crcuit/crcuit.zkey","../circom/crcuit/crcuit_vk.json",[8]).then(()=>{
//     process.exit()
// })


// Setup(path.join(__dirname,"../circom/crcuit.circom")).then(()=>{
//     console.timeEnd("c0");
//     console.time("c1")
//     // return run("./circom/crcuit1.r1cs","c1.zkey","vk1.json")
// }).then(()=>{
//     console.timeEnd("c1")
//     process.exit()
// })

module.exports={Setup,poweroftau,}


    // ["0x21b6677d8153cff7aa8bc553ddf0c2df7bb0ccf6f8a48bd55e0f0556af2c1b20", "0x0fcbf1ef5d58d676667444881e4cef6b2b295e0b8f562fafe2f849eeec9cb63d"],
    // [
    //     ["0x283847cd5c5f2c77cba35263d38e32bcf7e32fd465e7b50fe28f6133558d63c0", "0x1142c3b52f48800fd98b9bb0b2953a2b5268f1162eae6dd844eb220c62b21489"],
    //     ["0x024c9f7995f95bbe0a0840013990af3585b629aa1ed5bd6438d8c27d78bcec8d", "0x2c341f6cc47314427b2af7ff3f2606d37ef56d3aca07c9c7c01a78696caf2678"]
    // ],
    // ["0x16263eb129fcfc2a50fd0c2fd2f1fb6622e404ebe66fb627a3787036894827f0", "0x212c1d31559bac89ed83eb896dcf966a1e23f74968a3a57b0d51cea9331fdee0"],
    // ["0x0000000000000000000000000000000000000000000000000000000000000008"]
