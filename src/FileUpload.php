<?php

namespace mirocow\upload;

use yii\base\Widget;

/**
 * Class FileUpload
 * @package backend\widgets
 * @see https://github.com/fengyuanchen/cropperjs/blob/master/README.md#options
 */
class FileUpload extends Widget
{
    public $model;

    public $files = [];

    public $form;

    public $name;

    public $captions = false;

    public $crop_configurations = [
        'viewMode' => 0,
        'aspectRatio' => null,
        'autoCropArea' => 1,
        'fillColor' => '#fff',
    ];

    public function run()
    {
        $this->registerAssetBundle();
        return $this->render('file-upload',[
            'model' => $this->model,
            'files' => $this->files,
            'form' => $this->form,
            'name' => $this->name,
            'captions' => $this->captions,
            'crop_configurations' => $this->crop_configurations,
        ]);
    }

    /**
     * Registers the asset bundle and locale
     */
    public function registerAssetBundle()
    {
        $view = $this->getView();
        FileUploadAsset::register($view);
    }
}