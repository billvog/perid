FilePond.registerPlugin(
    FilePondPluginImageResize,
    FilePondPluginFileEncode,
    FilePondPluginFileValidateSize,
    FilePondPluginFileValidateType
);

FilePond.setOptions({
    imageResizeTargetWidth: 32,
    imageResizeTargetHeight: 32,
    maxFileSize: "5MB",
    acceptedFileTypes: ['image/*']
});

FilePond.parse(document.body);