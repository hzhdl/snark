
const { exec } = require('child_process');
var circom = require("circom");
var path = require("path");
const fs = require("fs");
const circomname= "crcuit"

async function compile(srcpath){
    var basename = path.basename(srcpath).split(".")[0];
    var dirname = path.dirname(srcpath);
    var newdirname=path.join(dirname,"/"+basename)
    if(!fs.existsSync(newdirname)){
        fs.mkdirSync(newdirname)
    }
    return await circom.compiler(srcpath,{
        wasmFileName:path.join(dirname,"/"+basename,"/"+basename+".wasm"),
        r1csFileName:path.join(dirname,"/"+basename,"/"+basename+".r1cs"),
        // symWriteStream:path.join("../circom/"+circomname+".sym"),
    })

}
compile(path.join(__dirname,"../circom/crcuit.circom")).then((res)=>{
    process.exit()
},(err)=>{
    console.log(err)
    process.exit()
})

// exec('circom ',(err,stdout,stderr)=>{
//     console.log(stdout)
// })
// if (argv.wasm) {
//     options.wasmFileName = wasmName;
// }
// if (argv.wat) {
//     options.watFileName = watName;
// }
// if (argv.r1cs) {
//     options.r1csFileName = r1csName;
// }
// if (argv.sym) {
//     options.symWriteStream = fs.createWriteStream(symName);
// }
