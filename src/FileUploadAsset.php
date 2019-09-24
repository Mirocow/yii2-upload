<?php

namespace mirocow\upload;

use yii\web\AssetBundle;

/**
 * Class FileUploadAsset
 * @package frontend\assets
 */
class FileUploadAsset extends AssetBundle
{
    public $sourcePath = '@mirocow/upload/assets';
    public $css = [
        'css/cropper.css',
        'css/file-upload.css'
    ];
    public $js = [
        'js/cropper.js',
        'js/file-upload.js',
    ];
    public $depends = [];

}
