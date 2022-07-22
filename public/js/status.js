function isSiteOnline(url,callback) {
    // try to load favicon
    var timer = setTimeout(function(){
        // timeout after 5 seconds
        callback(false);
    },5000)

    var img = document.createElement("img");
    img.onload = function() {
        clearTimeout(timer);
        callback(true);
    }

    img.onerror = function() {
        clearTimeout(timer);
        callback(false);
    }

    img.src = url+"/favicon.ico";
}

function codeAddress() {
    isSiteOnline("http://facebook.com",function(result){
        var msg = result ? "Active" : "Inactive";
        document.getElementById("demo").innerHTML = msg;   
    })
}

window.onload = codeAddress;