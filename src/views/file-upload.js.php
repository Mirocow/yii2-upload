<?php
use yii\helpers\Url;
?>
$("#<?= $form->id?>").submit(function(e){
    e.preventDefault();
    e.stopPropagation();
    var form = document.getElementById("<?= $form->id?>");
    // Create a FormData and append the file
    var fd = new FormData(form);

    const nameTemplate = document
        .querySelector(".image-manager-container")
        .getAttribute("data-input-template");

    $.each($('#preview .card img'), function(index, img){
        var contentType = img.src.split(';')[0].split(":")[1]; // In this case "image/gif"
        fd.append(nameTemplate.format(index), b64toBlob(img.src, contentType), $(img).attr('data-filename'));
    });

    $.ajax({
        url: form.action,
        data: fd,
        processData: false,
        contentType: false,
        type: 'POST',
        success: function(data){
          alert(data);
        }
      });
});

function b64toBlob(dataURI, contentType) {

    var byteString = atob(dataURI.split(',')[1]);
    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);

    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: contentType });
}