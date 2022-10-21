$.getJSON("caremissiondata.json", function(json) {
    console.log(json); // this will show the info it in firebug console
});
    
for(let i = 0; i < json.length; i++) {
    let obj = json[i];

    console.log(obj.id);
}