/**
 * officejs.js
 * Ver. : 1.0.1 
 * last update: 15/11/2017
 * Author: meshesha , https://github.com/meshesha
 * LICENSE: MIT
 * url:https://meshesha.github.io/officeJS
 */

(function ( $ ) {
   
    /////////////////////////////////////////////////////
    $.fn.officejs = function( options ) {
        var $result = $(this);
        var divId = $result.attr("id");
        var settings = $.extend({
            // These are the defaults.
            url: "",
            inputObjId:""
        }, options );
        //1.get file memeType
        //2.load all js file needed to read the file
        var file = settings.url;
        var inputId = settings.inputObjId;
        var fileObj = null;
        if(file != ""){
            fileObj = {
                Obj : file, 
                ext : file.split('.').pop().toLowerCase()
            }
            getContent(fileObj,divId);
        }
        if(inputId != ""){
            //TODO
            $("#"+inputId).on("change", function(e) {
                //var inputFileObj = $(this)[0].files[0];
                var inputFileObj = e.target.files[0];
                if(inputFileObj !== undefined){
                    var fName = inputFileObj.name;
                    fileBlob = URL.createObjectURL(inputFileObj);
                    fileObj = {
                        Obj : fileBlob,
                        ext : fName.split('.').pop().toLowerCase()
                    }
                }
                getContent(fileObj,divId);
            });
        }
    }
    function getContent(fObj,divId){
        var ext = fObj.ext;
        var file = fObj.file;
        switch (ext) {
            case "pdf":
                //handel pdf file (https://mozilla.github.io/pdf.js/) -- V
                getPdfContent(fObj,divId);
                break;
            case "docx":
                //handel docx (https://github.com/mwilliamson/mammoth.js) -- V
                getDocxContent(fObj,divId);
                break;
            case "doc":
                //handel doc file () -- X
                getDocContent(fObj,divId);
                break;
            case "pptx":
                //handel pptx file (https://meshesha.github.io/pptxjs/) -- V
                getPptxContent(fObj,divId);
                break;
            case "ppt":
                //handel ppt file () -- X
                getPptContent(fObj,divId);
                break;
            case "xlsx":
            case "xls":
            case "xlw":
            case "xlsb":
            case "xlsm":
            case "csv":
            case "dbf":
            case "dif":
            case "slk":
            case "sylk":
            case "prn":
            case "ods":
            case "fods":
                //handel sheet file (https://github.com/sheetjs/js-xlsx) -- V
                getSheetContent(fObj,divId);
                break;
            case "gif":
            case "jpg":
            case "jpeg":
            case "bmp":
            case "tiff":
            case "tif":
            case "png":
            case "svg":
               //handel imge  -- V
               getImgContent(fObj,divId);
                break;
            default:
                unknownMsg(divId);
        }
        return
    }
    /////////////////////////////////////////////////PDF//////////////////////////////////////////
    function getPdfContent(fObj,divId){
        $("#"+divId).html("");
        // The workerSrc property shall be specified.
        //PDFJS.workerSrc = './Content/pdfViewer/pdf.worker.js';
        var file = fObj.Obj;

        scale = 1.5;

        //var options = options || { scale: 1 };
        
        function renderPage(page) {
            var viewport = page.getViewport(scale); //options.scale
            var canvas = document.createElement('canvas');
            var ctx = canvas.getContext('2d');
            var renderContext = {
            canvasContext: ctx,
            viewport: viewport
            };
            
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            $("#"+divId).append(canvas);
            
            page.render(renderContext);
        }
        
        function renderPages(pdfDoc) {
            for(var num = 1; num <= pdfDoc.numPages; num++)
                pdfDoc.getPage(num).then(renderPage);
        }
        //PDFJS.disableWorker = true;
        PDFJS.getDocument(file).then(renderPages);

        return
    }
    /////////////////////////////////////////////////Docx//////////////////////////////////////////
    function getDocxContent(fObj,divId){
        
        $("#"+divId).html("");
        var file = fObj.Obj;
        
        JSZipUtils.getBinaryContent(file, function (err, content) {
            mammoth.convertToHtml({ arrayBuffer: content })
                .then(displayResult)
                .done();
        });
        
        function displayResult(result) {
            var rslt = result.value;
            var position = rslt.search(/[\u0590-\u05FF]/);
            if (position >= 0) {
                $('#'+divId).attr("dir", "rtl");
            } else {
                $('#'+divId).attr("dir", "ltr");
            }

            $('#'+divId).html(rslt);
            if (result.messages != "") {
                var messageHtml = result.messages.map(function (message) {
                    return message.type + ': ' + message.message + "\n";
                }).join("");

                console.log("Docx viewer Messages: \n" + messageHtml + "\n");
            }

        }
        return
    }
    /////////////////////////////////////////////////doc//////////////////////////////////////////
    function getDocContent(fObj,divId){
        
        $("#"+divId).html("");
        var file = fObj.Obj;

        var ran5 = 10000+Math.round(Math.floor()*90000);
        var subDiv = $('<div/>').attr({ class:'doc_files', id:"doc_file_"+ran5,style:"color:#9d9999;font-size:30pt"});
        $("#"+divId).append(subDiv);
        $("#doc_file_"+ran5).html(".doc file is not supported, convert it to .docx file");
        return
    }
    /////////////////////////////////////////////////pptx//////////////////////////////////////////
    function getPptxContent(fObj,divId){
        
        $("#"+divId).html("");
        
        //console.log(fObj,divId);
        var file = fObj.Obj;
        $("#"+divId).pptxToHtml({
            pptxFileUrl: file,
            slideMode: false,
            keyBoardShortCut: false,
            mediaProcess: true
        });
        return
    }
    /////////////////////////////////////////////////ppt//////////////////////////////////////////
    function getPptContent(fObj,divId){
        
        $("#"+divId).html("");
        var file = fObj.Obj;
        
        var ran5 = 10000+Math.round(Math.floor()*90000);
        var subDiv = $('<div/>').attr({ class:'ppt_files', id:"ppt_file_"+ran5,style:"color:#9d9999;font-size:30pt"});
        $("#"+divId).append(subDiv);
        $("#ppt_file_"+ran5).html(".ppt file is not supported, convert it to .pptx file");
        
        return
    }
    /////////////////////////////////////////////////Sheet//////////////////////////////////////////
    function getSheetContent(fObj,divId){
        
        $("#"+divId).html("");
        
        
        var file = fObj.Obj;

        var $container, $window, availableWidth, availableHeight;
        
        $container = $("#"+divId);
        $window = $(window);

        function process_wb(wb) {
            var sheetNames = wb.SheetNames;
            sheetNames.forEach(function(sheetName,idx) {
                var subDivId = 'wbSheets_' +idx;
                var json = XLSX.utils.sheet_to_json(wb.Sheets[sheetName],{header:1});
                    
                availableWidth = Math.max($window.width()-50,600);
                availableHeight = Math.max($window.height()-50, 400);

                $container.append('<p>' + sheetName + '</p>');
                var subDiv = $('<div/>').attr({ class:'(wbSheets', id:subDivId});
                $container.append(subDiv);
                /* add header row for table */
                if(!json) json = [];
                json.forEach(function(r) {
                    //must "...,{header:1}"
                    if(json[0].length < r.length) json[0].length = r.length; 
                });
                /* showtime! */
                $subContainer = $("#"+subDivId);
                $subContainer.handsontable({
                    data: json,
                    readOnly: true,
                    startRows: 1,
                    startCols: 1,
                    stretchH: 'all',
                    rowHeaders: true,
                    colHeaders: true,
                    width: function () { return availableWidth; },
                    height: function () { return availableHeight; }
                });
            });
        }
        var url = file;

        var req = new XMLHttpRequest();
        req.open("GET", url, true);
        req.responseType = "arraybuffer";
        req.onload = function(e) {
            var data = new Uint8Array(req.response);
            var wb = XLSX.read(data, {type:"array"});
            process_wb(wb);
        };
        req.send();
        return
    }
    /////////////////////////////////////////////////Images//////////////////////////////////////////
    function getImgContent(fObj,divId){
        
        $("#"+divId).html("");
        var file = fObj.Obj;
        
        var img_div = $("#"+divId);
        img_div.html("");
        var myImage = new Image();//Image(100, 200)
        myImage.src = file;
        img_div.append(myImage);
        return
    }
    /////////////////////////////////////////////////Unknown file//////////////////////////////////////////
    function unknownMsg(divId){
        
        $("#"+divId).html("");
        
        var ran5 = 10000+Math.round(Math.floor()*90000);
        var subDiv = $('<div/>').attr({ class:'unknown_files', id:"unknown_file_"+ran5,style:"color:#9d9999;font-size:30pt"});
        $("#"+divId).append(subDiv);
        $("#unknown_file_"+ran5).html("The file is not supported!");
        return
    }
}(jQuery));