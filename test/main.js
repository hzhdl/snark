
const snarkjs = require("snarkjs");
const fs = require("fs");
const bfj = require("bfj")
const {getCurveFromR,getCurveFromName,getCurveFromQ} = require("./lib/curves.js")
const {utils} = require("ffjavascript");
const path = require("path")
const {compiler} = require("circom");
const Logger =require("logplease");
const logger = Logger.create("snarkJS", {showTimestamp: false});
Logger.setLogLevel("INFO");

// "BN128", "BN254", "ALTBN128"
async function run(r1csname,finalzkeyname,vkname) {
    // var curve = await getCurveFromName("BN128")
    // var newAccumulator =await snarkjs.powersOfTau.newAccumulator(curve,14,"test_init.ptau");
    //
    // var contribute = await snarkjs.powersOfTau.contribute("test_init.ptau","test_01.ptau","first","e");
    //
    // var preparePhase2 = await snarkjs.powersOfTau.preparePhase2("test_01.ptau","test_final.ptau");
    //

    var newZKey = await snarkjs.zKey.newZKey(r1csname,"test_final.ptau","test_02.zkey");
    var finalZKey = await snarkjs.zKey.contribute("test_02.zkey",finalzkeyname,"lksadjlkfajsdkfjsad","e");

    const vKey = await snarkjs.zKey.exportVerificationKey(finalzkeyname);

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

    // res = await snarkjs.groth16.verify(vKey, ['415343651578354'], proof);
    //
    //
    // if (res === true) {
    //     console.log("Verification OK");
    // } else {
    //     console.log("Invalid proof");
    // }

}

// genproof().then(()=>{
//     console.log("The code is ending!")
//     process.exit()
// })
// console.time("c0")
// run("./circom/crcuit.r1cs","c.zkey","vk0.json").then(()=>{
//     console.timeEnd("c0");
//     console.time("c1")
//     return run("./circom/crcuit1.r1cs","c1.zkey","vk1.json")
// }).then(()=>{
//     console.timeEnd("c1")
//     process.exit()
// })

// console.time("g0")
// genproof("./circom/crcuit.wasm", {a:2,b:8},"c.zkey","vk0.json",[16]).then(()=>{
//     // console.timeEnd("g0");
//     // console.time("g1")
//     return genproof("./circom/crcuit1.wasm", {a:1,b:2,c:9},"c1.zkey","vk1.json",[512])
// }).then(()=>{
//     console.timeEnd("g1")
//     process.exit()
// })

// genproof("./circom/crcuit1.wasm", {a:1,b:2,c:9},"c1.zkey","vk1.json",[512])


// run().then(genproof).then(()=>{
//     console.log("The code is ending!")
//     process.exit()
// })


async function exportSolidityVerifier(zkeyname,solname,logger) {

    const templates = {};
    templates.groth16 = await fs.promises.readFile(path.join(__dirname, "templates", "verifier_groth16.sol.ejs"), "utf8");
    templates.plonk = await fs.promises.readFile(path.join(__dirname, "templates", "verifier_plonk.sol.ejs"), "utf8");
    templates.fflonk = await fs.promises.readFile(path.join(__dirname, "templates", "verifier_fflonk.sol.ejs"), "utf8");
    const verifierCode = await snarkjs.zKey.exportSolidityVerifier(zkeyname, templates, logger);

    fs.writeFileSync(solname, verifierCode, "utf-8");


    return templates;
}




