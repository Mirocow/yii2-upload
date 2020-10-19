<?php

use yii\helpers\Url;
use yii\web\View;

$js = $this->render('file-upload.js.php', [
    'form' => $form,
    'name' => $name,
]);

$this->registerJs($js, yii\web\View::POS_READY);

?><div class="file-upload">
    <div
        class="image-manager-container"
        data-images='<?= json_encode($files); ?>'
        data-captions='<?= json_encode( $captions ) ?>'
        data-input-template="<?= $name?>"
        data-crop-configurations='<?= json_encode($crop_configurations)?>'
    >
        <div id="preview" class="playground">
            <div class="card-placeholder tpl-placeholder"></div>
        </div>
    </div>

    <div id="cropperModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <span class="close">&times;</span>
                <h2>Редактирование изображения</h2>
            </div>
            <div class="modal-body"></div>
            <div class="modal-footer">
                <div class="modal-info"></div>
                <button id="cropImage" type="button">Сохранить</button>
            </div>
        </div>
    </div>

    <label for="file-input">
        <div class="file-input-upload">
            <i class="fa fa-upload" aria-hidden="true"></i>
            Добавить
        </div>
        <input id="file-input" type="file" multiple>
    </label>

    <div id="inputsContainer" class="inputs-container">
    </div>

    <template id="card-template">
        <div class="card" draggable="true" data-index="{index}">
            <img width="250" height="250" src="{data}" draggable="false" data-filename="{filename}"/>
            <?php if ($captions) : ?>
                <input type="text" name="captions[{filename}]" value="{caption}" class="caption">
            <?php endif; ?>
            <div class="card-text">
                <button class="image-edit-button" type="button">
                    <i class="fa fa-pencil" aria-hidden="true"></i>
                    Edit
                </button>
                <button class="image-delete-button" type="button">
                    <i class="fa fa-trash" aria-hidden="true"></i>
                    Delete
                </button>
            </div>
        </div>
    </template>
</div>
