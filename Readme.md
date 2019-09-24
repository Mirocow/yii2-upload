```php
                <?= \backend\widgets\FileUpload::widget([
                    'model' => $model,
                    'files' => array_map(function ($file){
                        return Yii::$app->urlManagerFrontend->createUrl($file->photo);
                    }, $model->adsPhotos),
                    'form' => $form,
                    'name' => 'AdsPhoto[photo][]',
                ]) ?>
```
