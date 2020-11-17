$(function(){
    $('.btn').onclick(function(event){
        event.preventDefault();
        console.log(this);
        $.post("/home",{
            genre: $(this).val()
        }, function(data) {
            console.log(data);
        })
    })
});