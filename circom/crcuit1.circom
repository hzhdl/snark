template circuit() {
    signal private input a;
    signal private input b;
    signal private input c;
    signal output d;
    var data=1;
    data=a*b;
    for (var i = 1; i<c; i++) {
        data *= b;
    }
    d <== data;
}

component main = circuit();
