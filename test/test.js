const {keccak256}=require('web3').utils
const {utils,}=require('web3')
const {abi}=require('web3').eth


 function hex2ByteArray(s) {
    if (s instanceof Uint8Array) return s;
    if (s.slice(0,2) === "0x") s= s.slice(2);
    return new Uint8Array(s.match(/[\da-f]{2}/gi).map(function (h) {
        return parseInt(h, 16);
    }));
}

 function byteArray2hex(byteArray) {
    return Array.prototype.map.call(byteArray, function(byte) {
        return ("0" + (byte & 0xFF).toString(16)).slice(-2);
    }).join("");
}

// var message = hex2ByteArray("0x1234");
// console.log(message)
// var message1 = byteArray2hex(message);
// console.log(message1)
//
// console.log(crypto.utils.keccak256(message));


const data=["0x1234",
"0x361f286bf0029ea50537409ad9c44b6f087bdd8661003fd607adbab1e7fd4123",
"0x1234",
"0x50c8214044f4d7a12187f134818cc339b5c6dbda2f0e41540733c411a81bdd28"]



const ss0="0x1234"

function validation(laststat,s0,s1,root){
    // var uint8Array = utils.hexToBytes(laststat);

    var sn = utils.hexToBytes(laststat);
    var ss00 = utils.hexToBytes(ss0);
    var s00 =utils.hexToBytes(s0);
    var s11 =utils.hexToBytes(s1);
    var roothash =utils.hexToBytes(root);

    var s = concatandkeccak(
                concatandkeccak(
                    concatandkeccak(utils.hexToBytes(keccak256(ss00)),s00)
                ,s11)
            ,sn);
    let res=utils.bytesToHex(s);
    return res===root;
}

function concatandkeccak( b1, b2){
    var res = new Uint8Array(b1.length+b2.length);
    var p=0;
    for (let i = 0; i < b1.length; i++) {
        res[p]=b1[i];
        p++;
    }
    for (let j = 0; j < b2.length; j++) {
        res[p]=b2[j];
        p++;
    }

    return utils.hexToBytes(keccak256(res));
}

console.log(validation(data[0], data[1], data[2], data[3]));
