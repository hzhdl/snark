const snarkjs = require("snarkjs");
const fs = require("fs");
const bfj = require("bfj")
const {getCurveFromR,getCurveFromName,getCurveFromQ} = require("./lib/curves.js")
const {utils} = require("ffjavascript")

// "BN128", "BN254", "ALTBN128"
async function run() {
    var curve = await getCurveFromName("BN128")
    var newAccumulator =await snarkjs.powersOfTau.newAccumulator(curve,14,"test_init.ptau");

    var contribute = await snarkjs.powersOfTau.contribute("test_init.ptau","test_01.ptau","first","e");

    var preparePhase2 = await snarkjs.powersOfTau.preparePhase2("test_01.ptau","test_final.ptau");

    var newZKey = await snarkjs.zKey.newZKey("./lib/circuit.r1cs","test_final.ptau","test_02.zkey");
    var finalZKey = await snarkjs.zKey.contribute("test_02.zkey","test_final.zkey","lksadjlkfajsdkfjsad","e");

    const vKey = await snarkjs.zKey.exportVerificationKey("test_final.zkey");

    await bfj.write("VK.json", utils.stringifyBigInts(vKey), {space: 1});

}

async function genproof(){
    const { proof, publicSignals } = await snarkjs.groth16.fullProve({a: 56, b:4589}, "./lib/circuit.wasm", "test_final.zkey");

    console.log("Proof: ");
    // console.log(JSON.stringify(proof, null, 1));
    console.log(publicSignals)

    const vKey = JSON.parse(fs.readFileSync("VK.json"));

    let res = await snarkjs.groth16.verify(vKey, publicSignals, proof);


    if (res === true) {
        console.log("Verification OK");
    } else {
        console.log("Invalid proof");
    }

    res = await snarkjs.groth16.verify(vKey, ['415343651578354'], proof);


    if (res === true) {
        console.log("Verification OK");
    } else {
        console.log("Invalid proof");
    }

}

run().then(genproof).then(()=>{
    console.log("The code is ending!")
    process.exit()
})
