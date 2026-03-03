document.addEventListener("DOMContentLoaded", ()=>{
    let inputTextCounter=document.getElementsByClassName("length_instrument");
    let inputText=document.querySelector(".textarea-wrapper textarea");
    if(!inputTextCounter|| !inputText){
        console.log("Can not find the inputed text counter element.");
    }else{
        inputText.addEventListener("input",(e)=>{
            let len=inputText.value.length;
            inputTextCounter[0].textContent=`${len} / 600`;
        });
    }
    
    const form = document.getElementById("contact-form");
    const toastEl = document.getElementById("liveToast");
    const toast = bootstrap.Toast.getOrCreateInstance(toastEl);

    form.addEventListener("submit", function (e) {
        if (!form.checkValidity()) {
            e.stopPropagation();
            return;
        }
        // If valid, prevent refresh and show toast
        e.preventDefault();
        toast.show();
        });

});