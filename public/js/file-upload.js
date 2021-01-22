FilePond.registerPlugin(
    FilePondPluginImageResize,
    FilePondPluginFileEncode,
    FilePondPluginFileValidateSize,
    FilePondPluginFileValidateType
);

FilePond.setOptions({
    imageResizeTargetWidth: 32,
    imageResizeTargetHeight: 32,
    imageResizeMode: 'force',
    acceptedFileTypes: ['image/*'],
    maxFileSize: "5MB",
});

FilePond.parse(document.body);