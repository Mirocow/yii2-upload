function closest(el, clazz, stopClazz) {
  if (el.classList.contains(stopClazz)) return null;

  while (
    (el = el.parentElement) &&
    !el.classList.contains(clazz) &&
    !el.classList.contains(stopClazz)
  );

  return el.classList.contains(stopClazz) ? null : el;
}

function swap(arr, from, to) {
  arr.splice(from, 1, arr.splice(to, 1, arr[from])[0]);
}

function readFiles(files) {
  return Promise.all(
      [].map.call(files, file => {
        return new Promise(resolve => {
          if (~fileNameList.indexOf( file.name)) return false;
          fileNameList.push(file.name);
          let reader = new FileReader();
          reader.onload = function () {
            resolve({ filename: file.name, data: reader.result })
          };
          reader.readAsDataURL(file);
          reader.onerror = function (error) {
            return false;
          };
        });
      })
  );
}

function toDataUrl(url) {
  return new Promise((resolve, reject) => {
    let xhr = new XMLHttpRequest();
    xhr.onload = function() {
      let reader = new FileReader();
      reader.onload = function() {
        resolve(reader.result);
      };
      reader.readAsDataURL(xhr.response);
      reader.onerror = function (error) {
        return false;
      };
    };
    xhr.open("GET", url);
    xhr.responseType = "blob";
    xhr.send();
  });
}

function getPreviewTemplate () {
  const previewTemplateNode = document.querySelector('#card-template');
  return previewTemplateNode.innerHTML
}

function previewFiles() {
  const preview = document.querySelector("#preview");
  const inputsContainer = document.querySelector("#inputsContainer");
  const nameTemplate = document
    .querySelector(".image-manager-container")
    .getAttribute("data-input-template");

  if (!previewTemplate) previewTemplate = getPreviewTemplate()

  preview.innerHTML = '<div class="card-placeholder tpl-placeholder"></div>';
  inputsContainer.innerHTML = "";

  let previewHTML = "";
  let inputsHTML = "";

  fileList.forEach((file, index) => {
    if ( !file.caption ) file.caption = '';
    previewHTML += previewTemplate
      .slice() // To not mutate original template
      .replace('{index}', index)
      .replace('{data}', file.data)
      .replace('{caption}',file.caption)
      .replaceAll('{filename}', file.filename);
  });

  preview.insertAdjacentHTML("beforeend", previewHTML);
  inputsContainer.insertAdjacentHTML("beforeend", inputsHTML);

  document.querySelectorAll(".image-edit-button").forEach(editButton => {
    editButton.addEventListener("click", event => {
      event.preventDefault();
      const imageIndex = closest(
        event.target,
        "card",
        "playground"
      ).getAttribute("data-index");
      cropperModal.showCropper(originalFileList[imageIndex].data, imageIndex);
    });
  });

  document.querySelectorAll(".image-delete-button").forEach(deleteButton => {
    deleteButton.addEventListener("click", event => {
      event.preventDefault();
      const imageIndex = closest(
        event.target,
        "card",
        "playground"
      ).getAttribute("data-index");
      fileList.splice(imageIndex, 1);
      originalFileList.splice(imageIndex, 1);
      fileNameList.splice(imageIndex, 1);
      previewFiles();
    });
  });
}

const dnd = (element, options) => {
  let draggableElements = element.querySelectorAll("[draggable=true]");
  let activeDragElement;
  let placeholderElement;
  let startElementRect;
  let targetIndex;

  const _onDragOver = function(event) {
    placeholderElement.style.width = startElementRect.width + "px";
    placeholderElement.style.height = startElementRect.height + "px";
    placeholderElement.style.top = startElementRect.top + "px";
    placeholderElement.style.left = startElementRect.left + "px";

    event.preventDefault();
    event.dataTransfer.dropEffect = "move";

    let target = closest(event.target, "card", "playground");
    if (target && target !== activeDragElement) {
      targetIndex = parseInt(target.getAttribute("data-index"));

      let rect = target.getBoundingClientRect();
      let horizontal =
        event.clientY > startElementRect.top &&
        event.clientY < startElementRect.bottom;
      let next = false;

      if (horizontal) {
        next = (event.clientX - rect.left) / (rect.right - rect.left) > 0.5;
      } else {
        next = !((event.clientY - rect.top) / (rect.bottom - rect.top) > 0.5);
      }

      element.insertBefore(
        activeDragElement,
        (next && target.nextSibling) || target
      );

      startElementRect = activeDragElement.getBoundingClientRect();
    }
  };

  const _onDragEnd = function(event) {
    event.preventDefault();

    placeholderElement.style.width = "0px";
    placeholderElement.style.height = "0px";
    placeholderElement.style.top = "0px";
    placeholderElement.style.left = "0px";

    const currentIndex = activeDragElement.getAttribute("data-index");
    swap(fileList, targetIndex, currentIndex);
    swap(originalFileList, targetIndex, currentIndex);
    previewFiles();

    activeDragElement.classList.remove("moving");
    element.removeEventListener("dragover", _onDragOver, false);
    element.removeEventListener("dragend", _onDragEnd, false);
  };

  element.addEventListener("dragstart", function(event) {
    if (event.target.getAttribute("draggable") !== "true") {
      event.preventDefault();
      return;
    }

    activeDragElement = event.target;
    startElementRect = activeDragElement.getBoundingClientRect();

    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/uri-list", "http://www.mozilla.org");

    element.addEventListener("dragover", _onDragOver, false);
    element.addEventListener("dragend", _onDragEnd, false);

    activeDragElement.classList.add("moving");

    placeholderElement = element.querySelector(".tpl-placeholder");
  });
};

const input = element => {
  const container = document.querySelector(".image-manager-container");
  const initialImages = JSON.parse(container.getAttribute("data-images"));
  const captions = container.getAttribute("data-captions") ? JSON.parse(container.getAttribute("data-captions")) : false;
   
  const handleFilesFromAttribute = async () => {
    originalFileList = await Promise.all(
      initialImages.map(async function(url, index) {
        const data = await toDataUrl(url);
        let fileName = url.split("/").slice(-1)[0];
        fileNameList.push(fileName);
        caption = captions ? captions[index] : '';
        return {
          filename: fileName,
          caption: caption,
          url,
          data
        };
      })
    );
    fileList = [...originalFileList];
    previewFiles();
  };

  if (initialImages && initialImages.length) handleFilesFromAttribute();

  const handleFiles = async files => {
    const list = await readFiles(files);
    if(list) {
      originalFileList.push(...list);
      fileList = [...originalFileList];
      previewFiles();
    }
  };

  const dragOverHandler = event => {
    event.preventDefault();
  };

  const dropHandler = event => {
    event.preventDefault();

    const files = [];

    if (event.dataTransfer.effectAllowed === "move") return;

    if (event.dataTransfer.items) {
      for (let i = 0; i < event.dataTransfer.items.length; i++) {
        if (event.dataTransfer.items[i].kind === "file") {
          files.push(event.dataTransfer.items[i].getAsFile());
        }
      }
    } else {
      for (let i = 0; i < event.dataTransfer.files.length; i++) {
        files.push(event.dataTransfer.files[i]);
      }
    }
    handleFiles(files);
  };

  document
    .querySelector(".image-manager-container")
    .addEventListener("dragover", dragOverHandler);
  document
    .querySelector(".image-manager-container")
    .addEventListener("drop", dropHandler);

  element.addEventListener("change", async event => handleFiles(element.files));
};

function getFileSize (url) {
  return new Promise(resolve => {
    const http = new XMLHttpRequest();
    http.open('HEAD', url, true); // true = Asynchronous
    http.onreadystatechange = function() {
      if (this.readyState == this.DONE) {
        if (this.status === 200) {
          const fileSize = this.getResponseHeader('content-length');
          resolve(fileSize)
        }
      }
    };
    http.send();
  })
}

function calculateImageSize (base64String){
  let padding, inBytes, base64StringLength;
  if(base64String.endsWith("==")) padding = 2;
  else if (base64String.endsWith("=")) padding = 1;
  else padding = 0;

  base64StringLength = base64String.length;
  inBytes =(base64StringLength / 4 ) * 3 - padding;
  return inBytes;
}

const cropper = () => {
  const modal = document.getElementById("cropperModal");
  const closeSpan = document.getElementsByClassName("close")[0];
  const applyButton = document.querySelector("#cropImage");
  let currentIndex = null;

  const showCropper = async function(imageBase64, imageIndex) {
    if (!imageBase64) {
      console.error("Cannot show cropper without image data");
      return;
    }

    currentIndex = imageIndex;
    const image = document.createElement("img");
    image.src = imageBase64;
    //image.width = 625;
    image.height = 600;
    const modalBody = modal.querySelector(".modal-body");
    modalBody.innerHTML = "";
    modalBody.appendChild(image);

    const contentType = imageBase64.split(';')[0].split(":")[1];
    const { url, data } = fileList[imageIndex];
    const fileSize = url ? await getFileSize(url) : calculateImageSize(data);
    const fileUrl = url ? `<a href="${url}" target="_blank">${url}</a>` : 'Not loaded yet';

    const modalInfo = modal.querySelector(".modal-info")
    modalInfo.innerHTML = `
      <ul class="modal-list">
        <li><b>Url:</b> ${fileUrl}</li>
        <li><b>Type:</b> ${contentType}</li>
        <li><b>Size:</b> ${(fileSize / 1024).toFixed(1)} kb</li>
      </ul>
    `;

    const rootElement = document.querySelector(".image-manager-container");
    const cropConfigurations = JSON.parse(rootElement.getAttribute("data-crop-configurations"));

    // DOCS: https://github.com/fengyuanchen/cropperjs/blob/master/README.md#options
    cropperInstance = new Cropper(image, cropConfigurations);
    modal.style.display = "flex";
  };

  const hideCropper = function(event) {
    event && event.preventDefault();
    modal.style.display = "none";
    currentIndex = null;
  };

  const applyCropper = function(event) {
    event.preventDefault();
    fileList[currentIndex].data = cropperInstance.getCroppedCanvas().toDataURL();
    previewFiles();
    hideCropper();
  };

  closeSpan.onclick = hideCropper;
  applyButton.onclick = applyCropper;
  window.onclick = function(event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  };

  return {
    showCropper,
    hideCropper,
    applyCropper
  };
};

let fileNameList = [];
let fileList = [];
let originalFileList = [];
let cropperInstance;
let previewTemplate;

dnd(document.querySelector(".playground"));
input(document.querySelector("#file-input"));
const cropperModal = cropper();
