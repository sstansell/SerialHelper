exports.yell = function (msg) {
    return msg.toUpperCase();
};

exports.debug = function(data, breakpoint){
    console.log(data);
    if (breakpoint === true) {   
        debugger;
    }
    return '';	
}